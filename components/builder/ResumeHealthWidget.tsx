'use client';

import { useUIStore } from '@/lib/store/useUIStore';
import { useHealthSelectors } from '@/lib/store/selectors';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Heart } from 'lucide-react';
import { COMPLETENESS_WEIGHTS, SECTION_IMPACTS, computeGain } from '@/lib/scoringWeights';

// ── Types ─────────────────────────────────────────────────────────────────────

type Status = 'complete' | 'warning' | 'missing';

interface GapAction {
  id: string;
  label: string;
  potentialGain: number;
  status: Status;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeCompleteness(
  contact: ReturnType<typeof useHealthSelectors>['contact'],
  summary: string,
  experience: unknown[],
  skills: unknown[],
  education: unknown[],
  projects: unknown[],
  certifications: unknown[],
): number {
  const W = COMPLETENESS_WEIGHTS;
  let score = 0;
  if (contact?.firstName) score += W.contact.firstName;
  if (contact?.email)     score += W.contact.email;
  if (contact?.phone)     score += W.contact.phone;
  if (contact?.city)      score += W.contact.city;
  if ((summary || '').trim().length > 50) score += W.summary;

  const expLen = experience.length;
  score += expLen >= 2 ? W.experience.twoPlus : expLen >= 1 ? W.experience.onePlus : 0;

  const skLen = skills.length;
  score += skLen >= 8 ? W.skills.eightPlus : skLen >= 5 ? W.skills.fivePlus : skLen >= 1 ? W.skills.onePlus : 0;

  if (education.length > 0)     score += W.education;
  if (projects.length > 0)      score += W.projects;
  if (certifications.length > 0) score += W.certifications;
  return score;
}

/** Derive which sections are incomplete, ordered by potential gain (highest first). */
function computeGapActions(
  experience: unknown[],
  skills: unknown[],
  projects: unknown[],
  certifications: unknown[],
): GapAction[] {
  const actions: GapAction[] = [];

  for (const impact of SECTION_IMPACTS) {
    const countMap: Record<string, number> = {
      experience:     experience.length,
      skills:         skills.length,
      education:      0,       // education always counts as 0 here — handled in completeness
      projects:       projects.length,
      certifications: certifications.length,
    };
    const count = countMap[impact.id] ?? 0;
    const gain  = computeGain(impact, count);

    if (gain > 0) {
      actions.push({
        id: impact.id,
        label: impact.label,
        potentialGain: gain,
        status: count === 0 ? (impact.id === 'experience' || impact.id === 'skills' ? 'missing' : 'warning') : 'warning',
      });
    }
  }

  return actions.sort((a, b) => b.potentialGain - a.potentialGain);
}

// ── Widget ────────────────────────────────────────────────────────────────────

export default function ResumeHealthWidget({ className }: { className?: string }) {
  const { experience, skills, projects, certifications, education, summary, contact } = useHealthSelectors();
  const requestSectionFocus = useUIStore((s) => s.requestSectionFocus);
  const data = { experience, skills, projects, certifications, education, summary, contact };

  // ── Derived state ──
  const completeness = useMemo(
    () => computeCompleteness(contact, summary, experience, skills, education, projects, certifications),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contact, summary, experience, skills, education, projects, certifications],
  );

  // Gap actions ordered by impact (highest gain first)
  const gapActions = useMemo(
    () => computeGapActions(experience, skills, projects, certifications),
    [experience, skills, projects, certifications],
  );

  // ── Fix cycle state machine ──────────────────────────────────────────────────
  // Tracks which gap action to navigate to on the NEXT button click.
  // Resets to 0 whenever the set of incomplete sections changes size.
  const [fixCycleIndex, setFixCycleIndex] = useState(0);
  useEffect(() => {
    setFixCycleIndex(0);
  }, [gapActions.length]);

  const handleFixGap = () => {
    if (gapActions.length === 0) return;
    const idx = fixCycleIndex % gapActions.length;
    requestSectionFocus(gapActions[idx].id);
    setFixCycleIndex(prev => (prev + 1) % gapActions.length);
  };

  const nextAction = gapActions.length > 0 ? gapActions[fixCycleIndex % gapActions.length] : null;

  // ── Checklist sections (shown as rows) ─────────────────────────────────────
  const CHECKLIST = [
    { id: 'experience',     label: 'Work Experience', required: true,  count: experience.length,        goodCount: 2 },
    { id: 'skills',         label: 'Skills',          required: true,  count: skills.length,            goodCount: 5 },
    { id: 'projects',       label: 'Projects',        required: false, count: projects.length,          goodCount: 1 },
    { id: 'certifications', label: 'Certifications',  required: false, count: certifications?.length ?? 0, goodCount: 1 },
  ] as const;

