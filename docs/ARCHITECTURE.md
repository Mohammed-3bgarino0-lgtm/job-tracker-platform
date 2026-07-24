# 🏛️ Architecture Document - Qaddem AI Phase 1

```text
قدّم | Qaddem AI
├── apps/web          منصة Next.js والملف الوظيفي
├── apps/extension    إضافة Chrome والاستخراج والتعبئة
├── packages/shared   الأنواع وقواعد التحليل المشتركة
├── prisma            قاعدة البيانات (24 نموذجاً)
└── docs              المعمارية وخطة التنفيذ
```

## Zero Dummy Data Policy & Core Rules
1. Never invent fake data or fallback emails/phones.
2. Extension reads visible page cards.
3. Human-in-the-loop: final submission click is by the user.
4. No CAPTCHA / OTP / Nafath bypass.
