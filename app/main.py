import os
import sqlite3
import hashlib
import hmac
from contextlib import contextmanager
from pathlib import Path
from urllib.parse import quote as urlquote
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from .ai_marketing import generate_reply
from .lead_engine import make_lead

BASE = Path(__file__).resolve().parent
DATABASE_URL = os.getenv('DATABASE_URL') or os.getenv('POSTGRES_URL') or os.getenv('POSTGRES_PRISMA_URL')
DB = Path(os.getenv('VLS_DATABASE_PATH', str(BASE.parent / 'data' / 'victoria.db')))
if not DATABASE_URL:
    DB.parent.mkdir(parents=True, exist_ok=True)
DEFAULT_WHATSAPP = '967771119726'
app = FastAPI(title='Victoria Line Soft', version='2.5.0')
secure_cookie_setting = os.getenv('VLS_SECURE_COOKIES')
secure_cookies = (secure_cookie_setting.lower() in {'1', 'true', 'yes'}) if secure_cookie_setting is not None else bool(os.getenv('VERCEL'))
session_secret = os.getenv('VLS_SESSION_SECRET', '').strip() or os.urandom(32).hex()
app.add_middleware(SessionMiddleware, secret_key=session_secret, https_only=secure_cookies, same_site='lax')
app.mount('/static', StaticFiles(directory=str(BASE / 'static')), name='static')
templates = Jinja2Templates(directory=str(BASE / 'templates'))


class PostgresCompat:
    """Small compatibility adapter for the existing SQLite-style query calls."""
    def __init__(self, connection):
        self.connection = connection

    def execute(self, sql, params=()):
        sql = sql.replace('?', '%s')
        return self.connection.execute(sql, params)

    def commit(self):
        self.connection.commit()

    def close(self):
        self.connection.close()


def normalize_whatsapp(phone: str) -> str:
    value = ''.join(ch for ch in str(phone) if ch.isdigit() or ch == '+')
    if value.startswith('00'): value = '+' + value[2:]
    if value.startswith('7') and len(value) == 9: value = '+967' + value
    if value.startswith('0') and len(value) == 10: value = '+967' + value[1:]
    return value.replace('+', '')


def whatsapp_url(phone: str, message: str) -> str:
    number = normalize_whatsapp(phone or os.getenv('WHATSAPP_NUMBER', DEFAULT_WHATSAPP))
    return f'https://wa.me/{number}?text={urlquote(message)}' if number else ''


def ensure_column(con, table: str, column: str, definition: str):
    if DATABASE_URL:
        exists = con.execute(
            'SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = ? AND column_name = ?',
            (table, column)
        ).fetchone()
        if not exists:
            con.execute(f'ALTER TABLE {table} ADD COLUMN {column} {definition}')
    else:
        columns = {row[1] for row in con.execute(f'PRAGMA table_info({table})').fetchall()}
        if column not in columns:
            con.execute(f'ALTER TABLE {table} ADD COLUMN {column} {definition}')


def verify_admin_password(password: str) -> bool:
    stored = os.getenv('VLS_ADMIN_PASSWORD_HASH', '').strip()
    if not stored or '$' not in stored: return False
    try:
        algorithm, salt_hex, digest_hex = stored.split('$', 2)
        if algorithm != 'pbkdf2_sha256': return False
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(digest_hex)
        actual = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 310000)
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()'
    return response


