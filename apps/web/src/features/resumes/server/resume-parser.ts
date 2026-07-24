import { ExtractedResumeField, ParsedResumeResult } from '../domain/resume-types';
import { createExtractionField } from '../domain/extraction-field';

export function parseRawResumeText(fileName: string, rawText: string): ParsedResumeResult {
  const fields: ExtractedResumeField[] = [];

  // Email Extraction
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    fields.push(createExtractionField('email', 'البريد الإلكتروني', emailMatch[0], 98, emailMatch[0]));
  }

  // Phone Extraction
  const phoneMatch = rawText.match(/(?:05|\+9665)[0-9]{8}/);
  if (phoneMatch) {
    fields.push(createExtractionField('phone', 'رقم الجوال', phoneMatch[0], 99, phoneMatch[0]));
  }

  // Name & City Extraction if present in text
  const nameMatch = rawText.match(/(?:الاسم|Name):\s*([^\n.]+)/i);
  if (nameMatch) {
    fields.push(createExtractionField('full_name', 'الاسم الكامل', nameMatch[1].trim(), 95, nameMatch[0]));
  }

  return {
    resumeId: 'res-' + Math.random().toString(36).substr(2, 9),
    fileName,
    fields
  };
}
