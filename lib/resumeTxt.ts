import { ResumeData } from './types';

/**
 * TEXT POLICY (decided once, applied to every surviving output path):
 * user text is emitted exactly as authored. Nothing is normalised.
 *
 * This file used to fold smart quotes, em/en dashes, ellipses and non-breaking
 * spaces down to ASCII, matching the same fold in the react-pdf templates. That
 * existed for one reason: react-pdf's built-in Helvetica/Times/Courier carry no
 * glyphs for those characters, so leaving them intact produced blanks. The
 * headless-print pipeline embeds real fonts with full Latin punctuation, and a
 * round-trip test confirms all eight survive render -> embed -> extract:
 *
 *   'single' "double" em — en – ellipsis … bullet •
 *
 * So the constraint is gone, and with it the reason to rewrite what someone
 * typed. Keeping the fold here would also mean the .txt export and the PDF
 * disagreed about the user's own words — a smaller instance of exactly the
 * preview/export divergence this rewrite removed.
 *
 * The one place a fold survives is components/templates/ClassicTemplate.tsx,
 * still used by the tailor/rewrite flow, where the built-in-font limitation is
 * real. It retires with that tree.
 */
function bulletsOf(text: string): string[] {
  return (text || '')
    .split('\n')
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => b.replace(/^[-•]\s*/, ''));
}

const ALL_SECTION_KEYS = [
  'summary',
  'skills',
  'experience',
  'education',
  'certifications',
  'languages',
  'projects',
  'awards',
  'volunteer',
  'courses',
  'publications',
];