@contextmanager
def db():
    if DATABASE_URL:
        import psycopg
        from psycopg.rows import dict_row
        raw_con = psycopg.connect(DATABASE_URL, row_factory=dict_row, connect_timeout=10)
        con = PostgresCompat(raw_con)
    else:
        con = sqlite3.connect(DB)
        con.row_factory = sqlite3.Row
    try:
        if DATABASE_URL:
            statements = [
                """CREATE TABLE IF NOT EXISTS quotes (
                    id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL,
                    service TEXT NOT NULL, details TEXT, status TEXT DEFAULT 'new',
                    offer TEXT, created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text))""",
                """CREATE TABLE IF NOT EXISTS products (
                    id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT,
                    price TEXT, status TEXT DEFAULT 'published')""",
                """CREATE TABLE IF NOT EXISTS leads (
                    id BIGSERIAL PRIMARY KEY, name TEXT, company TEXT, email TEXT, phone TEXT,
                    need TEXT, budget TEXT, timeline TEXT, decision_role TEXT, score INTEGER DEFAULT 0,
                    stage TEXT DEFAULT 'nurture', created_at TEXT)""",
                """CREATE TABLE IF NOT EXISTS ai_interactions (
                    id BIGSERIAL PRIMARY KEY, message TEXT NOT NULL, reply TEXT NOT NULL,
                    lead_score INTEGER, created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text))""",
                """CREATE TABLE IF NOT EXISTS followups (
                    id BIGSERIAL PRIMARY KEY, lead_id BIGINT, channel TEXT DEFAULT 'whatsapp',
                    note TEXT, due_at TEXT, status TEXT DEFAULT 'pending',
                    created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text))"""
            ]
            for statement in statements:
                con.execute(statement)
        else:
            con.execute('CREATE TABLE IF NOT EXISTS quotes (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL, service TEXT NOT NULL, details TEXT, status TEXT DEFAULT "new", offer TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)')
            con.execute('CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, price TEXT, status TEXT DEFAULT "published")')
            con.execute('CREATE TABLE IF NOT EXISTS leads (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, company TEXT, email TEXT, phone TEXT, need TEXT, budget TEXT, timeline TEXT, decision_role TEXT, score INTEGER DEFAULT 0, stage TEXT DEFAULT "nurture", created_at TEXT)')
            con.execute('CREATE TABLE IF NOT EXISTS ai_interactions (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT NOT NULL, reply TEXT NOT NULL, lead_score INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP)')
            con.execute('CREATE TABLE IF NOT EXISTS followups (id INTEGER PRIMARY KEY AUTOINCREMENT, lead_id INTEGER, channel TEXT DEFAULT "whatsapp", note TEXT, due_at TEXT, status TEXT DEFAULT "pending", created_at TEXT DEFAULT CURRENT_TIMESTAMP)')
        ensure_column(con, 'quotes', 'status', "TEXT DEFAULT 'new'" if DATABASE_URL else 'TEXT DEFAULT "new"')
        ensure_column(con, 'quotes', 'offer', 'TEXT')
        if not con.execute('SELECT 1 FROM products LIMIT 1').fetchone():
            con.execute('INSERT INTO products(name,description,price) VALUES(?,?,?)', ('تصميم وتطوير المواقع', 'حلول ويب احترافية للشركات والمتاجر.', 'حسب الطلب'))
            con.execute('INSERT INTO products(name,description,price) VALUES(?,?,?)', ('أنظمة الأعمال', 'أنظمة إدارة مخصصة وسهلة الاستخدام.', 'حسب الطلب'))
        con.commit()
        yield con
    finally:
        con.close()


def admin_required(request: Request): return bool(request.session.get('admin'))


@app.middleware('http')
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    return security_headers(response)


@app.get('/health')
def health():
    with db() as con: con.execute('SELECT 1').fetchone()
    return {
        'status':'ok',
        'service':'Victoria Line Soft',
        'version':'2.5.0',
        'whatsapp_configured':bool(os.getenv('WHATSAPP_NUMBER', DEFAULT_WHATSAPP)),
        'ai_provider':'openai' if os.getenv('OPENAI_API_KEY','').strip() else 'none',
        'ai_configured':bool(os.getenv('OPENAI_API_KEY','').strip()),
        'ai_status':'configured' if os.getenv('OPENAI_API_KEY','').strip() else 'unavailable',
        'ai_model':os.getenv('OPENAI_MODEL','gpt-4.1-mini').strip() if os.getenv('OPENAI_API_KEY','').strip() else None,
        'database_backend':'postgresql' if DATABASE_URL else 'sqlite',
        'database_persistent_configured':bool(DATABASE_URL),
        'admin_configured':bool(os.getenv('VLS_ADMIN_PASSWORD_HASH','').strip())
    }


