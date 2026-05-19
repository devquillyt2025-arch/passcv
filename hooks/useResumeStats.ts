'use client';

import { useDeferredValue, useMemo } from 'react';
import type { ResumeData } from '@/lib/types';

export const TARGET_KEYWORDS = [
  'python', 'java', 'javascript', 'typescript', 'react', 'node', 'angular', 'vue',
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'aws', 'azure', 'gcp',
  'docker', 'kubernetes', 'git', 'linux', 'api', 'graphql', 'microservices',
  'agile', 'scrum', 'jira', 'tableau', 'power bi', 'spark', 'kafka',
  'elasticsearch', 'terraform', 'jenkins', 'machine learning', 'deep learning',
  'nlp', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'data analysis',
  'data science', 'etl', 'data warehouse', 'airflow', 'dbt', 'snowflake',
  'bigquery', 'redshift', 'looker', 'salesforce', 'sap', 'excel', 'analytics',
];

export const WEAK_PATTERNS = [
  /^helped\b/i, /^worked\s+(on|with)\b/i, /^worked\b/i, /^assisted\b/i,
  /^supported\b/i, /^participated\b/i, /^involved\b/i, /^contributed\b/i,
  /^responsible for\b/i, /^handled\b/i, /^utilized\b/i, /^made sure\b/i,
];

export interface WeakBullet {
  expId: string;
  expIndex: number;
  text: string;
}

export interface ResumeStatsResult {
  pageCount: number;
  wordCount: number;
  expDisplay: string;
  jobCount: number;
  skillCount: number;
  eduCount: number;
  projCount: number;
  metricCoverage: number | null;
  weakBulletCount: number;
  weakBullets: WeakBullet[];
  keywordDensity: { found: number; total: number };
  /** Actual keyword strings found in the resume — for the drill-down popover */
  matchedKeywords: string[];
  /** Top keywords from the target list that are absent — shown as suggestions */
  missingTopKeywords: string[];
  bulletTotal: number;
  isPending: boolean;
}

function parseYYYYMM(dateStr: string): Date | null {
  if (!dateStr) return null;
  const m = dateStr.match(/^(\d{4})-(\d{2})/);
  if (m) return new Date(parseInt(m[1]), parseInt(m[2]) - 1, 1);
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function useResumeStats(data: ResumeData): ResumeStatsResult {
  // useDeferredValue keeps the UI responsive on fast typing — the previous stats
  // remain visible while React defers the recalculation to an idle frame.
  const deferred = useDeferredValue(data);
  const isPending = deferred !== data;

  const stats = useMemo(() => {
    const experience     = deferred.experience     || [];
    const education      = deferred.education      || [];
    const skills         = deferred.skills         || [];
    const projects       = deferred.projects       || [];
    const certifications = deferred.certifications || [];

    // ── Word count ──
    const textParts: string[] = [];
    if (deferred.summary) textParts.push(deferred.summary);
    experience.forEach(e => { if (e.description) textParts.push(e.description); });
    projects.forEach(p => { if (p.description) textParts.push(p.description); });
    skills.forEach(s => { if (s.name) textParts.push(s.name); });
    const wordCount = textParts.join(' ').split(/\s+/).filter(w => w.length > 0).length;

    // ── Total experience ──
    let totalExpYears = 0;
    const now = new Date();
    experience.forEach(exp => {
      const start = parseYYYYMM(exp.startDate);
      if (!start) return;
      const end = exp.currentlyWorking ? now : (parseYYYYMM(exp.endDate) || now);
      const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (years > 0) totalExpYears += years;
    });

    const expDisplay =
      totalExpYears < 1
        ? totalExpYears > 0 ? '< 1 yr' : '—'
        : `${Math.floor(totalExpYears)} yr${Math.floor(totalExpYears) !== 1 ? 's' : ''}`;

    // ── Page estimate ──
    const sectionCount = [
      deferred.summary ? 1 : 0, experience.length, education.length,
      skills.length > 0 ? 1 : 0, projects.length, certifications.length,
    ].reduce((a, b) => a + b, 0);
    const pageCount = Math.max(1, Math.ceil((wordCount + sectionCount * 20) / 550));

    // ── All bullets with source location ──
    const allBullets: WeakBullet[] = [];
    experience.forEach((exp, expIndex) => {
      (exp.description || '')
        .split('\n')
        .map(b => b.replace(/^[-•*]\s*/, '').trim())
        .filter(b => b.length > 15)
        .forEach(text => allBullets.push({ expId: exp.id, expIndex, text }));
    });

    // ── Metric coverage ──
    const bulletsWithMetrics = allBullets.filter(b => /\d/.test(b.text));
    const metricCoverage = allBullets.length > 0
      ? Math.round((bulletsWithMetrics.length / allBullets.length) * 100)
      : null;

    // ── Weak bullets ──
    const weakBullets = allBullets.filter(b => WEAK_PATTERNS.some(p => p.test(b.text)));

    // ── Keyword density ──
    const resumeText = [
      deferred.summary || '',
      skills.map(s => s.name).join(' '),
      ...experience.map(e => `${e.position} ${e.description}`),
    ].join(' ').toLowerCase();
    const foundKeywords   = TARGET_KEYWORDS.filter(kw =>  resumeText.includes(kw));
    const missingKeywords = TARGET_KEYWORDS.filter(kw => !resumeText.includes(kw));

    return {
      pageCount,
      wordCount,
      expDisplay,
      jobCount:   experience.length,
      skillCount: skills.length,
      eduCount:   education.length,
      projCount:  projects.length,
      metricCoverage,
      weakBulletCount: weakBullets.length,
      weakBullets,
      keywordDensity: { found: foundKeywords.length, total: TARGET_KEYWORDS.length },
      matchedKeywords:    foundKeywords,
      missingTopKeywords: missingKeywords.slice(0, 5),
      bulletTotal: allBullets.length,
    };
  }, [deferred]);

  return { ...stats, isPending };
}
