# PowerShell Deployment Script for v1.3 Fixes
param (
    [string]$RepoPath = "C:\Users\Moham\OneDrive\المستندات\محمد\البحث عن عمل"
)

Write-Host "🚀 بدء تنفيذ deploy-fix.ps1 للنسخة v1.3 الفعالية بدون بيانات وهمية..." -ForegroundColor Green

Set-Location $RepoPath

git add -A
git commit -m "Fix: Qaddem AI v1.3 Job Parser Fixes - Zero Dummy Data & Independent Card Scanning"
git push origin main

Write-Host "✅ تم بنجاح النشر والتحديث للنسخة v1.3 على GitHub وموقع haderksa.org!" -ForegroundColor Green
