import type { ResumeRenderInput } from './types';

/**
 * The single client-side entry point for turning a render tuple into a PDF.
 *
 * Both the download button and the PDF preview modal call this, so the modal's
 * promise ("Exactly how your resume will look when downloaded") is structurally
 * true rather than merely intended.
 *
 * Every template goes through headless-Chromium print — there is no per-template
 * branch and there must not be one again. The branch that used to live here (a
 * set containing only 'classic') was the last place the two render paths could
 * disagree by template id.
 */
export async function generateResumePdf(input: ResumeRenderInput): Promise<Blob> {
  const res = await fetch('/api/export/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: 'Export failed' }));
    throw new Error(error || 'Export failed');
  }
  return res.blob();
}