  function getStatus(id: string, required: boolean, count: number, goodCount: number): Status {
    if (count === 0) return required ? 'missing' : 'warning';
    if (count < goodCount) return 'warning';
    return 'complete';
  }

  const barColor = completeness >= 80 ? 'bg-green-500' : completeness >= 50 ? 'bg-amber-500' : 'bg-red-500';
  const pctColor = completeness >= 80 ? 'text-green-700' : completeness >= 50 ? 'text-amber-700' : 'text-red-600';

  return (
    <div className={`${className ?? 'w-72'} h-full flex flex-col bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200`}>

      {/* Header + progress bar */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 flex items-center gap-1.5 text-sm">
            <Heart className="w-4 h-4 text-rose-400" />
            Resume Health
          </h3>
          <span className={`text-sm font-bold ${pctColor}`}>{completeness}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${completeness}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1">
          {completeness >= 80 ? 'Great shape — keep going' : completeness >= 50 ? 'Looking good — fill the gaps' : 'Missing key sections'}
        </p>
      </div>

      {/* Section checklist rows */}
      <div className="flex flex-col py-1.5 px-2 gap-0.5">
        {CHECKLIST.map(s => {
          const status = getStatus(s.id, s.required, s.count, s.goodCount);
          // Find the gain for this specific section from SECTION_IMPACTS
          const impact = SECTION_IMPACTS.find(i => i.id === s.id);
          const gain   = impact ? computeGain(impact, s.count) : 0;
          return (
            <SectionRow
              key={s.id}
              id={s.id}
              label={s.label}
              required={s.required}
              count={s.count}
              goodCount={s.goodCount}
              status={status}
              potentialGain={gain}
              onNavigate={requestSectionFocus}
            />
          );
        })}
      </div>

      {/* Fix Gaps CTA — state machine button */}
      <div className="px-4 pb-4 pt-3 shrink-0">
        {nextAction ? (
          <button
            onClick={handleFixGap}
            className="w-full flex items-center justify-between py-2 px-3 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
            title={gapActions.length > 1 ? `Then: ${gapActions[(fixCycleIndex + 1) % gapActions.length]?.label}` : undefined}
          >
            <span>Fix {nextAction.label} →</span>
            <span className="ml-2 text-indigo-200 font-medium">+{nextAction.potentialGain}%</span>
          </button>
        ) : (
          <div className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold bg-green-50 text-green-700 rounded-lg border border-green-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> All sections complete
          </div>
        )}
        {/* Cycle hint — show when there are multiple gaps */}
        {gapActions.length > 1 && (
          <p className="text-[10px] text-gray-400 text-center mt-1.5">
            {fixCycleIndex + 1} of {gapActions.length} gaps · click to cycle
          </p>
        )}
      </div>
    </div>
  );
}

// ── Section row component ─────────────────────────────────────────────────────

function SectionRow({
  id, label, required, count, goodCount, status, potentialGain, onNavigate,
}: {
  id: string;
  label: string;
  required: boolean;
  count: number;
  goodCount: number;
  status: Status;
  potentialGain: number;
  onNavigate: (id: string) => void;
}) {
  const clickable = status !== 'complete';

  const accentBorder =
    status === 'missing' ? 'border-l-2 border-l-red-300' :
    status === 'warning'  ? 'border-l-2 border-l-amber-300' : '';

  const Icon =
    status === 'complete' ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> :
    status === 'warning'  ? <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" /> :
                            <XCircle      className="w-4 h-4 text-red-400 shrink-0" />;

  const sub =
    count === 0
      ? (required ? 'None added' : 'Optional — none added')
      : status === 'warning'
      ? `${count} added — add ${goodCount - count} more`
      : `${count} added`;

  const subColor =
    status === 'missing' ? 'text-red-400' :
    status === 'warning'  ? 'text-amber-500' : 'text-green-600';

  return (
    <div
      onClick={clickable ? () => onNavigate(id) : undefined}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        clickable ? 'cursor-pointer hover:bg-gray-50 active:bg-gray-100' : ''
      } ${accentBorder}`}
    >
      {Icon}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 leading-none">{label}</p>
        <p className={`text-[10px] mt-0.5 ${subColor}`}>{sub}</p>
      </div>
      {/* Impact hint — shown for incomplete sections */}
      {clickable && potentialGain > 0 && (
        <span className="text-[10px] font-semibold text-indigo-500 shrink-0 tabular-nums">
          +{potentialGain}%
        </span>
      )}
      {clickable && <span className="text-[10px] text-gray-300 shrink-0">↗</span>}
    </div>
  );
}
