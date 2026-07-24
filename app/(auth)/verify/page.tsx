'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';

export default function VerifyPage() {
  const [code, setCode] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = '/onboarding';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-tajawal">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto shadow-md">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">التحقق من البريد الإلكتروني والجوال</h2>
        <p className="text-xs text-slate-600">أدخل كود التحقق المرسل لرسائلك أو بريدك الإلكتروني</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="clean-card p-8 shadow-xl text-center space-y-6">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">كود التحقق (OTP)</label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="1 2 3 4 5 6"
                className="w-full text-center tracking-widest text-2xl font-bold py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              تأكيد الحساب والانتقال للإعداد <ArrowLeft className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
