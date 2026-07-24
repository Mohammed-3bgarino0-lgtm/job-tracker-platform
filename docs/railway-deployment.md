# Qaddem AI — Railway Deployment

## الهدف

نشر نسخة خادمية تجريبية من تطبيق Next.js دون تحويل نطاق `haderksa.org` قبل اجتياز اختبار الدخان.

## إنشاء المشروع

1. افتح Railway وأنشئ مشروعًا جديدًا.
2. اختر **Deploy from GitHub Repo**.
3. اختر المستودع `Mohammed-3bgarino0-lgtm/job-tracker-platform`.
4. اترك **Root Directory** على جذر المستودع `/` لأن تطبيق الويب يعتمد على `packages/shared` و`prisma`.
5. استخدم فرع `main` للنشر التجريبي بعد نجاح CI.
6. فعّل **Wait for CI** قبل النشر التلقائي.

يقرأ Railway ملف `railway.json` من جذر المستودع ويستخدم أوامر البناء والتشغيل وفحص الصحة الموجودة فيه.

## قاعدة البيانات

1. من لوحة المشروع اضغط **+ New**.
2. اختر **Database → PostgreSQL**.
3. افتح خدمة تطبيق الويب ثم **Variables**.
4. أضف Reference Variable باسم `DATABASE_URL` من خدمة PostgreSQL.
5. أضف `NEXT_TELEMETRY_DISABLED=1`.
6. بعد إنشاء رابط Railway العام، أضف `NEXT_PUBLIC_APP_URL` بقيمة الرابط.

لا تضع أسرارًا أو بيانات اتصال حقيقية داخل GitHub.

## المخطط والهجرات

يحتوي المستودع على سجل هجرات Prisma معتمد داخل `prisma/migrations`.

عند تشغيل خدمة Railway:

1. يفحص `scripts/start-railway.mjs` وجود `DATABASE_URL`.
2. عند وجوده، يشغّل `pnpm db:deploy` لتطبيق الهجرات المعلقة.
3. عند نجاح الهجرات، يبدأ تطبيق Next.js.
4. عند غياب `DATABASE_URL`، يبدأ التطبيق في وضع المعاينة دون تخزين دائم.
5. إذا فشلت الهجرة أو تعذر الاتصال بقاعدة البيانات، لا يبدأ التطبيق حتى لا يعمل فوق مخطط ناقص.

لا تستخدم `prisma db push` في الإنتاج بعد اعتماد سجل الهجرات. التطوير المحلي يستخدم `prisma migrate dev`، بينما Railway يستخدم `prisma migrate deploy` فقط.

## فحص الصحة

يعرض `/api/health` القيم التالية:

- `databaseConfigured`: هل متغير الاتصال موجود؟
- `databaseReady`: هل نجح اتصال فعلي بقاعدة البيانات؟
- `databaseStatus`: إحدى القيم `not_configured`, `connected`, أو `unreachable`.

وجود `DATABASE_URL` وحده لا يكفي؛ الحالة الصحيحة للإنتاج هي:

```json
{
  "status": "ok",
  "databaseConfigured": true,
  "databaseReady": true,
  "databaseStatus": "connected"
}
```

## رابط المعاينة

بعد نجاح النشر:

1. افتح خدمة الويب.
2. ادخل **Settings → Networking**.
3. اضغط **Generate Domain**.
4. استخدم نطاق Railway المؤقت لاختبار المشروع.

## اختبار الدخان

لا يُحوّل النطاق حتى تنجح النقاط التالية:

1. `/api/health` يعيد HTTP 200 و`status: ok`.
2. عند ربط PostgreSQL يعيد `databaseReady: true`.
3. تعمل الصفحات `/`, `/dashboard`, `/jobs`, `/applications`, `/resume`, `/profile`, `/searches`, `/devices`, `/settings`.
4. يعمل التنقل على الكمبيوتر والجوال.
5. لا توجد وظائف أو شركات أو مستخدمون أو نسب مطابقة وهمية.
6. لا تُرسل طلبات توظيف تلقائيًا.
7. لا تُحفظ السيرة قبل وجود مستخدم حقيقي وجلسة موثوقة.

## تحويل النطاق

بعد نجاح المعاينة فقط:

1. افتح **Settings → Networking → Custom Domain**.
2. أضف `haderksa.org` و`www.haderksa.org`.
3. انسخ سجلات DNS التي يعرضها Railway إلى مزود النطاق.
4. احتفظ بسجلات الاستضافة القديمة حتى التأكد من HTTPS والمسارات وفحص الصحة.

## الرجوع

عند حدوث عطل بعد تحويل النطاق، أعد سجلات DNS القديمة فورًا، واترك نسخة Railway على نطاقها المؤقت حتى إصلاح المشكلة.
