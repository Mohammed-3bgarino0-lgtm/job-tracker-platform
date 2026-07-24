import Link from 'next/link';

const capabilities = [
  {
    title: 'ابحث من مكان واحد',
    description: 'مصادر رسمية، مواقع شركات، منصات توظيف، وروابط ومنشورات يضيفها المستخدم.',
  },
  {
    title: 'اعرف سبب المطابقة',
    description: 'نسبة مفسرة بالمهارات والخبرة والموقع والشروط، دون درجات غامضة أو بيانات مخترعة.',
  },
  {
    title: 'قدّم بمراجعتك',
    description: 'تجهيز السيرة والإجابات وتعبئة الحقول الموثوقة، مع بقاء زر الإرسال النهائي بيدك.',
  },
  {
    title: 'تابع كل طلب',
    description: 'سجل زمني موحد للطلبات والمقابلات والاختبارات والعروض الوظيفية.',
  },
];

const journey = [
  'إنشاء الحساب والملف الوظيفي',
  'رفع السيرة ومراجعة البيانات',
  'تحديد الوظائف والمصادر المستهدفة',
  'استقبال الفرص وإزالة التكرار',
  'تجهيز حزمة التقديم',
  'المراجعة والإرسال من المستخدم',
  'متابعة حالة الطلب',
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.28),transparent_42%),radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_35%)]" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500 text-lg font-black text-emerald-950">
            ق
          </span>
          <span>
            <span className="block text-lg font-black">قدّم AI</span>
            <span className="block text-[11px] text-emerald-200">Qaddem AI</span>
          </span>
        </Link>
        <Link
          href="/dashboard"
          className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-black backdrop-blur transition hover:bg-white/15"
        >
          فتح لوحة العمل
        </Link>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-16 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-24">
        <div>
          <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-black text-emerald-200">
            مساعد بحث وتقديم ومتابعة — بقرار المستخدم
          </span>
          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
            ملف وظيفي واحد يبحث معك ويساعدك على التقديم.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
            قدّم يجمع فرص العمل من المصادر المتاحة، يحلل ملاءمتها، يجهز بيانات التقديم، ويترك لك المراجعة والقرار النهائي.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-2xl bg-emerald-500 px-6 py-3.5 text-sm font-black text-emerald-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
            >
              ابدأ من لوحة العمل
            </Link>
            <Link
              href="/resume"
              className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-black transition hover:bg-white/10"
            >
              جرّب تحليل السيرة
            </Link>
          </div>
          <p className="mt-5 text-xs leading-6 text-slate-400">
            لا تخمين للبيانات، لا تجاوز للتحقق، ولا إرسال نهائي دون المستخدم.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur md:p-6">
          <div className="rounded-3xl bg-white p-5 text-slate-950">
            <p className="text-xs font-black text-emerald-700">طريقة الاستخدام</p>
            <div className="mt-4 space-y-3">
              {journey.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-100 text-xs font-black text-emerald-800">
                    {index + 1}
                  </span>
                  <span className="text-sm font-bold">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-16 md:grid-cols-2 md:px-8 xl:grid-cols-4">
          {capabilities.map((capability) => (
            <article key={capability.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-black">{capability.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{capability.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
