'use client';

/**
 * TanStack Query hook for the ATS scoring pipeline.
 *
 * Strategy
 * ─────────
 * • Both resume data AND jdText are debounced (800 ms) before they enter the
 *   query key.  This prevents a new fetch on every keystroke while the user
 *   is editing — the previous score stays visible (via placeholderData) until
 *   the debounce settles and a fresh fetch completes.
 *
 * • The fetch targets the Next.js proxy at /api/ats-score which forwards to
 *   the Python semantic scorer.  If the service is not configured (503/502),
 *   the queryFn falls back silently to the synchronous client-side scoring
 *   from lib/scoring.ts so the widget is never empty.
 *
 * • staleTime: 30 s — the same resume+JD combination won't be re-fetched
 *   within 30 seconds even if the component re-mounts (e.g. tab switch).
 *
 * • retry: false — we handle all error cases via the client-side fallback;
 *   retrying an unavailable service just adds latency for the user.
 *
 * Returned shape
 * ──────────────
 * { score, isLoadingScore, isRefreshingScore }
 *   isLoadingScore    — true only on the very first fetch (no cached data)
 *                       → show skeleton loaders in the widget
 *   isRefreshingScore — true when cached/placeholder data is stale and a
 *                       background refresh is running
 *                       → show a subtle spinner overlay, keep content visible
 */

import { useEffect, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ATSScore, ResumeData } from '@/lib/types';
import { calculateScore, mapResumeDataToParsedResume, parseJD } from '@/lib/scoring';
import { fetchSemanticMatch } from '@/lib/api/semanticScorer';

const DEBOUNCE_MS = 800;
const STALE_MS    = 30_000;
const GC_MS       = 5 * 60_000;

function clientFallback(data: ResumeData, jdText: string): ATSScore {
  return calculateScore(mapResumeDataToParsedResume(data), parseJD(jdText));
}

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useAtsScoreQuery(data: ResumeData, jdText: string) {
  // Debounce both inputs together so a single fetch fires when editing pauses.
  // They are batched into one object so setState batching keeps them in sync.
  const [debouncedPayload, setDebouncedPayload] = useState({ data, jdText });
  useEffect(() => {
    const t = setTimeout(() => setDebouncedPayload({ data, jdText }), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [data, jdText]);

  const query = useQuery<ATSScore>({
    // The query key includes the full payload so TanStack Query can cache
    // distinct results for different resume + JD combinations automatically.
    queryKey: ['ats-score', debouncedPayload.data, debouncedPayload.jdText],

    queryFn: async ({ signal }) => {
      // fetchSemanticMatch is the single typed boundary to the Python scorer.
      // It returns null on any network/service error (503, timeout, etc.).
      const semantic = await fetchSemanticMatch(
        { resume: debouncedPayload.data, jdText: debouncedPayload.jdText },
        signal,
      );
      // Graceful fallback to synchronous client-side scoring when the Python
      // service is unavailable — the widget is never empty.
      return semantic ?? clientFallback(debouncedPayload.data, debouncedPayload.jdText);
    },

    // Show stale data while a background fetch runs — prevents the skeleton
    // from flashing every time the resume is edited.
    placeholderData: keepPreviousData,

    staleTime:            STALE_MS,
    gcTime:               GC_MS,
    retry:                false, // client-side fallback handles errors
    refetchOnWindowFocus: false,
  });

  return {
    score:              query.data ?? null,
    // First ever load with no cached data — show skeleton
    isLoadingScore:     query.isPending && query.isFetching,
    // Background refresh with stale/placeholder data visible
    isRefreshingScore:  query.isFetching && !query.isPending,
  };
}
