import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from datetime import datetime, timezone
from urllib.parse import quote as urlquote
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from .ai_marketing import generate_reply
from .lead_engine import make_lead

BASE = Path(__file__).resolve().parent
DB = Path(os.getenv('VLS_DATABASE_PATH', str(BASE.parent / 'data' / 'victoria.db')))
DB.parent.mkdir(parents=True, exist_ok=True)
app = FastAPI(title='Victoria Line Soft', version='2.3.0')
app.add_middleware(SessionMiddleware, secret_key=os.getenv('VLS_SESSION_SECRET', 'change-this-secret-in-production'), https_only=os.getenv('VLS_SECURE_COOKIES', '0') == '1', same_site='lax')
app.mount('/static', StaticFiles(directory=str(BASE / 'static')), name='static')
templates = Jinja2Templates(directory=str(BASE / 'templates'))

def normalize_whatsapp(phone: str) -> str:
    value = ''.join(ch for ch in str(phone) if ch.isdigit() or ch == '+')
    if value.startswith('00'): value = '+' + value[2:]
    if value.startswith('7') and len(value) == 9: value = '+967' + value
    if value.startswith('0') and len(value) == 10: value = '+967' + value[1:]
    return value.replace('+', '')

def whatsapp_url(phone: str, message: str) -> str:
    number = normalize_whatsapp(phone)
    return f'https://wa.me/{number}?text={urlquote(message)}' if number else ''

def ensure_column(con, table: str, column: str, definition: str):
    columns = {row[1] for row in con.execute(f'PRAGMA table_info({table})').fetchall()}
    if column not in columns: con.execute(f'ALTER TABLE {table} ADD COLUMN {column} {definition}')

@contextmanager
def db():
    con = sqlite3.connect(DB); con.row_factory = sqlite3.Row
    try:
        con.execute('CREATE TABLE IF NOT EXISTS quotes (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL, service TEXT NOT NULL, details TEXT, status TEXT DEFAULT "new", offer TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)')
        con.execute('CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, price TEXT, status TEXT DEFAULT "published")')
        con.execute('CREATE TABLE IF NOT EXISTS leads (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, company TEXT, email TEXT, phone TEXT, need TEXT, budget TEXT, timeline TEXT, decision_role TEXT, score INTEGER DEFAULT 0, stage TEXT DEFAULT "nurture", created_at TEXT)')
        con.execute('CREATE TABLE IF NOT EXISTS ai_interactions (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT NOT NULL, reply TEXT NOT NULL, lead_score INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP)')
        con.execute('CREATE TABLE IF NOT EXISTS followups (id INTEGER PRIMARY KEY AUTOINCREMENT, lead_id INTEGER, channel TEXT DEFAULT "whatsapp", note TEXT, due_at TEXT, status TEXT DEFAULT "pending", created_at TEXT DEFAULT CURRENT_TIMESTAMP)')
        ensure_column(con, 'quotes', 'status', 'TEXT DEFAULT "new"'); ensure_column(con, 'quotes', 'offer', 'TEXT')
        if not con.execute('SELECT 1 FROM products LIMIT 1').fetchone():
            con.execute('INSERT INTO products(name,description,price) VALUES(?,?,?)', ('تصميم وتطوير المواقع', 'حلول ويب احترافية للشركات والمتاجر.', 'حسب الطلب'))
            con.execute('INSERT INTO products(name,description,price) VALUES(?,?,?)', ('أنظمة الأعمال', 'أنظمة إدارة مخصصة وسهلة الاستخدام.', 'حسب الطلب'))
        con.commit(); yield con
    finally: con.close()

def admin_required(request: Request): return bool(request.session.get('admin'))

@app.get('/health')
def health():
    with db() as con: con.execute('SELECT 1').fetchone()
    return {'status':'ok','service':'Victoria Line Soft','version':'2.3.0'}

@app.get('/', response_class=HTMLResponse)
def home(request: Request):
    with db() as con: products = con.execute('SELECT * FROM products WHERE status="published" ORDER BY id DESC').fetchall()
    return templates.TemplateResponse(request,'home.html',{'products':products})

@app.get('/products', response_class=HTMLResponse)
def products(request: Request):
    with db() as con: rows = con.execute('SELECT * FROM products WHERE status="published" ORDER BY id DESC').fetchall()
    return templates.TemplateResponse(request,'products.html',{'products':rows})

@app.get('/contact', response_class=HTMLResponse)
def contact(request: Request): return templates.TemplateResponse(request,'contact.html',{})

@app.post('/quote')
def quote(name: str=Form(...), phone: str=Form(...), service: str=Form(...), details: str=Form('')):
    if not name.strip() or not phone.strip() or not service.strip(): return JSONResponse({'error':'البيانات المطلوبة ناقصة'},status_code=400)
    with db() as con: con.execute('INSERT INTO quotes(name,phone,service,details,status) VALUES(?,?,?,?,?)',(name.strip(),phone.strip(),service.strip(),details.strip(),'new')); con.commit()
    return RedirectResponse('/contact?saved=1',status_code=303)

