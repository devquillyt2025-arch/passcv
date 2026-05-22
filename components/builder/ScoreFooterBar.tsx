'use client';

import { useState, useRef } from 'react';
import type { ATSScore } from '@/lib/types';
import PortalPopover from '@/components/ui/PortalPopover';

interface ScoreFooterBarProps {
  score: ATSScore;
}

interface Metric {
  id: string;
  label: string;
  value: number;
  max: number;
  color: string;
  darkColor: string;
  details: string[];
  tooltip: string;
}

function MetricItem({ metric }: { metric: Metric }) {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const percentage = (metric.value / metric.max) * 100;

  return (
    <div 
      className="relative flex-[1_1_0%] min-w-0 overflow-visible"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={metric.tooltip}
      ref={ref}
    >
      <div
        className="flex flex-col gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 transition-all hover:border-slate-300 hover:bg-white hover:shadow-sm cursor-default"
      >
        {/* Header with label and fraction */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">{metric.label}</span>
          <span className="text-[16px] font-bold text-slate-900 tabular-nums leading-none">
            {metric.value}/{metric.max}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full rounded-[2px] bg-slate-200 overflow-hidden">
          <div
            className={`h-full rounded-[2px] transition-all duration-300 ${metric.color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Percentage label */}
        <span className="text-[11px] font-medium text-slate-500">
          {Math.round(percentage)}%
        </span>
      </div>

      {/* Expanded details tooltip */}
      <PortalPopover isOpen={isHovered && metric.details.length > 0} anchorRef={ref} position="top-center" offset={8}>
        <div className="z-40 w-80 rounded-lg border border-slate-200 bg-white p-3 shadow-lg pointer-events-none">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-950">{metric.label} Details</p>
            <ul className="space-y-1">
              {metric.details.map((detail, idx) => (
                <li key={idx} className="text-[11px] text-slate-600 leading-relaxed">
                  • {detail}
                </li>
              ))}
            </ul>
          </div>
          {/* Tooltip arrow */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-slate-200 transform rotate-45" />
        </div>
      </PortalPopover>
    </div>
  );
}

export default function ScoreFooterBar({ score }: ScoreFooterBarProps) {
  const metrics: Metric[] = [
    {
      id: 'ats',
      label: 'ATS',
      value: score.total,
      max: 100,
      color: 'bg-indigo-400',
      darkColor: 'bg-indigo-600',
      details: score.topFixes.length ? score.topFixes : ['No major issues found.'],
      tooltip: `ATS Compatibility: ${score.total}/100. ${
        score.total >= 80
          ? 'Excellent - Your resume is ATS-optimized'
          : score.total >= 50
          ? 'Good - Some improvements needed'
          : 'Needs work - Review formatting and keywords'
      }`,
    },
    {
      id: 'keywords',
      label: 'KEYWORDS',
      value: score.breakdown.keyword,
      max: 40,
      color: 'bg-emerald-400',
      darkColor: 'bg-emerald-600',
      details: [
        score.matchedKeywords.length ? `Matched: ${score.matchedKeywords.slice(0, 5).join(', ')}${score.matchedKeywords.length > 5 ? ` +${score.matchedKeywords.length - 5} more` : ''}` : 'No JD keywords matched yet.',
        score.missingKeywords.length ? `Missing: ${score.missingKeywords.slice(0, 5).join(', ')}${score.missingKeywords.length > 5 ? ` +${score.missingKeywords.length - 5} more` : ''}` : 'No missing keywords.',
      ],
      tooltip: `Keywords: ${score.breakdown.keyword}/40. How well your resume matches job description keywords.`,
    },
    {
      id: 'formatting',
      label: 'FORMAT',
      value: score.breakdown.formatting,
      max: 20,
      color: 'bg-violet-400',
      darkColor: 'bg-violet-600',
      details: score.formattingIssues.length ? score.formattingIssues : ['ATS-safe formatting looks good.'],
      tooltip: `Formatting: ${score.breakdown.formatting}/20. ATS-safe fonts, spacing, and structure.`,
    },
    {
      id: 'content',
      label: 'CONTENT',
      value: score.breakdown.content,
      max: 20,
      color: 'bg-rose-400',
      darkColor: 'bg-rose-600',
      details: score.contentIssues.length ? score.contentIssues : ['Content quality checks look good.'],
      tooltip: `Content: ${score.breakdown.content}/20. Bullet quality, clarity, and impact.`,
    },
    {
      id: 'recruiter',
      label: 'RECRUITER',
      value: score.breakdown.naukri,
      max: 20,
      color: 'bg-amber-400',
      darkColor: 'bg-amber-600',
      details: score.naukriIssues.length ? score.naukriIssues : ['Recruiter checks look good.'],
      tooltip: `Recruiter Profile: ${score.breakdown.naukri}/20. Profile completeness for recruiter searches.`,
    },
  ];

  return (
    <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="relative w-full px-4 py-2.5">
        <div className="flex w-full items-center gap-2">
          {metrics.map((metric) => (
            <MetricItem key={metric.id} metric={metric} />
          ))}
        </div>
      </div>
    </div>
  );
}
