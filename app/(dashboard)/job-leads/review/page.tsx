'use client';

import { useState } from 'react';
import DashboardNav from '@/components/DashboardNav';
import Link from 'next/link';
import { parseJobAdContent } from '@/lib/ad-parser/ad-scraper-engine';
import { validateOutboundEmail } from '@/lib/anti-spam/anti-spam-engine';
import { generateHtmlEmailTemplate } from '@/lib/cover-letter/cover-letter-engine';
import { CheckCircle2, AlertTriangle, Send, Mail, Phone, FileText, Paperclip, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function JobLeadReviewPage() {
  const sampleContent = `مطلوب مشرف خدمات إدارية وتطوير عمليات بشركة سابك بالرياض. للتقديم يرجى إرسال السيرة الذاتية إلى hr@sabic-ksa.com أو التواصل عبر الواتساب على 0539491361 مرجع الوظيفة SAB-2026-ADM`;
  const parsed = parseJobAdContent(sampleContent, 'منشور X / تويتر');
  
  const [selectedEmail, setSelectedEmail] = useState(parsed.primaryEmail);
  const [channel, setChannel] = useState<'email' | 'whatsapp'>('email');
  const [showPreSendModal, setShowPreSendModal] = useState(false);

  const spamCheck = validateOutboundEmail(selectedEmail, parsed.companyName);

  const htmlEmailBody = generateHtmlEmailTemplate({
    jobTitle: parsed.jobTitle,
    companyName: parsed.companyName,
    applicantName: 'محمد السكران',
    language: 'ar',
    tone: 'Professional',
    referenceNumber: parsed.referenceNumber
  });

  const handleConfirmAndSend = () => {
    if (channel === 'whatsapp') {
      const waText = encodeURIComponent(`السلام عليكم، أنا محمد السكران، أتقدم بطلب التقديم على شاغر (${parsed.jobTitle}) مرجع (${parsed.referenceNumber}). أرجو تزويدي بالإيميل المعتمد لإرفاق السيرة الذاتية PDF.`);
      window.open(`https://wa.me/966539491361?text=${waText}`, '_blank');
    } else {
      setShowPreSendModal(true);
    }
  };

  const handleFinalSendEmail = () => {
    alert(`✅ تم اعتماد التقديم وإرسال البريد الإلكتروني المنمق بـ HTML إلى (${selectedEmail}) وإضافة الطلب تلقائياً لمتتبع Kanban!`);
    window.location.href = '/applications/kanban';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-tajawal">
      <DashboardNav />

      <main className="flex-1 p-6 md:p-10 max-w-5xl space-y-6">
        
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">شاشة مراجعة الإعلان والبيانات المستخرجة</h1>
            <p className="text-xs text-slate-500">راجع البيانات ووسائل التواصل واختر وسيلة التقديم قبل إنشاء الرسالة</p>
          </div>
          <button
            onClick={handleConfirmAndSend}
            className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition inline-flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> مراجعة طلب الإرسال والاعتماد
          </button>
        </div>

        {/* Multiple Contacts Warning if exists */}
        {parsed.hasMultipleContactsWarning && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-amber-900 font-semibold">
            <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0" />
            <span>تنبيه: تم اكتشاف أكثر من بريد إلكتروني أو رقم جوال في الإعلان. يرجى اختيار الوسيلة الصحيحة المعتمدة أدناه.</span>
          </div>
        )}

        {/* Extracted Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="clean-card p-6 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2">البيانات الوظيفية المستخرجة</h3>
            <div className="space-y-2 text-xs">
              <div><strong className="text-slate-700">المسمى الوظيفي:</strong> {parsed.jobTitle}</div>
              <div><strong className="text-slate-700">اسم الشركة:</strong> {parsed.companyName}</div>
              <div><strong className="text-slate-700">المدينة والدولة:</strong> {parsed.city}، المملكة العربية السعودية</div>
              <div><strong className="text-slate-700">رقم مرجع الوظيفة:</strong> {parsed.referenceNumber}</div>
              <div><strong className="text-slate-700">نوع الدوام:</strong> {parsed.workType}</div>
              <div><strong className="text-slate-700">سنوات الخبرة المطلوبة:</strong> {parsed.experienceYears}</div>
            </div>
          </div>

          <div className="clean-card p-6 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2">وسائل التواصل المكتشفة</h3>
            <div className="space-y-3">
              {parsed.allContacts.map((c, idx) => (
                <label key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs cursor-pointer hover:bg-slate-100 transition">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="contact_picker"
                      checked={selectedEmail === c.value}
                      onChange={() => setSelectedEmail(c.value)}
                      className="text-emerald-800 focus:ring-emerald-700"
                    />
                    <span className="font-bold text-slate-900">{c.value}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">ثقة {c.confidence}%</span>
                </label>
              ))}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-2">اختر وسيلة التقديم:</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setChannel('email')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${channel === 'email' ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-slate-100 text-slate-700 border-slate-200'}`}
                >
                  <Mail className="w-3.5 h-3.5 inline ml-1" /> بريد إلكتروني HTML
                </button>
                <button
                  onClick={() => setChannel('whatsapp')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${channel === 'whatsapp' ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-slate-100 text-slate-700 border-slate-200'}`}
                >
                  <Phone className="w-3.5 h-3.5 inline ml-1" /> واتساب مباشر (wa.me)
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Pre-Send Review Modal / Area */}
        {showPreSendModal && (
          <div className="clean-card p-8 space-y-6 border-2 border-emerald-700 bg-emerald-50/30">
            <div className="flex justify-between items-center border-b border-emerald-200 pb-3">
              <h3 className="font-black text-lg text-emerald-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-800" /> الشاشة النهائية لمراجعة البريد قبل الإرسال (Pre-Send Review)
              </h3>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">موافقات صريحة</span>
            </div>

            {/* Anti-Spam Warning */}
            {spamCheck.mismatchedDomainWarning && (
              <div className="bg-amber-100 border border-amber-300 p-4 rounded-xl text-xs text-amber-900 font-semibold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-800 flex-shrink-0" />
                <span>{spamCheck.mismatchedDomainWarning}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div><strong className="text-slate-700">المرسل منه:</strong> mohammed-alsakran@hotmail.com (حساب موثق)</div>
              <div><strong className="text-slate-700">البريد المستلم:</strong> <span className="font-bold text-emerald-900">{selectedEmail}</span></div>
              <div><strong className="text-slate-700">عنوان البريد:</strong> طلب توظيف: {parsed.jobTitle} - محمد السكران</div>
              <div><strong className="text-slate-700">حجم المرفقات الكلي:</strong> 1.2 ميجابايت (سيرة PDF + خطاب تقديم PDF)</div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">معاينة نص إيميل ה-HTML التفاعلي:</label>
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs" dangerouslySetInnerHTML={{ __html: htmlEmailBody }} />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button onClick={() => setShowPreSendModal(false)} className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs">تعديل</button>
              <button onClick={handleFinalSendEmail} className="px-8 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2">
                <Send className="w-4 h-4" /> تأكيد وضغط زر الإرسال المباشر
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
