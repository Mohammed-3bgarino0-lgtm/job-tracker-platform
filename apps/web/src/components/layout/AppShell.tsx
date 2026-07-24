import type { ReactNode } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { MobileNavigation } from '@/components/layout/MobileNavigation';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar />
      <div className="min-h-screen lg:pr-72">
        <AppHeader />
        <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 md:px-6 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}
