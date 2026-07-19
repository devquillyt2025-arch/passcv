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

function adaptToResumeData(input: ResumeInput): ResumeData {
  return {
    contact: {
      firstName: input.contact?.name?.split(' ')[0] || '',
      lastName: input.contact?.name?.split(' ').slice(1).join(' ') || '',
      jobTitle: '',
      email: input.contact?.email || '',
      phone: input.contact?.phone || '',
      city: input.contact?.location || '',
      country: '',
      linkedin: input.contact?.linkedin || '',
      github: '',
      website: ''
    },
    summary: input.summary || '',
    experience: (input.experience || []).map((exp, i) => ({
      id: `exp-${i}`,
      company: exp.company || '',
      position: exp.title || '',
      location: '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      currentlyWorking: exp.endDate?.toLowerCase().includes('present') || false,
      description: exp.bullets?.join('\n') || ''
    })),
    education: (input.education || []).map((edu, i) => ({
      id: `edu-${i}`,
      institution: edu.institution || '',
      degree: edu.degree || '',
      field: edu.field || '',
      location: '',
      startDate: '',
      endDate: edu.year || '',
      currentlyStudying: false,
      score: edu.cgpa || ''
    })),
    skills: (input.skills || []).map((skill, i) => ({
      id: `skill-${i}`,
      name: skill,
      level: ''
    })),
    projects: (input.projects || []).map((proj, i) => ({
      id: `proj-${i}`,
      name: proj.name || '',
      description: proj.description || '',
      url: proj.url || '',
      startDate: proj.startDate || '',
      endDate: proj.endDate || ''
    })),
    certifications: (input.certifications || []).map((cert, i) => ({
      id: `cert-${i}`,
      name: typeof cert === 'string' ? cert : '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      doesNotExpire: true,
      credentialId: '',
      credentialUrl: ''
    })),
    languages: (input.languages || []).map((lang, i) => ({
      id: `lang-${i}`,
      name: lang.name || '',
      proficiency: (lang.proficiency as any) || 'Professional Working Proficiency'
    })),
    customSections: [],
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
