import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from .ai_marketing import generate_reply
from .lead_engine import make_lead

BASE = Path(__file__).resolve().parent
DB = Path(os.getenv('VLS_DATABASE_PATH', str(BASE.parent / 'data' / 'victoria.db')))
DB.parent.mkdir(parents=True, exist_ok=True)
app = FastAPI(title='Victoria Line Soft', version='2.0.0')
app.mount('/static', StaticFiles(directory=str(BASE / 'static')), name='static')
templates = Jinja2Templates(directory=str(BASE / 'templates'))

@contextmanager
def db():
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    try:
        con.execute('CREATE TABLE IF NOT EXISTS quotes (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL, service TEXT NOT NULL, details TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)')
        con.execute('CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, price TEXT, status TEXT DEFAULT "published")')
        con.execute('CREATE TABLE IF NOT EXISTS leads (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, company TEXT, email TEXT, phone TEXT, need TEXT, budget TEXT, timeline TEXT, decision_role TEXT, score INTEGER DEFAULT 0, stage TEXT DEFAULT "nurture", created_at TEXT)')
        con.execute('CREATE TABLE IF NOT EXISTS ai_interactions (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT NOT NULL, reply TEXT NOT NULL, lead_score INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP)')
        if not con.execute('SELECT 1 FROM products LIMIT 1').fetchone():
            con.execute('INSERT INTO products(name,description,price) VALUES(?,?,?)', ('تصميم وتطوير المواقع', 'حلول ويب احترافية للشركات والمتاجر.', 'حسب الطلب'))
            con.execute('INSERT INTO products(name,description,price) VALUES(?,?,?)', ('أنظمة الأعمال', 'أنظمة إدارة مخصصة وسهلة الاستخدام.', 'حسب الطلب'))
        con.commit()
        yield con
    finally:
        con.close()

@app.get('/health')
def health():
    with db() as con:
        con.execute('SELECT 1').fetchone()
    return {'status':'ok','service':'Victoria Line Soft','version':'2.0.0'}

@app.get('/', response_class=HTMLResponse)
def home(request: Request):
    with db() as con:
        products = con.execute('SELECT * FROM products WHERE status="published" ORDER BY id DESC').fetchall()
    return templates.TemplateResponse(request, 'home.html', {'products': products})

@app.get('/products', response_class=HTMLResponse)
def products(request: Request):
    with db() as con:
        rows = con.execute('SELECT * FROM products WHERE status="published" ORDER BY id DESC').fetchall()
    return templates.TemplateResponse(request, 'products.html', {'products': rows})

@app.get('/contact', response_class=HTMLResponse)
def contact(request: Request):
    return templates.TemplateResponse(request, 'contact.html', {})

@app.post('/quote')
def quote(name: str = Form(...), phone: str = Form(...), service: str = Form(...), details: str = Form('')):
    if not name.strip() or not phone.strip() or not service.strip():
        return JSONResponse({'error':'البيانات المطلوبة ناقصة'}, status_code=400)
    with db() as con:
        con.execute('INSERT INTO quotes(name,phone,service,details) VALUES(?,?,?,?)', (name.strip(), phone.strip(), service.strip(), details.strip()))
        con.commit()
    return RedirectResponse('/contact?saved=1', status_code=303)

@app.get('/ai/sales', response_class=HTMLResponse)
def ai_sales(request: Request):
    return templates.TemplateResponse(request, 'ai_sales.html', {})

@app.post('/ai/sales')
def ai_sales_generate(message: str = Form(...)):
    result = generate_reply(message)
    with db() as con:
        con.execute('INSERT INTO ai_interactions(message,reply,lead_score) VALUES(?,?,?)', (message.strip(), result.get('reply',''), result.get('lead_score',0)))
        con.commit()
    return JSONResponse(result)

@app.post('/api/leads')
def create_lead(name: str = Form(''), company: str = Form(''), email: str = Form(''), phone: str = Form(''), need: str = Form(''), budget: str = Form(''), timeline: str = Form(''), decision_role: str = Form('')):
    lead = make_lead({'name':name.strip(),'company':company.strip(),'email':email.strip(),'phone':phone.strip(),'need':need.strip(),'budget':budget.strip(),'timeline':timeline.strip(),'decision_role':decision_role.strip()})
    with db() as con:
        con.execute('INSERT INTO leads(name,company,email,phone,need,budget,timeline,decision_role,score,stage,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)', tuple(lead.get(k,'') for k in ('name','company','email','phone','need','budget','timeline','decision_role')) + (lead['score'],lead['stage'],lead['created_at']))
        con.commit()
    return JSONResponse({'status':'created','lead':lead})

@app.get('/admin', response_class=HTMLResponse)
def admin(request: Request):
    with db() as con:
        quotes = con.execute('SELECT * FROM quotes ORDER BY id DESC LIMIT 100').fetchall()
        products = con.execute('SELECT * FROM products ORDER BY id DESC').fetchall()
        leads = con.execute('SELECT * FROM leads ORDER BY score DESC, id DESC LIMIT 100').fetchall()
    return templates.TemplateResponse(request, 'admin.html', {'quotes':quotes, 'products':products, 'leads':leads})
