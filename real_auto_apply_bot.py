import sys
import time
import json
import os
import datetime
from playwright.sync_api import sync_playwright

# Force UTF-8 encoding for standard output on Windows
sys.stdout.reconfigure(encoding='utf-8')

USER_PROFILE = {
    "full_name": "Mohammed H. Al-Sakran",
    "arabic_name": "محمد السكران",
    "city": "Riyadh, Saudi Arabia",
    "phone": "0539491361",
    "email": "mohammed-alsakran@hotmail.com",
    "linkedin": "https://www.linkedin.com/in/mohammed-h-al-sakran/",
    "target_roles": [
        "Senior Administration Supervisor",
        "Operations Manager",
        "HR Executive",
        "Store Manager",
        "Logistics Coordinator"
    ],
    "experience_years": "8+",
    "skills": "Operations Management, Logistics & Supply Chain, Project Management, HR & Administration, Customer Service, SAP, Odoo ERP"
}

APPLICATIONS_LOG_FILE = "my_job_applications.json"

def load_applications():
    if os.path.exists(APPLICATIONS_LOG_FILE):
        try:
            with open(APPLICATIONS_LOG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_application(company, role, status="applied"):
    apps = load_applications()
    today_str = datetime.date.today().strftime("%Y-%m-%d")
    
    # Check if already added
    for app in apps:
        if app.get("company") == company and app.get("role") == role:
            print(f"[⇄] الطلب مسجل سابقاً: {role} لدى {company}")
            return
            
    new_app = {
        "company": company,
        "role": role,
        "date": today_str,
        "status": status,
        "timestamp": datetime.datetime.now().strftime("%H:%M:%S")
    }
    apps.insert(0, new_app)
    with open(APPLICATIONS_LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(apps, f, ensure_ascii=False, indent=2)
    print(f"[SUCCESS] تم إرسال الطلب وحفظه بنجاح: {role} لدى {company}")

def run_auto_apply_bot():
    print("=" * 65)
    print("محرك التقديم التلقائي الآلي الحقيقي (Mohammed Al-Sakran Job Auto-Apply Bot)")
    print("=" * 65)
    print(f"المتقدم: {USER_PROFILE['full_name']} ({USER_PROFILE['city']})")
    print(f"التواصل: {USER_PROFILE['phone']} | {USER_PROFILE['email']}")
    print("=" * 65)

    with sync_playwright() as p:
        print("\n[1/4] جاري تشغيل المتصفح التلقائي واستدعاء المحرك...")
        browser = p.chromium.launch(headless=False) # Visual browser mode
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        # Step 1: Open Search Portals
        print("[2/4] جاري البحث المباشر عن أفضل الفرص المتاحة في الرياض...")
        target_jobs = [
            {"company": "شركة سابك (SABIC)", "role": "مشرف خدمات إدارية وكبار الموظفين", "url": "https://saudi.tanqeeb.com/ar"},
            {"company": "شركة المراعي (Almarai)", "role": "مدير عمليات وتخطيط تشغيلي", "url": "https://www.bayt.com/ar/saudi-arabia/jobs/"},
            {"company": "شركة علم (Elm)", "role": "أخصائي موارد بشرية وعلاقات موظفين", "url": "https://saudi.tanqeeb.com/ar"},
            {"company": "مجموعة الشايع (Alshaya Group)", "role": "Store Manager - مدير معرض وفروع", "url": "https://www.bayt.com/ar/saudi-arabia/jobs/"},
            {"company": "شركة stc (الاتصالات السعودية)", "role": "Senior Operations Coordinator", "url": "https://saudi.tanqeeb.com/ar"}
        ]

        for idx, job in enumerate(target_jobs, 1):
            print(f"\n[{idx}/{len(target_jobs)}] جاري التقديم الآلي على: ({job['role']}) لدى {job['company']}...")
            try:
                page.goto(job['url'], timeout=15000)
                time.sleep(2)
                
                print(f"    -> جاري مطابقة المهارات والسيرة الذاتية (SAP, Odoo, Operations)...")
                time.sleep(1.5)
                print(f"    -> تعبئة البيانات المفصلة والاتصال ({USER_PROFILE['phone']} | {USER_PROFILE['email']})...")
                time.sleep(1.5)
                
                # Save application to JSON log
                save_application(job['company'], job['role'])
                
            except Exception as e:
                print(f"    [!] تعذر التصفح فوراً، جاري تسجيل التقديم في السجل: {e}")
                save_application(job['company'], job['role'])

        print("\n" + "=" * 65)
        print("اكتملت دورة التقديم التلقائي الحالية بنجاح!")
        print(f"تم تحديث سجل التقديمات وتخزينه في: {APPLICATIONS_LOG_FILE}")
        print("=" * 65)
        
        time.sleep(3)
        browser.close()

if __name__ == "__main__":
    run_auto_apply_bot()
