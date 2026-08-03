import { buildResumeHtml, PAGE_W_PX, PAGE_H_PX } from './document';
import { launchBrowser, type LaunchTimings } from './browser';
import type { ResumeRenderInput } from './types';

export interface PrintTimings extends LaunchTimings {
  /** React -> HTML string. */
  htmlMs: number;
  /** setContent + waiting on document.fonts.ready. */
  contentMs: number;
  /** page.pdf() — the actual print/fragmentation pass. */
  pdfMs: number;
  /** Tearing the browser down. */
  closeMs: number;
  totalMs: number;
  bytes: number;
}

export interface PrintResult {
  pdf: Buffer;
  timings: PrintTimings;
}

/** Emitted as one line per export so a deploy's logs show where the time went. */
export function formatTimings(t: PrintTimings, templateId: string): string {
  return [
    `pdf-export template=${templateId}`,
    t.reusedInstance ? 'warm' : 'COLD',
    `executable=${t.executableMs}ms`,
    `launch=${t.launchMs}ms`,
    `html=${t.htmlMs}ms`,
    `content=${t.contentMs}ms`,
    `pdf=${t.pdfMs}ms`,
    `close=${t.closeMs}ms`,
    `total=${t.totalMs}ms`,
    `bytes=${t.bytes}`,
  ].join(' ');
}

/** Server-Timing header value, so the spans are readable in browser devtools. */
export function serverTimingHeader(t: PrintTimings): string {
  return [
    `executable;dur=${t.executableMs}`,
    `launch;dur=${t.launchMs}`,
    `html;dur=${t.htmlMs}`,
    `content;dur=${t.contentMs}`,
    `pdf;dur=${t.pdfMs}`,
    `total;dur=${t.totalMs}`,
    `cold;desc="${t.reusedInstance ? 'warm' : 'cold'}"`,
  ].join(', ');
}

/**
 * Render a resume to PDF by printing the *preview's own component tree* with
 * headless Chromium. This is the only PDF generator in the app.
 */
export async function printResumePdf(input: ResumeRenderInput): Promise<PrintResult> {
  const tStart = Date.now();

  const tHtml = Date.now();
  const html = buildResumeHtml(input);
  const htmlMs = Date.now() - tHtml;

  const { browser, timings: launch } = await launchBrowser();

  try {
    const tContent = Date.now();
    const page = await browser.newPage();

    // `domcontentloaded` is enough: the markup is fully self-contained
    // (inline styles only, no external CSS, no scripts, no network images).
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    // Guarantee webfonts are decoded and swapped in before the snapshot,
    // otherwise Chromium can print fallback glyphs.
    await page.evaluate(() => document.fonts.ready);
    const contentMs = Date.now() - tContent;

    const tPdf = Date.now();
    const pdf = Buffer.from(
      await page.pdf({
        width: `${PAGE_W_PX}px`,
        height: `${PAGE_H_PX}px`,
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      }),
    );
    const pdfMs = Date.now() - tPdf;

    const tClose = Date.now();
    await browser.close();
    const closeMs = Date.now() - tClose;

    return {
      pdf,
      timings: {
        ...launch,
        htmlMs,
        contentMs,
        pdfMs,
        closeMs,
        totalMs: Date.now() - tStart,
        bytes: pdf.byteLength,
      },
    };
  } catch (err) {
    await browser.close().catch(() => {});
    throw err;
  }
}
