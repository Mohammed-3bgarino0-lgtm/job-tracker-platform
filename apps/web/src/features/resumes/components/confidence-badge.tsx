import React from 'react';

interface ConfidenceBadgeProps {
  score: number;
}

export function ConfidenceBadge({ score }: ConfidenceBadgeProps) {
  let badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (score < 70) badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
  else if (score < 85) badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';

  return (
    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
      نسبة الثقة: {score}%
    </span>
  );
}
