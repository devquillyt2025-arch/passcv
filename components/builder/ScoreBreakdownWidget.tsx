'use client';

import { useResumeStore } from '@/lib/store/useResumeStore';
import { calculateScore, mapResumeDataToParsedResume, parseJD } from '@/lib/scoring';
import { useMemo } from 'react';

const CATEGORIES = [
  {
    key: 'keyword' as const,
    label: 'Keyword Match',
    max: 40,
    description: 'Job-relevant terms found in your resume',
    color: { bar: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
  },
  {
    key: 'formatting' as const,
    label: 'Formatting',
    max: 20,
    description: 'ATS-safe layout — no tables or images',
    color: { bar: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  },
  {
    key: 'content' as const,
    label: 'Content Quality',
    max: 20,
    description: 'Quantified achievements & action verbs',
    color: { bar: 'bg-violet-500', light: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-100' },
  },
  {
    key: 'naukri' as const,
    label: 'Recruiter Checks',
    max: 20,
    description: 'Location, contact info & title alignment',
    color: { bar: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
  },
] as const;

interface Props {
  jdText: string;
}

export default function ScoreBreakdownWidget({ jdText }: Props) {
  const data = useResumeStore((state) => state.data);

  const { total, breakdown } = useMemo(() => {
    const parsedResume = mapResumeDataToParsedResume(data);
    const jd = parseJD(jdText);
    return calculateScore(parsedResume, jd);
  }, [data, jdText]);

  const totalColor =
    total >= 80 ? 'text-green-700 bg-green-50 border-green-200'
    : total >= 50 ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-red-600 bg-red-50 border-red-200';

  return (
    <div className="w-full max-w-[680px] overflow-hidden rounded-xl border border-gray-200 bg-white leading-relaxed shadow-lg">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Score Breakdown</h3>
        <span className={`text-sm font-bold px-3 py-0.5 rounded-full border ${totalColor}`}>
          {total} / 100
        </span>
      </div>

      {/* ── Four category tiles ── */}
      <div className="grid grid-cols-1 divide-y divide-gray-100 gap-y-3 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-1 xl:divide-x-0 xl:divide-y">
        {CATEGORIES.map(({ key, label, max, description, color }) => {
          const score = breakdown[key];
          const pct = Math.round((score / max) * 100);

          return (
            <div key={key} className="flex flex-col gap-3 px-4 py-4">
              {/* Label + score */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold leading-relaxed text-gray-800">{label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-400">{description}</p>
                </div>
                <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-md border ${color.light} ${color.text} ${color.border}`}>
                  {score}/{max}
                </span>
              </div>

              {/* Progress bar + pct */}
              <div className="space-y-1">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${color.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 text-right">{pct}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
