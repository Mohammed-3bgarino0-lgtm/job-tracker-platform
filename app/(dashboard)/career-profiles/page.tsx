'use client';

import { useState } from 'react';
import DashboardNav from '@/components/DashboardNav';
import { Briefcase, Plus, CheckCircle2, Layers } from 'lucide-react';

export default function CareerProfilesPage() {
  const [profiles, setProfiles] = useState([
    { id: '1', title: 'الملف الرئيسي - إدارة العمليات والإشراف الإداري', domain: 'Operations & Admin', isDefault: true, count: 5 },
    { id: '2', title: 'ملف إدارة المشاريع (Project Management)', domain: 'Management', isDefault: false, count: 3 },
    { id: '3', title: 'ملف الموارد البشرية وشؤون الموظفين (HR)', domain: 'Human Resources', isDefault: false, count: 4 },
    { id: '4', title: 'ملف إدارة الفروع والمبيعات (Store & Sales)', domain: 'Retail & Sales', isDefault: false, count: 2 }
  ]);

  const [newTitle, setNewTitle] = useState('');

  const handleAddProfile = () => {
    if (!newTitle.trim()) return;
    setProfiles([...profiles, {
      id: Date.now().toString(),
      title: newTitle,
      domain: 'General',
      isDefault: false,
      count: 0
    }]);
    setNewTitle('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-tajawal">
      <DashboardNav />

      <main className="flex-1 p-6 md:p-10 max-w-5xl space-y-6">
        
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">الملف الوظيفي والملفات الفرعية</h1>
            <p className="text-xs text-slate-500">إنشاء وتعديل الملفات الوظيفية المخصصة حسب المجال (إدارة مشاريع، مبيعات، موارد بشرية)</p>
          </div>
        </div>

        {/* Add New Sub Profile */}
        <div className="clean-card p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-700" /> إضافة ملف فرعي جديد حسب المجال
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="مثال: ملف إدارة الخدمات اللوجستية وتخطيط التكاليف..."
              className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
            <button
              onClick={handleAddProfile}
              className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition whitespace-nowrap"
            >
              إنشاء الملف الفرعي
            </button>
          </div>
        </div>

        {/* List Profiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profiles.map((p) => (
            <div key={p.id} className="clean-card p-6 space-y-3 relative border-r-4 border-r-emerald-800">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-base text-slate-900">{p.title}</h4>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">{p.domain}</span>
                </div>
                {p.isDefault && (
                  <span className="text-[10px] font-bold bg-emerald-800 text-white px-2 py-0.5 rounded-full">الرئيسي</span>
                )}
              </div>
              <p className="text-xs text-slate-500">عدد الوظائف المربوطة بهذا الملف: {p.count} وظائف</p>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
