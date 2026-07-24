import Link from 'next/link';
import { ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-700 text-white rounded-xl flex items-center justify-center font-bold text-lg">
                قدّم
              </div>
              <span className="text-xl font-extrabold text-white">قدّم | Qaddem AI</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              المنصة السعودية الذكية لمساعدة الباحثين عن عمل على رفع وإدارة السير الذاتية وتسهيل التقديم التفاعلي بأمان تام وموافقة صريحة.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" /> ملتزمون بعدم تجاوز اختبارات CAPTCHA أو OTP أو نفاذ
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-base mb-4">المنصة والحلول</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/features" className="hover:text-emerald-400 transition">تحليل السيرة الذاتية</Link></li>
              <li><Link href="/job-leads" className="hover:text-emerald-400 transition">التقديم من إعلان أو منشور</Link></li>
              <li><Link href="/applications/kanban" className="hover:text-emerald-400 transition">متتبع الطلبات (Kanban)</Link></li>
              <li><Link href="/cover-letters" className="hover:text-emerald-400 transition">صانع الخطابات المخصصة</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-base mb-4">الدعم والأمان</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/privacy" className="hover:text-emerald-400 transition">سياسة الخصوصية وحماية البيانات</Link></li>
              <li><Link href="/terms" className="hover:text-emerald-400 transition">شروط الاستخدام</Link></li>
              <li><Link href="/faq" className="hover:text-emerald-400 transition">الأسئلة الشائعة</Link></li>
              <li><Link href="/settings/data-privacy" className="hover:text-emerald-400 transition">حذف وتصدير البيانات</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-base mb-4">تواصل معنا</h4>
            <p className="text-xs text-slate-400 mb-3">المملكة العربية السعودية - الرياض</p>
            <p className="text-sm font-bold text-white">support@qaddem.ai</p>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} قدّم | Qaddem AI. جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-1">صُمم بحب وتفوق تقني <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" /> في المملكة العربية السعودية</p>
        </div>
      </div>
    </footer>
  );
}
