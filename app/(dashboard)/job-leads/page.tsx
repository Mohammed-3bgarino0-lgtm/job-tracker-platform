'use client';

import { useState } from 'react';
import DashboardNav from '@/components/DashboardNav';
import Link from 'next/link';
import { Send, Plus, ArrowLeft, Search, Link as LinkIcon, FileText, Upload, Sparkles } from 'lucide-react';
import { parseJobAdContent } from '@/lib/ad-parser/ad-scraper-engine';

export default function JobLeadsPage() {
  const [adText, setAdText] = useState('');

  const handleAnalyze = () => {
    if (!adText.trim()) return;
    window.location.href = '/job-leads/review';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-tajawal">
      <DashboardNav />

      <main className="flex-1 p-6 md:p-10 max-w-5xl space-y-6">
        
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">التقديم من إعلان أو منشور</h1>
            <p className="text-xs text-slate-500">إضافة وتحليل الفرص الوظيفية المنشورة في X، لينكد إن، إنستغرام، الواتساب، والبريد الإلكتروني</p>
          </div>
        </div>

        {/* Form Input Card */}
        <div className="clean-card p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center font-bold">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">إضافة إعلان أو فرصة وظيفية جديدة</h3>
              <p className="text-xs text-slate-500">اختر طريقة الإضافة المناسبة واستخرج وسائل التواصل فوراً</p>
            </div>
          </div>

          <textarea
            value={adText}
            onChange={(e) => setAdText(e.target.value)}
            placeholder="الصق رابط الإعلان (من X أو LinkedIn)، نص المنشور، أو تفاصيل الإعلان هنا..."
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>طرق الدعم:</span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-lg">رابط منشور</span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-lg">نص مقتطع</span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-lg">صورة (OCR)</span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-lg">إعادة توجيه إيميل</span>
            </div>

            <button
              onClick={handleAnalyze}
              className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> تحليل الإعلان وانتقال لشاشة المراجعة <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
