'use client';

import type { GenderMatchResult } from '@/lib/matching/gender-matcher';

interface GenderMatchAlertProps {
  matchResult: GenderMatchResult;
  onProceedAnyway?: () => void;
}

export function GenderMatchAlert({
  matchResult,
  onProceedAnyway,
}: GenderMatchAlertProps) {
  if (
    matchResult.status !== 'MISMATCH_REVIEW' ||
    !matchResult.warningMessage
  ) {
    return null;
  }

  return (
    <section
      role="alert"
      aria-live="polite"
      className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950"
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="text-xl">
          ⚠️
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-black">تنبيه مراجعة الإعلان</h3>
          <p className="mt-1 text-sm leading-7">
            {matchResult.warningMessage}
          </p>

          {matchResult.evidence.length ? (
            <div className="mt-3 rounded-xl bg-white/70 p-3 text-xs">
              <strong>الدلالة الصريحة المكتشفة:</strong>{' '}
              {matchResult.evidence.join('، ')}
              <span className="mr-2 text-amber-700">
                ثقة {Math.round(matchResult.confidence * 100)}%
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {onProceedAnyway ? (
        <div className="mt-4 flex justify-end border-t border-amber-200 pt-3">
          <button
            type="button"
            onClick={onProceedAnyway}
            className="rounded-lg bg-amber-100 px-3 py-2 text-xs font-black text-amber-950 transition hover:bg-amber-200"
          >
            قرأت التنبيه وأرغب في المتابعة
          </button>
        </div>
      ) : null}
    </section>
  );
}