@app.get('/', response_class=HTMLResponse)
def home(request: Request):
    with db() as con: products = con.execute("SELECT * FROM products WHERE status='published' ORDER BY id DESC").fetchall()
    return templates.TemplateResponse(request,'home.html',{'products':products, 'articles': INSIGHTS[:3]})


@app.get('/products', response_class=HTMLResponse)
def products(request: Request):
    with db() as con: rows = con.execute("SELECT * FROM products WHERE status='published' ORDER BY id DESC").fetchall()
    return templates.TemplateResponse(request,'products.html',{'products':rows})


@app.get('/contact', response_class=HTMLResponse)
def contact(request: Request): return templates.TemplateResponse(request,'contact.html',{})


@app.post('/quote')
def quote(name: str=Form(...), phone: str=Form(...), service: str=Form(...), details: str=Form('')):
    if not name.strip() or not phone.strip() or not service.strip(): return JSONResponse({'error':'البيانات المطلوبة ناقصة'},status_code=400)
    with db() as con: con.execute('INSERT INTO quotes(name,phone,service,details,status) VALUES(?,?,?,?,?)',(name.strip()[:120],phone.strip()[:40],service.strip()[:160],details.strip()[:4000],'new')); con.commit()
    return RedirectResponse('/contact?saved=1',status_code=303)


@app.post('/api/ai/chat')
async def ai_chat(request: Request):
    payload = await request.json(); message = str(payload.get('message','')).strip()[:4000]; context = payload.get('context') if isinstance(payload.get('context'),dict) else {}
    if not message: return JSONResponse({'error':'message is required'},status_code=400)
    result = generate_reply(message,context); lead_data = result.get('lead') if isinstance(result.get('lead'),dict) else {}
    merged = {k:str(context.get(k,lead_data.get(k,'')) or '').strip()[:500] for k in ('name','company','email','phone','need','budget','timeline','decision_role')}
    with db() as con:
        con.execute('INSERT INTO ai_interactions(message,reply,lead_score) VALUES(?,?,?)',(message,result.get('reply',''),result.get('lead_score',0)))
        if any(merged.get(k) for k in ('phone','email','company')) and (result.get('lead_score',0)>=45 or merged.get('phone')):
            lead=make_lead(merged); existing=con.execute('SELECT id FROM leads WHERE phone=? ORDER BY id DESC LIMIT 1',(lead['phone'],)).fetchone() if lead.get('phone') else None
            if existing: con.execute('UPDATE leads SET name=?,company=?,email=?,need=?,budget=?,timeline=?,decision_role=?,score=?,stage=? WHERE id=?',(lead['name'],lead['company'],lead['email'],lead['need'],lead['budget'],lead['timeline'],lead['decision_role'],lead['score'],lead['stage'],existing['id']))
            else: con.execute('INSERT INTO leads(name,company,email,phone,need,budget,timeline,decision_role,score,stage,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)',tuple(lead.get(k,'') for k in ('name','company','email','phone','need','budget','timeline','decision_role'))+(lead['score'],lead['stage'],lead['created_at']))
        con.commit()
    return JSONResponse(result)


@app.get('/ai/sales',response_class=HTMLResponse)
def ai_sales(request: Request): return templates.TemplateResponse(request,'ai_sales.html',{})


@app.post('/ai/sales')
def ai_sales_generate(message: str=Form(...)):
    result=generate_reply(message)
    with db() as con: con.execute('INSERT INTO ai_interactions(message,reply,lead_score) VALUES(?,?,?)',(message.strip()[:4000],result.get('reply',''),result.get('lead_score',0))); con.commit()
    return JSONResponse(result)


