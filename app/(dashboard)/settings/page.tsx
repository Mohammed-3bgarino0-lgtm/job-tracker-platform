'use client';

import DashboardNav from '@/components/DashboardNav';
import Link from 'next/link';
import { Settings, ShieldCheck, Mail, Lock, Smartphone, Database } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex font-tajawal">
      <DashboardNav />

      <main className="flex-1 p-6 md:p-10 max-w-4xl space-y-6">
        
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-black text-slate-900">إعدادات الحساب والربط والأمان</h1>
          <p className="text-xs text-slate-500">إدارة إعدادات المصادقة الثنائية (2FA)، ربط البريد (Gmail OAuth)، وحماية الحساب</p>
        </div>

        <div className="clean-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">المصادقة الثنائية (2FA)</h3>
              <p className="text-xs text-slate-500">تأكيد الأمان عند دخول الحساب أو تنفيذ العمليات الحساسة</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">مفعّلة ⚡</span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">ربط البريد الإلكتروني (Gmail OAuth / Outlook)</h3>
              <p className="text-xs text-slate-500">ربط حساب الإرسال لإرسال طلبات الـ HTML بموافقتك الصريحة</p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">متصل: mohammed-alsakran@hotmail.com</span>
          </div>

          <div className="pt-2">
            <Link href="/settings/data-privacy" className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1">
              <Database className="w-4 h-4" /> الانتقال لشاشة تصدير البيانات وحذف الحساب نهائياً
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
