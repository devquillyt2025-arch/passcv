import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import ClassicTemplate from '@/components/templates/ClassicTemplate';
import ModernTemplate from '@/components/templates/ModernTemplate';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { data, templateId, sectionOrder } = body;
    
    if (!data) {
      return new Response(JSON.stringify({ error: 'Missing resume data' }), { status: 400 });
    }

    const TemplateComponent = templateId === 'modern' ? ModernTemplate : ClassicTemplate;
    const doc = React.createElement(TemplateComponent, { data, sectionOrder }) as unknown as React.ReactElement<DocumentProps>;
    const stream = await renderToStream(doc);
    
    return new Response(stream as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate PDF' }), { status: 500 });
  }
}
