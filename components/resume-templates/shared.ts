import type { CSSProperties } from 'react';
import type { ResumeData } from '@/lib/types';

/** The subset of the builder's design state that templates actually read. */
export interface BuilderDesign {
  accentColor?: string;
  fontPair?: string;
  spacing?: string;
  zoom?: number;
}

export interface TemplateProps {
  data: ResumeData;
  /**
   * Required and guaranteed non-empty — ResumeDoc always supplies a resolved
   * order from selectRenderInput(). Templates must not carry their own default
   * list; those copies disagreed with each other and with the store.
   */
  sectionOrder: string[];
  builderDesign?: BuilderDesign | null;
}

/** A4 sheet geometry shared by every HTML template (96dpi). */
export const SHEET_W = 794;
export const SHEET_H = 1123;

/* ── Fragmentation-safe columns ───────────────────────────────────────────
 * Chromium cannot fragment a flex or grid container across printed pages: a
 * container that does not fit in the remaining space is pushed to the next
 * page whole. On the magazine-spread fixture that produced a PDF whose first
 * page held only the header (184 characters) and whose second held the entire
 * body (2260) — while the preview showed one continuous page.
 *
 * Measured alternatives, same fixture:
 *   grid / flex    2 pages, 184 + 2260   container pushed whole
 *   inline-block   2 pages, 184 + 2261   also monolithic
 *   column-count   1 page,  2444         fragments, but reflows content
 *                                        between columns, so a template can no
 *                                        longer choose what goes where
 *   float          1 page,  2446         fragments AND keeps each child in the
 *                                        column the template assigned it
 *
 * Floats win. `colRow`/`colCell`/`colClear` express a row of columns that
 * paginates. Every child needs an explicit width — all templates already
 * declared percentage widths, so this is a like-for-like swap.
 * ---------------------------------------------------------------------- */

/** Container for a row of columns. Must be followed by <div style={colClear} />. */
export const colRow: CSSProperties = { display: 'block' };

/** One column. `gap` becomes right padding, so it does not add to the width. */
export function colCell(width: string, gap = 0): CSSProperties {
  return { float: 'left', width, paddingRight: gap, boxSizing: 'border-box' };
}

/**
 * Closes a colRow. A float container cannot use overflow:hidden to self-clear
 * here — that clips content at the page break instead of letting it flow.
 */
export const colClear: CSSProperties = { clear: 'both' };

/* ── Colour plumbing ──────────────────────────────────────────────────────
 * Templates used to hardcode their accent (#7f1d1d, #e11d48, #0ea5e9 …) and
 * their rules (#111, #000). Both now go through `palette()`: each template
 * passes the accent that is part of its identity as the fallback, and the
 * builder's accentColor overrides it when the user has picked one.
 * ------------------------------------------------------------------------ */

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

function hexToRgb(hex: string): RGB | null {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6);
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  const c = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h, s, l };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  if (s === 0) return { r: l * 255, g: l * 255, b: l * 255 };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return { r: hue(h + 1 / 3) * 255, g: hue(h) * 255, b: hue(h - 1 / 3) * 255 };
}

/** Return `hex` with its HSL lightness/saturation forced to the given values. */
function shade(hex: string, l: number, s?: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const hsl = rgbToHsl(rgb);
  return rgbToHex(hslToRgb({ h: hsl.h, s: s ?? hsl.s, l: Math.min(1, Math.max(0, l)) }));
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const ch = (v: number) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * ch(rgb.r) + 0.7152 * ch(rgb.g) + 0.0722 * ch(rgb.b);
}

/** WCAG contrast ratio between two opaque colours (1–21). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Walk `color`'s lightness away from `bg` until it clears `target` contrast.
 * Used for accent-coloured text and links, which are the things that go
 * illegible when a user picks a dark accent on a dark surface (or vice versa).
 */
function ensureContrast(color: string, bg: string, target = 4.5): string {
  if (contrastRatio(color, bg) >= target) return color;
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  const { h, s } = rgbToHsl(rgb);
  const goLighter = luminance(bg) < 0.5;
  let best = color;
  let bestRatio = contrastRatio(color, bg);
  for (let i = 1; i <= 20; i++) {
    const l = goLighter ? Math.min(0.97, rgbToHsl(rgb).l + i * 0.04) : Math.max(0.06, rgbToHsl(rgb).l - i * 0.04);
    const candidate = rgbToHex(hslToRgb({ h, s, l }));
    const ratio = contrastRatio(candidate, bg);
    if (ratio > bestRatio) { best = candidate; bestRatio = ratio; }
    if (ratio >= target) return candidate;
  }
  return best;
}

