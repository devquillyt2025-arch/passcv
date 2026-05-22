'use client';

import { useLayoutEffect, useRef, useState, useMemo, memo } from 'react';
import type { ResumeData, ResumeExperience, ResumeEducation, ResumeProject, ResumeCertification, ResumeLanguage, ResumePublication, ResumeCourse, ResumeAward, ResumeVolunteer, StoreState } from '@/lib/types';
import { DEFAULT_SECTION_ORDER } from '@/lib/store/slices/globalSlice';

// ── Page geometry (preview scale: 680px wide = A4 at ~83dpi) ─────────────────
const PAGE_W   = 680;
const PAGE_H   = 960;   // px — proportional A4 height at this width
const PAD_T    = 32;    // top padding per page (symmetric margins: 32px 40px)
const PAD_B    = 32;    // bottom padding per page
const PAD_SIDE = 40;    // horizontal padding (symmetric)
const USABLE_H = PAGE_H - PAD_T - PAD_B;   // 896px usable content height per page
const CONTENT_W = PAGE_W - PAD_SIDE * 2;   // 600px — used for measurement div width

// ── Themes ────────────────────────────────────────────────────────────────────
const CLASSIC = {
  font: 'Georgia, "Times New Roman", serif',
  nameColor: '#1E3A8A',
  titleColor: '#374151',
  contactColor: '#6B7280',
  headingColor: '#1E3A8A',
  bodyColor: '#1F2937',
  mutedColor: '#6B7280',
  nameAlign: 'center' as const,
  nameSize: 23,
  lineHeight: 1.5,
  sectionTop: 18,
  sectionBottom: 8,
  itemGap: 12,
  headingStyle: {
    borderBottom: '1.5px solid #1E3A8A',
    borderLeft: 'none',
    paddingLeft: 0,
    paddingBottom: 3,
  },
  showDivider: true,
};

const MODERN = {
  font: '"Segoe UI", system-ui, -apple-system, sans-serif',
  nameColor: '#4338CA',
  titleColor: '#6B7280',
  contactColor: '#6B7280',
  headingColor: '#4F46E5',
  bodyColor: '#374151',
  mutedColor: '#6B7280',
  nameAlign: 'left' as const,
  nameSize: 26,
  lineHeight: 1.65,
  sectionTop: 18,
  sectionBottom: 8,
  itemGap: 12,
  headingStyle: {
    borderBottom: 'none',
    borderLeft: '3px solid #4F46E5',
    paddingLeft: 8,
    paddingBottom: 0,
  },
  showDivider: false,
};

type Theme = {
  font: string;
  nameColor: string;
  titleColor: string;
  contactColor: string;
  headingColor: string;
  bodyColor: string;
  mutedColor: string;
  nameAlign: 'center' | 'left';
  nameSize: number;
  lineHeight: number;
  sectionTop: number;
  sectionBottom: number;
  itemGap: number;
  headingStyle: {
    borderBottom: string;
    borderLeft: string;
    paddingLeft: number;
    paddingBottom: number;
  };
  showDivider: boolean;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(d: string) {
  if (!d) return '';
  const [yr, mo] = d.split('-');
  if (!mo) return yr;
  return `${'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')[+mo - 1]} ${yr}`;
}

function parseBullets(text: string) {
  return text
    .split('\n')
    .map((l) => l.trim().replace(/^[•\-]\s*/, ''))
    .filter(Boolean);
}

// ── Atomic block components ───────────────────────────────────────────────────
// Each is a self-contained unit that will never be split mid-render.

function SectionHeading({ title, t }: { title: string; t: Theme }) {
  return (
    <div style={{ marginTop: t.sectionTop, marginBottom: t.sectionBottom, ...t.headingStyle }}>
      <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.headingColor }}>
        {title}
      </span>
    </div>
  );
}

