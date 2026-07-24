'use client';

import type { ParsedResumeData } from '@qaddem/shared';
import { useState } from 'react';
import { ResumeReviewForm } from './ResumeReviewForm';

interface ParseResponse {
  extractionId: string;
  confidenceScore: number;
  data: ParsedResumeData;
  storage: {
    persisted: boolean;
    message: string;
  };
  error?: string;
}

export function ResumeWorkflow() {
  const [userId, setUserId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ParseResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadResume() {
    if (!file || !userId.trim()) {
      setError('اختر ملف السيرة وأدخل معرف المستخدم.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setResult(null);
    setIsConfirmed(false);

    try {
      const formData = new FormData();
      formData.set('file', file);
      formData.set('userId', userId.trim());

      const response = await fetch('/api/resumes/parse', {
        method: 'POST',
        body: formData,
      });
      const payload = (await response.json()) as ParseResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? 'تعذر تحليل السيرة.');
      }

      setResult(payload);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'تعذر تحليل السيرة.',
      );
    } finally {
      setIsUploading(false);
    }
  }

  if (isConfirmed) {
    return (
      <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-emerald-700 text-2xl text-white">
          ✓
        </div>
        <h2 className="text-2xl font-black text-emerald-950">
          تم اعتماد الملف الوظيفي
        </h2>
        <p className="mt-2 text-sm text-emerald-800">
          حُفظت القيم التي راجعتها فقط، وسُجلت الموافقة في سجل التدقيق.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {!result ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6">
            <p className="mb-2 text-xs font-black text-emerald-700">
              PDF أو DOCX — حتى 10MB
            </p>
            <h2 className="text-2xl font-black text-slate-900">
              ارفع سيرتك للتحليل
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              يتم استخراج النص في ذاكرة الخادم فقط. الملف نفسه لا يُحفظ
              حتى يتم ربط التخزين السحابي.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
            <label>
              <span className="mb-1.5 block text-xs font-bold text-slate-700">
                معرف المستخدم
              </span>
              <input
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="معرف مستخدم موجود في قاعدة البيانات"
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-bold text-slate-700">
                ملف السيرة
              </span>
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(event) =>
                  setFile(event.target.files?.[0] ?? null)
                }
                className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm"
              />
            </label>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={uploadResume}
            disabled={isUploading}
            className="mt-5 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-black text-white transition hover:bg-emerald-800"
          >
            {isUploading ? 'جارٍ التحليل...' : 'تحليل السيرة'}
          </button>
        </section>
      ) : (
        <>
          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
            متوسط الثقة في الحقول الموجودة:{' '}
            <strong>
              {Math.round(result.confidenceScore * 100)}%
            </strong>
            <span className="mt-1 block text-xs text-sky-700">
              {result.storage.message}
            </span>
          </div>

          <ResumeReviewForm
            extractionId={result.extractionId}
            userId={userId.trim()}
            initialData={result.data}
            onConfirmed={() => setIsConfirmed(true)}
          />
        </>
      )}
    </div>
  );
}
