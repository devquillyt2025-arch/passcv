import type { ResumeData } from '@/lib/types';

export interface TemplateProps {
  data: ResumeData;
}

/** A4 sheet geometry shared by every HTML template (96dpi). */
export const SHEET_W = 794;
export const SHEET_H = 1123;

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
