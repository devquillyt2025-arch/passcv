'use client';

import { useResumeStore } from '@/lib/store/useResumeStore';
import { useUIStore } from '@/lib/store/useUIStore';
import { useAiRewrite } from '@/hooks/useAiRewrite';
import { Sparkles, Loader2, Plus, RotateCcw, Square } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const MAX_CHARS = 400;

export default function SummaryStep({ headless = false }: { headless?: boolean }) {
  const { summary, experience, skills, contact } = useResumeStore((state) => state.data);
  const updateSummary = useResumeStore((state) => state.updateSummary);
  const jdText = useUIStore((s) => s.jdText);

  const [keywords, setKeywords] = useState<string[]>([]);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);

  const textareaRef   = useRef<HTMLTextAreaElement>(null);
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isLoading, isStreaming, canRevert, error, rewrite, revert, abort } = useAiRewrite();
  const isBusy = isLoading || isStreaming;

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    if (textareaRef.current) autoResize(textareaRef.current);
  }, [summary]);

  useEffect(() => {
    return () => { if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current); };
  }, []);

  // ── Keyword suggestions (unchanged) ──
  const scheduleKeywordFetch = (text: string) => {
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    if (text.length < 25) { setKeywords([]); return; }
    fetchTimerRef.current = setTimeout(() => fetchKeywords(text), 1800);
  };

  const fetchKeywords = async (summaryText: string) => {
    setIsLoadingKeywords(true);
    try {
      const res = await fetch('/api/builder/suggest-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: summaryText, jobTitle: contact.jobTitle, skills, experience }),
      });
      const data = await res.json() as { keywords?: string[] };
      if (data.keywords) {
        const lower = summaryText.toLowerCase();
        setKeywords(data.keywords.filter((kw) => !lower.includes(kw.toLowerCase())));
      }
    } catch { /* non-critical */ } finally {
      setIsLoadingKeywords(false);
    }
  };

  const handleChange = (value: string) => {
    if (value.length > MAX_CHARS) return;
    updateSummary(value);
    scheduleKeywordFetch(value);
  };

  const addKeyword = (kw: string) => {
    const sep = summary.length > 0 && !summary.endsWith(' ') ? ' ' : '';
    const next = summary + sep + kw;
    if (next.length <= MAX_CHARS) {
      updateSummary(next);
      setKeywords((prev) => prev.filter((k) => k !== kw));
    }
  };

  // ── AI Rewrite ──
  const handleRewrite = () => {
    const context = [
      contact.jobTitle   && `Role: ${contact.jobTitle}`,
      skills.length > 0  && `Skills: ${skills.slice(0, 8).map(s => s.name).join(', ')}`,
      experience.length > 0 && `Experience: ${experience.slice(0, 2).map(e => `${e.position} at ${e.company}`).join('; ')}`,
    ].filter(Boolean).join('\n');

    rewrite(
      summary,
      jdText,
      'summary',
      (text) => updateSummary(text.slice(0, MAX_CHARS)),
      context,
    );
    setKeywords([]);
  };

  const remaining   = MAX_CHARS - summary.length;
  const isNearLimit = remaining <= 40;
  const isAtLimit   = remaining <= 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        {!headless && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Professional Summary</h2>
            <p className="text-sm text-gray-500 mt-1">
              Write a short summary highlighting your key achievements and skills.
            </p>
          </div>
        )}

        <div className={`flex items-center gap-2 ${headless ? 'ml-auto' : ''}`}>
          {/* Revert — visible for 8s after a successful rewrite */}
          {canRevert && (
            <button
              onClick={revert}
              className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Revert
            </button>
          )}

          {/* Stop — only during streaming */}
          {isStreaming && (
            <button
              onClick={abort}
              className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Square className="w-3 h-3 fill-current" />
              Stop
            </button>
          )}

          {/* Main rewrite button */}
          <button
            onClick={isBusy ? undefined : handleRewrite}
            disabled={isBusy}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading   ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
             isStreaming  ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                           <Sparkles className="w-3.5 h-3.5" />}
            {isLoading  ? 'Preparing…' : isStreaming ? 'Writing…' : 'AI Rewrite'}
          </button>
        </div>
      </div>

      <div>
        <div className={`relative rounded-lg border transition-colors ${isStreaming ? 'border-indigo-400 ring-1 ring-indigo-200' : 'border-gray-300'}`}>
          <textarea
            ref={textareaRef}
            value={summary}
            onChange={(e) => handleChange(e.target.value)}
            onInput={(e) => autoResize(e.currentTarget)}
            disabled={isBusy}
            placeholder="e.g. Results-driven Software Engineer with 5+ years of experience building scalable web applications…"
            rows={3}
            className="w-full rounded-lg px-4 py-2 text-sm text-gray-900 bg-white outline-none resize-none overflow-hidden disabled:bg-gray-50 disabled:text-gray-500"
          />
          {/* Streaming indicator */}
          {isStreaming && (
            <span className="absolute bottom-2 right-2 w-1.5 h-4 bg-indigo-500 rounded-sm animate-pulse" />
          )}
        </div>

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5">
            {isLoadingKeywords && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Loader2 className="w-3 h-3 animate-spin" /> Analysing keywords…
              </span>
            )}
            {error && (
              <span className="text-xs text-red-500">{error}</span>
            )}
          </div>
          <p className={`text-xs ${isAtLimit ? 'text-red-500 font-medium' : isNearLimit ? 'text-amber-500' : 'text-gray-400'}`}>
            {summary.length} / {MAX_CHARS}
          </p>
        </div>

        {keywords.length > 0 && !isBusy && (
          <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100 space-y-2">
            <p className="text-xs font-semibold text-indigo-700">
              AI Suggestions — click to add missing keywords:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((kw) => {
                const wouldExceed = summary.length + kw.length + 1 > MAX_CHARS;
                return (
                  <button
                    key={kw}
                    onClick={() => addKeyword(kw)}
                    disabled={wouldExceed}
                    title={wouldExceed ? 'Would exceed 400 character limit' : `Add "${kw}"`}
                    className="inline-flex items-center gap-1 text-xs bg-white text-indigo-700 border border-indigo-300 rounded-full px-2.5 py-0.5 font-medium hover:bg-indigo-100 hover:border-indigo-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3 h-3" />
                    {kw}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
