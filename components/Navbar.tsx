import Link from 'next/link';
import { Briefcase, User, Sparkles, Shield, Compass, Lock } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 bg-emerald-800 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-md group-hover:bg-emerald-700 transition">
            قدّم
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 block leading-tight">قدّم | Qaddem AI</span>
            <span className="text-xs font-medium text-emerald-700">مساعد التوظيف الذكي السعودي</span>
          </div>
        </Link>

        {/* Nav Navigation links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-800 hover:bg-slate-100 rounded-lg transition">الرئيسية</Link>
          <Link href="/features" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-800 hover:bg-slate-100 rounded-lg transition">المميزات</Link>
          <Link href="/pricing" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-800 hover:bg-slate-100 rounded-lg transition">الأسعار</Link>
          <Link href="/faq" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-800 hover:bg-slate-100 rounded-lg transition">الأسئلة الشائعة</Link>
          <Link href="/privacy" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-800 hover:bg-slate-100 rounded-lg transition">الأمان والخصوصية</Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-700" />
            تسجيل الدخول
          </Link>
          <Link href="/register" className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-700 rounded-xl shadow-md transition flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            إنشاء حساب جديد
          </Link>
        </div>

      </div>
    </header>
  );
}
