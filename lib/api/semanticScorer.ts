/**
 * Typed frontend API boundary for the Python semantic ATS scorer.
 *
 * The actual computation (TF-IDF vectors, sentence-transformers cosine
 * similarity, spaCy named-entity extraction) runs in services/ats_scorer.
 * This module is the ONLY place in the frontend that knows the endpoint URL
 * or the request/response shapes — every other module calls this function.
 *
 * To switch from the Next.js proxy to a direct Lambda URL, change ENDPOINT
 * and nothing else changes.
 */
import type { ATSScore, ResumeData } from '@/lib/types';

const ENDPOINT = '/api/ats-score';
const TIMEOUT_MS = 12_000;

export interface SemanticMatchPayload {
  /** Full resume data from the Zustand store — mirrors ResumeData in lib/types.ts */
  resume: ResumeData;
  /** Raw job description text pasted by the user */
  jdText: string;
}

export interface SemanticMatchResult extends ATSScore {
  /**
   * Raw cosine similarity (0–1) between resume and JD embeddings.
   * Provided by the Python backend; absent in the client-side fallback.
   */
  semanticSimilarity?: number;
  /**
   * Skills extracted from the JD by spaCy NER + pattern matching.
   * Used to populate the keyword pill list.
   */
  extractedSkills?: string[];
}

/**
 * Call the Python semantic scoring pipeline via the Next.js proxy.
 *
 * Returns null when:
 *   - ATS_SCORER_URL is not configured (service returns 503)
 *   - The service is unreachable (network error, timeout)
 *   - The response is malformed
 *
 * Callers should fall back to synchronous client-side scoring when null is
 * returned. The `signal` parameter connects to an AbortController so
 * TanStack Query can cancel in-flight requests when the query key changes.
 */
export async function fetchSemanticMatch(
  payload: SemanticMatchPayload,
  signal?: AbortSignal,
): Promise<SemanticMatchResult | null> {
  try {
    const res = await fetch(ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
      signal:  signal ?? AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) return null;
    return res.json() as Promise<SemanticMatchResult>;
  } catch {
    return null;
  }
}
