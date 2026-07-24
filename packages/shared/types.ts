// Shared Types for Qaddem AI Monorepo

export enum GenderTarget {
  FEMALE = 'FEMALE',
  MALE = 'MALE',
  BOTH = 'BOTH'
}

export enum ApplicationStatus {
  SUGGESTED = 'SUGGESTED',
  SAVED = 'SAVED',
  READY = 'READY',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  APPLIED = 'APPLIED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  TEST = 'TEST',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export interface ExtractedJobCard {
  id: string;
  title: string;
  company: string;
  city: string;
  emails: string[];
  phones: string[];
  forms: string[];
  links: string[];
  sourceUrl: string;
  subjectInstruction: string;
  genderTarget: GenderTarget;
  genderLabel: string;
  date: string;
}