@app.post('/api/leads')
def create_lead(name: str=Form(''),company: str=Form(''),email: str=Form(''),phone: str=Form(''),need: str=Form(''),budget: str=Form(''),timeline: str=Form(''),decision_role: str=Form('')):
    lead=make_lead({'name':name.strip(),'company':company.strip(),'email':email.strip(),'phone':phone.strip(),'need':need.strip(),'budget':budget.strip(),'timeline':timeline.strip(),'decision_role':decision_role.strip()})
    with db() as con: con.execute('INSERT INTO leads(name,company,email,phone,need,budget,timeline,decision_role,score,stage,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)',tuple(lead.get(k,'') for k in ('name','company','email','phone','need','budget','timeline','decision_role'))+(lead['score'],lead['stage'],lead['created_at'])); con.commit()
    return JSONResponse({'status':'created','lead':lead})




INSIGHTS = [
    {
        "slug": "ai-agents-from-chat-to-workflows",
        "title": "من روبوت يجيب إلى وكيل ينجز: كيف تستفيد شركتك من الذكاء الاصطناعي؟",
        "category": "الذكاء الاصطناعي",
        "tag": "AI & AUTOMATION",
        "date": "2026-10-24",
        "read_time": "6 دقائق",
        "summary": "القيمة الحقيقية ليست في الدردشة فقط، بل في ربط الذكاء الاصطناعي بخطوات عمل واضحة مع رقابة بشرية وقياس للنتائج.",
        "image": "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=85",
        "source_title": "Google Cloud — 2026 AI Agent Trends",
        "source_url": "https://blog.google/innovation-and-ai/infrastructure-and-cloud/google-cloud/ai-business-trends-report-2026/",
        "sections": [
            {
                "heading": "ما الذي يتغير؟",
                "paragraphs": [
                    "تتحرك الشركات من تجربة أدوات توليد النصوص إلى استخدام مساعدات تستطيع تنفيذ أجزاء من سير العمل، مثل فرز الاستفسارات، تلخيص الطلبات، تجهيز مسودة عرض، أو توجيه الحالة إلى الموظف المناسب.",
                    "هذا لا يعني ترك النظام يعمل بلا إشراف. كل خطوة تحتاج صلاحيات واضحة، ومراجعة بشرية في القرارات الحساسة، وسجلًا يمكن الرجوع إليه."
                ]
            },
            {
                "heading": "أين تبدأ شركة صغيرة؟",
                "paragraphs": [
                    "ابدأ بمشكلة واحدة متكررة: الرد على الأسئلة المتشابهة، جمع متطلبات العميل، تصنيف الطلبات أو تلخيص محادثة طويلة. اختر عملية محددة بدل محاولة أتمتة الشركة كلها دفعة واحدة.",
                    "قِس زمن الاستجابة، وعدد الطلبات التي أُنجزت بصورة صحيحة، وعدد الحالات التي احتاجت تدخل الموظف. إذا لم يتحسن مؤشر واضح، راجع التصميم قبل توسيع الحل."
                ]
            },
            {
                "heading": "خطة تطبيق عملية",
                "paragraphs": [
                    "1. ارسم خطوات العملية الحالية. 2. حدّد البيانات التي يسمح للمساعد باستخدامها. 3. ابدأ بوضع اقتراحات ومراجعة بشرية. 4. اختبر حالات الخطأ. 5. وسّع الصلاحيات تدريجيًا بعد قياس النتائج."
                ]
            }
        ],
        "takeaways": [
            "اختر مهمة محددة قابلة للقياس",
            "لا تمنح المساعد صلاحيات أكثر من حاجته",
            "احتفظ بمراجعة بشرية وسجل للقرارات"
        ]
    },
    {
        "slug": "ecommerce-experience-beyond-the-design",
        "title": "لماذا يترك العملاء المتجر؟ تجربة الشراء أهم من جمال الواجهة وحده",
        "category": "التجارة الإلكترونية",
        "tag": "DIGITAL COMMERCE",
        "date": "2026-10-24",
        "read_time": "7 دقائق",
        "summary": "التوصيل والدفع والمرتجعات والثقة عوامل حاسمة. اكتشف كيف تقلل الاحتكاك في رحلة الشراء من أول زيارة إلى إتمام الطلب.",
        "image": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85",
        "source_title": "DHL — 2026 E-Commerce Trends Report",
        "source_url": "https://www.dhl.com/global-en/microsites/ec/ecommerce-insights/insights/reports/2026-ecommerce-trends-report.html",
        "sections": [
            {
                "heading": "المتجر ليس صور منتجات فقط",
                "paragraphs": [
                    "قد يبدو المتجر رائعًا، لكن العميل يتراجع إذا لم يفهم تكلفة التوصيل، أو لم يجد طريقة دفع مناسبة، أو لم يعرف كيف يستبدل المنتج. تجربة الشراء تتكون من تفاصيل صغيرة تعمل معًا.",
                    "تقرير DHL لعام 2026 يستند إلى استطلاع شمل 29 ألف متسوق و5,800 شركة تجارة إلكترونية في 29 دولة، ويبرز فجوات في التوصيل والدفع والثقة وتجربة التسوق المدعومة بالذكاء الاصطناعي."
                ]
            },
            {
                "heading": "خمسة أشياء راجعها في متجرك",
                "paragraphs": [
                    "وضوح السعر والتكاليف قبل الدفع؛ صور ومعلومات منتج حقيقية؛ خطوات طلب قصيرة على الهاتف؛ خيارات دفع وتوصيل مفهومة؛ وسياسة استبدال واسترجاع سهلة الوصول.",
                    "لا تضف مزايا كثيرة لمجرد أنها رائجة. اعرض الخيارات التي تناسب سوقك وعملاءك، واختبر رحلة الشراء من هاتف بطيء واتصال محدود."
                ]
            },
            {
                "heading": "اجعل التحسين قابلًا للقياس",
                "paragraphs": [
                    "راقب عدد الزوار الذين يضيفون للسلة، والذين يبدأون الدفع، والذين يكملون الطلب. إذا كان الانقطاع كبيرًا في خطوة محددة، حسّن تلك الخطوة أولًا بدل تغيير تصميم الموقع كله."
                ]
            }
        ],
        "takeaways": [
            "اعرض تكاليف التوصيل مبكرًا",
            "اجعل الطلب سهلًا على الجوال",
            "وضّح الدفع والاستبدال وسياسة الخصوصية"
        ]
    },
    {
        "slug": "ai-security-and-trust-for-growing-businesses",
        "title": "قبل أن تضيف الذكاء الاصطناعي إلى شركتك: الأمان والثقة أولًا",
        "category": "الأمن الرقمي",
        "tag": "SECURITY & TRUST",
        "date": "2026-10-24",
        "read_time": "5 دقائق",
        "summary": "الذكاء الاصطناعي يفتح فرصًا جديدة، لكنه يضيف مخاطر للبيانات والصلاحيات. هذه قائمة عملية لتبنٍّ أكثر أمانًا.",
        "image": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=85",
        "source_title": "World Economic Forum — Global Cybersecurity Outlook 2026",
        "source_url": "https://www.weforum.org/publications/global-cybersecurity-outlook-2026/",
        "sections": [
            {
                "heading": "لماذا صار الموضوع مهمًا؟",
                "paragraphs": [
                    "كلما ربطت المساعدات الذكية بالبريد أو ملفات العملاء أو نظام المبيعات، أصبحت إدارة الصلاحيات وجودة البيانات والخصوصية جزءًا من تصميم المنتج، وليست إضافة نؤجلها إلى النهاية.",
                    "يشير تقرير المنتدى الاقتصادي العالمي للأمن السيبراني 2026 إلى أن توسع الذكاء الاصطناعي يغيّر مشهد المخاطر، وأن المؤسسات تحتاج إلى موازنة الابتكار مع الحوكمة والجاهزية الأمنية."
                ]
            },
            {
                "heading": "قائمة تحقق للشركات",
                "paragraphs": [
                    "استخدم حسابات منفصلة وصلاحيات حسب الدور؛ لا تضع مفاتيح API داخل كود الواجهة؛ اجمع أقل قدر ممكن من البيانات؛ حدّد مدة الاحتفاظ بها؛ احتفظ بسجلات للأفعال المهمة؛ اختبر النسخ الاحتياطي والاستعادة؛ ووفّر طريقة واضحة للتصعيد إلى موظف.",
                    "لا تمنح نظامًا ذكيًا صلاحية حذف أو إرسال أو شراء تلقائيًا من دون حدود وموافقة مناسبة. ابدأ بالقراءة والاقتراح، ثم أضف التنفيذ عند ثبوت الحاجة."
                ]
            },
            {
                "heading": "متى تحتاج إلى مختص؟",
                "paragraphs": [
                    "إذا كان النظام يتعامل مع بيانات مالية أو صحية أو هوية شخصية، أو ينفذ معاملات حساسة، فاجعل مراجعة الأمن والامتثال جزءًا من خطة المشروع قبل الإطلاق."
                ]
            }
        ],
        "takeaways": [
            "احمِ الأسرار ومفاتيح API",
            "طبّق أقل صلاحية ممكنة",
            "اختبر الاستعادة وخطة التعامل مع الحوادث"
        ]
    }
]

