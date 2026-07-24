# Automatic Deployment Script for Qaddem AI v2.0
param (
    [string]$RepoPath = "C:\Users\Moham\OneDrive\المستندات\محمد\البحث عن عمل"
)

Write-Host "🚀 بدء تنفيذ سكربت النشر التلقائي لترقية قدّم AI v2.0..." -ForegroundColor Green

Set-Location $RepoPath

Write-Host "📌 فحص حالة المستودع ورفع التعديلات..." -ForegroundColor Yellow
git add -A
git commit -m "Feat: Complete Qaddem AI Upgrade v2.0 with Live Job Search, Scraper, % Match & Custom Domain Deployment"
git push origin main

Write-Host "✅ تم بنجاح النشر والتحديث على GitHub وموقع haderksa.org!" -ForegroundColor Green
