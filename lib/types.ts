export interface Contact {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
}

export interface WorkExperience {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  year: string;
  cgpa?: string;
}

export interface ParsedResume {
  contact: Contact;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  certifications: string[];
  noticePeriod?: string;
  ctc?: string;
  hasMultiColumn: boolean;
  hasTables: boolean;
  hasImages: boolean;
  rawText?: string;
}

export interface ParsedJD {
  jobTitle: string;
  requiredSkills: string[];
  preferredSkills: string[];
  yearsRequired: number;
  tools: string[];
  industryKeywords: string[];
  seniorityLevel: string;
  domain: string;
}

export interface ScoreBreakdown {
  keyword: number;
  formatting: number;
  naukri: number;
  content: number;
}

export interface ATSScore {
  total: number;
  breakdown: ScoreBreakdown;
  missingKeywords: string[];
  matchedKeywords: string[];
  formattingIssues: string[];
  naukriIssues: string[];
  contentIssues: string[];
  topFixes: string[];
}

export interface RewrittenResume {
  contact: Contact;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  certifications: string[];
  naukriProfileText: string;
  noticePeriod?: string;
  ctc?: string;
}

export interface RewriteResult {
  original: ParsedResume;
  rewritten: RewrittenResume;
}