def find_insight(slug: str):
    return next((item for item in INSIGHTS if item['slug'] == slug), None)


@app.get('/insights', response_class=HTMLResponse)
def insights(request: Request, q: str = '', category: str = 'الكل'):
    clean_q = q.strip()[:100]
    categories = ['الكل'] + list(dict.fromkeys(item['category'] for item in INSIGHTS))
    filtered = [item for item in INSIGHTS if (category == 'الكل' or item['category'] == category) and (not clean_q or clean_q.casefold() in (item['title'] + ' ' + item['summary'] + ' ' + item['category']).casefold())]
    return templates.TemplateResponse(request, 'insights.html', {'articles': filtered, 'all_articles': INSIGHTS, 'categories': categories, 'active_category': category if category in categories else 'الكل', 'query': clean_q})


@app.get('/insights/{slug}', response_class=HTMLResponse)
def insight_detail(request: Request, slug: str):
    article = find_insight(slug)
    if not article:
        return templates.TemplateResponse(request, 'insights.html', {'articles': INSIGHTS, 'all_articles': INSIGHTS, 'categories': ['الكل'] + list(dict.fromkeys(item['category'] for item in INSIGHTS)), 'active_category': 'الكل', 'query': '', 'not_found': True}, status_code=404)
    related = [item for item in INSIGHTS if item['slug'] != slug and item['category'] == article['category']][:2]
    related += [item for item in INSIGHTS if item['slug'] != slug and item not in related][:max(0, 2-len(related))]
    return templates.TemplateResponse(request, 'insight_detail.html', {'article': article, 'related': related})