function HeaderBlock({ data, t, templateId }: { data: ResumeData; t: Theme; templateId: string }) {
  const contact = data.contact || {};
  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
  const contactParts = [
    contact.email,
    contact.phone,
    [contact.city, contact.country].filter(Boolean).join(', '),
    contact.linkedin,
    contact.github || contact.website,
  ].filter(Boolean);

  return (
    <>
      <div style={{ textAlign: t.nameAlign }}>
        <h1 style={{ margin: 0, fontSize: t.nameSize, fontWeight: 700, color: t.nameColor, lineHeight: 1.25, letterSpacing: templateId === 'modern' ? '-0.01em' : 0 }}>
          {fullName || <span style={{ color: '#D1D5DB', fontStyle: 'italic', fontSize: 18 }}>Your Name</span>}
        </h1>
        {contact.jobTitle && (
          <p style={{ margin: '5px 0 0 0', fontSize: 12, color: t.titleColor, fontWeight: templateId === 'modern' ? 500 : 400 }}>
            {contact.jobTitle}
          </p>
        )}
        {contactParts.length > 0 && (
          <p style={{ margin: '6px 0 0 0', fontSize: 9.5, color: t.contactColor, lineHeight: 1.4 }}>
            {contactParts.join('  |  ')}
          </p>
        )}
      </div>
      {t.showDivider && <div style={{ borderTop: '1.5px solid #1E3A8A', marginTop: 12 }} />}
    </>
  );
}

