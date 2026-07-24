# 🛠️ دليل أوامر التشغيل والنشر اليدوي | قدّم AI v2.0

## 1. التحديث المباشر والرفع إلى GitHub:
```powershell
Set-ExecutionPolicy -Scope Process Bypass
git add -A
git commit -m "Feat: Deploy Qaddem AI Upgrade v2.0 with Live Jobs, Scraper & Custom Domain"
git push origin main
```

## 2. تشغيل بيئة تطوير Next.js و Prisma:
```bash
# تثبيت التبعيات
npm install

# توليد Prisma Client لقاعدة البيانات 45+ Tables
npx prisma generate

# تشغيل الخادم المحلي
npm run dev
```

## 3. تشغيل الحاويات بـ Docker Compose:
```bash
docker-compose up -d --build
```