@app.get('/admin/login',response_class=HTMLResponse)
def admin_login(request: Request):
    if admin_required(request): return RedirectResponse('/admin',status_code=303)
    return templates.TemplateResponse(request,'admin_login.html',{'error':request.query_params.get('error')})


@app.post('/admin/login')
def admin_login_submit(request: Request,password: str=Form(...)):
    if not os.getenv('VLS_ADMIN_PASSWORD_HASH','').strip(): return RedirectResponse('/admin/login?error=missing_config',status_code=303)
    if not verify_admin_password(password): return RedirectResponse('/admin/login?error=invalid',status_code=303)
    request.session.clear(); request.session['admin']=True; return RedirectResponse('/admin',status_code=303)


@app.post('/admin/logout')
def admin_logout(request: Request): request.session.clear(); return RedirectResponse('/admin/login',status_code=303)


@app.get('/admin',response_class=HTMLResponse)
def admin(request: Request):
    if not admin_required(request): return RedirectResponse('/admin/login',status_code=303)
    with db() as con:
        quotes=con.execute('SELECT * FROM quotes ORDER BY id DESC LIMIT 100').fetchall(); products=con.execute('SELECT * FROM products ORDER BY id DESC').fetchall(); leads=con.execute('SELECT * FROM leads ORDER BY score DESC,id DESC LIMIT 100').fetchall(); interactions=con.execute('SELECT * FROM ai_interactions ORDER BY id DESC LIMIT 30').fetchall(); followups=con.execute('SELECT * FROM followups ORDER BY id DESC LIMIT 50').fetchall()
    stats={'leads':len(leads),'quotes':len(quotes),'hot':sum(1 for x in leads if x['stage']=='hot'),'followups':len(followups)}
    return templates.TemplateResponse(request,'admin.html',{'quotes':quotes,'products':products,'leads':leads,'interactions':interactions,'followups':followups,'stats':stats,'whatsapp_number':os.getenv('WHATSAPP_NUMBER',DEFAULT_WHATSAPP)})


