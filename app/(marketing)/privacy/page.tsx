import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Lock, Eye, Trash2, Database } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-tajawal">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
            <ShieldCheck className="w-4 h-4" /> سياسة الخصوصية وحماية البيانات
          </div>
          <h1 className="text-3xl font-black text-slate-900">حماية بياناتك وخصوصيتك هي أصل عملنا</h1>
          <p className="text-slate-600 text-sm">نلتزم بالكامل بالمعايير الأنظمة السعودية للخصوصية وحماية البيانات الشخصية</p>
        </div>

        <div className="clean-card p-8 space-y-6 text-slate-700 text-sm leading-relaxed">
          
          <section className="space-y-2">
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-800" /> 1. التشفير التام وعدم التدريب على البيانات
            </h3>
            <p>
              جميع السير الذاتية والملفات المرفوعة تُشفر أثناء النقل والتخزين عبر خوارزميات AES-256. لا يتم استخدام سيرتك الذاتية أو بياناتك الشخصية لتدريب نماذج الذكاء الاصطناعي العامة إطلاقاً دون موافقة صريحة ومستقلة منك.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-800" /> 2. اشتراط موافقة المستخدم الصريحة
            </h3>
            <p>
              لا تنفذ أداة المتصفح أو المنصة أي عملية إرسال بريد، أو تعبئة استمارة، أو مشاركة بيانات دون موافقتك ومراجعتك المباشرة عبر شاشة المراجعة.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-800" /> 3. حظر حفظ كلمات المرور والمصادقة الحكومية
            </h3>
            <p>
              لا تقوم المنصة بإلتقاط أو تخزين كلمات مرور مواقع التوظيف الخارجية، وتمنع بالكامل أي محاولة لتجاوز اختبارات CAPTCHA أو OTP أو نظام المصادقة الوطنية (نفاذ).
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-emerald-800" /> 4. التصدير والحذف النهائي
            </h3>
            <p>
              يحق لك في أي وقت تنزيل كافة بياناتك الملفية والسير الذاتية في صيغة موحدة، أو طلب الحذف النهائي الشامل لحسابك وكافة السجلات المرتبطة به.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
