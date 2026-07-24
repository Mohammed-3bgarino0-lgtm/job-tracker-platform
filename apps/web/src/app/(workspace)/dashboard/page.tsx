import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';

const onboardingSteps = [
  {
    title: 'أنشئ ملفك الوظيفي',
    description: 'اعتمد بياناتك الأساسية والخبرات والتعليم والمهارات.',
    href: '/profile',
    label: 'فتح الملف الوظيفي',
  },
  {
    title: 'ارفع سيرتك الذاتية',
    description: 'استخرج البيانات من PDF أو DOCX ثم راجعها بنفسك.',
    href: '/resume',
    label: 'رفع السيرة',
  },
  {
    title: 'حدد ما تبحث عنه',
    description: 'أضف المسميات والمدن والمصادر التي تهمك.',
    href: '/searches',
    label: 'إعداد البحث',
  },
  {
    title: 'اربط أجهزتك',
    description: 'جهز إضافة المتصفح وتطبيقات الجوال للمزامنة لاحقًا.',
    href: '/devices',
    label: 'إدارة الأجهزة',
  },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="لوحة قدّم"
        title="ابدأ رحلتك الوظيفية من ملف واحد"
        description="هذه اللوحة تعرض الوظائف والطلبات والتنبيهات الحقيقية بعد ربط حسابك ومصادرك. لا توجد أرقام أو فرص تجريبية."
        actions={
          <Link
            href="/jobs"
            className="rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-black text-white transition hover:bg-emerald-900"
          >
            البحث عن وظائف
          </Link>
        }
      />

      <section className="rounded-[2rem] bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700 p-6 text-white shadow-xl md:p-8">
        <p className="text-xs font-black text-emerald-200">خطة البدء</p>
        <h2 className="mt-2 text-2xl font-black">جهز حسابك قبل التقديم</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-emerald-100">
          كل خطوة تربط جزءًا من ملفك بالمساعد. لن يستخدم قدّم أي قيمة قبل أن تعتمدها.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {onboardingSteps.map((step, index) => (
            <article
              key={step.href}
              className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/15 text-xs font-black">
                {index + 1}
              </span>
              <h3 className="mt-4 font-black">{step.title}</h3>
              <p className="mt-2 min-h-12 text-xs leading-6 text-emerald-100">
                {step.description}
              </p>
              <Link
                href={step.href}
                className="mt-4 inline-flex text-xs font-black text-white underline decoration-emerald-300 underline-offset-4"
              >
                {step.label}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-950">الوظائف المناسبة</h2>
            <Link href="/jobs" className="text-xs font-black text-emerald-700">
              عرض البحث
            </Link>
          </div>
          <EmptyState
            title="لا توجد وظائف مستوردة بعد"
            description="ستظهر هنا الوظائف القادمة من المصادر الرسمية ومواقع الشركات وX بعد ربط موصلات البحث."
            actionLabel="فتح صفحة الوظائف"
            actionHref="/jobs"
          />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-950">آخر طلبات التوظيف</h2>
            <Link
              href="/applications"
              className="text-xs font-black text-emerald-700"
            >
              عرض الطلبات
            </Link>
          </div>
          <EmptyState
            title="لم تسجل أي طلب حتى الآن"
            description="بعد التقديم وتأكيد نجاح الإرسال، سيظهر الطلب هنا مع حالته وسجله الزمني."
            actionLabel="فتح لوحة الطلبات"
            actionHref="/applications"
          />
        </section>
      </div>
    </>
  );
}
