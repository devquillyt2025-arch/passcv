'use client';

import { memo } from 'react';
import type { ResumeRenderInput } from '@/lib/resume-render/types';
import ResumeDoc from '@/components/resume-templates';
import { usePaginatedSheet } from './usePaginatedSheet';

/**
 * The on-screen resume sheet — builder live preview and gallery thumbnails.
 *
 * Takes the whole render tuple and forwards it untouched. It used to accept
 * five loose props and quietly forward only three, which is how the accent
 * colour and section order came to apply to the PDF but not to the preview.
 * There is nothing left to drop: one object in, the same object out.
 */
interface ResumePreviewProps {
  input: ResumeRenderInput;
  /** Show page-boundary hairlines. On for the builder pane, off for thumbnails. */
  pageGuides?: boolean;
  /**
   * Reflow blocks across page boundaries the way the PDF does. On for the
   * builder pane; pointless for thumbnails, which only ever show page one.
   */
  paginate?: boolean;
}

const ResumePreview = memo(function ResumePreview({
  input,
  pageGuides = false,
  paginate = false,
}: ResumePreviewProps) {
  const ref = usePaginatedSheet<HTMLDivElement>([paginate ? input : null]);

  return (
    <div
      ref={paginate ? ref : undefined}
      style={{
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 40px -4px rgba(0,0,0,0.10)',
        border: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <ResumeDoc input={input} pageGuides={pageGuides} />
    </div>
  );
});

export default ResumePreview;
