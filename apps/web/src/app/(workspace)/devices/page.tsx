import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';

const channels = [
  {
    title: 'إضافة Chrome للكمبيوتر',
    description: 'قراءة صفحات الوظائف المفتوحة، اكتشاف الحقول، وإرسال النتائج إلى حساب المستخدم بعد الربط الآمن.',
    status: 'قيد التطوير',
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
        description="إدارة الأجهزة المصرح لها بمزامنة الوظائف وحزم التقديم، مع إمكانية إلغاء أي جهاز من الحساب."
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

      <section className="mt-6">
        <EmptyState
          title="لا توجد أجهزة مرتبطة"
          description="سيظهر كل جهاز بعد تسجيل الدخول وإتمام رمز الربط والموافقة الصريحة من المستخدم."
        />
      </section>
    </>
  );
}
