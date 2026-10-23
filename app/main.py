import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

BASE = Path(__file__).resolve().parent
DB = Path(os.getenv('VLS_DATABASE_PATH', str(BASE.parent / 'data' / 'victoria.db')))
DB.parent.mkdir(parents=True, exist_ok=True)
app = FastAPI(title='Victoria Line Soft')
app.mount('/static', StaticFiles(directory=str(BASE / 'static')), name='static')
templates = Jinja2Templates(directory=str(BASE / 'templates'))

@contextmanager
def db():
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    try:
        con.execute('CREATE TABLE IF NOT EXISTS quotes (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL, service TEXT NOT NULL, details TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)')
        con.execute('CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, price TEXT, status TEXT DEFAULT "published")')
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
    return {'status':'ok','service':'Victoria Line Soft'}

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

@app.get('/admin', response_class=HTMLResponse)
def admin(request: Request):
    with db() as con:
        quotes = con.execute('SELECT * FROM quotes ORDER BY id DESC LIMIT 100').fetchall()
        products = con.execute('SELECT * FROM products ORDER BY id DESC').fetchall()
    return templates.TemplateResponse(request, 'admin.html', {'quotes':quotes, 'products':products})
