'use client';

import { useState } from 'react';
import DashboardNav from '@/components/DashboardNav';
import Link from 'next/link';
import { CheckCircle2, Edit3, Trash2, ShieldCheck, ArrowLeft, AlertCircle, FileCheck } from 'lucide-react';
import { parseCVDocument } from '@/lib/cv-parser/cv-parser-engine';

export default function ResumeReviewPage() {
  const parsedData = parseCVDocument('Mohammed_AlSakran_CV.pdf', '');
  const [fields, setFields] = useState(parsedData.fields);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (idx: number) => {
    setEditingIndex(idx);
    setEditValue(fields[idx].value);
  };

  const handleSaveEdit = (idx: number) => {
    const updated = [...fields];
    updated[idx].value = editValue;
    setFields(updated);
    setEditingIndex(null);
  };

  const handleDelete = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  const handleConfirmAll = () => {
    alert('✅ تم اعتماد البيانات المستخرجة وتحديث الملف الوظيفي الموحد لمحمد السكران بنجاح!');
    window.location.href = '/career-profiles';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-tajawal">
      <DashboardNav />

      <main className="flex-1 p-6 md:p-10 max-w-5xl space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">مراجعة البيانات المستخرجة من السيرة الذاتية</h1>
            <p className="text-xs text-slate-500">راجع كل قيمة مع مصدر النص ونسبة الثقة واعتمد البيانات قبل حفظها في ملفك الوظيفي</p>
          </div>
          <button
            onClick={handleConfirmAll}
            className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition inline-flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> اعتماد وتأكيد البيانات المستخرجة
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-amber-900 font-semibold">
          <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0" />
          <span>تنبيه شفافية: لا تعتمد البريد أو الجوال أو أي بيانات قبل مراجعتها. تتيح لك الأداة التعديل والحذف الكامل قبل أي اعتماد.</span>
        </div>

        {/* Fields Review Table/Grid */}
        <div className="space-y-4">
          {fields.map((f, idx) => (
            <div key={idx} className="clean-card p-5 space-y-3">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-700" />
                  <span className="font-extrabold text-sm text-slate-900">{f.fieldLabelAr}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    نسبة الثقة: {f.confidenceScore}%
                  </span>
                  <button onClick={() => handleEdit(idx)} className="p-1.5 text-slate-600 hover:text-emerald-800 transition">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(idx)} className="p-1.5 text-slate-600 hover:text-rose-600 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {editingIndex === idx ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                  <button onClick={() => handleSaveEdit(idx)} className="px-4 py-2 bg-emerald-800 text-white font-bold text-xs rounded-xl">حفظ</button>
                </div>
              ) : (
                <div className="text-xs font-bold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {f.value}
                </div>
              )}

              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <strong className="text-slate-700">مصدر النص داخل السيرة:</strong> "{f.snippetSource}"
              </div>

            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
