import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { ResumeData, ParsedResume, RewrittenResume } from './types';
import ClassicTemplate from '@/components/templates/ClassicTemplate';
import ModernTemplate from '@/components/templates/ModernTemplate';

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
    projects: [],
    certifications: [],
    languages: [],
    customSections: [],
  };
}

export async function generateResumePdfBlob(resume: ResumeInput): Promise<Blob> {
  const data = adaptToResumeData(resume);
  return generateBuilderPdfBlob(data, 'classic');
}

export async function generateBuilderPdfBlob(
  data: ResumeData,
  templateId: 'classic' | 'modern' = 'classic',
  sectionOrder?: string[]
): Promise<Blob> {
  const TemplateComponent = templateId === 'modern' ? ModernTemplate : ClassicTemplate;
  const doc = React.createElement(TemplateComponent, { data, sectionOrder });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const asPdf = pdf(doc as any);
  const blob = await asPdf.toBlob();
  return blob;
}
