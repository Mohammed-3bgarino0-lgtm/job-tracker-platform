import { GenderTarget } from '../../../../../packages/shared/types';

export interface GenderMatchResult {
  targetGender: GenderTarget;
  genderLabel: string;
  isMatch: boolean;
  warningMessage?: string;
}

export function detectJobGenderTarget(jobTitle: string, description: string = ''): GenderTarget {
  const combinedText = `${jobTitle} ${description}`.toLowerCase();

  const femaleKeywords = [
    'نساء', 'إناث', 'للسيدات', 'سيدات', 'فتيات',
    'منسقة', 'أخصائية', 'مديرة', 'بائعة', 'موظفة', 'طبيبة', 'ممرضة', 'معلمة'
  ];

  const maleKeywords = [
    'رجال', 'ذكور', 'للكبار', 'شباب', 'سائق', 'حارس أمن', 'معقب'
  ];

  const isFemale = femaleKeywords.some(k => combinedText.includes(k));
  const isMale = maleKeywords.some(k => combinedText.includes(k));

  if (isFemale && !isMale) return GenderTarget.FEMALE;
  if (isMale && !isFemale) return GenderTarget.MALE;
  return GenderTarget.BOTH;
}

export function checkGenderMatch(
  jobGender: GenderTarget,
  userGender: 'male' | 'female' | null
): GenderMatchResult {
  let label = '👫 للرجال والنساء';
  if (jobGender === GenderTarget.FEMALE) label = '👩 للنساء فقط';
  else if (jobGender === GenderTarget.MALE) label = '👨 للرجال فقط';

  if (!userGender) {
    return { targetGender: jobGender, genderLabel: label, isMatch: true };
  }

  if (jobGender === GenderTarget.FEMALE && userGender === 'male') {
    return {
      targetGender: jobGender,
      genderLabel: label,
      isMatch: false,
      warningMessage: '⚠️ تنبيه: هذه الوظيفة مخصصة للنساء فقط بينما الجنس في ملفك هو رجل.'
    };
  }

  if (jobGender === GenderTarget.MALE && userGender === 'female') {
    return {
      targetGender: jobGender,
      genderLabel: label,
      isMatch: false,
      warningMessage: '⚠️ تنبيه: هذه الوظيفة مخصصة للرجال فقط بينما الجنس في ملفك هو امرأة.'
    };
  }

  return { targetGender: jobGender, genderLabel: label, isMatch: true };
}
