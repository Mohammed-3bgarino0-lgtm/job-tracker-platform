import { ExtractedResumeField } from './resume-types';

export function createExtractionField(
  fieldName: string,
  fieldLabelAr: string,
  fieldValue: string,
  confidenceScore: number,
  snippetSource: string
): ExtractedResumeField {
  return {
    id: 'field-' + Math.random().toString(36).substr(2, 9),
    fieldName,
    fieldLabelAr,
    fieldValue,
    confidenceScore: Math.min(100, Math.max(0, confidenceScore)),
    snippetSource,
    isConfirmed: false
  };
}
