'use client';

/**
 * Granular Zustand selectors using useShallow.
 *
 * WHY: `useResumeStore(state => state.data)` subscribes to the entire data
 * object and re-renders the component on ANY change — even when only an
 * unrelated field changed (e.g. contact update triggers a re-render in a
 * component that only cares about experience).
 *
 * `useShallow` performs a shallow key-by-key comparison, so components that
 * select { experience, skills } won't re-render if only contact changed.
 *
 * USAGE:
 *   import { useHealthSelectors } from '@/lib/store/selectors';
 *   const { experience, skills, projects, certifications } = useHealthSelectors();
 */

import { useShallow } from 'zustand/shallow';
import { useResumeStore } from './useResumeStore';

// ── Resume Health widget — needs section counts only ──────────────────────────
export function useHealthSelectors() {
  return useResumeStore(
    useShallow((s) => ({
      experience:     s.data.experience,
      skills:         s.data.skills,
      projects:       s.data.projects,
      certifications: s.data.certifications,
      education:      s.data.education,
      summary:        s.data.summary,
      contact:        s.data.contact,
    })),
  );
}

// ── ATS widget — needs full data + store-level JD via UIStore ─────────────────
// (the widget reads data here; jdText comes from useUIStore)
export function useAtsSelectors() {
  return useResumeStore(useShallow((s) => ({ data: s.data })));
}

// ── Resume Stats widget — needs full data for word-count / exp calculation ────
// This intentionally selects the whole data object because useResumeStats
// needs every field; useDeferredValue inside that hook handles the perf.
export function useStatsData() {
  return useResumeStore((s) => s.data);
}