export interface Palette {
  /** The accent as chosen (builder override, else the template's own). */
  accent: string;
  /** Accent darkened until it is readable as text on paper (>=4.5:1 on white). */
  accentInk: string;
  /** Accent-tinted hairline for rules and underlines — visible, never harsh. */
  accentLine: string;
  /** Very light accent wash for pills and bands. */
  accentTint: string;
  /** Accent lightened until readable on the dark surface below. */
  accentOnDark: string;
  /** Neutral text scale. */
  ink: string;
  inkMuted: string;
  inkFaint: string;
  /** Neutral rules — the replacement for the old #111 / #000 borders. */
  rule: string;
  ruleStrong: string;
  /** Dark-surface tokens (Slate 900 family, not pure black). */
  surfaceDark: string;
  surfaceDarker: string;
  onDark: string;
  onDarkMuted: string;
  ruleOnDark: string;
}

const SURFACE_DARK = '#1e293b';   // Slate 800 — sidebar body
const SURFACE_DARKER = '#0f172a'; // Slate 900 — deepest tone we use in print

/** Derive a full token set from the builder accent (or a template's fallback). */
export function palette(design?: BuilderDesign | null, fallbackAccent = '#0f172a'): Palette {
  const raw = design?.accentColor;
  const accent = (raw && hexToRgb(raw)) ? raw : fallbackAccent;
  return {
    accent,
    accentInk: ensureContrast(accent, '#ffffff', 4.5),
    accentLine: shade(accent, 0.78, 0.45),
    accentTint: shade(accent, 0.95, 0.55),
    accentOnDark: ensureContrast(accent, SURFACE_DARK, 4.5),
    ink: '#1f2937',
    inkMuted: '#4b5563',
    inkFaint: '#6b7280',
    rule: '#d4d4d8',
    ruleStrong: '#a1a1aa',
    surfaceDark: SURFACE_DARK,
    surfaceDarker: SURFACE_DARKER,
    onDark: '#e2e8f0',
    onDarkMuted: '#94a3b8',
    ruleOnDark: 'rgba(255,255,255,0.16)',
  };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "2021-06" -> "Jun 2021"; passes through anything already formatted. */
export function fmtDate(d?: string): string {
  if (!d) return '';
  const m = /^(\d{4})-(\d{2})/.exec(d);
  if (m) {
    const mo = MONTHS[+m[2] - 1];
    return mo ? `${mo} ${m[1]}` : m[1];
  }
  return d;
}

/** "2021-06" -> "June 2021" (used by the formal/government template). */
export function fmtDateFull(d?: string): string {
  if (!d) return '';
  const m = /^(\d{4})-(\d{2})/.exec(d);
  if (m) {
    const mo = MONTHS_FULL[+m[2] - 1];
    return mo ? `${mo} ${m[1]}` : m[1];
  }
  return d;
}

export function range(start?: string, end?: string, current?: boolean, full = false): string {
  const f = full ? fmtDateFull : fmtDate;
  const e = current ? 'Present' : f(end);
  return [f(start), e].filter(Boolean).join(' – ');
}

export function bullets(desc?: string): string[] {
  return (desc || '')
    .split('\n')
    .map((s) => s.trim().replace(/^[-•]\s*/, ''))
    .filter(Boolean);
}

export function fullName(c: ResumeData['contact']): string {
  return [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Your Name';
}

export function initials(c: ResumeData['contact']): string {
  return [c.firstName?.[0], c.lastName?.[0]].filter(Boolean).join('').toUpperCase() || '··';
}

export function contactItems(c: ResumeData['contact']): string[] {
  return [
    c.email,
    c.phone,
    [c.city, c.country].filter(Boolean).join(', '),
    c.linkedin,
    c.github,
    c.website,
  ].filter(Boolean) as string[];
}

export function degreeLine(edu: ResumeData['education'][number]): string {
  return [edu.degree, edu.field ? `in ${edu.field}` : ''].filter(Boolean).join(' ');
}

export function has<T>(arr?: T[]): arr is T[] {
  return Array.isArray(arr) && arr.length > 0;
}
