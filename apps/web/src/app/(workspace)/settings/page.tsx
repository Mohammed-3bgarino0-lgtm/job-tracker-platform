import { PageHeader } from '@/components/ui/PageHeader';

const settingsSections = [
  {
    title: 'الموافقات والخصوصية',
    description: 'إدارة موافقات تحليل السيرة، تعبئة النماذج، إرسال البريد، ومزامنة الأجهزة.',
  },
  {
    title: 'الإشعارات',
    description: 'اختيار تنبيهات الوظائف الجديدة والطلبات والمقابلات والقنوات المفضلة.',
  },
  {
    title: 'الأمان والجلسات',
    description: 'عرض الجلسات والأجهزة، تسجيل الخروج منها، وتحديث وسائل الاسترداد.',
  },
  {
    title: 'إدارة البيانات',
    description: 'تصدير البيانات أو حذف السيرة أو حذف الحساب وفق مسار واضح وقابل للتدقيق.',
  },
];

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="تحكم المستخدم"
        title="الإعدادات والخصوصية"
        description="لا تُفعّل أي صلاحية حساسة تلقائيًا. كل موافقة يجب أن تكون واضحة ويمكن سحبها لاحقًا."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {settingsSections.map((section) => (
          <section
            key={section.title}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-black text-slate-950">{section.title}</h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">{section.description}</p>
            <button
              type="button"
              disabled
              className="mt-5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-400"
            >
              يتاح بعد نظام الحسابات
            </button>
          </section>
        ))}
      </div>

      <section className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-5">
        <h2 className="font-black text-red-950">منطقة إدارة البيانات الحساسة</h2>
        <p className="mt-2 text-sm leading-7 text-red-800">
          حذف الحساب أو الملفات سيحتاج إعادة تحقق وتأكيدًا صريحًا، مع تسجيل العملية في سجل التدقيق.
        </p>
      </section>
    </>
  );
}
