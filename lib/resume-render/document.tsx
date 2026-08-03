import React from 'react';
// NOTE: this module must only be imported from a Pages Router API route
// (pages/api/export/*). Next's App Router applies the "react-server" export
// condition, under which react-dom/server throws
// ("Cannot set properties of undefined (setting 'current')" in
// prepareHostDispatcher) — RSC ships a react-dom build without the client
// internals renderToStaticMarkup needs. Pages API routes run in a plain Node
// context where it works normally.
import { renderToStaticMarkup } from 'react-dom/server';
import ResumeDoc from '@/components/resume-templates';
import { SHEET_W, SHEET_H } from '@/components/resume-templates/shared';
import { PAGE_RULE_CSS } from '@/components/resume-templates/sheetStyles';
import { fontsFor } from '@/components/resume-templates/fonts';
import { embeddedFontCss } from './fontEmbed';
import type { ResumeRenderInput } from './types';

/**
 * Page geometry. The on-screen preview sheet is SHEET_W x SHEET_H CSS px
 * (794 x 1123 @96dpi). Chromium rasterises print CSS at exactly 96 CSS px per
 * inch, so declaring the same numbers in `@page` makes the printed page and the
 * preview sheet the same coordinate space — 1:1, no scale factor.
 *
 * 794px = 210.08mm, i.e. A4 + 0.08mm. That deviation is ~0.04% and invisible in
 * print; taking it buys exact pixel parity with the preview, which formal
 * `size: A4` would not (793.7px would round-trip into sub-pixel reflow and can
 * spill a blank trailing page).
 */
export const PAGE_W_PX = SHEET_W;
export const PAGE_H_PX = SHEET_H;

/**
 * Reproduces the layout-relevant Tailwind utilities that ResumeDoc's wrapper
 * uses, because the print document loads no Tailwind stylesheet.
 *
 * Screen-only affordances are deliberately NOT reproduced: `shadow-2xl` and
 * `transition-all duration-300` are viewport chrome.
 *
 * Note there is no fragmentation CSS here — ResumeDoc carries its own
 * (sheetStyles.ts) in a <style> tag inside the markup, so the printed document
 * and the on-screen sheet get those rules from one definition.
 */
const SHEET_CSS = `
  *, *::before, *::after { box-sizing: border-box; border-width: 0; border-style: solid; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  /* ── Tailwind Preflight equivalent ──────────────────────────────────────
   * The preview renders inside the app shell, which loads Tailwind Preflight.
   * The print document loads no Tailwind, so without this the 102 <ul>/<li>
   * and 23 <p> nodes across the template tree would pick up UA defaults
   * (ul: 1em margin + 40px padding + disc bullets; p/h1: em margins) and the
   * PDF would not resemble the preview at all.
   * ------------------------------------------------------------------- */
  /* Preflight's root line-height. Easy to miss because most templates set an
     explicit line-height on their outermost div, which masks it — but the ones
     that do not (magazine-spread) inherited 1.5 on screen and 'normal' (~1.2)
     in print, shifting every line and changing the page count. */
  html { line-height: 1.5; -webkit-text-size-adjust: 100%; }

  h1, h2, h3, h4, h5, h6, p, blockquote, figure, pre, dl, dd { margin: 0; }
  h1, h2, h3, h4, h5, h6 { font-size: inherit; font-weight: inherit; }
  ul, ol, menu { list-style: none; margin: 0; padding: 0; }
  strong, b { font-weight: bolder; }
  table { border-collapse: collapse; }

  /* ── Mirror of app/globals.css:7-10 ─────────────────────────────────────
   * TEMPORARY. globals.css applies this to every h1/h2/h3 in the app, which
   * bleeds into the resume sheet in the preview. Replicated verbatim so the
   * print cascade matches the preview cascade rather than "fixing" it on one
   * side only — that asymmetry is the bug this whole project is removing.
   * Phase 5 deletes this by giving each template an explicit inline stack, at
   * which point the resume sheet stops depending on app-global CSS entirely.
   * ------------------------------------------------------------------- */
  h1, h2, h3 { font-family: 'Outfit', sans-serif; font-weight: 700; }

  .relative { position: relative; }
  .w-full   { width: 100%; }
  .bg-white { background-color: #fff; }

  ${PAGE_RULE_CSS}

  @media print {
    html, body { width: ${PAGE_W_PX}px; }
  }
`;

/**
 * Server-render the *same* ResumeDoc component tree the preview uses into a
 * standalone HTML document ready for headless-Chromium printing.
 *
 * There is no export-specific template here and there must never be one: the
 * markup below is produced by components/resume-templates, byte for byte the
 * tree that components/builder/ResumePreview.tsx renders on screen.
 */
export function buildResumeHtml(input: ResumeRenderInput): string {
  // Inline the same font files the preview loads over HTTP. Only the families
  // this template uses, so a serif resume does not carry the sans faces.
  const fontCss = embeddedFontCss(fontsFor(input.templateId));
  const body = renderToStaticMarkup(<ResumeDoc input={input} fontCss={fontCss} />);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Resume</title>
<style>${SHEET_CSS}</style>
</head>
<body>${body}</body>
</html>`;
}
