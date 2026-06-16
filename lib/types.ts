export type TemplateId =
  | 'classic' | 'sidebar-dark' | 'executive-bold' | 'creative-purple' | 'swiss-grid'
  | 'infographic' | 'minimalist-mono' | 'magazine-spread' | 'card-stack' | 'timeline-left'
  | 'government' | 'dark-mode' | 'elegant-serif' | 'startup-bold' | 'academic-cv';

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
  projects?: {
    name: string;
    description: string;
    url?: string;
    startDate?: string;
    endDate?: string;
  }[];
  languages?: {
    name: string;
    proficiency?: string;
  }[];
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

export interface NaukriProfile {
  headline: string;   // max 250 chars
  summary: string;    // max 3000 chars
  keySkills: string[]; // 15-20 skills
}

// --- New Resume Builder Types ---

export interface ResumeContact {
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  linkedin: string;
  github: string;
  website: string;
}

export interface ResumeExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string; // This can be multiple lines of bullets
}

export interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  currentlyStudying: boolean;
  score: string;
}

export interface ResumeSkill {
  id: string;
  name: string;
  level: string; // e.g., Beginner, Intermediate, Expert
}

export interface ResumeProject {
  id: string;
  name: string;
  description: string;
  url: string;
  startDate: string;
  endDate: string;
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  doesNotExpire: boolean;
  credentialId: string;
  credentialUrl: string;
}

export type LanguageProficiency =
  | 'Native Speaker'
  | 'Fluent'
  | 'Professional Working Proficiency'
  | 'Limited Working Proficiency'
  | 'Elementary Proficiency';

export interface ResumeLanguage {
  id: string;
  name: string;
  proficiency: LanguageProficiency;
}

export interface ResumeCustomItem {
  id: string;
  name: string;
  description: string;
}

export interface ResumeCustomSection {
  id: string; // e.g. "custom-uuid"
  title: string;
  items: ResumeCustomItem[];
}

export interface ResumePublication {
  id: string;
  title: string;
  publisher: string;
  date: string;
  coAuthors: string;
  url: string;
}

export interface ResumeCourse {
  id: string;
  name: string;
  platform: string;
  completionDate: string;
  certificateUrl: string;
}

export interface ResumeAward {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description: string;
}

export interface ResumeVolunteer {
  id: string;
  organization: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  currentlyVolunteering: boolean;
  description: string;
}

export interface ResumeData {
  contact: ResumeContact;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkill[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  languages: ResumeLanguage[];
  publications?: ResumePublication[];
  courses?: ResumeCourse[];
  awards?: ResumeAward[];
  volunteer?: ResumeVolunteer[];
  customSections?: ResumeCustomSection[];
}
