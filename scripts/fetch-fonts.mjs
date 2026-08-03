/**
 * One-shot: download the self-hosted fonts.
 *
 * The resume templates originally named proprietary system fonts (Georgia,
 * Arial, Helvetica, Segoe UI, Courier New). None exist on the Lambda Chromium
 * that renders the PDF, so the export silently used whatever that image ships.
 * These are open (OFL) replacements, three of them metric-compatible with the
 * font they stand in for, so line breaking and page fills barely move:
 *
 *   Gelasio <- Georgia           (metric-compatible)
 *   Tinos   <- Times New Roman   (metric-compatible)
 *   Cousine <- Courier New       (metric-compatible)
 *   Inter   <- Segoe UI / Helvetica / Arial (no metric-compatible clone carries
 *              the 800/900 weights every sans template uses; Arimo stops at 700)
 *   Outfit  <- app chrome. globals.css applies it to every h1/h2/h3, which
 *              bleeds into the resume sheet. Self-hosted so the printed page
 *              resolves it to the same font the preview does — before this it
 *              fell through to generic sans and Chromium embedded Arial.
 *
 * Two artefacts per face:
 *   public/fonts/*.woff2  latin subset, fetched by the browser
 *   assets/fonts/*.ttf    the same subset decompressed, read server-side and
 *                         inlined as base64 for PDF embedding. Never served.
 *
 * Why TTF for print: Chromium's Skia PDF backend cannot re-embed a typeface it
 * decoded from WOFF2 — it emits Type3 fonts instead, every glyph redrawn as
 * vector outlines with no /FontFile and no /BaseFont (measured: 240 KB of
 * outlines vs 64 KB of properly embedded TrueType).
 *
 * Why the legacy (pre-woff2 UA) endpoint for the TTFs, and not decompressing
 * the woff2 we already have: the modern css2 endpoint now serves *variable*
 * fonts even at a single requested weight, so a decompressed woff2 carries
 * fvar/gvar/STAT. Skia cannot instance a variable font when embedding either —
 * given Inter's variable file it embedded "Inter-Thin" and fell back to
 * Arial-BoldMT for every bold run. The legacy endpoint returns genuinely static
 * TTFs. They are full-charset and therefore large, but Chromium subsets them on
 * embed, so it costs HTML size per render, not PDF size.
 *
 * Run once; the output is committed. Nothing fetches Google at runtime — that
 * is the entire point (see commit 0efda50).
 *
 * Usage: node scripts/fetch-fonts.mjs
 */
import { mkdirSync, writeFileSync, existsSync } from 'fs';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
/** Pre-woff2 UA — Google answers this with a genuinely static TTF. */
const UA_TTF = 'Mozilla/4.0';
const OUT = 'public/fonts';     // woff2 — fetched by the browser
const OUT_TTF = 'assets/fonts'; // ttf — server-side only, for PDF embedding

/**
 * family -> the [weight, style] faces the templates actually use.
 * 500 and 600 are omitted for Inter: CSS weight matching falls to the nearest
 * available face, and carrying two more TTFs to split 400/700 is not worth the
 * base64 in every render.
 */
const WANTED = {
  Gelasio: [[400, 'normal'], [700, 'normal'], [400, 'italic'], [700, 'italic']],
  Tinos: [[400, 'normal'], [700, 'normal'], [400, 'italic']],
  Cousine: [[400, 'normal'], [700, 'normal']],
  Inter: [[400, 'normal'], [700, 'normal'], [800, 'normal'], [900, 'normal'], [400, 'italic']],
  Outfit: [[400, 'normal'], [700, 'normal']],
};

function cssUrl(family, faces) {
  const weights = [...new Set(faces.map(([w]) => w))].sort((a, b) => a - b);
  const italics = weights.filter((w) => faces.some(([ww, s]) => ww === w && s === 'italic'));
  const spec = italics.length
    ? `ital,wght@${weights.map((w) => `0,${w}`).join(';')};${italics.map((w) => `1,${w}`).join(';')}`
    : `wght@${weights.join(';')}`;
  return `https://fonts.googleapis.com/css2?family=${family}:${spec}&display=swap`;
}

/** Keep only the latin-subset blocks — these resumes are Latin-script. */
function latinFaces(css) {
  const out = [];
  const re = /\/\*\s*latin\s*\*\/\s*@font-face\s*\{([^}]+)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const b = m[1];
    const url = /src:\s*url\(([^)]+)\)/.exec(b)?.[1];
    if (!url) continue;
    out.push({
      style: /font-style:\s*(\w+)/.exec(b)?.[1] ?? 'normal',
      weight: Number(/font-weight:\s*(\d+)/.exec(b)?.[1] ?? 400),
      url,
    });
  }
  return out;
}

for (const d of [OUT, OUT_TTF]) if (!existsSync(d)) mkdirSync(d, { recursive: true });

let woff2Bytes = 0, ttfBytes = 0, count = 0;

for (const [family, faces] of Object.entries(WANTED)) {
  const css = await (await fetch(cssUrl(family, faces), { headers: { 'User-Agent': UA } })).text();
  const available = latinFaces(css);

  for (const [weight, style] of faces) {
    const hit = available.find((f) => f.weight === weight && f.style === style);
    if (!hit) {
      console.warn(`  MISSING ${family} ${weight} ${style} — not offered by the API`);
      continue;
    }
    const woff2 = Buffer.from(await (await fetch(hit.url, { headers: { 'User-Agent': UA } })).arrayBuffer());
    const base = `${family}-${weight}${style === 'italic' ? 'i' : ''}`;
    writeFileSync(`${OUT}/${base}.woff2`, woff2);

    // Static TTF twin for PDF embedding, from the legacy endpoint.
    const ttfCss = await (
      await fetch(cssUrl(family, [[weight, style]]), { headers: { 'User-Agent': UA_TTF } })
    ).text();
    const ttfUrl = /src:\s*url\(([^)]+)\)/.exec(ttfCss)?.[1];
    if (!ttfUrl) {
      console.warn(`  NO TTF for ${base} — PDF will fall back to Type3 outlines`);
      continue;
    }
    const ttf = Buffer.from(await (await fetch(ttfUrl, { headers: { 'User-Agent': UA_TTF } })).arrayBuffer());

    // Guard the exact failure that cost this phase two rounds: a variable font
    // here silently degrades every PDF to Type3.
    const n = ttf.readUInt16BE(4);
    const tags = Array.from({ length: n }, (_, i) => ttf.toString('latin1', 12 + i * 16, 16 + i * 16));
    if (tags.includes('fvar')) console.warn(`  WARNING ${base}.ttf is a VARIABLE font — Skia cannot embed it`);

    writeFileSync(`${OUT_TTF}/${base}.ttf`, ttf);

    woff2Bytes += woff2.length;
    ttfBytes += ttf.length;
    count++;
    console.log(
      `  ${base.padEnd(18)} woff2 ${(woff2.length / 1024).toFixed(1).padStart(6)} KB   ttf ${(ttf.length / 1024).toFixed(1).padStart(6)} KB`,
    );
  }
}

console.log(`\n${count} faces`);
console.log(`  ${OUT}      ${(woff2Bytes / 1024).toFixed(1)} KB  (served to the browser)`);
console.log(`  ${OUT_TTF}      ${(ttfBytes / 1024).toFixed(1)} KB  (inlined into PDFs)`);
