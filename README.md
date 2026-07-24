# 💼 منصة إدارة وتتبع البحث عن عمل | Job Search & Tracker Platform

منصة ويب تفاعلية ومتكاملة مخصصة لمتابعة التقديمات الوظيفية، البحث المباشر عن الفرص في السعودية (الرياض)، وتوليد الخطابات التعريفية (Cover Letters) بالذكاء الاصطناعي باللغتين العربية والإنجليزية.

---

## 🌟 الميزات الرئيسية (Key Features)

- **🔍 محرك البحث المباشر عن الوظائف:** رابط مخصص ونشط بنقرة واحدة للبحث عن وظائف الإشراف الإداري، إدارة العمليات، والموارد البشرية في الرياض عبر (LinkedIn, Bayt, Tanqeeb, Indeed, Sabbar).
- **📋 سجل وتتبع التقديمات (Applications CRM):** تدوين وتتبع كل وظيفة يتم التقديم لها مع الإحصائيات (الطلبات النشطة، المقابلات الشخصية، المقبولة، والمرفوضة) وحفظ تلقائي في الـ LocalStorage.
- **✨ صانع الخطابات التعريفية (Cover Letter Generator):** توليد خطابات موجهة واحترافية لأي شركة ومسمى وظيفي باللغتين العربية والإنجليزية بنقرة زر واحدة.
- **⚡ التقديم السريع (Fast Copy Hub):** نسخ بيانات السيرة الذاتية، الجوال، البريد، وحساب LinkedIn بضغطة زر لتسهيل تعبئة الاستمارات.
- **🌐 جاهزية الربط بالدومين الخاص:** مهيأة بالكامل للنشر الفوري على GitHub Pages أو Vercel وربطها بدومين مخصص (مثل `haderksa.org`).

---

## 🛠️ التثبيت والتشغيل المحلي (Local Setup)

لا تتطلب المنصة أي تثبيت معقد أو سيرفرات خفية (Zero-dependency static web application):

1. قم بعمل `Clone` للمستودع:
```bash
git clone https://github.com/Mohammed-3bgarino0-lgtm/job-tracker-platform.git
cd job-tracker-platform
```
2. افتح ملف `index.html` في أي متصفح (Chrome, Edge, Safari, Firefox).

---

## 🌐 خطوات ربط المستودع بالدومين (Custom Domain Setup)

### باستخدام GitHub Pages:
1. اذهب إلى إعدادات المستودع **Settings** -> **Pages**.
2. اختر الفرع `main` واضغط **Save**.
3. في خانة **Custom domain** أدخل `haderksa.org` واضغط **Save**.
4. في لوحة تحكم الـ DNS لدومينك، أضف السجلات التالية:
   - **Type A:** `@` -> `185.199.108.153`
   - **Type A:** `@` -> `185.199.109.153`
   - **Type CNAME:** `www` -> `Mohammed-3bgarino0-lgtm.github.io`

---

## 👨‍💻 المطور صاحب سيرات التوظيف
**محمد السكران | Mohammed H. Al-Sakran**
- 📍 الرياض، المملكة العربية السعودية
- 📧 البريد الإلكتروني: mohammed-alsakran@hotmail.com
- 🔗 [LinkedIn Profile](https://www.linkedin.com/in/mohammed-h-al-sakran/)
