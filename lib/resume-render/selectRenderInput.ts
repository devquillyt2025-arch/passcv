import { DEFAULT_SECTION_ORDER } from '@/lib/store/slices/globalSlice';
import type { ResumeData, TemplateId } from '@/lib/types';
import type { ResumeRenderInput, ResumeRenderDesign } from './types';

/**
 * Resolve the section order to a guaranteed non-empty list.
 *
 * DEFAULT_SECTION_ORDER (lib/store/slices/globalSlice.ts) is the single
 * canonical default. Templates used to each carry their own `defaultOrder`
 * literal, and they disagreed — with each other and with the store — so the
 * order you got depended on which call site forgot to pass one. Those copies
 * are gone; resolution happens here, once.
 *
 * The `.length` check matters: the old `sectionOrder || defaultOrder` treated
 * `[]` as truthy, so an empty order rendered a blank resume instead of falling
 * back.
 */
export function resolveSectionOrder(sectionOrder: string[] | undefined, data: ResumeData): string[] {
  if (sectionOrder?.length) return sectionOrder;
  const customIds = (data.customSections || []).map((c) => c.id);
  return [...DEFAULT_SECTION_ORDER, ...customIds];
}

interface RenderInputSource {
  data: ResumeData;
  templateId: TemplateId;
  sectionOrder?: string[];
  hiddenSections?: string[];
  builderDesign: ResumeRenderDesign & { zoom?: number };
}

/**
 * Assemble the complete render tuple. This is the ONLY supported way to build a
 * ResumeRenderInput, and ResumeRenderInput is the only thing either render path
 * — on-screen preview or PDF export — accepts.
 *
 * Before this existed, each call site hand-assembled its own subset and the two
 * paths silently disagreed: the preview dropped `sectionOrder`/`builderDesign`,
 * and the export never received `hiddenSections` at all.
 *
 * `zoom` is accepted from the store's builderDesign and deliberately discarded
 * — it scales the preview viewport and must never reach the document.
 */
export function selectRenderInput(src: RenderInputSource): ResumeRenderInput {
  return {
    data: src.data,
    templateId: src.templateId,
    sectionOrder: resolveSectionOrder(src.sectionOrder, src.data),
    hiddenSections: src.hiddenSections ?? [],
    builderDesign: {
      accentColor: src.builderDesign.accentColor,
      fontPair: src.builderDesign.fontPair,
      spacing: src.builderDesign.spacing,
    },
  };
}
