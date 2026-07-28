import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { ResumeData, ParsedResume, RewrittenResume, TemplateId } from './types';
import ClassicTemplate from '@/components/templates/ClassicTemplate';
import ModernTemplate from '@/components/templates/ModernTemplate';
import MinimalTemplate from '@/components/templates/MinimalTemplate';
import ExecutiveTemplate from '@/components/templates/ExecutiveTemplate';
import SidebarTemplate from '@/components/templates/SidebarTemplate';
import ElegantTemplate from '@/components/templates/ElegantTemplate';
import CreativeTemplate from '@/components/templates/CreativeTemplate';
import AcademicTemplate from '@/components/templates/AcademicTemplate';
import BoldTemplate from '@/components/templates/BoldTemplate';
import ContemporaryTemplate from '@/components/templates/ContemporaryTemplate';

export type ResumeInput = ParsedResume | RewrittenResume;

function adaptToResumeData(input: any): ResumeData {
  return {
    ...input,
    contact: {
      firstName: input.contact?.firstName || input.contact?.name?.split(' ')[0] || '',
      lastName: input.contact?.lastName || input.contact?.name?.split(' ').slice(1).join(' ') || '',
      jobTitle: input.contact?.jobTitle || '',
      email: input.contact?.email || '',
      phone: input.contact?.phone || '',
      city: input.contact?.city || input.contact?.location || '',
      country: input.contact?.country || '',
      linkedin: input.contact?.linkedin || '',
      github: input.contact?.github || '',
      website: input.contact?.website || ''
    },
    summary: input.summary || '',
    experience: (input.experience || []).map((exp: any, i: number) => ({
      ...exp,
      id: exp.id || `exp-${i}`,
      company: exp.company || '',
      position: exp.position || exp.title || '',
      location: exp.location || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      currentlyWorking: exp.currentlyWorking ?? (exp.endDate?.toLowerCase().includes('present') || false),
      description: exp.description || (exp.bullets ? exp.bullets.join('\n') : '')
    })),
    education: (input.education || []).map((edu: any, i: number) => ({
      ...edu,
      id: edu.id || `edu-${i}`,
      institution: edu.institution || '',
      degree: edu.degree || '',
      field: edu.field || '',
      location: edu.location || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || edu.year || '',
      currentlyStudying: edu.currentlyStudying || false,
      score: edu.score || edu.cgpa || ''
    })),
    skills: (input.skills || []).map((skill: any, i: number) => {
      if (typeof skill === 'string') return { id: `skill-${i}`, name: skill, level: '' };
      return { ...skill, id: skill.id || `skill-${i}`, name: skill.name || '', level: skill.level || '' };
    }),
    projects: (input.projects || []).map((proj: any, i: number) => ({
      ...proj,
      id: proj.id || `proj-${i}`,
      name: proj.name || '',
      description: proj.description || '',
      url: proj.url || '',
      startDate: proj.startDate || '',
      endDate: proj.endDate || ''
    })),
    certifications: (input.certifications || []).map((cert: any, i: number) => {
      if (typeof cert === 'string') return { id: `cert-${i}`, name: cert, issuer: '', issueDate: '', expiryDate: '', doesNotExpire: true, credentialId: '', credentialUrl: '' };
      return { ...cert, id: cert.id || `cert-${i}`, name: cert.name || '' };
    }),
    languages: (input.languages || []).map((lang: any, i: number) => ({
      ...lang,
      id: lang.id || `lang-${i}`,
      name: lang.name || '',
      proficiency: lang.proficiency || 'Professional Working Proficiency'
    })),
    awards: (input.awards || []).map((aw: any, i: number) => ({ ...aw, id: aw.id || `aw-${i}` })),
    volunteer: (input.volunteer || []).map((vol: any, i: number) => ({ ...vol, id: vol.id || `vol-${i}` })),
    publications: (input.publications || []).map((pub: any, i: number) => ({ ...pub, id: pub.id || `pub-${i}` })),
    courses: (input.courses || []).map((course: any, i: number) => ({ ...course, id: course.id || `course-${i}` })),
    customSections: input.customSections || [],
  };
}

export async function generateResumePdfBlob(resume: ResumeInput): Promise<Blob> {
  const data = adaptToResumeData(resume);
  return generateBuilderPdfBlob(data, 'classic');
}

// The on-screen / gallery templates are HTML (see components/resume-templates).
// PDF export uses `@react-pdf/renderer` templates which differ from standard HTML/CSS.
// Because creating 1:1 react-pdf components for all HTML templates is complex, 
// each HTML template id maps to its closest structural react-pdf design below.
// Note: Visual drift (e.g. precise font kerning, background colors, custom SVGs) 
// is expected. Exact PDF parity is a planned follow-up.
const TEMPLATE_MAP: Record<TemplateId, typeof ClassicTemplate> = {
  'classic':         ClassicTemplate,
  'sidebar-dark':    SidebarTemplate,
  'executive-bold':  ExecutiveTemplate,
  'creative-purple': CreativeTemplate,
  'swiss-grid':      ModernTemplate,
  'infographic':     SidebarTemplate, // Closest structure for two-column graphics
  'minimalist-mono': MinimalTemplate,
  'magazine-spread': ExecutiveTemplate, // Full width elegant structure
  'card-stack':      ModernTemplate, // Clean separated sections
  'timeline-left':   ContemporaryTemplate,
  'government':      ClassicTemplate, // Standard formal format
  'dark-mode':       ExecutiveTemplate, // High contrast fallback
  'elegant-serif':   ElegantTemplate,
  'startup-bold':    BoldTemplate,
  'academic-cv':     AcademicTemplate,
};

export async function generateBuilderPdfBlob(
  data: ResumeData,
  templateId: TemplateId = 'classic',
  sectionOrder?: string[],
  accentColor?: string
): Promise<Blob> {
  const TemplateComponent = TEMPLATE_MAP[templateId] ?? ClassicTemplate;
  const doc = React.createElement(TemplateComponent, { data, sectionOrder, accentColor });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const asPdf = pdf(doc as any);
  const blob = await asPdf.toBlob();
  return blob;
}
