/**
 * Bullet-point analysis utilities — pure functions with no React or store deps.
 * Easily unit-tested: import { analyzeBullet } and call with any string.
 */
import type { ResumeExperience } from './types';

export interface BulletIssue {
  /** ID of the experience entry that contains this bullet */
  expId: string;
  /** Zero-based index of the experience entry */
  expIndex: number;
  /** Zero-based index of the line within the description */
  bulletIndex: number;
  /** Display text — truncated to 60 chars */
  text: string;
  /** Full original bullet text (untrimmed) */
  fullText: string;
  type: 'weak-verb' | 'passive-voice' | 'no-metric' | 'corporate-jargon';
  /** Human-readable suggestion surfaced in the UI */
  message: string;
}

// ── Patterns ──────────────────────────────────────────────────────────────────

const WEAK_VERB_RULES: { pattern: RegExp; label: string }[] = [
  { pattern: /^helped\b/i,              label: '"Helped"' },
  { pattern: /^worked\s*(on|with)?\b/i, label: '"Worked"' },
  { pattern: /^assisted\b/i,            label: '"Assisted"' },
  { pattern: /^supported\b/i,           label: '"Supported"' },
  { pattern: /^participated\b/i,        label: '"Participated"' },
  { pattern: /^involved\b/i,            label: '"Involved"' },
  { pattern: /^contributed\b/i,         label: '"Contributed"' },
  { pattern: /^responsible\s+for\b/i,   label: '"Responsible for"' },
  { pattern: /^handled\b/i,             label: '"Handled"' },
  { pattern: /^utilized\b/i,            label: '"Utilized"' },
  { pattern: /^made\s+sure\b/i,         label: '"Made sure"' },
];

const PASSIVE_VOICE_RULES: RegExp[] = [
  /\b(?:was|were|is|are|been|being)\s+\w+ed\b/i,
  /\b(?:was|were)\s+responsible\b/i,
  /\b(?:was|were)\s+tasked\b/i,
];

const HAS_METRIC = /\d/;

// Corporate jargon patterns to warn about
const CORPORATE_JARGON_RULES: { pattern: RegExp; label: string }[] = [
  { pattern: /cross-?functional/i,          label: 'cross-functional' },
  { pattern: /stakeholder\s+management/i,   label: 'stakeholder management' },
  { pattern: /\bdata-?driven\b/i,           label: 'data-driven' },
  { pattern: /\bgovernance\b/i,             label: 'governance' },
  { pattern: /\balignment\b/i,              label: 'alignment' },
  { pattern: /\bsynerg/i,                   label: 'synergy' },
  { pattern: /\bleverage\b/i,               label: 'leverage' },
  { pattern: /\butilize\b/i,                label: 'utilize' },
  { pattern: /\bimplement\b/i,              label: 'implement' },
  { pattern: /strategic\s+initiative/i,     label: 'strategic initiative' },
  { pattern: /best\s+practice/i,            label: 'best practice' },
  { pattern: /\bholistic\b/i,               label: 'holistic' },
  { pattern: /\brobust\b/i,                 label: 'robust' },
  { pattern: /\bscalable\b/i,               label: 'scalable' },
  { pattern: /\bseamless\b/i,               label: 'seamless' },
  { pattern: /cutting-?edge/i,              label: 'cutting-edge' },
  { pattern: /mission-?critical/i,          label: 'mission-critical' },
];

// ── Core analyzer ─────────────────────────────────────────────────────────────

/**
 * Analyze a single bullet line.
 * Returns null if the line is too short to be meaningful or passes all checks.
 */
export function analyzeBullet(
  rawLine: string,
  expId: string,
  expIndex: number,
  bulletIndex: number,
): BulletIssue | null {
  const trimmed = rawLine.replace(/^[-•*]\s*/, '').trim();
  if (trimmed.length < 15) return null;

  const displayText = trimmed.length > 60 ? trimmed.slice(0, 60) + '…' : trimmed;

  for (const { pattern, label } of WEAK_VERB_RULES) {
    if (pattern.test(trimmed)) {
      return {
        expId, expIndex, bulletIndex,
        text: displayText, fullText: trimmed,
        type: 'weak-verb',
        message: `Weak verb ${label} — try Led, Built, Drove, Delivered, Engineered`,
      };
    }
  }

  for (const pattern of PASSIVE_VOICE_RULES) {
    if (pattern.test(trimmed)) {
      return {
        expId, expIndex, bulletIndex,
        text: displayText, fullText: trimmed,
        type: 'passive-voice',
        message: 'Passive voice — rewrite in active voice with a strong verb',
      };
    }
  }

  // Check for corporate jargon (lower priority than weak verbs/passive voice)
  for (const { pattern, label } of CORPORATE_JARGON_RULES) {
    if (pattern.test(trimmed)) {
      return {
        expId, expIndex, bulletIndex,
        text: displayText, fullText: trimmed,
        type: 'corporate-jargon',
        message: `Cliché "${label}" — use specific action words instead`,
      };
    }
  }

  if (!HAS_METRIC.test(trimmed)) {
    return {
      expId, expIndex, bulletIndex,
      text: displayText, fullText: trimmed,
      type: 'no-metric',
      message: 'No metric — add a number, %, $, or time (e.g. "reduced by 40%")',
    };
  }

  return null;
}

/**
 * Analyze all bullets across every experience entry.
 * Returns one BulletIssue per failing bullet (at most one issue per bullet,
 * weak-verb taking priority over passive-voice over no-metric).
 */
export function analyzeAllBullets(experience: ResumeExperience[]): BulletIssue[] {
  const issues: BulletIssue[] = [];
  experience.forEach((exp, expIndex) => {
    const lines = (exp.description || '').split('\n');
    lines.forEach((line, bulletIndex) => {
      const issue = analyzeBullet(line, exp.id, expIndex, bulletIndex);
      if (issue) issues.push(issue);
    });
  });
  return issues;
}

/** Count issues grouped by type — useful for summary stats. */
export function summarizeIssues(issues: BulletIssue[]): Record<BulletIssue['type'], number> {
  return issues.reduce(
    (acc, { type }) => ({ ...acc, [type]: (acc[type] ?? 0) + 1 }),
    {} as Record<BulletIssue['type'], number>,
  );
}
