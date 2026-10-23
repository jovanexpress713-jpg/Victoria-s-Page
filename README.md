# Victoria Line Soft

موقع وخدمات رقمية مبني بـ FastAPI وJinja2 وSQLite، بواجهة عربية RTL ومتجاوبة مع الهاتف والكمبيوتر.

## التشغيل

```bash
python -m venv .venv
pip install -r requirements.txt
uvicorn app.main:app --reload
```

ثم افتح `http://127.0.0.1:8000`.

## المسارات

- `/` الصفحة الرئيسية
- `/products` الخدمات
- `/contact` طلب عرض سعر
- `/admin` لوحة الإدارة الأولية
- `/health` فحص الخدمة

## Docker

```bash
docker build -t victoria-line-soft .
docker run --rm -p 8000:8000 victoria-line-soft
```

## ملاحظات الإنتاج

لا تضع الأسرار أو قواعد البيانات في Git. استخدم HTTPS، قاعدة بيانات دائمة، نسخًا احتياطية، وإدارة أسرار مناسبة قبل النشر العام.
