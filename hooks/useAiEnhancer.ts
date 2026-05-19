'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

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

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function chunkString(value: string, size: number) {
  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += size) {
    chunks.push(value.slice(i, i + size));
  }
  return chunks;
}

function createMockEnhancedText(rawText: string): string {
  const bullets = rawText
    .split('\n')
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);

  if (bullets.length === 0) {
    return rawText;
  }

  const strongVerbs = ['Led', 'Designed', 'Delivered', 'Drove', 'Spearheaded', 'Optimized'];
  return bullets
    .map((bullet, index) => {
      const verb = strongVerbs[index % strongVerbs.length];
      const cleaned = bullet.replace(/^(helped|worked\s+(on|with)|worked|assisted|supported|participated|involved|contributed|responsible for|handled|utilized|made sure)\b/i, '').trim();
      const textWithMetric = /\d/.test(cleaned)
        ? cleaned
        : `${cleaned} with a ${15 + index * 10}% improvement in efficiency`;
      return `- ${verb} ${textWithMetric}`;
    })
    .join('\n');
}

export function useAiEnhancer(
  currentText: string,
  validationErrors: string[],
  jobTitle: string,
): UseAiEnhancerResult {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [canRevert, setCanRevert] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const originalTextRef = useRef(currentText);
  const onUpdateRef = useRef<(text: string) => void>(() => {});
  const abortingRef = useRef(false);
  const revertTimerRef = useRef<number | null>(null);

  useEffect(() => {
    originalTextRef.current = currentText;
  }, [currentText]);

  useEffect(() => {
    return () => {
      if (revertTimerRef.current) window.clearTimeout(revertTimerRef.current);
      abortingRef.current = true;
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
    abortingRef.current = true;
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
      abortingRef.current = false;
      setError(null);
      setIsLoading(true);
      setIsStreaming(false);
      setCanRevert(false);

      try {
        // Mock network delay and payload preparation.
        await sleep(500);
        if (abortingRef.current) throw new Error('Aborted');

        const enhancedText = createMockEnhancedText(payload.rawText);

        setIsLoading(false);
        setIsStreaming(true);

        const chunks = chunkString(enhancedText, 12);
        let accumulated = '';

        for (const chunk of chunks) {
          await sleep(50);
          if (abortingRef.current) throw new Error('Aborted');
          accumulated += chunk;
          onUpdateRef.current(accumulated);
        }

        setIsStreaming(false);
        setCanRevert(true);
        revertTimerRef.current = window.setTimeout(() => {
          setCanRevert(false);
        }, REVERT_WINDOW_MS);

      } catch (err) {
        if ((err as Error).message === 'Aborted') {
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
