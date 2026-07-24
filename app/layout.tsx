import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'قدّم | Qaddem AI - منصة التوظيف التفاعلية الذكية',
  description: 'المساعد الذكي لبناء الملف الوظيفي، تحليل السير الذاتية والإعلانات، وإدارة التقديمات بأمان في السعودية.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body class="bg-slate-50 text-slate-900 min-h-screen font-tajawal antialiased">
        {children}
      </body>
    </html>
  );
}
