# Deployment — دليل النشر

## 0) قبل أي نشر

1. اضبط متغيرات البيئة (انظر `.env.example`):
   - `VITE_SITE_URL`: نطاق الموقع الكامل (ضروري لوسوم المشاركة وsitemap).
   - `VITE_ADMIN_PASSWORD_HASH`: بصمة SHA-256 لكلمة مرور الإدارة (ضروري لفتح اللوحة).
   - `VITE_WHATSAPP_NUMBER` إن تغيّر الرقم الرسمي.
2. توليد بصمة كلمة المرور:

   ```bash
   node -e "crypto.subtle.digest('SHA-256',new TextEncoder().encode('كلمة-المرور-هنا')).then(b=>console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))"
   ```

3. ابن locally وتحقق: `npm run check` ثم `npm run preview`.

> ملاحظة: متغيرات `VITE_*` تُدمج داخل الحزمة وقت البناء؛ أي تعديل عليها يتطلب إعادة بناء/نشر.

---

## 1) Docker + nginx (موصى به للاستضافة الذاتية)

```bash
docker build \
  --build-arg VITE_SITE_URL=https://your-domain.com \
  --build-arg VITE_ADMIN_PASSWORD_HASH=<البصمة> \
  -t victoria-line-soft .

docker run -d -p 8080:80 --name vls victoria-line-soft
```

- الصورة متعددة المراحل: بناء Node ثم تقديم nginx خفيف.
- يشمل: توجيه SPA، gzip، ترويسات أمان (HSTS, CSP-adjacent, nosniff)، وتخزين دائم للأصول المُبصمة.
- خلف HTTPS: ضع reverse proxy (Caddy/Traefik/nginx) لإنهاء TLS؛ ترويسة HSTS مفعّلة افتراضياً.

---

## 2) Netlify

- المستودع يحتوي `netlify.toml` و`public/_redirects` — اربط المستودع واضغط Deploy.
- اضبط متغيرات البيئة من لوحة Netlify (Site settings → Environment variables) قبل أول بناء.
- الترويسات الأمنية وتخزين الأصول معرّفة مسبقاً في `netlify.toml`.

---

## 3) Vercel

- `vercel.json` جاهز (rewrites + ترويسات). اربط المستودع وسيكتشف Vite تلقائياً.
- أضف متغيرات البيئة من Project → Settings → Environment Variables.

---

## 4) استضافة ثابتة عامة (cPanel / S3 / GitHub Pages…)

1. `npm run build` (مع متغيرات البيئة).
2. ارفع محتويات `dist/` كاملة.
3. فعّل توجيه SPA:
   - **nginx**: `try_files $uri $uri/ /index.html;`
   - **Apache**: `FallbackResource /index.html` أو قاعدة Rewrite.
   - **S3+CloudFront**: خطأ 404 يعيد `index.html` بحالة 200.
4. فعّل HTTPS وشغّل فحصاً سريعاً: افتح `/products` مباشرة (يجب أن يفتح بدون 404).

---

## 5) قائمة تحقق ما بعد النشر

- [ ] الصفحة الرئيسية تعمل والسمة الداكنة/الفاتحة تتبدل بدون وميض.
- [ ] فتح `/insights/<slug>` و`/admin` مباشرة يعمل (توجيه SPA).
- [ ] `robots.txt` و`sitemap.xml` موجودان ويحتويان النطاق الصحيح.
- [ ] صورة المشاركة `og:image` تظهر عند معاينة الرابط (فاحص فيسبوك/تويتر).
- [ ] لوحة الإدارة: دخول ناجح بكلمة المرور الجديدة، وتنزيل نسخة احتياطية يعمل.
- [ ] زر واتساب يفتح المحادثة بالرقم الصحيح.
- [ ] Lighthouse: أداء ≥ 90 على الجوال (صور lazy والحزم مقسّمة مسبقاً).
