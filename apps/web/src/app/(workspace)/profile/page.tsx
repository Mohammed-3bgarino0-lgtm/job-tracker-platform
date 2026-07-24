import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';

const sections = [
  ['البيانات الشخصية', 'الاسم ووسائل التواصل والمدينة والجنسية.'],
  ['الملخص المهني', 'المسمى المستهدف والنبذة وسنوات الخبرة.'],
  ['الخبرات العملية', 'الشركات والأدوار والتواريخ والإنجازات المعتمدة.'],
  ['التعليم', 'المؤهلات والتخصصات والجهات التعليمية.'],
  ['المهارات والشهادات', 'المهارات المؤكدة واللغات والشهادات المهنية.'],
  ['تفضيلات الوظائف', 'المسميات والمدن ونمط العمل والراتب المتوقع.'],
];

export default function ProfilePage() {
  return (
    <>
      <PageHeader
        eyebrow="مصدر البيانات المعتمد"
        title="الملف الوظيفي الموحد"
        description="تستخدم جميع أدوات البحث والمطابقة والتعبئة هذه البيانات فقط بعد اعتمادك لها."
        actions={
          <Link
            href="/resume"
            className="rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-black text-white"
          >
            استخراج من السيرة
          </Link>
        }
      />

      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
        <strong className="font-black">الحالة الحالية:</strong>{' '}
        لا توجد بيانات مستخدم محملة في هذه الواجهة بعد. لن نعرض أسماء أو خبرات أو مهارات افتراضية.
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map(([title, description]) => (
          <section
            key={title}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-black text-slate-950">{title}</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">
                غير مكتمل
              </span>
            </div>
            <p className="mt-3 min-h-14 text-sm leading-7 text-slate-500">
              {description}
            </p>
            <button
              type="button"
              disabled
              className="mt-5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-400"
            >
              يتاح بعد تسجيل الدخول
            </button>
          </section>
        ))}
      </div>
    </>
  );
}
