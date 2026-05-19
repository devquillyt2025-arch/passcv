'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Target, AlertCircle, CheckCircle2, Zap,
  ChevronDown, ChevronUp, Loader2, Copy, Check, Plus,
} from 'lucide-react';
import { useAtsScoreQuery } from '@/hooks/useAtsScoreQuery';
import { useAtsSelectors } from '@/lib/store/selectors';
import { useResumeStore } from '@/lib/store/useResumeStore';
import type { ATSScore, ResumeSkill } from '@/lib/types';

interface ATSScoreWidgetProps {
  className?: string;
  jdText: string;
  onJdChange: (v: string) => void;
}

// Classify a fix as a "quick win" — something the user can do in <60 seconds
function isQuickWin(fix: string): boolean {
  return /missing|notice|location|contact|email|phone|add\s+(your|a\s+)/i.test(fix);
}

// ── Shimmer skeleton ──────────────────────────────────────────────────────────

function Shimmer({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded animate-pulse ${className ?? ''}`} />;
}

function ScoreSkeleton() {
  return (
    <>
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 shrink-0">
        <Shimmer className="w-14 h-14 rounded-full shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Shimmer className="h-3.5 w-20" />
          <Shimmer className="h-2.5 w-32" />
        </div>
      </div>
      <div className="px-4 pb-3 shrink-0">
        <Shimmer className="h-14 w-full rounded-lg" />
      </div>
      {/* Breakdown bars skeleton */}
      <div className="px-4 pb-3 shrink-0 space-y-2">
        <Shimmer className="h-2.5 w-24" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2 h-6">
            <Shimmer className="h-2.5 w-[4.5rem] shrink-0" />
            <Shimmer className="flex-1 h-1" />
            <Shimmer className="w-8 h-2.5 shrink-0" />
          </div>
        ))}
      </div>
    </>
  );
}

// ── Missing keyword pill ──────────────────────────────────────────────────────

function KeywordPill({
  keyword,
  alreadyAdded,
  onAddSkill,
}: {
  keyword: string;
  alreadyAdded: boolean;
  onAddSkill: (kw: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(keyword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard permission denied — fail silently */
    }
  };

  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] bg-white border border-amber-200 text-amber-800 rounded-full pl-2 pr-0.5 py-0.5 font-medium">
      {keyword}
      {/* Copy to clipboard */}
      <button
        onClick={handleCopy}
        title={copied ? 'Copied!' : 'Copy to clipboard'}
        className="ml-0.5 p-0.5 rounded-full hover:bg-amber-100 transition-colors shrink-0"
      >
        {copied
          ? <Check className="w-2.5 h-2.5 text-green-600" />
          : <Copy className="w-2.5 h-2.5 text-amber-500" />}
      </button>
      {/* Add to Skills */}
      {!alreadyAdded && (
        <button
          onClick={(e) => { e.stopPropagation(); onAddSkill(keyword); }}
          title={`Add "${keyword}" to Skills`}
          className="p-0.5 rounded-full hover:bg-indigo-100 transition-colors shrink-0"
        >
          <Plus className="w-2.5 h-2.5 text-indigo-500" />
        </button>
      )}
      {alreadyAdded && (
        <span title="Already in Skills" className="p-0.5">
          <Check className="w-2.5 h-2.5 text-green-500" />
        </span>
      )}
    </span>
  );
}

// ── Populated score content ───────────────────────────────────────────────────

function ScoreContent({
  score,
  isRefreshing,
  jdText,
  onAddSkill,
  existingSkillNames,
}: {
  score: ATSScore;
  isRefreshing: boolean;
  jdText: string;
  onAddSkill: (kw: string) => void;
  existingSkillNames: Set<string>;
}) {
  const [showMoreFixes, setShowMoreFixes] = useState(false);

  const { total, topFixes, breakdown, missingKeywords } = score;

  const quickWin   = topFixes.find(isQuickWin) ?? topFixes[0] ?? null;
  const otherFixes = topFixes.filter((f) => f !== quickWin).slice(0, 4);

  // Top 8 missing keywords to display as actionable pills
  const pillKeywords = jdText.trim() ? (missingKeywords ?? []).slice(0, 8) : [];

  const scoreColor =
    total >= 80 ? 'text-green-700 bg-green-50 border-green-300'
    : total >= 50 ? 'text-amber-700 bg-amber-50 border-amber-300'
    : 'text-red-600 bg-red-50 border-red-300';

  const ringColor =
    total >= 80 ? 'border-green-300' : total >= 50 ? 'border-amber-300' : 'border-red-300';

  return (
    <div className="relative flex-1 flex flex-col min-h-0">

      {/* Refresh overlay — stale data visible, background fetch in progress */}
      {isRefreshing && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-b-xl pointer-events-none">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
        </div>
      )}

      {/* Score ring */}
      <div className="flex items-center gap-4 px-5 pb-5 pt-5 shrink-0">
        <div className={`w-14 h-14 rounded-full border-4 flex flex-col items-center justify-center shrink-0 ${scoreColor} ${ringColor}`}>
          <span className="font-black text-xl leading-none">{total}</span>
          <span className="text-[9px] font-semibold opacity-70 leading-none mt-0.5">/ 100</span>
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 flex items-center gap-1.5 text-sm">
            <Target className="w-4 h-4 text-gray-400 shrink-0" />
            ATS Score
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            {total >= 80 ? 'Strong — keep optimising'
            : total >= 50 ? 'Good — a few fixes will help'
            : 'Needs work — start with Quick Win'}
          </p>
        </div>
      </div>

      {/* Quick Win + missing keyword pills */}
      {(quickWin || pillKeywords.length > 0) && (
        <div className="px-5 pb-4 shrink-0">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5 space-y-2.5">
            {quickWin && (
              <>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Quick Win</span>
                </div>
                <p className="text-xs leading-relaxed text-emerald-800">{quickWin}</p>
              </>
            )}

            {/* ── Missing keyword pills ── */}
            {pillKeywords.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-emerald-700 mb-1.5">
                  Add these JD keywords to your resume:
                </p>
                <div className="flex flex-wrap gap-1">
                  {pillKeywords.map((kw) => (
                    <KeywordPill
                      key={kw}
                      keyword={kw}
                      alreadyAdded={existingSkillNames.has(kw.toLowerCase())}
                      onAddSkill={onAddSkill}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Score breakdown — per-bar skeletons while refreshing are handled by the overlay */}
      <div className="px-5 pb-4 pt-1 shrink-0">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Score Breakdown</p>
        <div className="space-y-3">
          {([
            { label: 'Keywords',   score: breakdown.keyword,    max: 40, color: 'bg-indigo-400' },
            { label: 'Formatting', score: breakdown.formatting, max: 20, color: 'bg-emerald-400' },
            { label: 'Content',    score: breakdown.content,    max: 20, color: 'bg-violet-400' },
            { label: 'Recruiter',  score: breakdown.naukri,     max: 20, color: 'bg-rose-400' },
          ] as const).map(({ label, score: s, max, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-[4.9rem] shrink-0 text-[11px] leading-relaxed text-gray-500">{label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-1 overflow-hidden">
                <div
                  className={`h-1 rounded-full transition-all duration-500 ${color}`}
                  style={{ width: `${(s / max) * 100}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-[11px] font-semibold tabular-nums leading-relaxed text-gray-700">
                {s}/{max}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* More fixes */}
      {otherFixes.length > 0 && (
        <div className="px-5 pb-5 shrink-0">
          <button
            onClick={() => setShowMoreFixes((v) => !v)}
            className="flex items-center gap-1 text-[10px] font-bold text-amber-600 hover:text-amber-700 uppercase tracking-wide transition-colors mb-1.5"
          >
            <AlertCircle className="w-3 h-3" />
            {otherFixes.length} more fix{otherFixes.length > 1 ? 'es' : ''}
            {showMoreFixes ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
          </button>
          {showMoreFixes && (
            <ul className="space-y-1">
              {otherFixes.map((fix, i) => (
                <li key={i} className="rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-1.5 text-xs leading-relaxed text-gray-600">
                  {fix}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* All-clear */}
      {!quickWin && otherFixes.length === 0 && pillKeywords.length === 0 && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="text-xs font-medium">No major issues found.</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Widget shell ──────────────────────────────────────────────────────────────

export default function ATSScoreWidget({ className, jdText, onJdChange }: ATSScoreWidgetProps) {
  const { data }    = useAtsSelectors();
  const setSkills   = useResumeStore((s) => s.setSkills);
  const currentSkills = useResumeStore((s) => s.data.skills);

  const { score, isLoadingScore, isRefreshingScore } = useAtsScoreQuery(data, jdText);

  // Pre-compute a lowercase Set of existing skill names for O(1) lookup
  const existingSkillNames = useMemo(
    () => new Set(currentSkills.map((s) => s.name.toLowerCase())),
    [currentSkills],
  );

  // "Add to Skills" action — deduplicates before inserting
  const handleAddSkill = useCallback((keyword: string) => {
    if (existingSkillNames.has(keyword.toLowerCase())) return;
    const newSkill: ResumeSkill = {
      id:    crypto.randomUUID(),
      name:  keyword,
      level: '',
    };
    setSkills([...currentSkills, newSkill]);
  }, [currentSkills, setSkills, existingSkillNames]);

  return (
    <div className={`${className ?? 'w-72'} flex flex-col bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden leading-relaxed hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200`}>

      {/*
        JD textarea — always interactive, outside the score boundary.
        The user can keep editing even while the ATS score is recomputing.
      */}
      <div className="px-5 pt-5 pb-4 shrink-0">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
          Target Job Description{' '}
          <span className="normal-case font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          value={jdText}
          onChange={(e) => onJdChange(e.target.value)}
          placeholder="Paste job description to score against specific keywords…"
          rows={2}
          className="ats-jd-textarea w-full resize-none overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 outline-none transition-colors focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-200"
        />
      </div>

      {/* Score region: skeleton on first load, overlay on re-fetch */}
      {isLoadingScore ? (
        <ScoreSkeleton />
      ) : score ? (
        <ScoreContent
          score={score}
          isRefreshing={isRefreshingScore}
          jdText={jdText}
          onAddSkill={handleAddSkill}
          existingSkillNames={existingSkillNames}
        />
      ) : null}
    </div>
  );
}
