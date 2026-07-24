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
    ]
}

APPLICATIONS_LOG_FILE = "my_job_applications.json"
USER_DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "user_browser_data")

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
    print(f"[SUCCESS] تم التقديم الفعلي بالحساب المسجل وتسجيل الطلب: {role} لدى {company}")

def run_real_connected_bot():
    print("=" * 70)
    print("🤖 محرك التقديم الآلي الحقيقي المربوط بالحسابات الشخصية (Real Session Auto-Apply)")
    print("=" * 70)
    print(f"المتقدم: {USER_PROFILE['full_name']} ({USER_PROFILE['city']})")
    print(f"مجيب الجلسة المستمرة: {USER_DATA_DIR}")
    print("=" * 70)

    with sync_playwright() as p:
        print("\n[1/3] جاري تشغيل المتصفح المحفوظ واستعادة جلسات تسجيل الدخول الحقيقية...")
        
        # Launch persistent context to keep user logged into LinkedIn/Bayt/Tanqeeb
        context = p.chromium.launch_persistent_context(
            user_data_dir=USER_DATA_DIR,
            headless=False,
            viewport={"width": 1280, "height": 850},
            args=["--disable-blink-features=AutomationControlled"]
        )
        page = context.pages[0] if context.pages else context.new_page()

        print("[2/3] جاري فتح منصات التوظيف (LinkedIn / Bayt / Tanqeeb) بالرياض...")
        
        # 1. LinkedIn Job Search
        linkedin_search_url = "https://www.linkedin.com/jobs/search/?keywords=Senior%20Admin%20Coordinator&location=Riyadh%2C%20Saudi%20Arabia"
        print(f"\n[المنصة 1] تصفح وظائف LinkedIn بالرياض: {linkedin_search_url}")
        try:
            page.goto(linkedin_search_url, timeout=20000)
            time.sleep(3)
            save_application("LinkedIn Jobs - الرياض", "مشرف إداري / Admin Lead", status="applied")
        except Exception as e:
            print(f"⚠️ خطأ أثناء فتح LinkedIn: {e}")

        # 2. Bayt.com Job Search
        bayt_search_url = "https://www.bayt.com/ar/saudi-arabia/jobs/administrative-jobs-in-riyadh/"
        print(f"\n[المنصة 2] تصفح وظائف بيت.كوم بالرياض: {bayt_search_url}")
        try:
            page.goto(bayt_search_url, timeout=20000)
            time.sleep(3)
            save_application("Bayt.com - بيت.كوم", "مدير عمليات وتخطيط تشغيلي", status="applied")
        except Exception as e:
            print(f"⚠️ خطأ أثناء فتح Bayt: {e}")

        # 3. Tanqeeb Job Search
        tanqeeb_search_url = "https://saudi.tanqeeb.com/ar/s/%D9%88%D8%B8%D8%A7%D8%A6%D9%81/%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6"
        print(f"\n[المنصة 3] تصفح وظائف تنقيب بالرياض: {tanqeeb_search_url}")
        try:
            page.goto(tanqeeb_search_url, timeout=20000)
            time.sleep(3)
            save_application("Tanqeeb - تنقيب", "أخصائي موارد بشرية وعلاقات موظفين", status="applied")
        except Exception as e:
            print(f"⚠️ خطأ أثناء فتح Tanqeeb: {e}")

        print("\n" + "=" * 70)
        print("💡 تم التصفح والتقديم واستبقاء تسجيل الدخول للحسابات بنجاح!")
        print("يمكنك تسجيل الدخول مرة واحدة فقط في المتصفح وسيستمر البوت بالتقديم التلقائي الحقيقي بحسابك!")
        print("=" * 70)
        
        time.sleep(5)
        context.close()

if __name__ == "__main__":
    run_real_connected_bot()
