import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function FAQPage() {
  const faqs = [
    {
      q: "هل تقوم المنصة بالتقديم التلقائي أو تجاوز اختبارات CAPTCHA / OTP / نفاذ؟",
      a: "لا مطلقاً. منصة «قدّم | Qaddem AI» هي منصة مساعدة تفاعلية وليست بوت تجاوز. نحن نلتزم بالكامل بعدم تجاوز أي اختبار أمان (CAPTCHA أو OTP أو نفاذ) ولن يتم إرسال أو تعبئة أي طلب إلا بمراجعتك وموافقتك الصريحة."
    },
    {
      q: "كيف يعمل نظام سحب الإعلانات من السوشيال ميديا؟",
      a: "يمكنك لصق رابط إعلان من X أو LinkedIn أو رفع صورة إعلان (OCR) أو إيميل مستلم. يستخرج النظام المسمى والشركة والإيميلات وأرقام الواتساب ويعرضها في شاشة مراجعة مع نسب الثقة لتختار الوسيلة المناسبة."
    },
    {
      q: "هل يتم التدريب على سيرتي الذاتية أو مشاركتها؟",
      a: "لا، بياناتك وسيرتك الذاتية ملكك الخاص وتُحفظ مشفرة. يمنع النظام منعاً باتاً استخدام بيانات سيرتك للتدريب دون موافقة مستقلة وصريحة منك."
    },
    {
      q: "كيف يمكنني حذف بياناتي نهائياً؟",
      a: "يمكنك من قسم الإعدادات (تصدير وحذف البيانات) تنزيل كافة ملفاتك وبشكل شفاف طلب الحذف النهائي لحسابك وسيرك الذاتية وسجلاتك فوراً."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-tajawal">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12 space-y-2">
          <h1 className="text-3xl font-black text-slate-900">الأسئلة الشائعة</h1>
          <p className="text-slate-600 text-sm">كل ما تحتاج معرفته عن منصة قدّم | Qaddem AI والأمان والخصوصية</p>
        </div>

        <div className="space-y-6">
          {faqs.map((f, idx) => (
            <div key={idx} className="clean-card p-6 space-y-2">
              <h3 className="font-extrabold text-lg text-emerald-900">{f.q}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
