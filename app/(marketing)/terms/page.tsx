import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-tajawal">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-slate-900">شروط الاستخدام والأمان</h1>
          <p className="text-slate-600 text-sm">القواعد الحاكمة لاستخدام منصة قدّم | Qaddem AI وإضافة المتصفح</p>
        </div>

        <div className="clean-card p-8 space-y-6 text-slate-700 text-sm leading-relaxed">
          <section className="space-y-2">
            <h3 className="font-extrabold text-lg text-slate-900">1. الاستخدام المشروع والمصداقية</h3>
            <p>
              يمنع استخدام المنصة لإدخال بيانات أو خبرات مزيفة أو شهادات غير صحيحة. المنصة مصممة لتسهيل إدارة وتقديم بياناتك الحقيقية التي تؤكد صحتها.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-lg text-slate-900">2. حظر الإرسال الجماعي العشوائي (Spam)</h3>
            <p>
              تطبق المنصة قيوداً ومعدلات إرسال يومية لمنع الإرسال الجماعي العشوائي للشركات. يُحظر استخدام المنصة لشراء أو جمع قوائم بريدية أو إزعاج مسؤولي التوظيف.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-lg text-slate-900">3. مسؤولية مراجعة الطلب والإرسال</h3>
            <p>
              المستخدم هو المسؤول الأول والوحيد عن مراجعة نص الرسالة، عنوان الإيميل، والمرفقات قبل ضغط زر الإرسال. لا تقوم المنصة بالإرسال دون إجراء المستخدم الصريح.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
