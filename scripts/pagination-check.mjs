/**
 * Pagination parity: does the on-screen sheet show each section on the same
 * page the PDF puts it on?
 *
 * The preview flows continuously with page-boundary guides, while the PDF is
 * fragmented by Chromium honouring `break-inside: avoid`. Those two can drift:
 * when a block would straddle a boundary the PDF pushes it to the next page,
 * but the continuous sheet just draws a line through it. This measures how
 * often that actually happens, so the decision to invest in true preview
 * pagination is made on data rather than on a guess.
 *
 * Usage: node scripts/pagination-check.mjs [templateId]
 * Requires `npm run dev`; honours PARITY_BASE.
 */
import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const BASE = process.env.PARITY_BASE ?? 'http://localhost:3000';
const TEMPLATE = process.argv[2] ?? 'classic';
const PAGE_H = 1123;
const OUT = 'scratch/parity';

const CHROME = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].filter(Boolean).find((p) => existsSync(p));

if (!CHROME) { console.error('No Chrome found.'); process.exit(1); }

/**
 * Strip whitespace entirely, not just collapse it. Several templates letter-space
 * their headings, and PDF text extraction turns that tracking into real spaces
 * ("Summary" -> "S U M M A R Y"), so any space-preserving comparison never matches.
 */
const norm = (s) => s.replace(/\s+/g, '').toLowerCase();

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true,
  defaultViewport: { width: 794, height: PAGE_H, deviceScaleFactor: 1 },
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

try {
  const page = await browser.newPage();
  // The paginated preview — the same path the builder renders, reflow included.
  await page.goto(`${BASE}/tplpreview?t=${TEMPLATE}&paginate=1`, { waitUntil: 'load', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);

  // The paginator runs once on layout and again when fonts resolve, so a fixed
  // delay is a race: under load this harness intermittently measured the
  // pre-font pass and reported a mismatch that did not reproduce in isolation.
  // Wait for the sheet height to stop changing instead.
  await page.waitForFunction(
    () => {
      const el = document.querySelector('[data-resume-sheet]');
      if (!el) return false;
      const h = el.getBoundingClientRect().height;
      const w = window;
      if (w.__lastH === h) return (w.__stable = (w.__stable || 0) + 1) >= 3;
      w.__lastH = h;
      w.__stable = 0;
      return false;
    },
    { polling: 100, timeout: 20000 },
  );

  // Where each section sits in the continuous flow, and its heading text.
  const sections = await page.evaluate((pageH) => {
    const root = document.querySelector('[data-resume-sheet]');
    const rootTop = root.getBoundingClientRect().top;
    const isSpacer = (c) => c.hasAttribute('data-pagination-spacer');

    return [...root.querySelectorAll('[data-section]')].map((el) => {
      const blocks = [...el.children].filter((c) => !isSpacer(c));
      // Measure the heading, not the section box: once the paginator inserts a
      // spacer the box starts *before* the spacer, so the box top no longer
      // says which page the section's content is actually on.
      const head = blocks[0];
      const hr = head ? head.getBoundingClientRect() : el.getBoundingClientRect();
      const top = hr.top - rootTop;

      // "Straddles" means a guide line cuts through a real block — the case the
      // PDF resolves by moving the block and a continuous sheet cannot.
      const straddles = blocks.some((c) => {
        const r = c.getBoundingClientRect();
        const t = r.top - rootTop;
        return Math.floor(t / pageH) !== Math.floor((t + r.height - 0.5) / pageH);
      });

      return {
        id: el.getAttribute('data-section'),
        heading: (head?.textContent || '').trim(),
        top: +top.toFixed(1),
        height: +el.getBoundingClientRect().height.toFixed(1),
        guidePage: Math.floor(top / pageH) + 1,
        straddles,
      };
    });
  }, PAGE_H);

  // Where the PDF actually put each section.
  const res = await fetch(`${BASE}/api/export/pdf?t=${TEMPLATE}&pdf=1`);
  const pdfBuf = Buffer.from(await res.arrayBuffer());
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
  writeFileSync(`${OUT}/${TEMPLATE}.pagination.pdf`, pdfBuf);

  const parsed = await new PDFParse({ data: new Uint8Array(pdfBuf) }).getText();
  const pageTexts = parsed.pages.map((p) => norm(p.text));

  console.log(`\nTemplate: ${TEMPLATE}`);
  console.log(`Flow height ${(sections.at(-1)?.top + sections.at(-1)?.height).toFixed(0)}px  ->  PDF pages: ${parsed.total}`);
  console.log(`Guide-implied pages: ${Math.max(...sections.map((s) => s.guidePage))}\n`);

  let mismatches = 0, straddling = 0, notFound = 0;
  console.log('section         heading                    guide  pdf   straddles');
  console.log('─'.repeat(72));

  for (const s of sections) {
    const needle = norm(s.heading).slice(0, 24);
    const pdfPage = needle ? pageTexts.findIndex((t) => t.includes(needle)) + 1 : 0;
    // A heading that cannot be located in the PDF is an unresolved case, never
    // a pass — silently counting it as agreement is how a harness lies.
    if (pdfPage === 0) notFound++;
    const ok = pdfPage > 0 && pdfPage === s.guidePage;
    if (pdfPage > 0 && !ok) mismatches++;
    if (s.straddles) straddling++;
    console.log(
      `${(s.id || '').padEnd(15)} ${s.heading.slice(0, 25).padEnd(26)} ${String(s.guidePage).padEnd(6)} ` +
      `${(pdfPage || '?')}     ${s.straddles ? 'YES' : '-'}   ${pdfPage === 0 ? '<-- NOT FOUND' : ok ? '' : '<-- MISMATCH'}`,
    );
  }

  console.log('─'.repeat(72));
  console.log(`Sections: ${sections.length}   mismatches: ${mismatches}   not found: ${notFound}   guide cuts through block: ${straddling}`);
  const clean = mismatches === 0 && notFound === 0;
  console.log(
    clean
      ? '\nPAGINATION: every section lands on the page the guides imply.'
      : `\nPAGINATION: ${mismatches} mismatch(es), ${notFound} unresolved.`,
  );
  process.exitCode = clean ? 0 : 1;
} finally {
  await browser.close();
}
