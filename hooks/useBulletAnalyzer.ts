'use client';

/**
 * Debounced bullet-quality analyzer.
 *
 * Wraps the pure `analyzeAllBullets` function in `useDeferredValue` so the
 * regex scan is deferred to React idle frames — the previous result stays
 * visible while the user is actively typing, preventing jank.
 *
 * Architecture note: the heavy logic lives in lib/bulletAnalyzer.ts (pure,
 * unit-testable). This hook is a thin React adapter around it.
 */
import { useDeferredValue, useMemo } from 'react';
import type { ResumeExperience } from '@/lib/types';
import { analyzeAllBullets, summarizeIssues, type BulletIssue } from '@/lib/bulletAnalyzer';

export type { BulletIssue };

export interface BulletAnalysis {
  issues: BulletIssue[];
  /** Counts by issue type — { 'weak-verb': 2, 'no-metric': 5, ... } */
  summary: Record<BulletIssue['type'], number>;
  /** true while React is deferring to avoid blocking the typing thread */
  isPending: boolean;
}

export function useBulletAnalyzer(experience: ResumeExperience[]): BulletAnalysis {
  const deferred  = useDeferredValue(experience);
  const isPending = deferred !== experience;

  const result = useMemo(() => {
    const issues  = analyzeAllBullets(deferred);
    const summary = summarizeIssues(issues);
    return { issues, summary };
  }, [deferred]);

  return { ...result, isPending };
}
