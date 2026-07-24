'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavIcon } from '@/components/layout/NavIcon';
import { primaryNavigation, secondaryNavigation } from '@/lib/navigation';

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavigationGroup({
  items,
  label,
}: {
  items: typeof primaryNavigation;
  label: string;
}) {
  const pathname = usePathname();

  return (
    <div>
      <p className="mb-2 px-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <nav className="space-y-1" aria-label={label}>
        {items.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                active
                  ? 'bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition ${
                  active
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-white'
                }`}
              >
                <NavIcon name={item.icon} className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-black">{item.label}</span>
                <span className="mt-0.5 block truncate text-[11px] text-slate-400">
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 right-0 z-30 hidden w-72 border-l border-slate-200/80 bg-white/95 px-4 py-5 backdrop-blur lg:flex lg:flex-col">
      <Link href="/dashboard" className="flex items-center gap-3 px-2">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-800 text-lg font-black text-white shadow-lg shadow-emerald-900/15">
          ق
        </span>
        <span>
          <span className="block text-lg font-black text-slate-950">قدّم AI</span>
          <span className="block text-[11px] font-bold text-emerald-700">
            مساعدك الوظيفي الموحد
          </span>
        </span>
      </Link>

      <div className="mt-8 flex-1 space-y-8 overflow-y-auto pb-4">
        <NavigationGroup items={primaryNavigation} label="مساحة العمل" />
        <NavigationGroup items={secondaryNavigation} label="الحساب والربط" />
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-950">
        <strong className="block font-black">القرار النهائي لك</strong>
        يساعدك قدّم في البحث والتعبئة والمراجعة، ولا يرسل أي طلب دونك.
      </div>
    </aside>
  );
}
