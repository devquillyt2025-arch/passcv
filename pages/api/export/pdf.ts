import type { NextApiRequest, NextApiResponse } from 'next';
import { printResumePdf, formatTimings, serverTimingHeader } from '@/lib/resume-render/printPdf';
import type { ResumeRenderInput } from '@/lib/resume-render/types';
import type { TemplateId } from '@/lib/types';

/**
 * Resume PDF export.
 *
 * Deliberately a Pages Router API route, not an App Router handler: rendering
 * the template tree to HTML needs `react-dom/server`, which throws under the
 * App Router's "react-server" export condition. See lib/resume-render/document.tsx.
 * Everything below the HTTP boundary is router-agnostic.
 */
export const config = {
  api: { bodyParser: { sizeLimit: '4mb' } },
  maxDuration: 60,
};

/** Reject payloads missing any part of the render tuple. */
function validate(body: unknown): ResumeRenderInput | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Partial<ResumeRenderInput>;
  if (!b.data || !b.templateId || !b.builderDesign) return null;
  if (!Array.isArray(b.sectionOrder) || !Array.isArray(b.hiddenSections)) return null;
  return b as ResumeRenderInput;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Dev-only harness, folded into this route rather than living in its own
  // file. As a separate route it became a second serverless function carrying
  // its own copy of Chromium — 390 MB against Vercel's 250 MB limit — for
  // something that 404s in production anyway.
  if (req.method === 'GET') {
    if (process.env.NODE_ENV === 'production') return res.status(404).send('Not found');
    return debugHandler(req, res);
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const input = validate(req.body);
  if (!input) {
    return res.status(400).json({
      error: 'Incomplete render input: data, templateId, sectionOrder, hiddenSections and builderDesign are all required.',
    });
  }

  try {
    const { pdf, timings } = await printResumePdf(input);
    // One structured line per export. On the first real deploy this is what
    // says whether the cost is inflating Chromium into /tmp (`executable`) or
    // launching and printing (`launch`/`pdf`) — a combined number could not.
    console.log(formatTimings(timings, input.templateId));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    res.setHeader('Content-Length', String(pdf.byteLength));
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Server-Timing', serverTimingHeader(timings));
    return res.status(200).send(pdf);
  } catch (err) {
    console.error('PDF export failed:', err);
    return res.status(500).json({ error: 'Failed to generate PDF' });
  }
}

/**
 * Dev-only. GET returns either the exact HTML that gets printed, or the PDF of
 * the same fixture /tplpreview renders. Paired with that page it is the parity
 * harness: /tplpreview is the preview cascade, this is the print cascade, and
 * scripts/parity-check.mjs diffs the two geometrically.
 *
 *   GET /api/export/pdf?t=classic          -> HTML
 *   GET /api/export/pdf?t=classic&pdf=1    -> PDF
 */
async function debugHandler(req: NextApiRequest, res: NextApiResponse) {
  const { buildResumeHtml } = await import('@/lib/resume-render/document');
  const { selectRenderInput } = await import('@/lib/resume-render/selectRenderInput');
  const { PREVIEW_RESUME } = await import('@/lib/previewFixture');

  const templateId = ((req.query.t as string) || 'classic') as TemplateId;
  const accentColor = (req.query.accent as string) || '#0D9488';
  const input = selectRenderInput({
    data: PREVIEW_RESUME,
    templateId,
    sectionOrder: undefined,
    hiddenSections: [],
    builderDesign: { accentColor, fontPair: 'modern', spacing: 'balanced' },
  });

  try {
    if (req.query.pdf) {
      const { pdf, timings } = await printResumePdf(input);
      console.log(formatTimings(timings, templateId));
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Server-Timing', serverTimingHeader(timings));
      return res.status(200).send(pdf);
    }

    const html = buildResumeHtml(input);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(html);
  } catch (err) {
    // Plain text so the parity harness reports a usable reason rather than an
    // opaque 500 page.
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(500).send(err instanceof Error ? `${err.message}\n\n${err.stack}` : String(err));
  }
}
