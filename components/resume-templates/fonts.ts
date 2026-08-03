import type { TemplateId } from '@/lib/types';

/**
 * The resume sheet's fonts — one registry, used by both render paths.
 *
 * Every template used to name proprietary system fonts (Georgia, Arial,
 * Helvetica, Segoe UI, Courier New). That works on a developer's Windows box
 * and not at all on the Lambda Chromium that renders the PDF, which ships
 * essentially no fonts — so the exported file silently used whatever fallback
 * that image had. Naming a self-hosted family *first* in each stack makes both
 * environments render from the same file.
 *
 * The system names are kept after the webfont purely as a belt-and-braces
 * fallback; in practice the webfont always wins because it always loads.
 *
 * Delivery differs by necessity — the preview fetches /fonts/*.woff2 over HTTP,
 * the print document inlines the same bytes as base64 because `setContent` has
 * no base URL to resolve against — but the family names, the stacks and the
 * font files are shared, which is what determines rendering.
 *
 * The families are namespaced ("Foliox Sans", not "Inter") and that is
 * load-bearing, not decoration. app/layout.tsx loads Inter via
 * next/font/google. Next 14 registered that under an obfuscated family name;
 * Next 16 registers the literal family "Inter" plus an "Inter Fallback". Our
 * self-hosted Inter then collided with it in the preview only — the print
 * document has no next/font — and the two documents resolved the same CSS to
 * different faces: weight 600 matched next/font's variable 100..900 face on
 * screen but fell to our static 700 in print, so one span rendered 2px wider.
 * A private family name cannot be captured by whatever the app shell loads.
 */

export interface FontFace {
  file: string;
  /** A range like "100 900" declares a variable font's supported axis. */
  weight: string;
  style: 'normal' | 'italic';
}

export interface FontDef {
  family: string;
  /** What a template puts in `font-family`. */
  stack: string;
  faces: FontFace[];
}

export type FontKey = 'serif' | 'times' | 'sans' | 'mono' | 'chrome';

export const FONTS: Record<FontKey, FontDef> = {
  // Gelasio is metric-compatible with Georgia, so line breaks barely move.
  serif: {
    family: 'Foliox Serif',
    stack: '"Foliox Serif", Georgia, "Times New Roman", Times, serif',
    faces: [
      { file: 'Gelasio-400.woff2', weight: '400', style: 'normal' },
      { file: 'Gelasio-700.woff2', weight: '700', style: 'normal' },
      { file: 'Gelasio-400i.woff2', weight: '400', style: 'italic' },
      { file: 'Gelasio-700i.woff2', weight: '700', style: 'italic' },
    ],
  },
  // Tinos is metric-compatible with Times New Roman.
  times: {
    family: 'Foliox Times',
    stack: '"Foliox Times", "Times New Roman", Times, serif',
    faces: [
      { file: 'Tinos-400.woff2', weight: '400', style: 'normal' },
      { file: 'Tinos-700.woff2', weight: '700', style: 'normal' },
      { file: 'Tinos-400i.woff2', weight: '400', style: 'italic' },
    ],
  },
  // Inter as static weights, not the variable file: Skia cannot instance a
  // variable font when embedding into a PDF — given Inter-var it embedded
  // "Inter-Thin" and fell back to Arial-BoldMT for every bold run. Arial's
  // metric-compatible clone (Arimo) was not an option: it stops at 700 and
  // every sans template uses 800 or 900 somewhere.
  sans: {
    family: 'Foliox Sans',
    stack: '"Foliox Sans", "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
    faces: [
      { file: 'Inter-400.woff2', weight: '400', style: 'normal' },
      { file: 'Inter-700.woff2', weight: '700', style: 'normal' },
      { file: 'Inter-800.woff2', weight: '800', style: 'normal' },
      { file: 'Inter-900.woff2', weight: '900', style: 'normal' },
      { file: 'Inter-400i.woff2', weight: '400', style: 'italic' },
    ],
  },
  // Cousine is metric-compatible with Courier New.
  mono: {
    family: 'Foliox Mono',
    stack: '"Foliox Mono", "Courier New", Menlo, Consolas, monospace',
    faces: [
      { file: 'Cousine-400.woff2', weight: '400', style: 'normal' },
      { file: 'Cousine-700.woff2', weight: '700', style: 'normal' },
    ],
  },
  /**
   * App chrome only — never embedded in a PDF, and deliberately so.
   *
   * globals.css applies Outfit to every h1/h2/h3, which used to bleed into the
   * resume sheet. sheetStyles.ts now resets font-family inside the sheet, so no
   * template renders in Outfit and the print document has no reason to carry it.
   *
   * That reset is load-bearing, not cosmetic: including Outfit's face in the
   * print document made Chromium drop TrueType embedding for the whole file and
   * emit Type3 outlines instead (65 KB -> 240 KB on Classic). Its tables and
   * fsType (0, installable) look ordinary next to the four families that embed
   * cleanly, so the trigger is unidentified — which is the other reason not to
   * put it back. It is still self-hosted for the app itself (see globals.css),
   * which is what removed the last runtime CDN font dependency.
   */
  chrome: {
    family: 'Outfit',
    stack: 'Outfit, sans-serif',
    faces: [
      { file: 'Outfit-400.woff2', weight: '400', style: 'normal' },
      { file: 'Outfit-700.woff2', weight: '700', style: 'normal' },
    ],
  },
};

/** Always embedded: see FONTS.chrome. */
const ALWAYS: FontKey[] = [];

/** Everything a template needs to render — its own stack plus app-chrome bleed. */
export function fontsFor(templateId: TemplateId): FontKey[] {
  return [...(TEMPLATE_FONTS[templateId] ?? ['sans']), ...ALWAYS];
}

/**
 * Which stack each template uses. The print path embeds only these (plus
 * ALWAYS), so a serif resume carries ~266 KB of TTF rather than all 1.1 MB.
 */
export const TEMPLATE_FONTS: Record<TemplateId, FontKey[]> = {
  'classic': ['serif'],
  'academic-cv': ['serif'],
  'elegant-serif': ['serif'],
  'government': ['times'],
  'minimalist-mono': ['mono'],
  'sidebar-dark': ['sans'],
  'executive-bold': ['sans'],
  'creative-purple': ['sans'],
  'swiss-grid': ['sans'],
  'infographic': ['sans'],
  'magazine-spread': ['sans'],
  'card-stack': ['sans'],
  'timeline-left': ['sans'],
  'dark-mode': ['sans'],
  'startup-bold': ['sans'],
};

/** Build @font-face rules; `srcFor` decides how the bytes are referenced. */
export function fontFaceCss(keys: FontKey[], srcFor: (file: string) => string | null): string {
  return keys
    .flatMap((key) =>
      FONTS[key].faces.map((face) => {
        const src = srcFor(face.file);
        if (!src) return '';
        return `@font-face{font-family:'${FONTS[key].family}';font-style:${face.style};font-weight:${face.weight};font-display:block;src:${src};}`;
      }),
    )
    .filter(Boolean)
    .join('\n');
}

/** Preview: fetch over HTTP from /public. */
export function fontFaceCssForBrowser(keys: FontKey[]): string {
  return fontFaceCss(keys, (file) => `url('/fonts/${file}') format('woff2')`);
}
