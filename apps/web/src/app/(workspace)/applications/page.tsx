import { PageHeader } from '@/components/ui/PageHeader';

const stages = [
  { key: 'saved', label: 'محفوظة', description: 'فرص تريد الرجوع إليها.' },
  { key: 'review', label: 'تحتاج مراجعة', description: 'بيانات أو أسئلة لم تُعتمد.' },
  { key: 'ready', label: 'جاهزة للتقديم', description: 'حزمة التقديم مكتملة.' },
  { key: 'applied', label: 'تم التقديم', description: 'طلبات أكد المستخدم إرسالها.' },
  { key: 'progress', label: 'قيد المتابعة', description: 'اختبار أو مقابلة أو مراجعة.' },
];

export default function ApplicationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="متابعة الطلبات"
        title="كل طلب في مكانه الصحيح"
        description="يعرض السجل الزمني، نسخة السيرة المستخدمة، طريقة التقديم، المواعيد، وآخر تحديث مؤكد."
      />

      <div className="overflow-x-auto pb-3">
        <div className="grid min-w-[1050px] grid-cols-5 gap-4">
          {stages.map((stage) => (
            <section
              key={stage.key}
              className="min-h-[390px] rounded-3xl border border-slate-200 bg-slate-100/70 p-3"
            >
              <header className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-black text-slate-950">{stage.label}</h2>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-500">
                    0
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {stage.description}
                </p>
              </header>

              <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 text-center text-xs leading-6 text-slate-500">
                لا توجد طلبات مؤكدة في هذه المرحلة.
              </div>
            </section>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs leading-6 text-slate-500">
        لا ينتقل الطلب إلى «تم التقديم» إلا بعد تأكيد المستخدم نجاح الإرسال أو وجود دليل واضح من صفحة التوظيف.
      </p>
    </>
  );
}
