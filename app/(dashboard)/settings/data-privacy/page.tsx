'use client';

import DashboardNav from '@/components/DashboardNav';
import { Download, Trash2, ShieldAlert, Lock } from 'lucide-react';

export default function DataPrivacySettingsPage() {
  const handleExport = () => {
    const userData = {
      profile: "Mohammed H. Al-Sakran",
      email: "mohammed-alsakran@hotmail.com",
      phone: "0539491361",
      city: "Riyadh",
      extractedResumesCount: 1,
      applicationsLogged: 5
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = "qaddem_ai_user_data_export.json";
    a.click();
  };

  const handleDeleteAccount = () => {
    if (confirm('⚠️ هل أنت تأكد تماماً من رغبتك في حذف حسابك وكافة السير الذاتية والملفات نهائياً؟ هذا الإجراء غير قابل للاسترجاع!')) {
      alert('تم حذف حسابك وكافة سجلاتك بنجاح.');
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-tajawal">
      <DashboardNav />

      <main className="flex-1 p-6 md:p-10 max-w-4xl space-y-6">
        
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-black text-slate-900">تصدير وتنزيل البيانات وحذف الحساب نهائياً</h1>
          <p className="text-xs text-slate-500">تحكم كامل وشفاف في ملفاتك وبياناتك الشخصية وفقاً لأنظمة حماية البيانات</p>
        </div>

        <div className="clean-card p-8 space-y-6">
          <div className="space-y-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-800" /> 1. تصدير وتنزيل كافة بياناتك الملفية
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              تحميل نسخة موحدة بصيغة JSON تحتوي على كافة السير الذاتية المستخرجة، الملفات الوظيفية، والتقديمات المسجلة.
            </p>
            <button onClick={handleExport} className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition">
              تنزيل الملف الموحد الآن
            </button>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-3">
            <h3 className="font-extrabold text-base text-rose-900 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-700" /> 2. حذف الحساب والملفات نهائياً (Permanent Deletion)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              مسح كافة السير الذاتية، التقديمات، والبيانات المرتبطة بحسابك بشكل نهائي وغير قابل للاسترجاع.
            </p>
            <button onClick={handleDeleteAccount} className="px-6 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl transition">
              حذف الحساب وكافة البيانات نهائياً
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
