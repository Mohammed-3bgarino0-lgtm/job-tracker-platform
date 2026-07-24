import { ResumeFileValidation } from '../domain/resume-types';

export function validateResumeFile(fileSize: number, mimeType: string): ResumeFileValidation {
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];

  if (fileSize > maxSizeBytes) {
    return {
      isValid: false,
      fileSize,
      mimeType,
      error: 'حجم الملف يتجاوز الحد الأقصى المسموح به (10 ميجابايت).'
    };
  }

  if (!allowedMimeTypes.includes(mimeType)) {
    return {
      isValid: false,
      fileSize,
      mimeType,
      error: 'نوع الملف غير مدعوم. يرجى رفع ملف صيغة PDF أو DOCX أو صورة.'
    };
  }

  return {
    isValid: true,
    fileSize,
    mimeType
  };
}
