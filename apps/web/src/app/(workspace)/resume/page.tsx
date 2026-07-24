import { ResumeWorkflow } from '@/components/resume/ResumeWorkflow';
import { PageHeader } from '@/components/ui/PageHeader';

export default function ResumePage() {
  return (
    <>
      <PageHeader
        eyebrow="Resume Parser"
        title="رفع السيرة ومراجعة البيانات"
        description="يدعم PDF وDOCX، يعرض درجات الثقة ومقتطف المصدر، ويترك أي قيمة غير موجودة فارغة حتى تعتمدها بنفسك."
      />
      <ResumeWorkflow />
    </>
  );
}
