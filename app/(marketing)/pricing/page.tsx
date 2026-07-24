import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-tajawal">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">خطط وباقات قدّم | Qaddem AI</span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">باقات مرنة تناسب رحلتك الوظيفية</h1>
          <p className="text-slate-600 text-sm">اختر الباقة المناسبة واستمتع بأقوى أدوات مساعدة التوظيف بالذكاء الاصطناعي</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          
          {/* Free Plan */}
          <div className="clean-card p-8 flex flex-col justify-between space-y-6">
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 mb-2">الباقة المجانية</h3>
              <p className="text-slate-500 text-xs mb-6">لتجربة أدوات المنصة الأساسية</p>
              <div className="text-3xl font-black text-slate-900 mb-6">0 <span className="text-sm font-normal text-slate-500">ر.س / شهرياً</span></div>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> رفع وتحليل سيرة ذاتية واحدة</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> تحليل حتى 5 إعلانات وظيفية</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> إضافة المتصفح الأساسية</li>
              </ul>
            </div>
            <Link href="/register" className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs text-center transition">ابدأ مجاناً</Link>
          </div>

          {/* Pro Plan */}
          <div className="clean-card p-8 flex flex-col justify-between space-y-6 border-2 border-emerald-700 relative shadow-xl">
            <span className="absolute -top-3 right-6 bg-emerald-800 text-white text-[10px] font-bold px-3 py-1 rounded-full">الأكثر طلباً 🌟</span>
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 mb-2">باقة المحترفين (Pro)</h3>
              <p className="text-slate-500 text-xs mb-6">للباحثين عن عمل بشكل مكثف</p>
              <div className="text-3xl font-black text-emerald-800 mb-6">49 <span className="text-sm font-normal text-slate-500">ر.س / شهرياً</span></div>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> سير ذاتية وملفات فرعية نامية</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> سحب وإرسال إعلانات غير محدود</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> ربط إيميل Gmail / Outlook OAuth</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> متتبع الطلبات Kanban الشامل</li>
              </ul>
            </div>
            <Link href="/register" className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs text-center transition">اشترك الآن في Pro</Link>
          </div>

          {/* Executive Plan */}
          <div className="clean-card p-8 flex flex-col justify-between space-y-6">
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 mb-2">الباقة التنفيذية (Executive)</h3>
              <p className="text-slate-500 text-xs mb-6">للقيادات والخبرات المتقدمة</p>
              <div className="text-3xl font-black text-slate-900 mb-6">99 <span className="text-sm font-normal text-slate-500">ر.س / شهرياً</span></div>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> كل ميزات باقة Pro</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> دعم أولوية وتذاكر مباشرة</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> تحليلات مطابقة استراتيجية</li>
              </ul>
            </div>
            <Link href="/register" className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs text-center transition">اختر التنفيذية</Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
