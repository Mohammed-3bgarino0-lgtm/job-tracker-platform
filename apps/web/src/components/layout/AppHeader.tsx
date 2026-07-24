import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 px-4 py-3 backdrop-blur md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-800 font-black text-white">
            ق
          </span>
          <span className="font-black text-slate-950">قدّم AI</span>
        </Link>

        <div className="hidden lg:block">
          <p className="text-sm font-black text-slate-950">مساحة العمل</p>
          <p className="text-xs text-slate-500">
            ابحث، راجع، قدّم، وتابع من مكان واحد
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/jobs"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"
          >
            البحث عن وظيفة
          </Link>
          <Link
            href="/profile"
            aria-label="فتح الملف الوظيفي"
            className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-xs font-black text-white"
          >
            م
          </Link>
        </div>
      </div>
    </header>
  );
}
