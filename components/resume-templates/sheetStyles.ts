import { SHEET_W, SHEET_H } from './shared';

/**
 * Pagination rules for the resume sheet.
 *
 * Defined once and injected into BOTH the on-screen sheet (ResumeDoc) and the
 * standalone print document (lib/resume-render/document.tsx). Two copies of
 * these rules would be two fragmentation policies, which is the class of drift
 * this whole project exists to remove.
 *
 * Structure this relies on: every template renders each section through
 * `renderSection(id)`, which returns `<div data-section={id}>` whose first
 * child is the section heading and whose remaining children are one entry each
 * (a job, a degree, a project). That shape is uniform across all 15 templates,
 * so these selectors need no per-template knowledge.
 *
 * Chromium ignores `break-inside: avoid` when the block is taller than a page,
 * so an unusually long entry degrades to breaking rather than vanishing.
 */
export const SHEET_FRAGMENTATION_CSS = `
  /* ── The sheet owns its typography ──────────────────────────────────────
   * app/globals.css:7-10 sets \`h1, h2, h3 { font-family: 'Outfit' }\` app-wide,
   * and it bled into the resume: 13 of 15 templates do not set font-family on
   * their <h1>, so the candidate's name — the most prominent thing on the page
   * — rendered in a font the template never chose.
   *
   * It also broke PDF export outright. Embedding Outfit alongside the template
   * font made Chromium abandon TrueType embedding for the *entire* document and
   * fall back to Type3 outlines (Classic: 65 KB properly embedded vs 240 KB of
   * outlines); leaving it unembedded made the printed name fall through to
   * generic sans, which Chromium resolved to Arial. Neither is acceptable, and
   * both disappear once the sheet stops inheriting app chrome.
   *
   * font-weight is deliberately left alone — globals.css's 700 still applies to
   * the two templates that do not set their own, identically in both paths.
   * ------------------------------------------------------------------- */
  [data-resume-sheet] h1, [data-resume-sheet] h2, [data-resume-sheet] h3,
  [data-resume-sheet] h4, [data-resume-sheet] h5, [data-resume-sheet] h6 {
    font-family: inherit;
  }

  /* Each entry (job, degree, project) stays whole rather than splitting. */
  [data-section] > * { break-inside: avoid; }

  /* Keep a section heading with the content it introduces.
   *
   * The :not(:last-child) guard is load-bearing. Several templates render a section as
   * a single wrapper div holding heading *and* entries, so that wrapper is both
   * first and last child. Without the guard the rule then reads "never break
   * after this section" — which glues consecutive sections into one
   * unbreakable chain. On startup-bold that chained education, certifications,
   * courses and languages onto projects; projects overflowed page 1, so all
   * five jumped to page 2 and the PDF used 57% of its first page while the
   * preview showed them filling it. */
  [data-section] > :first-child:not(:last-child) { break-after: avoid; }

  /* Sections themselves may span pages — a long Experience list should fill
     the page and continue, not jump wholesale to the next one. */
  [data-section] { break-inside: auto; }

  /* ── Equal-width column rows ────────────────────────────────────────────
   * For rows whose children come from a .map() and so cannot carry their own
   * inline width. Floats rather than grid for the reason in shared.ts: grid and
   * flex containers cannot be fragmented across printed pages, so one that does
   * not fit gets pushed whole and leaves a near-empty page behind.
   * Must be closed by an element with clear:both.
   * ------------------------------------------------------------------- */
  [data-colrow] { display: block; }
  /* The gutter is padding, not gap: the gap property has no effect on a block box. */
  [data-colrow] > * { float: left; box-sizing: border-box; padding-right: var(--colrow-gap, 0px); }
  [data-colrow] > *:last-child { padding-right: 0; }
  [data-colrow="2"] > * { width: 50%; }
  [data-colrow="3"] > * { width: 33.3333%; }

  /* A bullet never splits across pages. */
  li { break-inside: avoid; }

  /* No single dangling line from a wrapped paragraph. */
  p { orphans: 2; widows: 2; }
`;

/** @page box; matches the on-screen sheet exactly (96 CSS px per inch). */
export const PAGE_RULE_CSS = `
  @page {
    size: ${SHEET_W}px ${SHEET_H}px;
    margin: 0;
  }
`;

/**
 * Screen-only: draw a hairline at every page boundary so the user can see
 * where the PDF will break. Purely a background; it does not affect layout,
 * so it cannot itself cause preview/PDF divergence.
 */
export const PAGE_GUIDE_CSS = `
  [data-resume-sheet][data-page-guides] {
    background-image: repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent ${SHEET_H - 1}px,
      rgba(15, 23, 42, 0.18) ${SHEET_H - 1}px,
      rgba(15, 23, 42, 0.18) ${SHEET_H}px
    );
  }
  @media print {
    [data-resume-sheet][data-page-guides] { background-image: none; }
  }
`;
