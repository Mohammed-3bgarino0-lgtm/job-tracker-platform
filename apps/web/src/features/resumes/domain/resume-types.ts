export interface ResumeFileValidation {
  isValid: boolean;
  fileSize: number;
  mimeType: string;
  error?: string;
}

export interface ExtractedResumeField {
  id: string;
  fieldName: string;
  fieldLabelAr: string;
  fieldValue: string;
  confidenceScore: number; // 0 - 100
  snippetSource: string;
  isConfirmed: boolean;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface ParsedResumeResult {
  resumeId: string;
  fileName: string;
  fields: ExtractedResumeField[];
}
