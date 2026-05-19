import { z } from 'zod';

export const ContactSchema = z.object({
  name: z.string().default(''),
  email: z.string().default(''),
  phone: z.string().default(''),
  location: z.string().default(''),
  linkedin: z.string().optional(),
});

export const WorkExperienceSchema = z.object({
  company: z.string().default(''),
  title: z.string().default(''),
  startDate: z.string().default(''),
  endDate: z.string().default(''),
  bullets: z.array(z.string()).default([]),
});

export const EducationSchema = z.object({
  institution: z.string().default(''),
  degree: z.string().default(''),
  field: z.string().default(''),
  year: z.string().default(''),
  cgpa: z.string().optional(),
});

export const ParsedResumeSchema = z.object({
  contact: ContactSchema,
  summary: z.string().default(''),
  experience: z.array(WorkExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
  skills: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  noticePeriod: z.string().optional(),
  ctc: z.string().optional(),
  hasMultiColumn: z.boolean().default(false),
  hasTables: z.boolean().default(false),
  hasImages: z.boolean().default(false),
  rawText: z.string().optional(),
});

export const ParsedJDSchema = z.object({
  jobTitle: z.string().default(''),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  yearsRequired: z.number().default(0),
  tools: z.array(z.string()).default([]),
  industryKeywords: z.array(z.string()).default([]),
  seniorityLevel: z.string().default(''),
  domain: z.string().default(''),
});

export const ScoreBreakdownSchema = z.object({
  keyword: z.number().default(0),
  formatting: z.number().default(0),
  naukri: z.number().default(0),
  content: z.number().default(0),
});

export const ATSScoreSchema = z.object({
  total: z.number().default(0),
  breakdown: ScoreBreakdownSchema,
  missingKeywords: z.array(z.string()).default([]),
  matchedKeywords: z.array(z.string()).default([]),
  formattingIssues: z.array(z.string()).default([]),
  naukriIssues: z.array(z.string()).default([]),
  contentIssues: z.array(z.string()).default([]),
  topFixes: z.array(z.string()).default([]),
});

export const RewrittenResumeSchema = z.object({
  contact: ContactSchema,
  summary: z.string().default(''),
  experience: z.array(WorkExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
  skills: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  naukriProfileText: z.string().default(''),
  noticePeriod: z.string().optional(),
  ctc: z.string().optional(),
});

export const RewriteResultSchema = z.object({
  original: ParsedResumeSchema,
  rewritten: RewrittenResumeSchema,
});

export const NaukriProfileSchema = z.object({
  headline: z.string().default(''),
  summary: z.string().default(''),
  keySkills: z.array(z.string()).default([]),
});

// --- New Resume Builder Types ---

export const ResumeContactSchema = z.object({
  firstName: z.string().default(''),
  lastName: z.string().default(''),
  jobTitle: z.string().default(''),
  email: z.string().default(''),
  phone: z.string().default(''),
  city: z.string().default(''),
  country: z.string().default(''),
  linkedin: z.string().default(''),
  github: z.string().default(''),
  website: z.string().default(''),
});

export const ResumeExperienceSchema = z.object({
  id: z.string().default(''),
  company: z.string().default(''),
  position: z.string().default(''),
  location: z.string().default(''),
  startDate: z.string().default(''),
  endDate: z.string().default(''),
  currentlyWorking: z.boolean().default(false),
  description: z.string().default(''),
});

export const ResumeEducationSchema = z.object({
  id: z.string().default(''),
  institution: z.string().default(''),
  degree: z.string().default(''),
  field: z.string().default(''),
  location: z.string().default(''),
  startDate: z.string().default(''),
  endDate: z.string().default(''),
  currentlyStudying: z.boolean().default(false),
  score: z.string().default(''),
});

export const ResumeSkillSchema = z.object({
  id: z.string().default(''),
  name: z.string().default(''),
  level: z.string().default('Intermediate'),
});

export const ResumeProjectSchema = z.object({
  id: z.string().default(''),
  name: z.string().default(''),
  description: z.string().default(''),
  url: z.string().default(''),
  startDate: z.string().default(''),
  endDate: z.string().default(''),
});

export const ResumeDataSchema = z.object({
  contact: ResumeContactSchema,
  summary: z.string().default(''),
  experience: z.array(ResumeExperienceSchema).default([]),
  education: z.array(ResumeEducationSchema).default([]),
  skills: z.array(ResumeSkillSchema).default([]),
  projects: z.array(ResumeProjectSchema).default([]),
});
