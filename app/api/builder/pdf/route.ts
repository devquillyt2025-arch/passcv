import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import ClassicTemplate from '@/components/templates/ClassicTemplate';
import ModernTemplate from '@/components/templates/ModernTemplate';
import MinimalTemplate from '@/components/templates/MinimalTemplate';
import ExecutiveTemplate from '@/components/templates/ExecutiveTemplate';
import SidebarTemplate from '@/components/templates/SidebarTemplate';

const TEMPLATE_MAP = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  executive: ExecutiveTemplate,
  sidebar: SidebarTemplate,
} as const;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { data, templateId, sectionOrder, builderDesign } = body;

    if (!data) {
      return new Response(JSON.stringify({ error: 'Missing resume data' }), { status: 400 });
    }

    const TemplateComponent = TEMPLATE_MAP[templateId as keyof typeof TEMPLATE_MAP] ?? ClassicTemplate;
    const accentColor = builderDesign?.accentColor;
    const doc = React.createElement(TemplateComponent, { data, sectionOrder, accentColor }) as unknown as React.ReactElement<DocumentProps>;
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
