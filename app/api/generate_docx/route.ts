import { NextRequest, NextResponse } from 'next/server';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
} from 'docx';
import type { ResumeInput } from '@/lib/resumePdf';

function safeFilename(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
}

function buildDocx(resume: ResumeInput) {
  const name = resume?.contact?.name || 'Resume';
  const contact = [
    resume?.contact?.email,
    resume?.contact?.phone,
    resume?.contact?.location,
    resume?.contact?.linkedin,
  ]
    .filter(Boolean)
    .join(' | ');

  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      text: name,
      alignment: AlignmentType.CENTER,
      heading: undefined,
      spacing: { after: 120 },
      children: [
        new TextRun({ text: name, bold: true, size: 36 }),
      ],
    }),
  );

  if (contact) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
        children: [new TextRun({ text: contact, size: 20 })],
      }),
    );
  }

  const addHeading = (text: string) => {
    children.push(
      new Paragraph({
        spacing: { before: 120, after: 80 },
        border: {
          bottom: { color: '1E3A8A', space: 1, style: BorderStyle.SINGLE, size: 4 },
        },
        children: [
          new TextRun({ text: text.toUpperCase(), bold: true, color: '1E3A8A', size: 22 }),
        ],
      }),
    );
  };

  const addText = (text: string, bold = false) => {
    children.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text, bold, size: 22 })],
      }),
    );
  };

  const addBullet = (text: string) => {
    children.push(
      new Paragraph({
        bullet: { level: 0 },
        spacing: { after: 40 },
        children: [new TextRun({ text, size: 20 })],
      }),
    );
  };

  if (resume?.summary) {
    addHeading('Summary');
    addText(resume.summary);
  }

  if (resume?.skills?.length) {
    addHeading('Skills');
    addText(resume.skills.join(', '));
  }

  if (resume?.experience?.length) {
    addHeading('Work Experience');
    for (const job of resume.experience) {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [
            new TextRun({ text: `${job.title || ''} — ${job.company || ''}`, bold: true, size: 22 }),
            new TextRun({ text: ` (${job.startDate || ''} – ${job.endDate || ''})`, size: 20, color: '555555' }),
          ],
        }),
      );

      for (const bullet of job.bullets || []) {
        addBullet(bullet);
      }
    }
  }

  if (resume?.education?.length) {
    addHeading('Education');
    for (const edu of resume.education) {
      addText(`${edu.degree || ''}${edu.field ? ` in ${edu.field}` : ''}`.trim());
      addText(`${edu.institution || ''} (${edu.year || ''})${edu.cgpa ? ` — CGPA/Marks: ${edu.cgpa}` : ''}`);
    }
  }

  if (resume?.certifications?.length) {
    addHeading('Certifications');
    for (const cert of resume.certifications) {
      addBullet(cert);
    }
  }

  children.push(
    new Paragraph({
      spacing: { before: 160 },
      children: [
        new TextRun({
          text: 'I hereby declare that all information provided above is true and correct to the best of my knowledge.',
          size: 18,
          color: '777777',
        }),
      ],
    }),
  );

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        children,
      },
    ],
  });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const resume = data.resume;
    const jobTitle = data.jobTitle || 'Resume';
    console.log('DOCX route received request', { jobTitle, name: resume?.contact?.name });

    const doc = buildDocx(resume as ResumeInput);
    const buffer = await Packer.toBuffer(doc);
    const filename = `${safeFilename((resume as ResumeInput)?.contact?.name || 'Resume')}_${safeFilename(jobTitle)}_TailorCV.docx`;

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('DOCX route error', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
