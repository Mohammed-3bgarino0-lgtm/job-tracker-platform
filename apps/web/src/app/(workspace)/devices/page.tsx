import { ExtensionBridgePanel } from '@/components/devices/ExtensionBridgePanel';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';

const channels = [
  {
    title: 'إضافة Chrome للكمبيوتر',
    description: 'فحص الصفحات المفتوحة، معاينة النتائج، تصدير Excel، نقل آخر فحص إلى الموقع، وتحليل صور الإعلانات بعد موافقة صريحة.',
    status: 'v1.5 متاحة للاختبار',
  },
  {
    title: 'تطبيق Android',
    description: 'البحث والمشاركة والمتابعة، ثم خدمة تعبئة اختيارية يفعّلها المستخدم بنفسه.',
    status: 'مرحلة لاحقة',
  },
  {
    title: 'تطبيق iPhone وSafari Extension',
    description: 'مشاركة الروابط والصور والمساعدة في تعبئة النماذج المفتوحة داخل Safari.',
    status: 'مرحلة لاحقة',
  },
];

export default function DevicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="الربط متعدد الأجهزة"
        title="الأجهزة والإضافات"
        description="إدارة أدوات اكتشاف الوظائف ونقل النتائج إلى مساحة العمل، مع موافقات صريحة وحدود واضحة لكل عملية."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {channels.map((channel) => (
          <section
            key={channel.title}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600">
              {channel.status}
            </span>
            <h2 className="mt-4 text-lg font-black text-slate-950">{channel.title}</h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">{channel.description}</p>
          </section>
        ))}
      </div>

      <ExtensionBridgePanel />

      <section className="mt-6">
        <EmptyState
          title="لا توجد أجهزة مرتبطة بالحساب"
          description="الإضافة تعمل حاليًا في وضع محلي للمراجعة والنقل. ربط الجهاز بحساب دائم سيُفعّل بعد اكتمال تسجيل الدخول والجلسات."
        />
      </section>
    </>
  );
}
