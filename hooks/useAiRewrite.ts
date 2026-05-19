'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface AiRewriteState {
  isLoading: boolean;    // request sent, awaiting first byte
  isStreaming: boolean;  // receiving stream chunks
  canRevert: boolean;    // revert window open after completion
  error: string | null;
}

const INITIAL_STATE: AiRewriteState = {
  isLoading: false,
  isStreaming: false,
  canRevert: false,
  error: null,
};

const REVERT_WINDOW_MS = 8_000;

export function useAiRewrite() {
  const [state, setState] = useState<AiRewriteState>(INITIAL_STATE);

  // Stable refs — never stale inside async closures
  const originalTextRef = useRef<string>('');
  const onUpdateRef     = useRef<(text: string) => void>(() => {});
  const abortRef        = useRef<AbortController | null>(null);
  const revertTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Abort any in-flight request and clear revert timer on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (revertTimerRef.current) clearTimeout(revertTimerRef.current);
    };
  }, []);

  const rewrite = useCallback(async (
    originalText: string,
    jdText: string,
    sectionType: 'summary' | 'experience',
    onUpdate: (text: string) => void,
    context?: string,
  ) => {
    // Cancel any previous in-flight request
    abortRef.current?.abort();
    if (revertTimerRef.current) clearTimeout(revertTimerRef.current);

    originalTextRef.current = originalText;
    onUpdateRef.current = onUpdate;

    const controller = new AbortController();
    abortRef.current = controller;

    setState({ isLoading: true, isStreaming: false, canRevert: false, error: null });

    try {
      const res = await fetch('/api/builder/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalText, jdText, sectionType, context }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `Server error ${res.status}`);
      }

      if (!res.body) throw new Error('Empty response body');

      setState({ isLoading: false, isStreaming: true, canRevert: false, error: null });

      // ── SSE parsing ──────────────────────────────────────────────────────────
      // Chunks may arrive mid-line; buffer ensures we only parse complete lines.
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer      = '';
      let accumulated = '';

      try {
        outer: while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Split on newlines; last element may be an incomplete line
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6).trim();
            if (payload === '[DONE]') break outer;
            try {
              // Each token is JSON-encoded to safely transport newlines/quotes
              const token = JSON.parse(payload) as string;
              accumulated += token;
              onUpdateRef.current(accumulated);
            } catch { /* skip malformed chunk */ }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Open revert window
      setState({ isLoading: false, isStreaming: false, canRevert: true, error: null });
      revertTimerRef.current = setTimeout(() => {
        setState(s => ({ ...s, canRevert: false }));
      }, REVERT_WINDOW_MS);

    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        // Intentional abort (unmount or user stop) — reset quietly
        setState(INITIAL_STATE);
        return;
      }
      setState({
        isLoading: false,
        isStreaming: false,
        canRevert: false,
        error: (err as Error).message || 'Rewrite failed',
      });
    }
  }, []);

  const revert = useCallback(() => {
    onUpdateRef.current(originalTextRef.current);
    if (revertTimerRef.current) clearTimeout(revertTimerRef.current);
    setState(s => ({ ...s, canRevert: false }));
  }, []);

  // Stop mid-stream without reverting
  const abort = useCallback(() => {
    abortRef.current?.abort();
    setState(INITIAL_STATE);
  }, []);

  return { ...state, rewrite, revert, abort };
}
