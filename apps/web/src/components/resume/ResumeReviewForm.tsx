'use client';

import type {
  ExtractedField,
  ParsedResumeData,
} from '@qaddem/shared';
import { useState } from 'react';
import { ConfidenceBadge } from './ConfidenceBadge';
import { ResumeCollectionsEditor } from './ResumeCollectionsEditor';

interface ResumeReviewFormProps {
  extractionId: string | null;
  userId: string | null;
  canApprove: boolean;
  initialData: ParsedResumeData;
  onConfirmed: () => void;
}

type ScalarSection = 'personalInfo' | 'careerInfo';

const personalLabels: Record<
  keyof ParsedResumeData['personalInfo'],
  string
> = {
  firstName: 'الاسم الأول',
  lastName: 'اسم العائلة',
  englishName: 'الاسم بالإنجليزية',
  email: 'البريد الإلكتروني',
  phone: 'رقم الجوال',
  city: 'المدينة',
  country: 'الدولة',
  nationality: 'الجنسية',
};

const careerLabels: Record<
  keyof ParsedResumeData['careerInfo'],
  string
> = {
  professionalTitle: 'المسمى المهني',
  summary: 'الملخص المهني',
  totalYearsExperience: 'إجمالي سنوات الخبرة',
};

function ScalarField({
  label,
  field,
  type = 'text',
  multiline = false,
  onChange,
}: {
  label: string;
  field: ExtractedField<string | number>;
  type?: 'text' | 'email' | 'tel' | 'number';
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  const common =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100';

  return (
    <label className={multiline ? 'md:col-span-2' : ''}>
      <span className="mb-1.5 flex items-center justify-between gap-2 text-xs font-bold text-slate-700">
        {label}
        <ConfidenceBadge
          confidence={field.confidence}
          hasValue={field.value !== null}
        />
      </span>

      {multiline ? (
        <textarea
          rows={4}
          value={field.value?.toString() ?? ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder="لم يتم العثور عليه"
          className={common}
        />
      ) : (
        <input
          type={type}
          value={field.value?.toString() ?? ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder="لم يتم العثور عليه"
          className={common}
        />
      )}

      {field.sourceText ? (
        <span className="mt-1 block text-[11px] text-slate-400">
          المصدر: {field.sourceText}
        </span>
      ) : null}
    </label>
  );
}

export function ResumeReviewForm({
  extractionId,
  userId,
  canApprove,
  initialData,
  onConfirmed,
}: ResumeReviewFormProps) {
  const [formData, setFormData] =
    useState<ParsedResumeData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function changeScalar(
    section: ScalarSection,
    key: string,
    rawValue: string,
  ) {
    setFormData((previous) => {
      const currentSection = previous[section] as Record<
        string,
        ExtractedField<string | number>
      >;
      const currentField = currentSection[key];

      const value =
        rawValue.trim() === ''
          ? null
          : section === 'careerInfo' &&
              key === 'totalYearsExperience'
            ? Number(rawValue)
            : rawValue;

      return {
        ...previous,
        [section]: {
          ...currentSection,
          [key]: {
            ...currentField,
            value:
              typeof value === 'number' && Number.isNaN(value)
                ? null
                : value,
          },
        },
      };
    });
  }

  async function submitReview() {
    if (!canApprove || !extractionId || !userId) {
      setError(
        'هذه معاينة فقط. الحفظ والاعتماد سيتاحان بعد ربط قاعدة البيانات وتسجيل الدخول.',
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/resumes/extractions/${extractionId}/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, data: formData }),
        },
      );

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? 'تعذر اعتماد البيانات.');
      }

      onConfirmed();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'تعذر اعتماد البيانات.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
      <header className="mb-7 border-b border-slate-100 pb-5">
        <p className="mb-2 text-xs font-black text-emerald-700">
          المراجعة البشرية إلزامية
        </p>
        <h2 className="text-2xl font-black text-slate-900">
          راجع البيانات المستخرجة
        </h2>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          القيم الفارغة لم تُستخرج ولن يتم تعويضها ببيانات افتراضية.
          يمكنك تعديل كل قيمة أثناء المعاينة.
        </p>
      </header>

      {!canApprove ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          التحليل يعمل الآن بوضع المعاينة. لم تُحفظ السيرة أو البيانات في قاعدة بيانات.
        </div>
      ) : null}

      <div className="mb-8">
        <h3 className="mb-4 text-lg font-black text-emerald-900">
          البيانات الشخصية
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {(Object.entries(formData.personalInfo) as Array<[
            keyof ParsedResumeData['personalInfo'],
            ExtractedField<string>
          ]>).map(([key, value]) => (
            <ScalarField
              key={key}
              label={personalLabels[key]}
              field={value}
              type={
                key === 'email'
                  ? 'email'
                  : key === 'phone'
                    ? 'tel'
                    : 'text'
              }
              onChange={(nextValue) =>
                changeScalar('personalInfo', key, nextValue)
              }
            />
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="mb-4 text-lg font-black text-emerald-900">
          البيانات المهنية
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {(Object.entries(formData.careerInfo) as Array<[
            keyof ParsedResumeData['careerInfo'],
            ExtractedField<string | number>
          ]>).map(([key, value]) => (
            <ScalarField
              key={key}
              label={careerLabels[key]}
              field={value}
              type={
                key === 'totalYearsExperience' ? 'number' : 'text'
              }
              multiline={key === 'summary'}
              onChange={(nextValue) =>
                changeScalar('careerInfo', key, nextValue)
              }
            />
          ))}
        </div>
      </div>

      <ResumeCollectionsEditor data={formData} onChange={setFormData} />

      {formData.warnings.length ? (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {formData.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="mb-4 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={submitReview}
          disabled={isSubmitting || !canApprove}
          className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {!canApprove
            ? 'الحفظ يتطلب تسجيل الدخول'
            : isSubmitting
              ? 'جارٍ اعتماد البيانات...'
              : 'تأكيد واعتماد البيانات'}
        </button>
      </div>
    </section>
  );
}
