import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { ResumeData } from './types';
import ClassicTemplate from '@/components/templates/ClassicTemplate';
import ModernTemplate from '@/components/templates/ModernTemplate';

export async function generateBuilderPdfBlob(data: ResumeData, templateId: 'classic' | 'modern' = 'classic'): Promise<Blob> {
  const TemplateComponent = templateId === 'modern' ? ModernTemplate : ClassicTemplate;
  const doc = React.createElement(TemplateComponent, { data });
  const asPdf = pdf(doc as any);
  const blob = await asPdf.toBlob();
  return blob;
}
