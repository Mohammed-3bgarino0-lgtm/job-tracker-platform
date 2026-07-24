import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Sparkles, CheckCircle2, Shield, Zap, FileText, Send, Chrome, Layers } from 'lucide-react';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-tajawal">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">مميزات منصة قدّم | Qaddem AI</span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">حلول متكاملة تضعك في صدارة المتقدمين</h1>
          <p className="text-slate-600 text-sm">أدوات ذكية تحافظ على خصوصيتك وتسهل التقديم والبحث والمتابعة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="clean-card p-8 space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center font-bold text-xl">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-xl text-slate-900">1. استخراج ومراجعة السيرة الذاتية</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              استخراج 25+ حقلاً من ملفات PDF و DOCX والصور مع عرض نسبة الثقة ومصدر النص، ومراجعة إلزامية للتعديل والحذف والتأكيد قبل الحفظ.
            </p>
          </div>

          <div className="clean-card p-8 space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center font-bold text-xl">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-xl text-slate-900">2. التقديم من إعلانات التواصل الاجتماعي</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              سحب الإيميلات وأرقام الجوال من منشورات X ولينكد إن وتوليد رسالة تقديم منمقة بـ HTML مع فحص حماية النطاقات ومكافحة الـ Spam.
            </p>
          </div>

          <div className="clean-card p-8 space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center font-bold text-xl">
              <Chrome className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-xl text-slate-900">3. إضافة Chrome (Manifest V3) مع زر "حفظ في قدّم"</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              تكتشف النماذج وتساعدك على تعبئة الحقول عبر لوحة مراجعة جانبية، دون أي تجاوز لاختبارات CAPTCHA أو OTP أو نفاذ.
            </p>
          </div>

          <div className="clean-card p-8 space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center font-bold text-xl">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-xl text-slate-900">4. متتبع الطلبات (Kanban Board)</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              تتبع شامل عبر 11 حالة منظمة مع تذكيرات المتابعة التلقائية وتوثيق المرفقات والردود الواردة.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
