/**
 * Inspect a generated resume PDF: page count, page box, embedded fonts, text.
 * Usage: node scripts/inspect-pdf.mjs scratch/parity/classic.pdf
 */
import { readFileSync } from 'fs';
import { inflateSync } from 'zlib';
import { createRequire } from 'module';

const file = process.argv[2] ?? 'scratch/parity/classic.pdf';
const buf = readFileSync(file);
const raw = buf.toString('latin1');

const boxes = [...raw.matchAll(/\/MediaBox\s*\[\s*([\d.\s-]+?)\]/g)]
  .map(m => m[1].trim().split(/\s+/).map(Number));

/**
 * Font descriptors usually live inside FlateDecode object streams, so a regex
 * over the raw bytes finds nothing even when fonts are present and embedded.
 * Inflate every stream first, then search the plaintext.
 */
function inflatedText(buf) {
  let out = '';
  const marker = Buffer.from('stream');
  let i = 0;
  while ((i = buf.indexOf(marker, i)) !== -1) {
    let s = i + marker.length;
    if (buf[s] === 0x0d) s++;
    if (buf[s] === 0x0a) s++;
    const end = buf.indexOf(Buffer.from('endstream'), s);
    if (end === -1) break;
    try { out += inflateSync(buf.subarray(s, end)).toString('latin1'); } catch { /* not deflate */ }
    i = end + 9;
  }
  return out;
}

const searchable = raw + inflatedText(buf);
const fonts = [...new Set([...searchable.matchAll(/\/BaseFont\s*\/([A-Za-z0-9+\-,._]+)/g)].map(m => m[1]))];
const embedded = [...new Set([...searchable.matchAll(/\/FontFile(\d?)/g)].map(m => m[1] || '1'))];

console.log(`File        ${file}  (${(buf.length / 1024).toFixed(1)} KB)`);
console.log(`PDF version ${raw.slice(5, 8)}`);

if (boxes.length) {
  const [x0, y0, x1, y1] = boxes[0];
  const wpt = x1 - x0, hpt = y1 - y0;
  console.log(`Page box    ${wpt} x ${hpt} pt  =  ${(wpt / 72 * 96).toFixed(2)} x ${(hpt / 72 * 96).toFixed(2)} CSS px`);
  console.log(`            ${(wpt / 72 * 25.4).toFixed(2)} x ${(hpt / 72 * 25.4).toFixed(2)} mm   (A4 = 210.00 x 297.00)`);
  const allSame = boxes.every(b => b[2] - b[0] === wpt && b[3] - b[1] === hpt);
  console.log(`Uniform     ${allSame ? 'yes' : 'NO — pages differ in size'}`);
}

console.log(`Fonts       ${fonts.length ? fonts.join(', ') : '(none listed)'}`);
console.log(`FontFile    ${embedded.length ? embedded.map(e => `FontFile${e}`).join(', ') + ' (embedded)' : 'NONE — fonts not embedded'}`);

const require = createRequire(import.meta.url);
try {
  const { PDFParse } = require('pdf-parse');
  const parsed = await new PDFParse({ data: new Uint8Array(buf) }).getText();
  console.log(`Pages       ${parsed.total ?? parsed.pages?.length}`);
  const text = parsed.text.replace(/\s+/g, ' ').trim();
  console.log(`Text chars  ${text.length}`);
  console.log(`\n--- extracted text (first 600 chars) ---\n${text.slice(0, 600)}`);
} catch (e) {
  const count = (raw.match(/\/Type\s*\/Page[^s]/g) || []).length;
  console.log(`Pages       ~${count} (pdf-parse unavailable: ${e.message})`);
}
