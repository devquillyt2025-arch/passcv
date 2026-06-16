import type { FC } from 'react';
import type { ResumeData, TemplateId } from '@/lib/types';
import { SHEET_W, SHEET_H, type TemplateProps } from './shared';

import ClassicTemplate from './ClassicTemplate';
import SidebarDarkTemplate from './SidebarDarkTemplate';
import ExecutiveBoldTemplate from './ExecutiveBoldTemplate';
import CreativePurpleTemplate from './CreativePurpleTemplate';
import SwissGridTemplate from './SwissGridTemplate';
import InfographicTemplate from './InfographicTemplate';
import MinimalistMonoTemplate from './MinimalistMonoTemplate';
import MagazineSpreadTemplate from './MagazineSpreadTemplate';
import CardStackTemplate from './CardStackTemplate';
import TimelineLeftTemplate from './TimelineLeftTemplate';
import GovernmentTemplate from './GovernmentTemplate';
import DarkModeTemplate from './DarkModeTemplate';
import ElegantSerifTemplate from './ElegantSerifTemplate';
import StartupBoldTemplate from './StartupBoldTemplate';
import AcademicCvTemplate from './AcademicCvTemplate';

export const HTML_TEMPLATES: Record<TemplateId, FC<TemplateProps>> = {
  'classic': ClassicTemplate,
  'sidebar-dark': SidebarDarkTemplate,
  'executive-bold': ExecutiveBoldTemplate,
  'creative-purple': CreativePurpleTemplate,
  'swiss-grid': SwissGridTemplate,
  'infographic': InfographicTemplate,
  'minimalist-mono': MinimalistMonoTemplate,
  'magazine-spread': MagazineSpreadTemplate,
  'card-stack': CardStackTemplate,
  'timeline-left': TimelineLeftTemplate,
  'government': GovernmentTemplate,
  'dark-mode': DarkModeTemplate,
  'elegant-serif': ElegantSerifTemplate,
  'startup-bold': StartupBoldTemplate,
  'academic-cv': AcademicCvTemplate,
};

/** Blank out sections the user has toggled off so templates simply skip them. */
function applyHidden(data: ResumeData, hidden: string[]): ResumeData {
  if (!hidden.length) return data;
  const h = (k: string) => hidden.includes(k);
  return {
    ...data,
    summary: h('summary') ? '' : data.summary,
    skills: h('skills') ? [] : data.skills,
    experience: h('experience') ? [] : data.experience,
    education: h('education') ? [] : data.education,
    projects: h('projects') ? [] : data.projects,
    certifications: h('certifications') ? [] : data.certifications,
    languages: h('languages') ? [] : data.languages,
    publications: h('publications') ? [] : data.publications,
    courses: h('courses') ? [] : data.courses,
    awards: h('awards') ? [] : data.awards,
    volunteer: h('volunteer') ? [] : data.volunteer,
  };
}

interface ResumeDocProps {
  data: ResumeData;
  templateId: TemplateId;
  hiddenSections?: string[];
}

/**
 * Renders the selected HTML template inside a fixed A4 sheet. The sheet is the
 * single unit that callers scale (gallery thumbnails) or zoom (builder preview).
 */
export default function ResumeDoc({ data, templateId, hiddenSections = [] }: ResumeDocProps) {
  const Template = HTML_TEMPLATES[templateId] ?? ClassicTemplate;
  const filtered = applyHidden(data, hiddenSections);

  return (
    <div
      style={{
        width: SHEET_W,
        minHeight: SHEET_H,
        background: '#ffffff',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Template data={filtered} />
    </div>
  );
}
