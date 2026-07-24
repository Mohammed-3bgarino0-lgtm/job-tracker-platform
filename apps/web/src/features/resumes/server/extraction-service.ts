import { validateResumeFile } from './file-validator';
import { parseRawResumeText } from './resume-parser';
import { ParsedResumeResult } from '../domain/resume-types';

export async function processResumeExtraction(
  fileName: string,
  fileSize: number,
  mimeType: string,
  rawText: string
): Promise<ParsedResumeResult> {
  const validation = validateResumeFile(fileSize, mimeType);
  if (!validation.isValid) {
    throw new Error(validation.error || 'خطأ في فحص نوع أو حجم الملف.');
  }

  return parseRawResumeText(fileName, rawText);
}
