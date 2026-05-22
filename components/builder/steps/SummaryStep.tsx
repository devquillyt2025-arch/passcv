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

  const [toast, setToast] = useState('');
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleChange = (value: string) => {
    if (value.length > MAX_CHARS) {
      if (summary.length <= MAX_CHARS) {
        setToast('Keep your summary concise — recruiters spend ~7 seconds on a resume.');
      }
      return;
    }
    updateSummary(value);
    scheduleKeywordFetch(value);
  };

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
  const isNearLimit = remaining <= 50;
  const isAtLimit   = remaining <= 10;

  return (
    <div className="space-y-4">
      {!headless && (
        <div className="relative">
          <h2 className="text-lg font-semibold text-gray-900">Professional Summary</h2>
          <p className="text-sm text-gray-500 mt-1">
            Write a short summary highlighting your key achievements and skills.
          </p>
          {toast && (
            <div className="absolute -top-2 right-0 animate-fade-in-down rounded-lg bg-red-500 px-3 py-2 text-xs font-medium text-white shadow-lg">
              {toast}
            </div>
          )}
        </div>
      )}

      {/* Textarea */}
      <div>
        <div className={`relative rounded-[8px] border transition-colors duration-150 ${isStreaming ? 'border-[var(--accent-color)] ring-[3px] ring-[var(--accent-ring)]' : 'border-[#E2E8F0] focus-within:border-[var(--accent-color)] focus-within:ring-[3px] focus-within:ring-[var(--accent-ring)]'}`}>
          <textarea
            ref={textareaRef}
            value={summary}
            onChange={(e) => handleChange(e.target.value)}
            onInput={(e) => autoResize(e.currentTarget)}
            disabled={isBusy}
            placeholder="e.g. Results-driven Software Engineer with 5+ years of experience building scalable web applications…"
            rows={3}
            className="w-full rounded-[8px] px-[14px] py-[10px] text-[14px] text-slate-900 bg-transparent outline-none resize-none overflow-hidden disabled:bg-slate-50 disabled:text-slate-500"
          />
          {isStreaming && (
            <span className="absolute bottom-2.5 right-2.5 w-1.5 h-4 rounded-sm animate-pulse" style={{ backgroundColor: 'var(--accent-color)' }} />
          )}
        </div>

        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1.5">
            {isLoadingKeywords && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Loader2 className="w-3 h-3 animate-spin" /> Analysing keywords…
              </span>
            )}
            {error && <span className="text-xs text-red-500">{error}</span>}
          </div>
          <p className={`text-xs ${isAtLimit ? 'text-red-500 font-medium' : isNearLimit ? 'text-amber-500' : 'text-gray-400'}`}>
            {summary.length} / {MAX_CHARS}
          </p>
        </div>
      </div>

      {/* Keyword suggestions */}
      {keywords.length > 0 && !isBusy && (
        <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 space-y-2">
          <p className="text-xs font-semibold text-indigo-700">AI Suggestions — click to add missing keywords:</p>
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((kw) => {
              const wouldExceed = summary.length + kw.length + 1 > MAX_CHARS;
              return (
                <button
                  key={kw}
                  onClick={() => {
                    const sep = summary.length > 0 && !summary.endsWith(' ') ? ' ' : '';
                    const next = summary + sep + kw;
                    if (next.length <= MAX_CHARS) {
                      updateSummary(next);
                      setKeywords((prev) => prev.filter((k) => k !== kw));
                    }
                  }}
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

      {/* Revert / Stop strip */}
      {(canRevert || isStreaming) && (
        <div className="flex items-center gap-2">
          {canRevert && (
            <button
              onClick={revert}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Revert
            </button>
          )}
          {isStreaming && (
            <button
              onClick={abort}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <Square className="w-3 h-3 fill-current" /> Stop
            </button>
          )}
        </div>
      )}

      {/* ── AI Rewrite CTA ── */}
      <button
        onClick={isBusy ? undefined : handleRewrite}
        disabled={isBusy}
        style={{ backgroundColor: 'var(--accent-color)' }}
        className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg hover:opacity-90 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
      >
        <span className="flex items-center justify-center gap-2">
          {isLoading   ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparing…</> :
           isStreaming  ? <><Loader2 className="w-4 h-4 animate-spin" /> Writing…</> :
                         <><Sparkles className="w-4 h-4" /> Rewrite with AI</>}
        </span>
      </button>
    </div>
  );
}
