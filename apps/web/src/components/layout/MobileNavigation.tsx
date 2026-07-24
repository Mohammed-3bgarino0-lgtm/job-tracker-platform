'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavIcon } from '@/components/layout/NavIcon';
import { mobileNavigation } from '@/lib/navigation';

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="التنقل الرئيسي للجوال"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {mobileNavigation.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-black transition ${
                active ? 'bg-emerald-50 text-emerald-800' : 'text-slate-500'
              }`}
            >
              <NavIcon name={item.icon} className="h-5 w-5" />
              <span className="truncate">{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
