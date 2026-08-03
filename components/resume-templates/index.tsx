import type { FC } from 'react';
import type { ResumeData, TemplateId } from '@/lib/types';
import type { ResumeRenderInput } from '@/lib/resume-render/types';
import { SHEET_W, SHEET_H, type TemplateProps } from './shared';
import { SHEET_FRAGMENTATION_CSS, PAGE_GUIDE_CSS } from './sheetStyles';
import { fontFaceCssForBrowser, fontsFor } from './fonts';

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
  /**
   * The complete render tuple. Taking one required object rather than six
   * loose optional props is the point: every field is mandatory, so a call
   * site that forgets `hiddenSections` or `builderDesign` fails to compile
   * instead of silently rendering something the other path doesn't.
   * Build it with selectRenderInput() — never by hand.
   */
  input: ResumeRenderInput;
  /** Screen-only: drops the page shadow for thumbnails. Not part of the document. */
  atsFriendly?: boolean;
  /**
   * Screen-only: draw a hairline at each page boundary. On for the builder's
   * live preview, off for thumbnails and for the print document (where real
   * page breaks make it redundant).
   */
  pageGuides?: boolean;
  /**
   * Override the @font-face rules. Defaults to fetching /fonts/*.woff2, which
   * is right for the browser; the print document passes base64-inlined faces.
   * Same registry, same files, different delivery.
   */
  fontCss?: string;
}

/**
 * Renders the selected HTML template inside a fixed A4 sheet. The sheet is the
 * single unit that callers scale (gallery thumbnails) or zoom (builder preview),
 * and the same unit lib/resume-render/document.tsx prints to PDF.
 */
export default function ResumeDoc({ input, atsFriendly = false, pageGuides = false, fontCss }: ResumeDocProps) {
  const { data, templateId, sectionOrder, hiddenSections, builderDesign } = input;
  const Template = HTML_TEMPLATES[templateId] ?? ClassicTemplate;

  const filtered: ResumeData = {
    ...applyHidden(data, hiddenSections),
    customSections: (data.customSections || []).filter((c) => !hiddenSections.includes(c.id)),
  };

  return (
    <div className={`relative transition-all duration-300 w-full ${!atsFriendly ? 'shadow-2xl' : ''}`} style={{ textAlign: 'left' }}>
      {/* The sheet's own fonts and pagination rules travel with the markup, so
          the on-screen sheet and the printed document use one policy and one
          set of font files. `fontCss` is overridden by the print path, which
          inlines the same faces as base64 (setContent has no base URL). */}
      <style
        dangerouslySetInnerHTML={{
          __html:
            (fontCss ?? fontFaceCssForBrowser(fontsFor(templateId))) +
            SHEET_FRAGMENTATION_CSS +
            PAGE_GUIDE_CSS,
        }}
      />
      {/* data-resume-sheet is the stable anchor scripts/parity-check.mjs uses to
          compare the preview and print cascades from the same root element.
          No overflow:hidden — it used to clip everything past page one instead
          of paginating (the bug at this line). Height grows with content and
          the page guides mark where the PDF breaks. */}
      <div
        data-resume-sheet=""
        data-page-guides={pageGuides ? '' : undefined}
        className="relative w-full bg-white"
        style={{
          width: SHEET_W,
          minHeight: SHEET_H,
        }}
      >
        <Template data={filtered} sectionOrder={sectionOrder} builderDesign={builderDesign} />
      </div>
    </div>
  );
}