function ExperienceBlock({ job, isFirst, t }: { job: ResumeExperience; isFirst: boolean; t: Theme }) {
  const bs = parseBullets(job.description);
  const dates = [fmtDate(job.startDate), job.currentlyWorking ? 'Present' : fmtDate(job.endDate)]
    .filter(Boolean).join(' – ');

  return (
    // isFirst merges the section heading into this block to prevent orphan headings
    <div style={{ marginTop: isFirst ? 0 : t.itemGap }}>
      {isFirst && <SectionHeading title="Work Experience" t={t} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: t.bodyColor }}>
          {[job.position, job.company].filter(Boolean).join(' — ') || (
            <span style={{ color: '#D1D5DB', fontStyle: 'italic' }}>Position — Company</span>
          )}
        </span>
        {(job.location || dates) && (
          <span style={{ fontSize: 10, color: t.mutedColor, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {[job.location, dates].filter(Boolean).join('  |  ')}
          </span>
        )}
      </div>
      {bs.length > 0 && (
        <ul style={{ margin: '4px 0 0 0', paddingLeft: 16, listStyleType: 'disc' }}>
          {bs.map((b, i) => (
            <li key={i} style={{ fontSize: 11, color: t.bodyColor, lineHeight: t.lineHeight, marginBottom: 2 }}>{b}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EducationBlock({ edu, isFirst, t }: { edu: ResumeEducation; isFirst: boolean; t: Theme }) {
  const deg = [edu.degree, edu.field ? `in ${edu.field}` : ''].filter(Boolean).join(' ');
  const dates = [fmtDate(edu.startDate), edu.currentlyStudying ? 'Present' : fmtDate(edu.endDate)]
    .filter(Boolean).join(' – ');
  const line2 = [edu.institution, edu.location, dates ? `(${dates})` : '', edu.score ? `• ${edu.score}` : '']
    .filter(Boolean).join('  ');

  return (
    <div style={{ marginTop: isFirst ? 0 : Math.max(6, t.itemGap - 4) }}>
      {isFirst && <SectionHeading title="Education" t={t} />}
      {deg && <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: t.bodyColor }}>{deg}</p>}
      {line2 && <p style={{ margin: '2px 0 0 0', fontSize: 10.5, color: t.mutedColor }}>{line2}</p>}
    </div>
  );
}

function ProjectBlock({ proj, isFirst, t }: { proj: ResumeProject; isFirst: boolean; t: Theme }) {
  const bs = parseBullets(proj.description);
  const dates = [fmtDate(proj.startDate), fmtDate(proj.endDate)].filter(Boolean).join(' – ');

  return (
    <div style={{ marginTop: isFirst ? 0 : Math.max(8, t.itemGap - 2) }}>
      {isFirst && <SectionHeading title="Projects" t={t} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: t.bodyColor }}>
          {proj.name || 'Project Name'}
          {proj.url && <span style={{ fontWeight: 400, color: t.mutedColor, fontSize: 10.5 }}> — {proj.url}</span>}
        </span>
        {dates && <span style={{ fontSize: 10, color: t.mutedColor, whiteSpace: 'nowrap', flexShrink: 0 }}>{dates}</span>}
      </div>
      {bs.length > 0 && (
        <ul style={{ margin: '4px 0 0 0', paddingLeft: 16, listStyleType: 'disc' }}>
          {bs.map((b, i) => (
            <li key={i} style={{ fontSize: 11, color: t.bodyColor, lineHeight: t.lineHeight, marginBottom: 2 }}>{b}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CertificationBlock({ cert, isFirst, t }: { cert: ResumeCertification; isFirst: boolean; t: Theme }) {
  const dateStr = [
    fmtDate(cert.issueDate),
    cert.doesNotExpire ? 'No Expiry' : fmtDate(cert.expiryDate),
  ].filter(Boolean).join(' – ');

  const meta = [
    cert.credentialId ? `ID: ${cert.credentialId}` : '',
    cert.credentialUrl || '',
  ].filter(Boolean).join('  |  ');

  return (
    <div style={{ marginTop: isFirst ? 0 : Math.max(6, t.itemGap - 4) }}>
      {isFirst && <SectionHeading title="Certifications" t={t} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: t.bodyColor }}>
          {cert.name || 'Certification Name'}
          {cert.issuer && (
            <span style={{ fontWeight: 400, fontStyle: 'italic', color: t.mutedColor }}> — {cert.issuer}</span>
          )}
        </span>
        {dateStr && (
          <span style={{ fontSize: 10, color: t.mutedColor, whiteSpace: 'nowrap', flexShrink: 0 }}>{dateStr}</span>
        )}
      </div>
      {meta && (
        <p style={{ margin: '2px 0 0 0', fontSize: 10, color: t.mutedColor }}>{meta}</p>
      )}
    </div>
  );
}

function LanguageBlock({ lang, isFirst, t }: { lang: ResumeLanguage; isFirst: boolean; t: Theme }) {
  return (
    <div style={{ marginTop: isFirst ? 0 : 4 }}>
      {isFirst && <SectionHeading title="Languages" t={t} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: t.bodyColor }}>
          {lang.name || 'Language'}
        </span>
        <span style={{ fontSize: 10, color: t.mutedColor, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {lang.proficiency}
        </span>
      </div>
    </div>
  );
}

function PublicationBlock({ pub, isFirst, t }: { pub: ResumePublication; isFirst: boolean; t: Theme }) {
  return (
    <div style={{ marginTop: isFirst ? 0 : Math.max(6, t.itemGap - 4) }}>
      {isFirst && <SectionHeading title="Publications" t={t} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: t.bodyColor }}>
          {pub.title || 'Publication Title'}
        </span>
        {(pub.publisher || pub.date) && (
          <span style={{ fontSize: 10, color: t.mutedColor, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {[pub.publisher, fmtDate(pub.date)].filter(Boolean).join(', ')}
          </span>
        )}
      </div>
      {pub.coAuthors && (
        <p style={{ margin: '2px 0 0 0', fontSize: 10, color: t.mutedColor }}>
          with {pub.coAuthors}
        </p>
      )}
      {pub.url && (
        <p style={{ margin: '2px 0 0 0', fontSize: 10, color: t.mutedColor }}>{pub.url}</p>
      )}
    </div>
  );
}

function CourseBlock({ course, isFirst, t }: { course: ResumeCourse; isFirst: boolean; t: Theme }) {
  return (
    <div style={{ marginTop: isFirst ? 0 : Math.max(6, t.itemGap - 4) }}>
      {isFirst && <SectionHeading title="Courses & Training" t={t} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: t.bodyColor }}>
          {course.name || 'Course Name'}
        </span>
        {(course.platform || course.completionDate) && (
          <span style={{ fontSize: 10, color: t.mutedColor, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {[course.platform, fmtDate(course.completionDate)].filter(Boolean).join('  |  ')}
          </span>
        )}
      </div>
      {course.certificateUrl && (
        <p style={{ margin: '2px 0 0 0', fontSize: 10, color: t.mutedColor }}>{course.certificateUrl}</p>
      )}
    </div>
  );
}

function AwardBlock({ award, isFirst, t }: { award: ResumeAward; isFirst: boolean; t: Theme }) {
  return (
    <div style={{ marginTop: isFirst ? 0 : Math.max(6, t.itemGap - 4) }}>
      {isFirst && <SectionHeading title="Awards & Honors" t={t} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: t.bodyColor }}>
          {award.name || 'Award Name'}
          {award.issuer && (
            <span style={{ fontWeight: 400, fontStyle: 'italic', color: t.mutedColor }}> — {award.issuer}</span>
          )}
        </span>
        {award.date && (
          <span style={{ fontSize: 10, color: t.mutedColor, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {fmtDate(award.date)}
          </span>
        )}
      </div>
      {award.description && (
        <p style={{ margin: '2px 0 0 0', fontSize: 11, color: t.bodyColor, lineHeight: t.lineHeight }}>
          {award.description}
        </p>
      )}
    </div>
  );
}

function VolunteerBlock({ vol, isFirst, t }: { vol: ResumeVolunteer; isFirst: boolean; t: Theme }) {
  const bs = parseBullets(vol.description);
  const dates = [fmtDate(vol.startDate), vol.currentlyVolunteering ? 'Present' : fmtDate(vol.endDate)]
    .filter(Boolean).join(' – ');

  return (
    <div style={{ marginTop: isFirst ? 0 : t.itemGap }}>
      {isFirst && <SectionHeading title="Volunteer Work" t={t} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: t.bodyColor }}>
          {[vol.role, vol.organization].filter(Boolean).join(' — ') || (
            <span style={{ color: '#D1D5DB', fontStyle: 'italic' }}>Role — Organization</span>
          )}
        </span>
        {(vol.location || dates) && (
          <span style={{ fontSize: 10, color: t.mutedColor, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {[vol.location, dates].filter(Boolean).join('  |  ')}
          </span>
        )}
      </div>
      {bs.length > 0 && (
        <ul style={{ margin: '4px 0 0 0', paddingLeft: 16, listStyleType: 'disc' }}>
          {bs.map((b, i) => (
            <li key={i} style={{ fontSize: 11, color: t.bodyColor, lineHeight: t.lineHeight, marginBottom: 2 }}>{b}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SummaryBlock({ data, t }: { data: ResumeData; t: Theme }) {
  if (!data.summary) return null;
  return (
    <div>
      <SectionHeading title="Professional Summary" t={t} />
      <p style={{ margin: 0, fontSize: 11, color: t.bodyColor, lineHeight: t.lineHeight }}>{data.summary}</p>
    </div>
  );
}

function SkillsBlock({ data, t }: { data: ResumeData; t: Theme }) {
  const skills = data.skills || [];
  if (skills.length === 0) return null;
  return (
    <div>
      <SectionHeading title="Skills" t={t} />
      <p style={{ margin: 0, fontSize: 11, color: t.bodyColor, lineHeight: t.lineHeight }}>
        {skills.map((s) => s.name).join(' • ')}
      </p>
    </div>
  );
}

// ── Block list builder ────────────────────────────────────────────────────────
// Produces a flat ordered array of render blocks. Each block is atomic —
// it will never be split across pages. Section headings are merged into
// their first entry to prevent orphan headings at page bottoms.

type Block = { id: string; node: React.ReactNode };

function buildBlocks(data: ResumeData, t: Theme, templateId: string, order: string[], hidden: string[]): Block[] {
  const blocks: Block[] = [];

  if (!hidden.includes('personal')) {
    blocks.push({
      id: 'header',
      node: <HeaderBlock data={data} t={t} templateId={templateId} />,
    });
  }

  for (const sectionId of order) {
    if (hidden.includes(sectionId)) continue;
    switch (sectionId) {
      case 'summary':
        if (data.summary) {
          blocks.push({ id: 'summary', node: <SummaryBlock data={data} t={t} /> });
        }
        break;

      case 'skills':
        if ((data.skills || []).length > 0) {
          blocks.push({ id: 'skills', node: <SkillsBlock data={data} t={t} /> });
        }
        break;

      case 'experience':
        (data.experience || []).forEach((job, i) => {
          blocks.push({
            id: `exp-${job.id}`,
            node: <ExperienceBlock job={job} isFirst={i === 0} t={t} />,
          });
        });
        break;

      case 'education':
        (data.education || []).forEach((edu, i) => {
          blocks.push({
            id: `edu-${edu.id}`,
            node: <EducationBlock edu={edu} isFirst={i === 0} t={t} />,
          });
        });
        break;

      case 'certifications':
        (data.certifications || []).forEach((cert, i) => {
          blocks.push({
            id: `cert-${cert.id}`,
            node: <CertificationBlock cert={cert} isFirst={i === 0} t={t} />,
          });
        });
        break;

      case 'languages':
        (data.languages || []).forEach((lang, i) => {
          blocks.push({
            id: `lang-${lang.id}`,
            node: <LanguageBlock lang={lang} isFirst={i === 0} t={t} />,
          });
        });
        break;

      case 'projects':
        (data.projects || []).forEach((proj, i) => {
          blocks.push({
            id: `proj-${proj.id}`,
            node: <ProjectBlock proj={proj} isFirst={i === 0} t={t} />,
          });
        });
        break;

      case 'publications':
        (data.publications || []).forEach((pub, i) => {
          blocks.push({
            id: `pub-${pub.id}`,
            node: <PublicationBlock pub={pub} isFirst={i === 0} t={t} />,
          });
        });
        break;

      case 'courses':
        (data.courses || []).forEach((course, i) => {
          blocks.push({
            id: `course-${course.id}`,
            node: <CourseBlock course={course} isFirst={i === 0} t={t} />,
          });
        });
        break;

      case 'awards':
        (data.awards || []).forEach((award, i) => {
          blocks.push({
            id: `award-${award.id}`,
            node: <AwardBlock award={award} isFirst={i === 0} t={t} />,
          });
        });
        break;

      case 'volunteer':
        (data.volunteer || []).forEach((vol, i) => {
          blocks.push({
            id: `vol-${vol.id}`,
            node: <VolunteerBlock vol={vol} isFirst={i === 0} t={t} />,
          });
        });
        break;
    }
  }

  return blocks;
}

// ── Greedy bin-packing ────────────────────────────────────────────────────────
// Assigns block indices to pages. Each block goes on exactly one page.
// If a block doesn't fit in the remaining space, it starts the next page.
// A block taller than usableH still gets its own page (never split mid-entry).

function packBlocks(heights: number[], usableH: number): number[][] {
  const pages: number[][] = [[]];
  let remaining = usableH;

  for (let i = 0; i < heights.length; i++) {
    const h = heights[i];
    // Start a new page only if the current page already has content
    if (h > remaining && pages[pages.length - 1].length > 0) {
      pages.push([]);
      remaining = usableH;
    }
    pages[pages.length - 1].push(i);
    remaining -= h;
  }

  return pages;
}

interface ResumePreviewProps {
  data: ResumeData;
  templateId: string;
  sectionOrder: string[];
  hiddenSections: string[];
  builderDesign: StoreState['builderDesign'];
}

const ResumePreview = memo(function ResumePreview({ data, templateId, sectionOrder, hiddenSections, builderDesign }: ResumePreviewProps) {
  const t = useMemo(() => {
    const base = templateId === 'modern' ? MODERN : CLASSIC;
    const accent = builderDesign?.accentColor || base.headingColor;
    const fontByPair = {
      modern: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
      arial: 'Arial, Helvetica, sans-serif',
      helvetica: 'Helvetica, Arial, sans-serif',
      verdana: 'Verdana, Geneva, sans-serif',
      times: '"Times New Roman", Times, serif',
      calibri: 'Calibri, Roboto, sans-serif',
      courier: '"Courier New", Courier, monospace',
      editorial: '"Georgia", "Times New Roman", serif',
      classic: '"Times New Roman", Georgia, serif',
    };
    const spacingByMode = {
      compact: { lineHeight: 1.38, sectionTop: 13, sectionBottom: 5, itemGap: 8 },
      balanced: { lineHeight: base.lineHeight, sectionTop: 18, sectionBottom: 8, itemGap: 12 },
      airy: { lineHeight: 1.78, sectionTop: 23, sectionBottom: 10, itemGap: 16 },
    };
    const spacing = spacingByMode[builderDesign?.spacing || 'balanced'];

    return {
      ...base,
      ...spacing,
      font: fontByPair[builderDesign?.fontPair || 'editorial'],
      nameColor: accent,
      headingColor: accent,
      headingStyle: {
        ...base.headingStyle,
        borderBottom: base.headingStyle.borderBottom === 'none' ? 'none' : `1.5px solid ${accent}`,
        borderLeft: base.headingStyle.borderLeft === 'none' ? 'none' : `3px solid ${accent}`,
      },
    };
  }, [templateId, builderDesign]);
  const order = sectionOrder?.length ? sectionOrder : DEFAULT_SECTION_ORDER;

  // Rebuild flat block list whenever data or template changes
  const blocks = useMemo(
    () => buildBlocks(data, t, templateId, order, hiddenSections),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, templateId, sectionOrder, hiddenSections, t]
  );

  // One ref per block in the hidden measurement container
  const measureRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Page layout: array of pages, each page is an array of block indices
  const [pages, setPages] = useState<number[][]>([[0]]);

  // After every render, measure block heights from the hidden div and repaginate.
  // useLayoutEffect runs before browser paint, so the user never sees an intermediate state.
  useLayoutEffect(() => {
    const heights = blocks.map((_, i) => measureRefs.current[i]?.offsetHeight ?? 0);
    setPages(packBlocks(heights, USABLE_H));
  }, [blocks]);

  return (
    <>
      <style>{`
        @media print {
          .resume-page { break-inside: avoid; page-break-inside: avoid; box-shadow: none !important; border: none !important; }
          .resume-page + .resume-page { break-before: page; page-break-before: always; }
          .resume-page-fold { display: none !important; }
        }
      `}</style>

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* ── Hidden measurement container ──────────────────────────────────── */}
        {/* Renders all blocks at the exact content width so offsetHeight is accurate. */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            visibility: 'hidden',
            pointerEvents: 'none',
            top: 0,
            left: 0,
            width: CONTENT_W,
            fontFamily: t.font,
          }}
        >
          {blocks.map((block, i) => (
            // display:flow-root establishes a BFC so child margins (e.g. SectionHeading
            // marginTop:18) are trapped inside the wrapper, keeping offsetHeight accurate.
            // Unlike overflow:hidden it does NOT clip content, so the name h1's
            // ascenders are never cut off at the top edge of the first block.
            <div
              key={block.id}
              ref={(el) => { measureRefs.current[i] = el; }}
              style={{ display: 'flow-root' }}
            >
              {block.node}
            </div>
          ))}
        </div>

        {/* ── Visible A4 page boxes ─────────────────────────────────────────── */}
        {pages.map((blockIndices, pageIdx) => (
          <div
            key={pageIdx}
            style={{ position: 'relative', flexShrink: 0 }}
          >
          <div
            className="resume-page"
            style={{
              width: PAGE_W,
              height: PAGE_H,
              position: 'relative',
              backgroundColor: 'white',
              boxSizing: 'border-box',
              padding: `${PAD_T}px ${PAD_SIDE}px ${PAD_B}px`,
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 40px -4px rgba(0,0,0,0.10)',
              border: '1px solid rgba(0,0,0,0.06)',
              fontFamily: t.font,
              overflow: 'hidden',
            }}
          >
            {/* Page number label (only when multi-page) */}
            {pages.length > 1 && (
              <div style={{
                position: 'absolute',
                bottom: 10,
                right: PAD_SIDE,
                fontSize: 8,
                color: '#D1D5DB',
                letterSpacing: '0.04em',
                userSelect: 'none',
              }}>
                {pageIdx + 1} / {pages.length}
              </div>
            )}

            {/* Only the blocks assigned to this page — no duplication */}
            {blockIndices
              .filter((i) => i < blocks.length)
              .map((i) => (
                // display:flow-root matches the measurement BFC without clipping glyphs.
                <div key={blocks[i].id} style={{ display: 'flow-root' }}>
                  {blocks[i].node}
                </div>
              ))}
          </div>

          {/* ── Corner fold (first page only) ───────────────────────────────── */}
          {pageIdx === 0 && (
            <svg
              className="resume-page-fold"
              aria-hidden
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 32,
                height: 32,
                pointerEvents: 'none',
                zIndex: 2,
                display: 'block',
              }}
              viewBox="0 0 32 32"
              fill="none"
            >
              <defs>
                <linearGradient id="pcf-sh" x1="32" y1="0" x2="4" y2="28" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="rgba(0,0,0,0.22)" />
                  <stop offset="55%"  stopColor="rgba(0,0,0,0.07)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0)"    />
                </linearGradient>
              </defs>
              {/* Canvas-color triangle — the "cut corner" */}
              <polygon points="32,0 32,32 0,32" fill="#E8E8E8" />
              {/* Depth shadow cast by the folded flap */}
              <polygon points="32,0 32,32 0,32" fill="url(#pcf-sh)" />
            </svg>
          )}

          </div>
        ))}
      </div>
    </>
  );
});

export default ResumePreview;