@app.post('/admin/quotes/{quote_id}/offer')
def set_offer(request: Request,quote_id: int,offer: str=Form(...)):
    if not admin_required(request): return RedirectResponse('/admin/login',status_code=303)
    clean=offer.strip()[:4000]
    with db() as con:
        con.execute("UPDATE quotes SET offer=?,status='offer_ready' WHERE id=?",(clean,quote_id)); row=con.execute('SELECT name FROM quotes WHERE id=?',(quote_id,)).fetchone()
        if row: con.execute('INSERT INTO followups(lead_id,channel,note,status) VALUES(?,?,?,?)',(None,'whatsapp',f'عرض جاهز للعميل {row["name"]}: {clean}','pending'))
        con.commit()
    return RedirectResponse('/admin',status_code=303)


@app.get('/admin/quotes/{quote_id}/whatsapp')
def quote_whatsapp(request: Request,quote_id: int):
    if not admin_required(request): return RedirectResponse('/admin/login',status_code=303)
    with db() as con:
        row=con.execute('SELECT * FROM quotes WHERE id=?',(quote_id,)).fetchone()
        if not row: return RedirectResponse('/admin',status_code=303)
        message=f'مرحباً {row["name"]}، بخصوص طلبك لخدمة {row["service"]}:\n\n{row["offer"] or "سأرسل لك تفاصيل العرض بعد اعتماده."}\n\nإذا كان العرض مناسباً، أخبرنا لنبدأ الخطوة التالية.'; url=whatsapp_url(row['phone'],message)
        con.execute("UPDATE quotes SET status='offer_sent' WHERE id=?",(quote_id,)); con.commit()
    return RedirectResponse(url or '/admin',status_code=303)


@app.get('/whatsapp')
def whatsapp(request: Request, message: str=''):
    text=message.strip()[:1000] or 'مرحباً، أريد الاستفسار عن خدمات Victoria Line Soft.'
    return RedirectResponse(whatsapp_url(os.getenv('WHATSAPP_NUMBER',DEFAULT_WHATSAPP),text))


@app.post('/admin/leads/{lead_id}/stage')
def set_lead_stage(request: Request,lead_id: int,stage: str=Form(...)):
    if not admin_required(request): return RedirectResponse('/admin/login',status_code=303)
    allowed={'nurture','warm','hot','quote_requested','awaiting_offer','offer_sent','negotiation','won','lost'}
    if stage not in allowed: return RedirectResponse('/admin',status_code=303)
    with db() as con: con.execute('UPDATE leads SET stage=? WHERE id=?',(stage,lead_id)); con.commit()
    return RedirectResponse('/admin',status_code=303)
