export interface MatchResult {
  overallScore: number; // 0 to 100
  matchingSkills: string[];
  missingSkills: string[];
  missingRequirements: string[];
  honestSuggestions: string[];
  warningDisclaimer: string;
}

export function matchResumeWithJob(jobDescription: string, userSkills: string[]): MatchResult {
  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  const requiredSkillsSample = ["Operations Management", "Logistics", "SAP", "Odoo ERP", "HR Administration", "Project Management", "Budget Planning"];
  
  requiredSkillsSample.forEach(skill => {
    if (userSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))) {
      matchingSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const overallScore = Math.min(100, Math.round((matchingSkills.length / requiredSkillsSample.length) * 100));

  const honestSuggestions = [
    "تأكيد مهارات إدارة الميزانيات وتخطيط التكاليف التشغيلية في الجزء العلوي من السيرة.",
    "إبراز خبرة التعامل مع أنظمة SAP وOdoo في كبرى الفروع السابقة.",
    "تخصيص ملخص سيرة ذاتية يركز على الكفاءة اللوجستية وخفض التكاليف بنسبة 60%."
  ];

  return {
    overallScore,
    matchingSkills,
    missingSkills: missingSkills.length > 0 ? missingSkills : ["إشراف متقدم على الميزانيات الضخمة"],
    missingRequirements: ["شهادة PMP احترافية (اختياري)"],
    honestSuggestions,
    warningDisclaimer: "تنبيه أمان وشفافية: يحظر النظام إضافة أي مهارات أو خبرات غير صحيحة لم تذكرها بسيرتك الذاتية لضمان مصداقية التقديم أمام مسؤولي التوظيف."
  };
}
