'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Eye, X } from 'lucide-react';
import { useResumeStore } from '@/lib/store/useResumeStore';
import { DEMO_RESUME_DATA } from '@/lib/store/slices/defaultData';
import { DEFAULT_SECTION_ORDER } from '@/lib/store/slices/globalSlice';
import ResumePreview from '@/components/builder/ResumePreview';
import { TEMPLATE_META } from '@/lib/templates';
import type { TemplateId, ResumeData } from '@/lib/types';
import type { StoreState } from '@/lib/store/slices/types';

// The live preview renders an A4 sheet at 794px wide. We scale it to fit cards.
const PAGE_W = 794;
const THUMB_W = 260;
const THUMB_H = 367; // A4 ratio (794 : 1123)
const THUMB_SCALE = THUMB_W / PAGE_W;

function hasRealContent(data: ResumeData): boolean {
  return Boolean(
    data.contact?.firstName ||
    data.contact?.lastName ||
    (data.experience && data.experience.length > 0) ||
    (data.skills && data.skills.length > 0) ||
    data.summary
  );
}

interface PreviewProps {
  templateId: TemplateId;
  data: ResumeData;
  sectionOrder: string[];
  hiddenSections: string[];
  builderDesign: StoreState['builderDesign'];
}

/** A non-interactive, scaled-down live preview used as a gallery thumbnail. */
function Thumbnail({ templateId, data, sectionOrder, hiddenSections, builderDesign }: PreviewProps) {
  return (
    <div
      style={{ width: THUMB_W, height: THUMB_H, overflow: 'hidden', position: 'relative' }}
      className="pointer-events-none bg-white"
    >
      <div style={{ transform: `scale(${THUMB_SCALE})`, transformOrigin: 'top left', width: PAGE_W }}>
        <ResumePreview
          data={data}
          templateId={templateId}
          sectionOrder={sectionOrder}
          hiddenSections={hiddenSections}
          builderDesign={builderDesign}
        />
      </div>
      {/* Soft fade at the bottom so the clipped page edge looks intentional */}
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}

export default function TemplateGallery() {
  const router = useRouter();
  const {
    data, templateId, sectionOrder, hiddenSections, builderDesign, _hasHydrated, setTemplateId,
  } = useResumeStore();

  const [previewId, setPreviewId] = useState<TemplateId | null>(null);

  if (!_hasHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#0a0a0f]">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // Use the user's own resume so they see how their content looks; fall back to demo data.
  const previewData = hasRealContent(data) ? data : DEMO_RESUME_DATA;
  const order = sectionOrder?.length ? sectionOrder : DEFAULT_SECTION_ORDER;
  const usingDemo = previewData === DEMO_RESUME_DATA;

  const choose = (id: TemplateId) => {
    setTemplateId(id);
    router.push('/builder');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f]">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-200 dark:border-gray-800 bg-white/90 dark:bg-[#0a0a0f]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/builder')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-gray-700 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to builder
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Choose a template</h1>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                {usingDemo
                  ? 'Previewed with sample data — your content will fill in automatically.'
                  : 'Previewed with your resume content.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATE_META.map((tpl) => {
            const isCurrent = tpl.id === templateId;
            return (
              <div
                key={tpl.id}
                className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white dark:bg-gray-900 shadow-sm transition-all hover:shadow-lg ${
                  isCurrent ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-slate-200 dark:border-gray-800'
                }`}
              >
                {/* Thumbnail (click to open full preview) */}
                <button
                  type="button"
                  onClick={() => setPreviewId(tpl.id)}
                  className="relative flex justify-center bg-slate-100 dark:bg-gray-950 p-4"
                  aria-label={`Preview ${tpl.label} template`}
                >
                  <div className="rounded-md shadow-md ring-1 ring-black/5">
                    <Thumbnail
                      templateId={tpl.id}
                      data={previewData}
                      sectionOrder={order}
                      hiddenSections={hiddenSections}
                      builderDesign={builderDesign}
                    />
                  </div>
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                    <span className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow">
                      <Eye className="h-4 w-4" /> Preview
                    </span>
                  </span>
                  {isCurrent && (
                    <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      <Check className="h-3 w-3" /> Current
                    </span>
                  )}
                </button>

                {/* Meta + actions */}
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{tpl.label}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        tpl.ats
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                      }`}
                    >
                      {tpl.ats ? 'ATS-friendly' : 'Stylized'}
                    </span>
                  </div>
                  <p className="flex-1 text-xs leading-relaxed text-slate-500 dark:text-gray-400">{tpl.blurb}</p>
                  <button
                    type="button"
                    onClick={() => choose(tpl.id)}
                    className={`mt-1 w-full rounded-lg py-2 text-sm font-semibold transition-colors ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-200 hover:bg-slate-200 dark:hover:bg-gray-700'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isCurrent ? 'Keep using' : 'Use this template'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full-screen preview modal */}
      {previewId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setPreviewId(null); }}
        >
          <div className="flex h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  {TEMPLATE_META.find((t) => t.id === previewId)?.label}
                </h2>
                {(() => {
                  const m = TEMPLATE_META.find((t) => t.id === previewId);
                  return m ? (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      m.ats ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {m.ats ? 'ATS-friendly' : 'Stylized'}
                    </span>
                  ) : null;
                })()}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => choose(previewId)}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  Use this template
                </button>
                <button
                  onClick={() => setPreviewId(null)}
                  className="rounded-lg border border-slate-200 dark:border-gray-700 p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-slate-200 dark:bg-gray-950 p-6">
              <div className="mx-auto w-fit">
                <ResumePreview
                  data={previewData}
                  templateId={previewId}
                  sectionOrder={order}
                  hiddenSections={hiddenSections}
                  builderDesign={builderDesign}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
