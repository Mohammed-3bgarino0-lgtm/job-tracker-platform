import { ResumeWorkflow } from '@/components/resume/ResumeWorkflow';

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 md:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700 p-7 text-white shadow-xl md:p-10">
        <span className="inline-flex rounded-full border border-emerald-500/40 bg-emerald-800/70 px-3 py-1 text-xs font-black text-emerald-100">
          المرحلة الأولى — Resume Parser & Review UI
        </span>
        <h1 className="mt-5 text-3xl font-black md:text-5xl">
          قدّم | Qaddem AI
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-emerald-100 md:text-base">
          استخراج حقيقي من PDF وDOCX، درجات ثقة واضحة، ومراجعة بشرية
          إلزامية. كل قيمة غير موجودة تبقى فارغة دون تخمين.
        </p>
      </header>

      <ResumeWorkflow />
    </main>
  );
}
