/**
 * Preview vs. PDF parity harness.
 *
 * Loads the same template+fixture through both cascades —
 *   preview : /tplpreview?t=<id>        (app shell: Tailwind Preflight + globals.css)
 *   print   : /api/export/debug-html    (standalone print document)
 * — measures every text-bearing element geometrically in each, and diffs.
 *
 * Geometry is compared rather than pixels: a numeric box diff pinpoints *which*
 * element moved and by how much, which an image diff cannot.
 *
 * Usage: node scripts/parity-check.mjs [templateId] [--tolerance 0.5]
 * Requires `npm run dev` on :3000.
 */
import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

const BASE = process.env.PARITY_BASE ?? 'http://localhost:3000';
const TEMPLATE = process.argv[2]?.startsWith('--') ? 'classic' : process.argv[2] ?? 'classic';
const TOL = Number(process.argv[process.argv.indexOf('--tolerance') + 1]) || 0.5;
const OUT = 'scratch/parity';

const CHROME_CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].filter(Boolean);

/** Collect a stable, comparable box list for every element that renders text. */
const PROBE = `(() => {
  const root = document.querySelector('[data-resume-sheet]');
  if (!root) throw new Error('No [data-resume-sheet] element — page did not render the resume.');
  const out = [];
  const walk = (el, path) => {
    for (let i = 0; i < el.children.length; i++) {
      const c = el.children[i];
      if (c.tagName === 'STYLE' || c.tagName === 'SCRIPT') continue;
      const r = c.getBoundingClientRect();
      const cs = getComputedStyle(c);
      const own = Array.from(c.childNodes)
        .filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();
      const p = path + '/' + c.tagName.toLowerCase() + '[' + i + ']';
      out.push({
        path: p,
        text: own.slice(0, 60),
        x: +r.x.toFixed(2), y: +r.y.toFixed(2),
        w: +r.width.toFixed(2), h: +r.height.toFixed(2),
        font: cs.fontFamily, size: cs.fontSize, weight: cs.fontWeight,
        lh: cs.lineHeight, color: cs.color,
        mt: cs.marginTop, mb: cs.marginBottom, pl: cs.paddingLeft,
        ls: cs.listStyleType,
      });
      walk(c, p);
    }
  };
  walk(root, '');
  return { boxes: out, docHeight: root.getBoundingClientRect().height };
})()`;

async function measure(page, url) {
  // 'load', not 'networkidle0': the Next dev server holds an HMR websocket
  // open, so the network never goes idle and navigation would time out.
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 300));
  return page.evaluate(PROBE);
}

const exe = CHROME_CANDIDATES.find(p => existsSync(p));
if (!exe) { console.error('No Chrome found. Set PUPPETEER_EXECUTABLE_PATH.'); process.exit(1); }

const browser = await puppeteer.launch({
  executablePath: exe, headless: true,
  defaultViewport: { width: 794, height: 1123, deviceScaleFactor: 1 },
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

try {
  const page = await browser.newPage();
  const preview = await measure(page, `${BASE}/tplpreview?t=${TEMPLATE}`);
  const print = await measure(page, `${BASE}/api/export/pdf?t=${TEMPLATE}`);

  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
  writeFileSync(`${OUT}/${TEMPLATE}.preview.json`, JSON.stringify(preview, null, 2));
  writeFileSync(`${OUT}/${TEMPLATE}.print.json`, JSON.stringify(print, null, 2));

  const byPath = new Map(print.boxes.map(b => [b.path, b]));
  const diffs = [];

  for (const a of preview.boxes) {
    const b = byPath.get(a.path);
    if (!b) { diffs.push({ kind: 'MISSING', path: a.path, text: a.text }); continue; }
    byPath.delete(a.path);

    const geo = ['x', 'y', 'w', 'h'].filter(k => Math.abs(a[k] - b[k]) > TOL);
    if (geo.length) {
      diffs.push({
        kind: 'GEOMETRY', path: a.path, text: a.text,
        delta: geo.map(k => `${k}: ${a[k]} -> ${b[k]} (${(b[k] - a[k]).toFixed(2)})`).join(', '),
      });
    }
    for (const k of ['font', 'size', 'weight', 'lh', 'color', 'mt', 'mb', 'pl', 'ls']) {
      if (a[k] !== b[k]) diffs.push({ kind: 'STYLE', path: a.path, text: a.text, delta: `${k}: "${a[k]}" -> "${b[k]}"` });
    }
  }
  for (const b of byPath.values()) diffs.push({ kind: 'EXTRA', path: b.path, text: b.text });

  const previewText = preview.boxes.map(b => b.text).filter(Boolean).join('|');
  const printText = print.boxes.map(b => b.text).filter(Boolean).join('|');

  console.log(`\nTemplate: ${TEMPLATE}   tolerance: ${TOL}px`);
  console.log(`Elements  preview=${preview.boxes.length}  print=${print.boxes.length}`);
  console.log(`Height    preview=${preview.docHeight.toFixed(2)}px  print=${print.docHeight.toFixed(2)}px`);
  console.log(`Text      ${previewText === printText ? 'IDENTICAL' : 'DIVERGENT'}`);

  const counts = diffs.reduce((m, d) => ({ ...m, [d.kind]: (m[d.kind] || 0) + 1 }), {});
  console.log(`\nDiffs: ${diffs.length}`, Object.keys(counts).length ? counts : '');
  for (const d of diffs.slice(0, 40)) {
    console.log(`  [${d.kind}] ${d.path}${d.text ? ` "${d.text}"` : ''}${d.delta ? `\n        ${d.delta}` : ''}`);
  }
  if (diffs.length > 40) console.log(`  ... ${diffs.length - 40} more (see ${OUT}/)`);

  console.log(diffs.length === 0 ? '\nPARITY: PASS' : '\nPARITY: FAIL');
  process.exitCode = diffs.length === 0 ? 0 : 1;
} finally {
  await browser.close();
}