@app.post('/api/ai/chat')
async def ai_chat(request: Request):
    payload = await request.json(); message = str(payload.get('message','')).strip()[:4000]; context = payload.get('context') if isinstance(payload.get('context'),dict) else {}
    if not message: return JSONResponse({'error':'message is required'},status_code=400)
    result = generate_reply(message,context); lead_data = result.get('lead') if isinstance(result.get('lead'),dict) else {}
    merged = {k:str(context.get(k,lead_data.get(k,'')) or '').strip() for k in ('name','company','email','phone','need','budget','timeline','decision_role')}
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
    with db() as con: con.execute('INSERT INTO ai_interactions(message,reply,lead_score) VALUES(?,?,?)',(message.strip(),result.get('reply',''),result.get('lead_score',0))); con.commit()
    return JSONResponse(result)

@app.post('/api/leads')
def create_lead(name: str=Form(''),company: str=Form(''),email: str=Form(''),phone: str=Form(''),need: str=Form(''),budget: str=Form(''),timeline: str=Form(''),decision_role: str=Form('')):
    lead=make_lead({'name':name.strip(),'company':company.strip(),'email':email.strip(),'phone':phone.strip(),'need':need.strip(),'budget':budget.strip(),'timeline':timeline.strip(),'decision_role':decision_role.strip()})
    with db() as con: con.execute('INSERT INTO leads(name,company,email,phone,need,budget,timeline,decision_role,score,stage,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)',tuple(lead.get(k,'') for k in ('name','company','email','phone','need','budget','timeline','decision_role'))+(lead['score'],lead['stage'],lead['created_at'])); con.commit()
    return JSONResponse({'status':'created','lead':lead})

@app.get('/admin/login',response_class=HTMLResponse)
def admin_login(request: Request):
    if admin_required(request): return RedirectResponse('/admin',status_code=303)
    return templates.TemplateResponse(request,'admin_login.html',{'error':request.query_params.get('error')})

@app.post('/admin/login')
def admin_login_submit(request: Request,password: str=Form(...)):
    configured=os.getenv('VLS_ADMIN_PASSWORD','').strip()
    if not configured: return RedirectResponse('/admin/login?error=missing_config',status_code=303)
    if password!=configured: return RedirectResponse('/admin/login?error=invalid',status_code=303)
    request.session['admin']=True; return RedirectResponse('/admin',status_code=303)

@app.post('/admin/logout')
def admin_logout(request: Request): request.session.clear(); return RedirectResponse('/admin/login',status_code=303)

@app.get('/admin',response_class=HTMLResponse)
def admin(request: Request):
    if not admin_required(request): return RedirectResponse('/admin/login',status_code=303)
    with db() as con:
        quotes=con.execute('SELECT * FROM quotes ORDER BY id DESC LIMIT 100').fetchall(); products=con.execute('SELECT * FROM products ORDER BY id DESC').fetchall(); leads=con.execute('SELECT * FROM leads ORDER BY score DESC,id DESC LIMIT 100').fetchall(); interactions=con.execute('SELECT * FROM ai_interactions ORDER BY id DESC LIMIT 30').fetchall(); followups=con.execute('SELECT * FROM followups ORDER BY id DESC LIMIT 50').fetchall()
    stats={'leads':len(leads),'quotes':len(quotes),'hot':sum(1 for x in leads if x['stage']=='hot'),'followups':len(followups)}
    return templates.TemplateResponse(request,'admin.html',{'quotes':quotes,'products':products,'leads':leads,'interactions':interactions,'followups':followups,'stats':stats})

@app.post('/admin/quotes/{quote_id}/offer')
def set_offer(request: Request,quote_id: int,offer: str=Form(...)):
    if not admin_required(request): return RedirectResponse('/admin/login',status_code=303)
    clean=offer.strip()[:4000]
    with db() as con:
        con.execute('UPDATE quotes SET offer=?,status="offer_ready" WHERE id=?',(clean,quote_id)); row=con.execute('SELECT name FROM quotes WHERE id=?',(quote_id,)).fetchone()
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
        con.execute('UPDATE quotes SET status="offer_sent" WHERE id=?',(quote_id,)); con.commit()
    return RedirectResponse(url or '/admin',status_code=303)

@app.post('/admin/leads/{lead_id}/stage')
def set_lead_stage(request: Request,lead_id: int,stage: str=Form(...)):
    if not admin_required(request): return RedirectResponse('/admin/login',status_code=303)
    allowed={'nurture','warm','hot','quote_requested','awaiting_offer','offer_sent','negotiation','won','lost'}
    if stage not in allowed: return RedirectResponse('/admin',status_code=303)
    with db() as con: con.execute('UPDATE leads SET stage=? WHERE id=?',(stage,lead_id)); con.commit()
    return RedirectResponse('/admin',status_code=303)
