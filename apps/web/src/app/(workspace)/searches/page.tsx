import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';

export default function SearchesPage() {
  return (
    <>
      <PageHeader
        eyebrow="تنبيهات الاكتشاف"
        title="عمليات البحث المحفوظة"
        description="حدد المسميات والمهارات والمدن والمصادر ونسبة المطابقة المطلوبة، ثم استقبل الفرص الجديدة دون تكرار."
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-xs font-black text-slate-700">المسمى المستهدف</span>
            <input
              type="text"
              disabled
              placeholder="مثال: مطور تطبيقات Android"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            />
          </label>
          <label>
            <span className="mb-2 block text-xs font-black text-slate-700">المدينة أو عن بعد</span>
            <input
              type="text"
              disabled
              placeholder="مثال: الرياض أو عن بعد"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            />
          </label>
        </div>
        <p className="mt-4 text-xs leading-6 text-slate-500">
          إنشاء البحث سيُفعّل بعد تسجيل الدخول وربط مصادر الوظائف والإشعارات.
        </p>
      </section>

      <section className="mt-6">
        <EmptyState
          title="لا توجد عمليات بحث محفوظة"
          description="لن ننشئ معايير بحث أو تنبيهات بالنيابة عن المستخدم. يجب أن يحددها بنفسه ثم يعتمدها."
        />
      </section>
    </>
  );
}
