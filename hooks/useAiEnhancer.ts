'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useUIStore } from '@/lib/store/useUIStore';

export interface AiEnhancerPayload {
  rawText: string;
  validationErrors: string[];
  jobTitle: string;
}

interface UseAiEnhancerResult {
  isLoading: boolean;
  isStreaming: boolean;
  canRevert: boolean;
  error: string | null;
  buildPayload: () => AiEnhancerPayload;
  enhance: (
    onUpdate: (text: string) => void,
    overrides?: Partial<AiEnhancerPayload>,
  ) => Promise<void>;
  revert: () => void;
  abort: () => void;
}

const REVERT_WINDOW_MS = 10_000;

export function useAiEnhancer(
  currentText: string,
  validationErrors: string[],
  jobTitle: string,
): UseAiEnhancerResult {
  const jdText = useUIStore(s => s.jdText);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [canRevert, setCanRevert] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const originalTextRef = useRef(currentText);
  const onUpdateRef = useRef<(text: string) => void>(() => {});
  const abortControllerRef = useRef<AbortController | null>(null);
  const revertTimerRef = useRef<number | null>(null);

  useEffect(() => {
    originalTextRef.current = currentText;
  }, [currentText]);

  useEffect(() => {
    return () => {
      if (revertTimerRef.current) window.clearTimeout(revertTimerRef.current);
      abortControllerRef.current?.abort();
    };
  }, []);

  const buildPayload = useCallback(() => {
    return {
      rawText: currentText,
      validationErrors,
      jobTitle,
    };
  }, [currentText, validationErrors, jobTitle]);

  const revert = useCallback(() => {
    onUpdateRef.current(originalTextRef.current);
    setCanRevert(false);
    if (revertTimerRef.current) {
      window.clearTimeout(revertTimerRef.current);
      revertTimerRef.current = null;
    }
  }, []);

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setIsStreaming(false);
  }, []);

  const enhance = useCallback(
    async (
      onUpdate: (text: string) => void,
      overrides: Partial<AiEnhancerPayload> = {},
    ) => {
      if (isLoading || isStreaming) return;

      const payload = {
        rawText: overrides.rawText ?? currentText,
        validationErrors: overrides.validationErrors ?? validationErrors,
        jobTitle: overrides.jobTitle ?? jobTitle,
      };

      originalTextRef.current = payload.rawText;
      onUpdateRef.current = onUpdate;
      setError(null);
      setIsLoading(true);
      setIsStreaming(false);
      setCanRevert(false);

      if (revertTimerRef.current) {
        window.clearTimeout(revertTimerRef.current);
        revertTimerRef.current = null;
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch('/api/builder/rewrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalText: payload.rawText,
            jdText: jdText ?? '',
            sectionType: 'experience',
            context: payload.jobTitle,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(body.error ?? `Server error ${res.status}`);
        }

        if (!res.body) throw new Error('Empty response body');

        setIsLoading(false);
        setIsStreaming(true);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let accumulated = '';

        try {
          outer: while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const jsonPayload = line.slice(6).trim();
              if (jsonPayload === '[DONE]') break outer;
              try {
                const token = JSON.parse(jsonPayload) as string;
                accumulated += token;
                onUpdateRef.current(accumulated);
              } catch { /* skip malformed chunk */ }
            }
          }
        } finally {
          reader.releaseLock();
        }

        setIsStreaming(false);
        setCanRevert(true);
        revertTimerRef.current = window.setTimeout(() => {
          setCanRevert(false);
        }, REVERT_WINDOW_MS);

      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          setIsLoading(false);
          setIsStreaming(false);
          return;
        }
        setError((err as Error).message || 'AI enhancement failed');
        setIsLoading(false);
        setIsStreaming(false);
      }
    },
    [currentText, jobTitle, validationErrors, isLoading, isStreaming],
  );

  return {
    isLoading,
    isStreaming,
    canRevert,
    error,
    buildPayload,
    enhance,
    revert,
    abort,
  };
}
