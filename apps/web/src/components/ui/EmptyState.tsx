import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center md:p-9">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-xl text-slate-500">
        +
      </div>
      <h2 className="mt-4 text-base font-black text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-500">
        {description}
      </p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-5 inline-flex rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-black text-white transition hover:bg-emerald-900"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
