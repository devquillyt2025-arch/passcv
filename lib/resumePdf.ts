export interface ResumeInput {
  contact?: { name?: string; email?: string; phone?: string; location?: string; linkedin?: string };
  summary?: string;
  skills?: string[];
  experience?: Array<{ title?: string; company?: string; startDate?: string; endDate?: string; bullets?: string[] }>;
  education?: Array<{ degree?: string; field?: string; institution?: string; year?: string; cgpa?: string }>;
  certifications?: string[];
}

export async function generateResumePdfBlob(resume: ResumeInput): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const PW = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();
  const ML = 50, MR = 50, MT = 50, MB = 50;
  const CW = PW - ML - MR;
  const LH = 13.5;

  // Brand colors as RGB
  const BRAND: [number, number, number] = [30, 58, 138];   // #1E3A8A
  const DARK:  [number, number, number] = [26, 26, 26];
  const MID:   [number, number, number] = [85, 85, 85];
  const LIGHT: [number, number, number] = [136, 136, 136];

  let y = MT;

  const checkPage = (needed = LH * 2) => {
    if (y + needed > PH - MB) { doc.addPage(); y = MT; }
  };

  // ── Name ──────────────────────────────────────────────
  doc.setFontSize(21);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND);
  doc.text(resume.contact?.name || 'Resume', PW / 2, y, { align: 'center' });
  y += 25;

  // ── Contact line ──────────────────────────────────────
  const contactParts = [
    resume.contact?.email,
    resume.contact?.phone,
    resume.contact?.location,
    resume.contact?.linkedin,
  ].filter(Boolean) as string[];

  if (contactParts.length) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MID);
    const cLines = doc.splitTextToSize(contactParts.join('  |  '), CW);
    for (const cl of cLines) {
      doc.text(cl, PW / 2, y, { align: 'center' });
      y += 12;
    }
  }

  // ── Header rule ───────────────────────────────────────
  y += 6;
  doc.setDrawColor(...BRAND);
  doc.setLineWidth(0.75);
  doc.line(ML, y, ML + CW, y);
  y += 14;

  // ── Section header ────────────────────────────────────
  const sectionHeader = (title: string) => {
    checkPage(30);
    y += 3;
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND);
    doc.text(title.toUpperCase(), ML, y);
    y += 4;
    doc.setDrawColor(...BRAND);
    doc.setLineWidth(0.3);
    doc.line(ML, y, ML + CW, y);
    y += 10;
  };

  // ── Body text ─────────────────────────────────────────
  const bodyText = (text: string, indent = 0, color: [number, number, number] = DARK) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, CW - indent);
    for (const line of lines) {
      checkPage();
      doc.text(line, ML + indent, y);
      y += LH;
    }
  };

  // ── Bullet ────────────────────────────────────────────
  const addBullet = (text: string) => {
    const indent = 13;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    const lines = doc.splitTextToSize(text, CW - indent);
    checkPage();
    doc.text('•', ML + 2, y);
    doc.text(lines[0], ML + indent, y);
    y += LH;
    for (let i = 1; i < lines.length; i++) {
      checkPage();
      doc.text(lines[i], ML + indent, y);
      y += LH;
    }
  };

  // ── SUMMARY ───────────────────────────────────────────
  if (resume.summary) {
    sectionHeader('Summary');
    bodyText(resume.summary);
    y += 3;
  }

  // ── SKILLS ────────────────────────────────────────────
  if (resume.skills?.length) {
    sectionHeader('Skills');
    bodyText(resume.skills.join(' • '));
    y += 3;
  }

  // ── WORK EXPERIENCE ───────────────────────────────────
  if (resume.experience?.length) {
    sectionHeader('Work Experience');
    for (const job of resume.experience) {
      checkPage(30);
      const titleCompany = [job.title, job.company].filter(Boolean).join(' — ');
      const dateRange = [job.startDate, job.endDate].filter(Boolean).join(' – ');

      // Measure date width using the font it will be rendered with
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      const dateW = dateRange ? doc.getTextWidth(dateRange) + 4 : 0;

      // Job title (bold, truncated to leave room for date)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK);
      const titleLines = doc.splitTextToSize(titleCompany, CW - dateW - 6);
      doc.text(titleLines[0], ML, y);

      // Date right-aligned on same baseline
      if (dateRange) {
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...MID);
        doc.text(dateRange, ML + CW, y, { align: 'right' });
      }
      y += LH;

      // Overflow title lines
      if (titleLines.length > 1) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...DARK);
        for (let i = 1; i < titleLines.length; i++) {
          checkPage();
          doc.text(titleLines[i], ML, y);
          y += LH;
        }
      }

      for (const b of job.bullets || []) {
        addBullet(b);
      }

      y += 5;
    }
  }

  // ── EDUCATION ─────────────────────────────────────────
  if (resume.education?.length) {
    sectionHeader('Education');
    for (const edu of resume.education) {
      checkPage(24);
      const degreeField = [edu.degree, edu.field ? `in ${edu.field}` : '']
        .filter(Boolean).join(' ').trim();
      if (degreeField) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...DARK);
        const dLines = doc.splitTextToSize(degreeField, CW);
        for (const dl of dLines) {
          checkPage();
          doc.text(dl, ML, y);
          y += LH;
        }
      }
      const instParts = [
        edu.institution,
        edu.year ? `(${edu.year})` : '',
        edu.cgpa ? `• CGPA: ${edu.cgpa}` : '',
      ].filter(Boolean).join('  ');
      if (instParts) bodyText(instParts, 0, MID);
      y += 4;
    }
  }

  // ── CERTIFICATIONS ────────────────────────────────────
  if (resume.certifications?.length) {
    sectionHeader('Certifications');
    for (const cert of resume.certifications) {
      addBullet(cert);
    }
    y += 2;
  }

  // ── Declaration ───────────────────────────────────────
  checkPage(20);
  y += 8;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...LIGHT);
  const declLines = doc.splitTextToSize(
    'I hereby declare that all information provided above is true and correct to the best of my knowledge.',
    CW,
  );
  for (const dl of declLines) {
    doc.text(dl, ML, y);
    y += 11;
  }

  return doc.output('blob') as Blob;
}

