import DashboardNav from '@/components/DashboardNav';
import { ShieldAlert, Users, FileText, Send, CheckCircle2, ShieldCheck, Activity, Layers } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex font-tajawal">
      <DashboardNav />

      <main className="flex-1 p-6 md:p-10 max-w-6xl space-y-6">
        
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-emerald-800" /> لوحة إدارة المنصة والـ System Analytics (Super Admin)
            </h1>
            <p className="text-xs text-slate-500">مراقبة أداء النظام، نجاح تحليل السير، حالة محولات المواقع Adapters، وسجل العمليات الحساسة</p>
          </div>
          <span className="text-xs font-bold text-white bg-slate-900 px-3 py-1.5 rounded-full shadow-sm">النظام: نشط وحي 100%</span>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="clean-card p-5 space-y-1">
            <span className="text-slate-500 text-xs font-bold">إجمالي المستخدمين</span>
            <div className="text-2xl font-black text-slate-900">1,248</div>
            <span className="text-[10px] text-emerald-700 font-bold">+12% هذا الشهر</span>
          </div>

          <div className="clean-card p-5 space-y-1">
            <span className="text-slate-500 text-xs font-bold">السير الذاتية المرفوعة</span>
            <div className="text-2xl font-black text-emerald-800">2,850</div>
            <span className="text-[10px] text-emerald-700 font-bold">نسبة نجاح الاستخراج 98.4%</span>
          </div>

          <div className="clean-card p-5 space-y-1">
            <span className="text-slate-500 text-xs font-bold">الإعلانات المسحوبة</span>
            <div className="text-2xl font-black text-slate-900">5,910</div>
            <span className="text-[10px] text-emerald-700 font-bold">X / LinkedIn / OCR</span>
          </div>

          <div className="clean-card p-5 space-y-1">
            <span className="text-slate-500 text-xs font-bold">طلبات التوظيف المعتمة</span>
            <div className="text-2xl font-black text-emerald-800">12,400</div>
            <span className="text-[10px] text-emerald-700 font-bold">بموافقات صريحة 100%</span>
          </div>
        </div>

        {/* Adapters Status & Audit Logs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="clean-card p-6 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-800" /> حالة محولات النماذج (Site Adapters)
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800">Generic Form Adapter v1.4</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">متوافق 100%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800">LinkedIn Easy Apply Adapter v2.1</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">متوافق 100%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800">Bayt Form Adapter v1.8</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">متوافق 100%</span>
              </div>
            </div>
          </div>

          <div className="clean-card p-6 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-800" /> سجل العمليات الحساسة والأمان (Audit Logs)
            </h3>
            <div className="space-y-2 text-[11px] font-semibold text-slate-700">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">[13:04:10] اعتماد إرسال بريد إلكتروني تفاعلي للمستخدم U-102 (موافقة صريحة)</div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">[12:58:40] فحص سلامة نطاق بريد مستلم hr@sabic-ksa.com (لا توجد محاذير)</div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">[12:45:00] تحديث إصدار Generic Form Adapter v1.4 ورصد عدم تجاوز CAPTCHA</div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
