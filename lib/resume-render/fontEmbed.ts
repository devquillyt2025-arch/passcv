import { readFileSync } from 'fs';
import { join } from 'path';
import { fontFaceCss, type FontKey } from '@/components/resume-templates/fonts';

/**
 * Inline the self-hosted fonts into the print document as base64.
 *
 * `page.setContent()` gives the page no base URL, so `url('/fonts/x.woff2')`
 * cannot resolve — and pointing it at the deployment would put a network fetch
 * in the middle of every export, which is the dependency commit 0efda50
 * removed. Embedding the bytes keeps the print document self-contained.
 *
 * On Vercel, files under public/ are served by the CDN and are NOT part of the
 * function bundle by default. next.config.mjs uses outputFileTracingIncludes to
 * pull public/fonts into this route's bundle; without that this read succeeds
 * locally and throws in production.
 */

const cache = new Map<string, string | null>();

/**
 * TTFs live in assets/fonts, not public/fonts: they are read by this module
 * only and are ~3.2 MB unsubsetted. Putting them under public/ would publish
 * every byte to the CDN for no one to download. The browser's woff2 files stay
 * in public/fonts.
 */
const DIRS: Record<string, string[]> = {
  '.ttf': ['assets', 'fonts'],
  '.woff2': ['public', 'fonts'],
};

function base64Font(file: string): string | null {
  if (cache.has(file)) return cache.get(file) ?? null;
  const dir = DIRS[file.endsWith('.ttf') ? '.ttf' : '.woff2'];
  try {
    const b64 = readFileSync(join(process.cwd(), ...dir, file)).toString('base64');
    cache.set(file, b64);
    return b64;
  } catch {
    cache.set(file, null);
    return null;
  }
}

/**
 * Print uses the TTF twin of each woff2, and this is not incidental.
 *
 * Chromium's Skia PDF backend cannot re-embed a typeface it decoded from WOFF2.
 * Given woff2 it emits Type3 fonts instead — every glyph redrawn as vector
 * outlines, no /FontFile, no /BaseFont. The text still extracts, but the file
 * nearly doubles (127 KB -> 240 KB on Classic) and carries no real font.
 * Handing it TTF produces properly subset-embedded TrueType.
 *
 * The browser keeps loading the woff2 files. Same typeface, same metrics —
 * only the container differs.
 */
export function embeddedFontCss(keys: FontKey[]): string {
  return fontFaceCss(keys, (file) => {
    const ttf = file.replace(/\.woff2$/, '.ttf');
    const b64 = base64Font(ttf);
    if (b64) return `url('data:font/ttf;base64,${b64}') format('truetype')`;

    // Fall back to woff2 rather than dropping the face — a Type3 PDF still
    // reads correctly, a missing face does not.
    const alt = base64Font(file);
    if (alt) {
      console.warn(`[fonts] ${ttf} missing; using ${file}. PDF will contain Type3 outlines.`);
      return `url('data:font/woff2;base64,${alt}') format('woff2')`;
    }
    // Loud: a missing font silently becomes a fallback-glyph PDF, which is
    // exactly the failure this phase exists to prevent.
    console.error(`[fonts] MISSING ${ttf} and ${file} — PDF will render with fallback glyphs.`);
    return null;
  });
}