import { ResumeData } from './types';

export async function generateBuilderPdfBlob(resume: ResumeData): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const PW = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();
  const ML = 50, MR = 50, MT = 50, MB = 50;
  const CW = PW - ML - MR;
  const LH = 13.5;

  const BRAND: [number, number, number] = [30, 58, 138];
  const DARK:  [number, number, number] = [26, 26, 26];
  const MID:   [number, number, number] = [85, 85, 85];
  const LIGHT: [number, number, number] = [136, 136, 136];

  let y = MT;

  const checkPage = (needed = LH * 2) => {
    if (y + needed > PH - MB) { doc.addPage(); y = MT; }
  };

  doc.setFontSize(21);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND);
  const fullName = [resume.contact.firstName, resume.contact.lastName].filter(Boolean).join(' ');
  doc.text(fullName || 'Resume', PW / 2, y, { align: 'center' });
  y += 20;

  if (resume.contact.jobTitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...MID);
    doc.text(resume.contact.jobTitle, PW / 2, y, { align: 'center' });
    y += 18;
  }

  const contactParts = [
    resume.contact.email,
    resume.contact.phone,
    [resume.contact.city, resume.contact.country].filter(Boolean).join(', '),
    resume.contact.linkedin,
    resume.contact.github || resume.contact.website,
  ].filter(Boolean);

  if (contactParts.length) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MID);
    const cLines = doc.splitTextToSize(contactParts.join('  |  '), CW);
    for (const cl of cLines) {
      doc.text(cl, PW / 2, y, { align: 'center' });
      y += 12;
    }
  }

  y += 6;
  doc.setDrawColor(...BRAND);
  doc.setLineWidth(0.75);
  doc.line(ML, y, ML + CW, y);
  y += 14;

  const sectionHeader = (title: string) => {
    checkPage(30);
    y += 3;
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND);
    doc.text(title.toUpperCase(), ML, y);
    y += 4;
    doc.setDrawColor(...BRAND);
    doc.setLineWidth(0.3);
    doc.line(ML, y, ML + CW, y);
    y += 10;
  };

  const bodyText = (text: string, indent = 0, color: [number, number, number] = DARK) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, CW - indent);
    for (const line of lines) {
      checkPage();
      doc.text(line, ML + indent, y);
      y += LH;
    }
  };

  const addBullet = (text: string) => {
    const indent = 13;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    const lines = doc.splitTextToSize(text, CW - indent);
    checkPage();
    doc.text('•', ML + 2, y);
    doc.text(lines[0], ML + indent, y);
    y += LH;
    for (let i = 1; i < lines.length; i++) {
      checkPage();
      doc.text(lines[i], ML + indent, y);
      y += LH;
    }
  };

  if (resume.summary) {
    sectionHeader('Summary');
    bodyText(resume.summary);
    y += 3;
  }

  if (resume.skills.length) {
    sectionHeader('Skills');
    bodyText(resume.skills.map(s => s.name).join(' • '));
    y += 3;
  }

  if (resume.experience.length) {
    sectionHeader('Work Experience');
    for (const job of resume.experience) {
      checkPage(30);
      const titleCompany = [job.position, job.company].filter(Boolean).join(' — ');
      const dateRange = [job.startDate, job.currentlyWorking ? 'Present' : job.endDate].filter(Boolean).join(' – ');

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      const dateW = dateRange ? doc.getTextWidth(dateRange) + 4 : 0;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK);
      const titleLines = doc.splitTextToSize(titleCompany, CW - dateW - 6);
      doc.text(titleLines[0], ML, y);

      if (dateRange) {
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...MID);
        doc.text(dateRange, ML + CW, y, { align: 'right' });
      }
      y += LH;

      if (titleLines.length > 1) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...DARK);
        for (let i = 1; i < titleLines.length; i++) {
          checkPage();
          doc.text(titleLines[i], ML, y);
          y += LH;
        }
      }

      const bullets = job.description.split('\n').map(b => b.trim()).filter(Boolean).map(b => b.replace(/^[-•]\s*/, ''));
      for (const b of bullets) {
        addBullet(b);
      }

      y += 5;
    }
  }

  if (resume.education.length) {
    sectionHeader('Education');
    for (const edu of resume.education) {
      checkPage(24);
      const degreeField = [edu.degree, edu.field ? `in ${edu.field}` : ''].filter(Boolean).join(' ').trim();
      if (degreeField) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...DARK);
        const dLines = doc.splitTextToSize(degreeField, CW);
        for (const dl of dLines) {
          checkPage();
          doc.text(dl, ML, y);
          y += LH;
        }
      }
      
      const dateRange = [edu.startDate, edu.currentlyStudying ? 'Present' : edu.endDate].filter(Boolean).join(' – ');
      const instParts = [
        edu.institution,
        edu.location,
        dateRange ? `(${dateRange})` : '',
        edu.score ? `• ${edu.score}` : '',
      ].filter(Boolean).join('  ');
      if (instParts) bodyText(instParts, 0, MID);
      y += 4;
    }
  }

  if (resume.projects.length) {
    sectionHeader('Projects');
    for (const proj of resume.projects) {
      checkPage(30);
      const titleCompany = [proj.name, proj.url].filter(Boolean).join(' — ');
      const dateRange = [proj.startDate, proj.endDate].filter(Boolean).join(' – ');

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      const dateW = dateRange ? doc.getTextWidth(dateRange) + 4 : 0;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK);
      const titleLines = doc.splitTextToSize(titleCompany, CW - dateW - 6);
      doc.text(titleLines[0], ML, y);

      if (dateRange) {
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...MID);
        doc.text(dateRange, ML + CW, y, { align: 'right' });
      }
      y += LH;

      if (titleLines.length > 1) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...DARK);
        for (let i = 1; i < titleLines.length; i++) {
          checkPage();
          doc.text(titleLines[i], ML, y);
          y += LH;
        }
      }

      const bullets = proj.description.split('\n').map(b => b.trim()).filter(Boolean).map(b => b.replace(/^[-•]\s*/, ''));
      for (const b of bullets) {
        addBullet(b);
      }

      y += 5;
    }
  }

  checkPage(20);
  y += 8;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...LIGHT);
  const declLines = doc.splitTextToSize(
    'I hereby declare that all information provided above is true and correct to the best of my knowledge.',
    CW,
  );
  for (const dl of declLines) {
    doc.text(dl, ML, y);
    y += 11;
  }

  return doc.output('blob') as Blob;
}
