'use client';

/**
 * Async ATS score hook — calls the Python semantic scorer via the Next.js proxy.
 *
 * Strategy:
 *   1. Debounce inputs (600 ms) so the API isn't hammered on every keystroke.
 *   2. Call /api/ats-score (Next.js proxy → Python FastAPI microservice).
 *   3. If the service is unavailable (503/502/network error), silently fall back
 *      to the existing synchronous client-side scoring in lib/scoring.ts.
 *   4. Abort in-flight requests on input change or component unmount.
 *
 * The returned `score` shape is ATSScore — identical to what ATSScoreWidget
 * already consumes, so swapping the data source requires no widget changes.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ATSScore, ResumeData } from '@/lib/types';
import { calculateScore, mapResumeDataToParsedResume, parseJD } from '@/lib/scoring';

interface UseAtsScoreResult {
  score: ATSScore | null;
  isLoading: boolean;
  /** true while the Python service was unavailable and the fallback was used */
  usingFallback: boolean;
}

const DEBOUNCE_MS = 600;

export function useAtsScore(data: ResumeData, jdText: string): UseAtsScoreResult {
  const [score, setScore] = useState<ATSScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  const abortRef   = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable reference to the latest data/jdText so the debounced callback
  // always reads the current value without being re-created on every render.
  const dataRef  = useRef(data);
  const jdRef    = useRef(jdText);
  dataRef.current = data;
  jdRef.current  = jdText;

  const runScore = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);

    try {
      const res = await fetch('/api/ats-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: dataRef.current, jdText: jdRef.current }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`scorer ${res.status}`);

      const result = await res.json() as ATSScore;
      setScore(result);
      setUsingFallback(false);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;

      // Python service unavailable — fall back to synchronous client-side scoring
      const parsedResume = mapResumeDataToParsedResume(dataRef.current);
      const jd = parseJD(jdRef.current);
      setScore(calculateScore(parsedResume, jd));
      setUsingFallback(true);
    } finally {
      setIsLoading(false);
    }
  }, []); // no deps — reads data via refs

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(runScore, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, [data, jdText, runScore]);

  return { score, isLoading, usingFallback };
}
