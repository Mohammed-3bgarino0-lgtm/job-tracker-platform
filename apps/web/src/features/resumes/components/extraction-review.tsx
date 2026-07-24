'use client';

import React, { useState } from 'react';
import { ExtractedResumeField } from '../domain/resume-types';
import { ConfidenceBadge } from './confidence-badge';

interface ExtractionReviewProps {
  initialFields: ExtractedResumeField[];
  onConfirmAll: (confirmedFields: ExtractedResumeField[]) => void;
}

export function ExtractionReview({ initialFields, onConfirmAll }: ExtractionReviewProps) {
  const [fields, setFields] = useState<ExtractedResumeField[]>(initialFields);

  const handleToggleConfirm = (id: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, isConfirmed: !f.isConfirmed, reviewedAt: new Date().toISOString() } : f));
  };

  const handleConfirm = () => {
    onConfirmAll(fields);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
      <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
        مراجعة البيانات المستخرجة يدويًا قبل الاعتماد
      </h3>

      <div className="space-y-3">
        {fields.map(f => (
          <div key={f.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm text-slate-900">{f.fieldLabelAr}</span>
              <ConfidenceBadge score={f.confidenceScore} />
            </div>
            <div className="text-xs font-semibold text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200">
              {f.fieldValue}
            </div>
            <div className="text-[11px] text-slate-500">
              <strong>مصدر النص:</strong> "{f.snippetSource}"
            </div>
            <button
              onClick={() => handleToggleConfirm(f.id)}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${f.isConfirmed ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-slate-100 text-slate-700 border-slate-300'}`}
            >
              {f.isConfirmed ? '✅ معتمد' : 'تأكيد الحقل'}
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleConfirm}
        className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition"
      >
        اعتماد كافة البيانات المستخرجة والتحديث
      </button>
    </div>
  );
}
