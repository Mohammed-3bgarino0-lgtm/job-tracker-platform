'use client';

import React, { useState } from 'react';
import { validateResumeFile } from '../server/file-validator';

interface ResumeUploadProps {
  onUploadSuccess: (file: File) => void;
}

export function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const val = validateResumeFile(file.size, file.type);
    if (!val.isValid) {
      setError(val.error || 'خطأ في فحص الملف.');
      return;
    }

    setError(null);
    onUploadSuccess(file);
  };

  return (
    <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-emerald-300 text-center space-y-4">
      <h3 className="font-extrabold text-lg text-slate-900">رفع السيرة الذاتية لبدء الاستخراج</h3>
      <p className="text-xs text-slate-500">يدعم ملفات PDF، DOCX، والصور بحجم يصل إلى 10 ميجابايت</p>
      
      <input
        type="file"
        id="resume-file-input-comp"
        onChange={handleFileChange}
        className="hidden"
      />
      <label
        htmlFor="resume-file-input-comp"
        className="inline-block px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer transition"
      >
        اختر ملف السيرة الذاتية
      </label>

      {error && (
        <div className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
          {error}
        </div>
      )}
    </div>
  );
}
