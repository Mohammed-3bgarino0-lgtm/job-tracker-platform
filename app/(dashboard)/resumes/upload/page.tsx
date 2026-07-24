'use client';

import { useState } from 'react';
import DashboardNav from '@/components/DashboardNav';
import Link from 'next/link';
import { Upload, FileText, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ResumeUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = () => {
    setIsProcessing(true);
    setTimeout(() => {
      window.location.href = '/resumes/review';
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-tajawal">
      <DashboardNav />

      <main className="flex-1 p-6 md:p-10 max-w-4xl">
        <div className="space-y-6">
          
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900">رفع السيرة الذاتية</h1>
              <p className="text-xs text-slate-500">يدعم ملفات PDF، DOCX، والصور لاستخراج 25+ حقلاً وظيفياً</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">الخطوة 2: رفع الملف</span>
          </div>

          <div className="clean-card p-10 text-center space-y-6 border-2 border-dashed border-emerald-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-3xl flex items-center justify-center font-bold text-2xl mx-auto">
              <FileText className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-lg text-slate-900">اسحب السيرة الذاتية هنا أو اضغط للاستعراض</h3>
              <p className="text-xs text-slate-500">يدعم PDF / DOCX / JPG / PNG (بحد أقصى 10 ميجابايت)</p>
            </div>

            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="hidden"
              id="resume-file-input"
            />
            <label
              htmlFor="resume-file-input"
              className="inline-block px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs cursor-pointer transition"
            >
              {selectedFile ? selectedFile.name : 'اختر ملف من جهازك'}
            </label>

            {selectedFile && (
              <div className="pt-4">
                <button
                  onClick={handleUpload}
                  disabled={isProcessing}
                  className="px-8 py-3.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md transition inline-flex items-center gap-2"
                >
                  {isProcessing ? 'جاري التحليل واستخراج البيانات...' : 'بدء الاستخراج والانتقال للمراجعة'} <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
