import type { Metadata } from 'next';
import '../../../app/globals.css';

export const metadata: Metadata = {
  title: 'قدّم | Qaddem AI - المساعد الذكي للتوظيف',
  description: 'منصة قدّم AI لبناء السيرة الذاتية وتعبئة طلبات التوظيف بموافقات صريحة.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
