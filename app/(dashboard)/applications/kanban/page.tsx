'use client';

import { useState } from 'react';
import DashboardNav from '@/components/DashboardNav';
import { Layers, Plus, Calendar, Building, FileText, CheckCircle2, Clock } from 'lucide-react';

export default function KanbanPage() {
  const statuses = [
    { key: 'SUGGESTED', title: 'مقترحة' },
    { key: 'SAVED', title: 'محفوظة' },
    { key: 'READY', title: 'جاهزة' },
    { key: 'NEEDS_REVIEW', title: 'تحتاج مراجعة' },
    { key: 'APPLIED', title: 'تم التقديم' },
    { key: 'UNDER_REVIEW', title: 'تحت المراجعة' },
    { key: 'TEST', title: 'اختبار' },
    { key: 'INTERVIEW', title: 'مقابلة' },
    { key: 'OFFER', title: 'عرض وظيفي' },
    { key: 'REJECTED', title: 'مرفوضة' },
    { key: 'WITHDRAWN', title: 'منسحب' }
  ];

  const [applications, setApplications] = useState([
    { id: '1', company: 'شركة سابك (SABIC)', role: 'مشرف خدمات إدارية', city: 'الرياض', status: 'APPLIED', date: '2026-07-24', channel: 'Email HTML' },
    { id: '2', company: 'شركة المراعي (Almarai)', role: 'مدير عمليات وتخطيط', city: 'الرياض', status: 'INTERVIEW', date: '2026-07-24', channel: 'Email HTML' },
    { id: '3', company: 'شركة علم (Elm)', role: 'أخصائي موارد بشرية', city: 'الرياض', status: 'UNDER_REVIEW', date: '2026-07-24', channel: 'WhatsApp Link' },
    { id: '4', company: 'مجموعة الشايع (Alshaya)', role: 'Store Manager', city: 'الرياض', status: 'OFFER', date: '2026-07-24', channel: 'Email HTML' },
    { id: '5', company: 'stc (الاتصالات السعودية)', role: 'Senior Operations Coordinator', city: 'الرياض', status: 'TEST', date: '2026-07-24', channel: 'Email HTML' }
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex font-tajawal">
      <DashboardNav />

      <main className="flex-1 p-6 md:p-10 max-w-7xl overflow-x-auto space-y-6">
        
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 min-w-[1200px]">
          <div>
            <h1 className="text-2xl font-black text-slate-900">متتبع الطلبات (Kanban Board)</h1>
            <p className="text-xs text-slate-500">تتبع شامل لطلبات التوظيف عبر الـ 11 حالة المحددة وسجل التاريخ والتذكيرات</p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">11 حالة تتبع منظمة</span>
        </div>

        {/* Kanban Board Layout */}
        <div className="flex gap-4 min-w-[1400px] overflow-x-auto pb-6">
          {statuses.map((s) => {
            const colApps = applications.filter(a => a.status === s.key);
            return (
              <div key={s.key} className="w-72 bg-slate-100/70 border border-slate-200 rounded-2xl p-4 flex-shrink-0 flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <h3 className="font-extrabold text-xs text-slate-800">{s.title}</h3>
                  <span className="text-[11px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">{colApps.length}</span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                  {colApps.map(app => (
                    <div key={app.id} className="clean-card p-4 space-y-2 text-xs border-r-4 border-r-emerald-800">
                      <div className="font-extrabold text-slate-900">{app.company}</div>
                      <div className="text-emerald-800 font-bold">{app.role}</div>
                      <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
                        <span><Building className="w-3 h-3 inline ml-1" />{app.city}</span>
                        <span><Calendar className="w-3 h-3 inline ml-1" />{app.date}</span>
                      </div>
                    </div>
                  ))}
                  {colApps.length === 0 && (
                    <div className="text-[11px] text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-xl">لا توجد طلبات</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
