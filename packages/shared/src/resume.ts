export interface ExtractedField<T> {
  value: T | null;
  confidence: number; // نسبة الثقة من 0.0 إلى 1.0
  sourceText?: string; // النص الأصلي المقتطع من السيرة
}

export interface ParsedResumeData {
  // البيانات الشخصية
  personalInfo: {
    firstName: ExtractedField<string>;
    lastName: ExtractedField<string>;
    englishName: ExtractedField<string>;
    email: ExtractedField<string>;
    phone: ExtractedField<string>;
    city: ExtractedField<string>;
    country: ExtractedField<string>;
    nationality: ExtractedField<string>;
  };
  
  // البيانات المهنية
  careerInfo: {
    professionalTitle: ExtractedField<string>;
    summary: ExtractedField<string>;
    totalYearsExperience: ExtractedField<number>;
  };

  // المجموعات
  experiences: Array<{
    company: string;
    position: string;
    startDate?: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
  }>;

  skills: Array<{
    name: string;
    category?: string;
  }>;

  educations: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    gpa?: string;
  }>;
}
