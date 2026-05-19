/**
 * Single source of truth for all completeness scoring weights.
 *
 * Both ResumeHealthWidget (completeness bar) and the "Next Best Action"
 * progression engine read from this file. Changing a value here
 * automatically updates impact hints, the progress bar, and section ordering.
 *
 * Max total = 100 pts.
 */

// ── Raw weight config (used by the scoring algorithm) ────────────────────────

export const COMPLETENESS_WEIGHTS = {
  contact: { firstName: 5, email: 5, phone: 5, city: 5 }, // 20
  summary: 10,
  experience: { twoPlus: 25, onePlus: 15 },
  skills:     { eightPlus: 15, fivePlus: 10, onePlus: 5 },
  education:  15,
  projects:   10,
  certifications: 5,
} as const;

// ── Section impact descriptors (used by the progression engine) ───────────────

export interface SectionImpact {
  /** Matches the EditorPanel section ID and requestSectionFocus parameter */
  id: string;
  label: string;
  /** Max points this section can contribute when fully completed */
  fullPoints: number;
  /** Minimum item count considered "good enough" */
  goodCount: number;
  /**
   * Points awarded at an intermediate count (e.g. 1 experience entry = 15 pts
   * even though 2+ = 25 pts). Absence means full or nothing.
   */
  partialPoints?: number;
  /** Intermediate count that earns partialPoints */
  partialCount?: number;
}

export const SECTION_IMPACTS: SectionImpact[] = [
  {
    id: 'experience', label: 'Work Experience',
    fullPoints: 25, goodCount: 2,
    partialPoints: 15, partialCount: 1,
  },
  {
    id: 'skills', label: 'Skills',
    fullPoints: 15, goodCount: 8,
    partialPoints: 10, partialCount: 5,
  },
  {
    id: 'education', label: 'Education',
    fullPoints: 15, goodCount: 1,
  },
  {
    id: 'projects', label: 'Projects',
    fullPoints: 10, goodCount: 1,
  },
  {
    id: 'certifications', label: 'Certifications',
    fullPoints: 5, goodCount: 1,
  },
];

// ── Derived: compute the potential gain for one section given its current count ──

export function computeGain(impact: SectionImpact, currentCount: number): number {
  const currentPts =
    currentCount >= impact.goodCount
      ? impact.fullPoints
      : impact.partialCount !== undefined && currentCount >= impact.partialCount
      ? (impact.partialPoints ?? 0)
      : 0;
  return impact.fullPoints - currentPts;
}
