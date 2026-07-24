import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'قدّم | Qaddem AI - مراجعة السيرة الذاتية',
  description:
    'رفع السيرة الذاتية وتحليلها مع مراجعة يدوية كاملة ودون بيانات وهمية.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
