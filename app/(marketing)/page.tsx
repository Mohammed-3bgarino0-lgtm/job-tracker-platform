'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Sparkles, ArrowLeft, ShieldCheck, CheckCircle2, Search, Link as LinkIcon, FileText, Upload, Send, Lock, Briefcase, FileCheck, Layers } from 'lucide-react';
import { parseJobAdContent } from '@/lib/ad-parser/ad-scraper-engine';

export default function HomePage() {
  const [adInput, setAdInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleAnalyze = () => {
    if (!adInput.trim()) return;
    const res = parseJobAdContent(adInput);
    setAnalysisResult(res);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-tajawal">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-800/60 border border-emerald-600/40 text-emerald-300 text-xs font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" /> المنصة الذكية الموثوقة لمساعدة التوظيف في السعودية
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black leading-tight">
              ابنِ ملفك الوظيفي الموحد وقدّم بثقة وسرعة وبإشرافك التام
            </h1>
            
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              ارفع سيرتك الذاتية مرة واحدة، استخرج بياناتها بتدقيق ناصع، وحلّل الإعلانات والمنشورات بالذكاء الاصطناعي مع التزام كامل بعدم التقديم إلا بموافقتك ومراجعتك الصريحة.
            </p>
          </div>

          {/* Quick Input Box: "وجدت إعلان وظيفة؟" */}
          <div className="max-w-3xl mx-auto bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center font-bold">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">وجدت إعلان وظيفة؟</h3>
                  <p className="text-xs text-slate-500">الصق رابط الإعلان، نص المنشور، أو ارفع صورة واستخرج بيانات التواصل فوراً</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">تحليل تلقائي آمن</span>
            </div>

            <div className="space-y-4">
              <textarea
                value={adInput}
                onChange={(e) => setAdInput(e.target.value)}
                placeholder="الصق رابط المنشور (من X أو LinkedIn)، نص الإعلان، أو تفاصيل الفرصة الوظيفية هنا..."
                className="w-full h-28 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><LinkIcon className="w-3.5 h-3.5" /> روابط</span>
                  <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> نصوص</span>
                  <span className="flex items-center gap-1"><Upload className="w-3.5 h-3.5" /> صور OCR</span>
                </div>

                <button
                  onClick={handleAnalyze}
                  className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> تحليل الإعلان وإعداد التقديم
                </button>
              </div>

              {/* Analysis Preview Card */}
              {analysisResult && (
                <div className="mt-6 p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-right space-y-3">
                  <div className="flex justify-between items-center border-b border-emerald-200/60 pb-3">
                    <span className="font-extrabold text-emerald-900 text-sm">نتائج تحليل الإعلان الوظيفي:</span>
                    <span className="text-xs font-bold bg-emerald-800 text-white px-2.5 py-0.5 rounded-full">{analysisResult.companyName}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div><strong className="text-slate-700">المسمى:</strong> {analysisResult.jobTitle}</div>
                    <div><strong className="text-slate-700">المدينة:</strong> {analysisResult.city}</div>
                    <div><strong className="text-slate-700">البريد المستخرج:</strong> <span className="text-emerald-800 font-bold">{analysisResult.primaryEmail}</span></div>
                    <div><strong className="text-slate-700">المرجع:</strong> {analysisResult.referenceNumber}</div>
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    <Link href="/job-leads/review" className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1">
                      متابعة ومراجعة إيميل HTML التقديم <ArrowLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Safety & Non-Bypass Guarantee */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" /> التزام صارم بالأمان والخصوصية
              </div>
              <h3 className="text-xl font-extrabold">منصة مساعدة تفاعلية بموافقات صريحة، وليست بوت إرسال عشوائي</h3>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
                لا نتجاوز اختبارات CAPTCHA أو OTP أو نفاذ، ولا نرسل أي بريد أو طلب توظيف دون مراجعتك وضغطك زر الإرسال بنفسك.
              </p>
            </div>
            <Link href="/privacy" className="px-5 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs whitespace-nowrap transition">
              سياسة الخصوصية والأمان
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">مميزات منصة «قدّم | Qaddem AI»</h2>
            <p className="text-slate-600 text-sm">حلول متكاملة تضمن احترافية تقديمك وحماية بياناتك بالكامل</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="clean-card p-6 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center font-bold text-xl">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">تحليل السيرة مع الثقة والمصدر</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                استخراج 25+ حقلاً من سيرتك مع إظهار نسبة الثقة ومصدر النص وشاشة مراجعة إلزامية للتعديل والتأكيد.
              </p>
            </div>

            <div className="clean-card p-6 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center font-bold text-xl">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">التقديم من إعلان أو منشور</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                سحب الإيميلات وأرقام الواتساب من منشورات X ولينكد إن وتوليد رسالة HTML منمقة ومرفقة بالسيرة ومفحوصة ضد الرسائل المزعجة.
              </p>
            </div>

            <div className="clean-card p-6 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center font-bold text-xl">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">متتبع الطلبات (Kanban Board)</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                متابعة الطلبات عبر 11 حالة منظمة (مقترحة، تم التقديم، مقابلة، عرض) مع سجل التعديلات ومواعيد المتابعة.
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
