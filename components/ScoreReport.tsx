'use client';

import { ATSScore } from '@/lib/types';
import clsx from 'clsx';

const NOISE_WORDS = new Set([
  'develop', 'design', 'implement', 'utilize', 'leverage',
  'contribute', 'about', 'role', 'gen', 'welcome',
]);

function filterMissingKeywords(keywords: string[]): string[] {
  return keywords.filter(kw => {
    const w = kw.toLowerCase().trim();
    return w.length >= 5 && !NOISE_WORDS.has(w);
  });
}

interface Props {
  score: ATSScore;
  onRewrite: () => void;
  rewriting?: boolean;
}

const scoreColor = (val: number, max: number) => {
  const pct = val / max;
  if (pct >= 0.75) return 'text-green-600';
  if (pct >= 0.5)  return 'text-amber-500';
  return 'text-red-500';
};

const barColor = (val: number, max: number) => {
  const pct = val / max;
  if (pct >= 0.75) return 'bg-green-500';
  if (pct >= 0.5)  return 'bg-amber-400';
  return 'bg-red-400';
};

function ScoreGauge({ value }: { value: number }) {
  const color = value >= 75 ? '#22c55e' : value >= 50 ? '#f59e0b' : '#ef4444';
  const label = value >= 75 ? 'Good' : value >= 50 ? 'Needs work' : 'Low match';
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
        />
        <text x="70" y="68" textAnchor="middle" fontSize="28" fontWeight="700" fill={color}>{value}</text>
        <text x="70" y="86" textAnchor="middle" fontSize="11" fill="#6b7280">/100</text>
      </svg>
      <span className="text-sm font-medium" style={{ color }}>{label}</span>
    </div>
  );
}

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-sm text-gray-600">{label}</span>
      <div className="flex-1 rounded-full bg-gray-200 h-2.5 overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all', barColor(value, max))}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className={clsx('w-14 text-right text-sm font-semibold tabular-nums', scoreColor(value, max))}>
        {value}/{max}
      </span>
    </div>
  );
}

export default function ScoreReport({ score, onRewrite, rewriting }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-900 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">ATS Score Report</h2>
        <p className="text-indigo-300 text-sm mt-0.5">
          Based on keyword match, formatting, Naukri-specific rules & content quality
        </p>
      </div>

      <div className="p-6 grid gap-6 sm:grid-cols-[auto_1fr]">
        {/* Gauge */}
        <div className="flex justify-center sm:justify-start">
          <ScoreGauge value={score.total} />
        </div>

        {/* Breakdown bars */}
        <div className="flex flex-col gap-3 justify-center">
          <BarRow label="Keyword match"    value={score.breakdown.keyword}    max={40} />
          <BarRow label="Formatting"       value={score.breakdown.formatting} max={20} />
          <BarRow label="Naukri-specific"  value={score.breakdown.naukri}     max={20} />
          <BarRow label="Content quality"  value={score.breakdown.content}    max={20} />
        </div>
      </div>

      {/* Top fixes */}
      {score.topFixes.length > 0 && (
        <div className="border-t border-gray-100 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Top fixes to improve your score</h3>
          <ul className="space-y-2">
            {score.topFixes.map((fix, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="mt-0.5 shrink-0 text-red-500">✗</span>
                <span>{fix}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing keywords */}
      {(() => {
        const filtered = filterMissingKeywords(score.missingKeywords);
        if (!filtered.length) return null;
        return (
          <div className="border-t border-gray-100 px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              Missing keywords ({filtered.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {filtered.map((kw, i) => (
                <span key={i} className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 border border-red-100">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Matched keywords */}
      {score.matchedKeywords.length > 0 && (
        <div className="border-t border-gray-100 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">
            Matched keywords ({score.matchedKeywords.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {score.matchedKeywords.map((kw, i) => (
              <span key={i} className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 border border-green-100">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Estimated post-rewrite score callout */}
      {(() => {
        const lo = Math.min(85, Math.max(65, score.total + 20));
        const hi = Math.min(92, Math.max(72, score.total + 28));
        return (
          <div className="border-t border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 pl-4 pr-5 py-3 border-l-4 border-l-green-500">
              <span className="text-green-600 text-lg">↑</span>
              <p className="text-sm text-green-800">
                <span className="font-semibold">After AI rewrite, your estimated score: {lo}–{hi}/100</span>
                <span className="text-green-700 ml-2 font-normal">Claude rewrites every section using exact JD keywords.</span>
              </p>
            </div>
          </div>
        );
      })()}

      {/* CTA */}
      <div className="border-t border-gray-100 bg-gray-50 px-6 py-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">Fix all of this automatically</p>
          <p className="text-sm text-gray-500 mt-0.5">
            Claude rewrites every section of your resume for this exact JD
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={onRewrite}
            disabled={rewriting}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm"
          >
            {rewriting ? 'Rewriting…' : 'Rewrite for ₹49'}
          </button>
          <button
            onClick={onRewrite}
            disabled={rewriting}
            className="rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-60 transition-colors"
          >
            Pro ₹299/mo
          </button>
        </div>
      </div>
    </div>
  );
}
