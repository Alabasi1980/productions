# مسار الدراسة المهنية PWA

تطبيق قراءة عربي موبايل-أول يحول محتوى [00_مسار الدراسة المهنية](../00_%D9%85%D8%B3%D8%A7%D8%B1%20%D8%A7%D9%84%D8%AF%D8%B1%D8%A7%D8%B3%D8%A9%20%D8%A7%D9%84%D9%85%D9%87%D9%86%D9%8A%D8%A9) إلى تجربة تصفح وتثبيت مناسبة لهاتف أندرويد.

## ما الذي يفعله

- ينسخ ملفات Markdown من مصدرها الأصلي تلقائيًا إلى مجلد عام للتطبيق.
- يولد فهرس محتوى قابل للتصفح والبحث.
- يعرض الدروس والملاحق بواجهة RTL مناسبة للهاتف.
- يدعم التثبيت كتطبيق PWA من المتصفح.

## أوامر التشغيل

```bash
npm install
npm run dev
```

## أوامر البناء

```bash
npm run build
```

أثناء البناء يتم تنفيذ خطوتين تلقائيًا:

- `npm run sync-content`
- `npm run generate-icons`

## النشر على Netlify

تم تجهيز المشروع بملف [netlify.toml](./netlify.toml) بحيث يكون النشر مباشرًا:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `22`

للنشر اليدوي عبر CLI:

```bash
npx netlify deploy --prod
```

أو أول مرة:

```bash
npx netlify login
npx netlify deploy --prod
```

## التثبيت على أندرويد

بعد النشر عبر رابط HTTPS:

1. افتح الرابط من Chrome على الهاتف.
2. اختر `Add to Home Screen` أو `Install app`.
3. سيظهر التطبيق كأنه تطبيق مستقل على الهاتف.
