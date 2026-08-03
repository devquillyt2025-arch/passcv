import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { ResumeData, ParsedResume, RewrittenResume } from './types';
// Only Classic is imported now. The other nine react-pdf templates were
// referenced solely by the deleted TEMPLATE_MAP, which aliased 15 HTML template
// ids onto 10 react-pdf designs; they are unreachable and go with the tree.
import ClassicTemplate from '@/components/templates/ClassicTemplate';

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

/**
 * PDF for the tailor/rewrite flow, which produces a ParsedResume rather than
 * builder state and has no template picker — it is always Classic.
 *
 * This is the last remaining @react-pdf/renderer caller. The builder's export
 * moved to headless-Chromium print (lib/resume-render), and with it went the
 * TEMPLATE_MAP that used to approximate 15 HTML templates with 10 react-pdf
 * ones — five ids were aliases, so choosing Dark Mode produced a white
 * Executive PDF. Nothing maps or approximates any more: the builder renders the
 * template the user picked, and this function renders exactly Classic.
 *
 * Retire alongside components/templates once the tailor flow moves over too.
 */
export async function generateResumePdfBlob(resume: ResumeInput): Promise<Blob> {
  const data = adaptToResumeData(resume);
  const doc = React.createElement(ClassicTemplate, { data });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return pdf(doc as any).toBlob();
}
