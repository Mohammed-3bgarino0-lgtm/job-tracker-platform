'use client';

import { useState } from 'react';
import DashboardNav from '@/components/DashboardNav';
import { generateCoverLetterText } from '@/lib/cover-letter/cover-letter-engine';
import { Sparkles, Copy, FileText, Language } from 'lucide-react';

export default function CoverLettersPage() {
  const [jobTitle, setJobTitle] = useState('مشرف إداري ومسؤول عمليات');
  const [companyName, setCompanyName] = useState('شركة سابك (SABIC)');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [tone, setTone] = useState<'Professional' | 'Executive' | 'Short'>('Professional');

  const letterText = generateCoverLetterText({
    jobTitle,
    companyName,
    applicantName: 'محمد السكران',
    language: lang,
    tone
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(letterText);
    alert('تم نسخ الخطاب التعريفي المخصص إلى الحافظة بنجاح!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-tajawal">
      <DashboardNav />

      <main className="flex-1 p-6 md:p-10 max-w-5xl space-y-6">
        
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">صانع الخطابات التعريفية المخصصة (Cover Letter Generator)</h1>
            <p className="text-xs text-slate-500">توليد خطابات موجهة لكل وظيفة بناءً على السيرة واللغة والنبرة المحددة دون هلوسة مهارات غير حقيقية</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="clean-card p-6 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">إعدادات الخطاب</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المسمى الوظيفي المستهدف</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الشركة</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">اللغة</label>
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value as 'ar' | 'en')}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">النبرة</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as any)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="Professional">رسمي احترافي</option>
                    <option value="Executive">تنفيذي مالي</option>
                    <option value="Short">مختصر وسريع</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="clean-card p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-sm text-slate-900">الخطاب التعريفي المخصص النامج:</h3>
              <button onClick={handleCopy} className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1">
                <Copy className="w-3.5 h-3.5" /> نسخ النص
              </button>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-semibold text-slate-800 h-64 overflow-y-auto">
              {letterText}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
