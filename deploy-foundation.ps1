# Deployment PowerShell Script for Phase 1 Foundation
param (
    [string]$RepoPath = "C:\Users\Moham\OneDrive\المستندات\محمد\البحث عن عمل"
)

Write-Host "🚀 بدء تنفيذ deploy-foundation.ps1 لبناء وحفظ المرحلة الأولى من قدّم AI..." -ForegroundColor Green

Set-Location $RepoPath

git switch main
git pull --ff-only origin main

git add -A
git commit -m "34b1307 — Build Qaddem UI and Chrome extension foundation"
git push origin main

Write-Host "✅ تم بنجاح النشر والتحديث لـ المرحلة الأولى على GitHub وموقع haderksa.org!" -ForegroundColor Green
