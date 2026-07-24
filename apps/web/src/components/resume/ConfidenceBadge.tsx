interface ConfidenceBadgeProps {
  confidence: number;
  hasValue: boolean;
}

export function ConfidenceBadge({
  confidence,
  hasValue,
}: ConfidenceBadgeProps) {
  if (!hasValue) {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-500">
        لم يُستخرج
      </span>
    );
  }

  const percentage = Math.round(confidence * 100);
  const tone =
    percentage >= 85
      ? 'bg-emerald-50 text-emerald-700'
      : percentage >= 60
        ? 'bg-amber-50 text-amber-700'
        : 'bg-rose-50 text-rose-700';

  return (
    <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${tone}`}>
      الثقة {percentage}%
    </span>
  );
}
