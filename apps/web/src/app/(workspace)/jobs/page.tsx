import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';

const plannedSources = [
  'المنصات الرسمية',
  'مواقع الشركات',
  'منصات التوظيف',
  'X والمنشورات العامة',
  'الروابط التي يضيفها المستخدم',
];

export default function JobsPage() {
  return (
    <>
      <PageHeader
        eyebrow="محرك الاكتشاف"
        title="البحث الموحد عن الوظائف"
        description="ستجمع هذه الصفحة الوظائف من المصادر الموثوقة، توحد بياناتها، تزيل التكرار، وتعرض سبب المطابقة مع ملفك."
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]">
          <label className="block">
            <span className="mb-2 block text-xs font-black text-slate-700">
              المسمى أو المهارة
            </span>
            <input
              type="search"
              placeholder="مثال: مطور Android أو محاسب"
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none disabled:cursor-not-allowed"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-black text-slate-700">
              المدينة أو نمط العمل
            </span>
            <input
              type="search"
              placeholder="الرياض، جدة، عن بعد"
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none disabled:cursor-not-allowed"
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              disabled
              className="w-full rounded-xl bg-slate-200 px-5 py-3 text-sm font-black text-slate-500 md:w-auto"
            >
              يبدأ بعد ربط المصادر
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {plannedSources.map((source) => (
            <span
              key={source}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600"
            >
              {source}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <EmptyState
          title="لم يتم ربط مصادر الوظائف بعد"
          description="بعد تنفيذ موصلات المصادر وجسر إضافة المتصفح، ستظهر النتائج هنا مع المصدر الأصلي وتاريخ الاكتشاف ودرجة المطابقة وأسبابها."
          actionLabel="إعداد عمليات البحث"
          actionHref="/searches"
        />
      </section>
    </>
  );
}