export function generateResumeTxtBlob(data: ResumeData, sectionOrder?: string[]): Blob {
  const lines: string[] = [];
  const { contact } = data;

  // Header
  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
  if (fullName) lines.push(fullName.toUpperCase());
  if (contact.jobTitle) lines.push(contact.jobTitle);

  const contactLines = [
    contact.email,
    contact.phone,
    [contact.city, contact.country].filter(Boolean).join(', '),
    contact.linkedin,
    contact.github || contact.website,
  ].filter(Boolean);
  if (contactLines.length > 0) {
    lines.push(contactLines.join(' | '));
  }
  lines.push('');

  const defaultKeys = [...ALL_SECTION_KEYS, ...(data.customSections?.map(c => c.id) || [])];
  const order = (sectionOrder || defaultKeys).filter(
    (id) => ALL_SECTION_KEYS.includes(id) || id.startsWith('custom-')
  );

  order.forEach((sectionId) => {
    if (sectionId === 'summary' && data.summary) {
      lines.push('SUMMARY');
      lines.push(data.summary);
      lines.push('');
    }

    if (sectionId === 'skills' && data.skills && data.skills.length > 0) {
      lines.push('SKILLS');
      lines.push(data.skills.map((s) => s.name).join(', '));
      lines.push('');
    }

    if (sectionId === 'experience' && data.experience && data.experience.length > 0) {
      lines.push('EXPERIENCE');
      data.experience.forEach((exp) => {
        lines.push(exp.position || '');
        const companyStr = [exp.company, exp.location].filter(Boolean).join(' - ');
        if (companyStr) lines.push(companyStr);
        const dateStr = [exp.startDate, exp.currentlyWorking ? 'Present' : exp.endDate].filter(Boolean).join(' to ');
        if (dateStr) lines.push(dateStr);
        bulletsOf(exp.description).forEach((b) => lines.push(`- ${b}`));
        lines.push('');
      });
    }

    if (sectionId === 'education' && data.education && data.education.length > 0) {
      lines.push('EDUCATION');
      data.education.forEach((edu) => {
        const deg = [edu.degree, edu.field ? `in ${edu.field}` : ''].filter(Boolean).join(' ');
        if (deg) lines.push(deg);
        const instStr = [edu.institution, edu.location].filter(Boolean).join(' - ');
        if (instStr) lines.push(instStr);
        const dateStr = [edu.startDate, edu.currentlyStudying ? 'Present' : edu.endDate].filter(Boolean).join(' to ');
        if (dateStr) lines.push(dateStr);
        if (edu.score) lines.push(`GPA / Score: ${edu.score}`);
        lines.push('');
      });
    }

    if (sectionId === 'projects' && data.projects && data.projects.length > 0) {
      lines.push('PROJECTS');
      data.projects.forEach((proj) => {
        lines.push(proj.name || '');
        const dateStr = [proj.startDate, proj.endDate].filter(Boolean).join(' to ');
        if (dateStr) lines.push(dateStr);
        if (proj.url) lines.push(proj.url);
        if (proj.description) {
          bulletsOf(proj.description).forEach((b) => lines.push(`- ${b}`));
        }
        lines.push('');
      });
    }

    if (sectionId === 'certifications' && data.certifications && data.certifications.length > 0) {
      lines.push('CERTIFICATIONS');
      data.certifications.forEach((cert) => {
        lines.push(cert.name || '');
        if (cert.issuer) lines.push(cert.issuer);
        const dateStr = [cert.issueDate, cert.doesNotExpire ? 'No Expiry' : cert.expiryDate].filter(Boolean).join(' to ');
        if (dateStr) lines.push(dateStr);
        if (cert.credentialId) lines.push(`ID: ${cert.credentialId}`);
        if (cert.credentialUrl) lines.push(cert.credentialUrl);
        lines.push('');
      });
    }

    if (sectionId === 'languages' && data.languages && data.languages.length > 0) {
      lines.push('LANGUAGES');
      data.languages.forEach((lang) => {
        lines.push(`${lang.name || ''} - ${lang.proficiency}`);
      });
      lines.push('');
    }

    if (sectionId === 'awards' && data.awards && data.awards.length > 0) {
      lines.push('AWARDS');
      data.awards.forEach((award) => {
        lines.push(award.name || '');
        if (award.issuer) lines.push(award.issuer);
        if (award.date) lines.push(award.date);
        if (award.description) lines.push(award.description);
        lines.push('');
      });
    }

    if (sectionId === 'volunteer' && data.volunteer && data.volunteer.length > 0) {
      lines.push('VOLUNTEER');
      data.volunteer.forEach((vol) => {
        lines.push(vol.role || '');
        if (vol.organization) lines.push(vol.organization);
        const dateStr = [vol.startDate, vol.currentlyVolunteering ? 'Present' : vol.endDate].filter(Boolean).join(' to ');
        if (dateStr) lines.push(dateStr);
        bulletsOf(vol.description).forEach((b) => lines.push(`- ${b}`));
        lines.push('');
      });
    }

    if (sectionId === 'courses' && data.courses && data.courses.length > 0) {
      lines.push('COURSES');
      data.courses.forEach((course) => {
        lines.push(course.name || '');
        if (course.platform) lines.push(course.platform);
        if (course.completionDate) lines.push(course.completionDate);
        if (course.certificateUrl) lines.push(course.certificateUrl);
        lines.push('');
      });
    }

    if (sectionId === 'publications' && data.publications && data.publications.length > 0) {
      lines.push('PUBLICATIONS');
      data.publications.forEach((pub) => {
        lines.push(pub.title || '');
        if (pub.publisher) lines.push(pub.publisher);
        if (pub.date) lines.push(pub.date);
        if (pub.coAuthors) lines.push(`Co-authors: ${pub.coAuthors}`);
        if (pub.url) lines.push(pub.url);
        lines.push('');
      });
    }

    if (sectionId.startsWith('custom-')) {
      const customSection = data.customSections?.find((s) => s.id === sectionId);
      if (customSection && customSection.items && customSection.items.length > 0) {
        lines.push(customSection.title || 'OTHER'.toUpperCase());
        customSection.items.forEach((item) => {
          lines.push(item.name || '');
          if (item.description) lines.push(item.description);
          lines.push('');
        });
      }
    }
  });

  return new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
}
