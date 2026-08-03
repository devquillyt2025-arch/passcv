import type { ResumeData, TemplateId } from '@/lib/types';

/**
 * The design knobs that affect the *document*. Deliberately excludes `zoom`
 * from the store's `builderDesign`: zoom is a viewport affordance for the
 * on-screen preview and must never reach the printed page.
 */
export interface ResumeRenderDesign {
  accentColor: string;
  fontPair: 'modern' | 'arial' | 'helvetica' | 'verdana' | 'times' | 'calibri' | 'courier' | 'editorial' | 'classic';
  spacing: 'compact' | 'balanced' | 'airy';
}

/**
 * The complete tuple required to render a resume — the single input contract
 * shared by the on-screen preview and the PDF export.
 *
 * Every field is required on purpose. The preview/export divergence this
 * pipeline replaces was caused by call sites quietly passing a subset
 * (components/builder/ResumePreview.tsx dropped `sectionOrder` and
 * `builderDesign`; the PDF path never received `hiddenSections` at all).
 * With no optional fields, an incomplete call site is a compile error rather
 * than a silent visual difference.
 */
export interface ResumeRenderInput {
  data: ResumeData;
  templateId: TemplateId;
  sectionOrder: string[];
  hiddenSections: string[];
  builderDesign: ResumeRenderDesign;
}
