import DashboardNav from '@/components/DashboardNav';
import Link from 'next/link';
import { Upload, ArrowLeft, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex font-tajawal">
      <DashboardNav />

      <main className="flex-1 p-6 md:p-10 max-w-5xl">
        <div className="space-y-6">
          
          <div className="bg-emerald-900 text-white rounded-3xl p-8 shadow-xl space-y-3">
            <span className="text-xs font-bold bg-emerald-800 text-emerald-300 px-3 py-1 rounded-full border border-emerald-700">الخطوة 1 من 2</span>
            <h1 className="text-2xl sm:text-3xl font-black">مرحباً بك في منصة قدّم | Qaddem AI</h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              دعنا نساعدك في إعداد ملفك الوظيفي الموحد. ابدأ برفع سيرتك الذاتية لاستخراج كافة المهارات والخبرات تلقائياً ومراجعتها بكل شفافية.
            </p>
          </div>

          <div className="clean-card p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-3xl flex items-center justify-center font-bold text-2xl mx-auto">
              <Upload className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="font-extrabold text-xl text-slate-900">رفع السيرة الذاتية لبدء الاستخراج</h3>
              <p className="text-slate-500 text-xs">ادعم ملفات PDF و DOCX والصور بحجم يصل إلى 10 ميجابايت</p>
            </div>

            <div className="pt-4">
              <Link href="/resumes/upload" className="px-8 py-3.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md transition inline-flex items-center gap-2">
                الانتقال لشاشة رفع السيرة الذاتية <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
