'use client';

import { useState } from 'react';
import { ParsedResumeData } from '../../../../../packages/shared/src/resume';

interface Props {
  extractionId: string;
  initialData: ParsedResumeData;
  onConfirm: () => void;
}

export function ResumeReviewForm({ extractionId, initialData, onConfirm }: Props) {
  const [formData, setFormData] = useState<ParsedResumeData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (section: 'personalInfo' | 'careerInfo', field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: {
          ...prev[section][field as keyof typeof prev[section]],
          value: value === '' ? null : value,
        },
      },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirm();
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100 dir-rtl">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">مراجعة بيانات السيرة الذاتية</h2>
        <p className="text-sm text-gray-500 mt-1">
          يرجى التأكد من صحة البيانات المستخرجة قبل اعتمادها في ملفك الوظيفي الموحد.
        </p>
      </div>

      {/* قسم البيانات الشخصية */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold text-emerald-800">1. البيانات الشخصية</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* الاسم الأول */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              الاسم الأول
              <span className="text-xs text-gray-400 mr-2">
                (نسبة الثقة: {Math.round((formData.personalInfo.firstName.confidence || 0) * 100)}%)
              </span>
            </label>
            <input
              type="text"
              value={formData.personalInfo.firstName.value || ''}
              onChange={(e) => handleFieldChange('personalInfo', 'firstName', e.target.value)}
              placeholder="لم يتم العثور عليه"
              className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 border-gray-300"
            />
          </div>

          {/* البريد الإلكتروني */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              البريد الإلكتروني
              <span className="text-xs text-gray-400 mr-2">
                (نسبة الثقة: {Math.round((formData.personalInfo.email.confidence || 0) * 100)}%)
              </span>
            </label>
            <input
              type="email"
              value={formData.personalInfo.email.value || ''}
              onChange={(e) => handleFieldChange('personalInfo', 'email', e.target.value)}
              placeholder="لم يتم العثور عليه"
              className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 border-gray-300"
            />
          </div>

          {/* رقم الجوال */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              رقم الجوال
              <span className="text-xs text-gray-400 mr-2">
                (نسبة الثقة: {Math.round((formData.personalInfo.phone.confidence || 0) * 100)}%)
              </span>
            </label>
            <input
              type="text"
              value={formData.personalInfo.phone.value || ''}
              onChange={(e) => handleFieldChange('personalInfo', 'phone', e.target.value)}
              placeholder="لم يتم العثور عليه"
              className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 border-gray-300"
            />
          </div>

          {/* المدينة */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">المدينة</label>
            <input
              type="text"
              value={formData.personalInfo.city.value || ''}
              onChange={(e) => handleFieldChange('personalInfo', 'city', e.target.value)}
              placeholder="لم يتم العثور عليها"
              className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 border-gray-300"
            />
          </div>

        </div>
      </div>

      {/* زر الاعتماد والإنشاء */}
      <div className="pt-4 border-t flex justify-end gap-3">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
        >
          {isSubmitting ? 'جاري الاعتماد...' : 'تأكيد واعتماد البيانات'}
        </button>
      </div>
    </div>
  );
}
