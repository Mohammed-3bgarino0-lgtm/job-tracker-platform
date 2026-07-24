import Link from 'next/link';
import { LayoutDashboard, FileText, Send, Layers, UserCheck, Briefcase, Settings, ShieldCheck, Mail, ShieldAlert, Sparkles, Inbox } from 'lucide-react';

export default function DashboardNav() {
  return (
    <aside className="w-64 bg-white border-l border-slate-200 min-h-screen p-6 hidden md:block space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 bg-emerald-800 text-white rounded-xl flex items-center justify-center font-bold text-lg">
          قدّم
        </div>
        <div>
          <h3 className="font-extrabold text-sm text-slate-900">قدّم | Qaddem AI</h3>
          <span className="text-[10px] text-emerald-700 font-bold">لوحة المستخدم الذكية</span>
        </div>
      </div>

      <nav className="space-y-1 text-xs font-bold text-slate-700">
        <Link href="/onboarding" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-slate-100 hover:text-emerald-800 transition">
          <LayoutDashboard className="w-4 h-4 text-emerald-700" /> إعداد الملف الموحد
        </Link>
        <Link href="/resumes/upload" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-slate-100 hover:text-emerald-800 transition">
          <FileText className="w-4 h-4 text-emerald-700" /> رفع وتدقيق السيرة الذاتية
        </Link>
        <Link href="/job-leads" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-slate-100 hover:text-emerald-800 transition">
          <Send className="w-4 h-4 text-emerald-700" /> التقديم من إعلان أو منشور
        </Link>
        <Link href="/job-leads/review" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-slate-100 hover:text-emerald-800 transition">
          <Inbox className="w-4 h-4 text-emerald-700" /> مراجعة الإعلانات والـ HTML
        </Link>
        <Link href="/applications/kanban" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-slate-100 hover:text-emerald-800 transition">
          <Layers className="w-4 h-4 text-emerald-700" /> متتبع الطلبات (Kanban)
        </Link>
        <Link href="/career-profiles" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-slate-100 hover:text-emerald-800 transition">
          <Briefcase className="w-4 h-4 text-emerald-700" /> الملفات الوظيفية والفرعية
        </Link>
        <Link href="/cover-letters" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-slate-100 hover:text-emerald-800 transition">
          <Sparkles className="w-4 h-4 text-emerald-700" /> صانع خطابات التقديم
        </Link>
        <Link href="/settings" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-slate-100 hover:text-emerald-800 transition">
          <Settings className="w-4 h-4 text-emerald-700" /> إعدادات الحساب والأمان
        </Link>
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-900 text-emerald-400 hover:bg-slate-800 transition mt-4">
          <ShieldAlert className="w-4 h-4 text-emerald-400" /> لوحة إدارة المنصة (Admin)
        </Link>
      </nav>

      <div className="pt-6 border-t border-slate-100 space-y-2">
        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 font-semibold space-y-1">
          <div className="flex items-center gap-1 font-bold text-emerald-800"><ShieldCheck className="w-3.5 h-3.5" /> حماية صارمة للبيانات</div>
          <p className="text-[10px] text-slate-600">جميع عمليات التقديم والإرسال تقتصر على موافقتك الصريحة.</p>
        </div>
      </div>
    </aside>
  );
}
