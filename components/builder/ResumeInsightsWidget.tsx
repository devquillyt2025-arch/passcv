'use client';

import type { ReactNode } from 'react';
import { useResumeStore } from '@/lib/store/useResumeStore';
import { useMemo } from 'react';
import { Briefcase, Code2, User, GraduationCap, Lightbulb } from 'lucide-react';

function parseYYYYMM(d: string): Date | null {
  if (!d) return null;
  const m = d.match(/^(\d{4})-(\d{2})/);
  if (m) return new Date(parseInt(m[1]), parseInt(m[2]) - 1, 1);
  const p = new Date(d);
  return isNaN(p.getTime()) ? null : p;
}

type MetricKey = 'experience' | 'skills' | 'role' | 'education';

export default function ResumeInsightsWidget({ className }: { className?: string }) {
  const data = useResumeStore((s) => s.data);

  const { metrics, weakest } = useMemo(() => {
    const experience = data.experience || [];
    const skills     = data.skills     || [];
    const education  = data.education  || [];
    const now = new Date();

    // ── Experience ──
    let totalMs = 0;
    experience.forEach((exp) => {
      const start = parseYYYYMM(exp.startDate);
      if (!start) return;
      const end = exp.currentlyWorking ? now : (parseYYYYMM(exp.endDate) || now);
      const ms = end.getTime() - start.getTime();
      if (ms > 0) totalMs += ms;
    });
    const yrs = totalMs / (1000 * 60 * 60 * 24 * 365.25);
    const expLabel  = yrs < 0.1 ? '—' : yrs < 1 ? `${Math.round(yrs * 12)} mo` : `${yrs.toFixed(1)} yrs`;
    const expHint   = yrs < 0.5 ? 'Add freelance or contract roles' : yrs < 2 ? 'Quantify impact in each role' : 'Showcase leadership moments';
    const expScore  = yrs >= 3 ? 100 : yrs >= 1 ? 60 : 20;

    // ── Skills ──
    const skillCount = skills.length;
    const skillLabel = skillCount > 0 ? String(skillCount) : '—';
    const skillHint  = skillCount < 5  ? 'Add core tools you use daily'
                     : skillCount < 10 ? 'Include domain-specific tools'
                     : 'Prioritise most relevant skills';
    const skillScore = skillCount >= 8 ? 100 : skillCount >= 4 ? 60 : 20;

    // ── Latest role ──
    const roleLabel = experience[0]?.position?.split(' ').slice(0, 2).join(' ') || '—';
    const roleHint  = !experience[0] ? 'Add your most recent position' : 'Keep title aligned with target JD';
    const roleScore = experience.length > 0 ? 80 : 0;

    // ── Education ──
    const edu      = education[0];
    const eduLabel = edu ? (edu.degree?.match(/\b[A-Z]/g)?.join('') || edu.degree?.split(' ')[0] || 'Degree') : '—';
    const eduHint  = !edu ? 'Add degrees or certifications' : edu.score ? 'Strong — GPA listed' : 'Add GPA or key courses';
    const eduScore = edu ? (edu.score ? 100 : 70) : 20;

    // ── Weakest (only flag if score < 60) ──
    const scores: Record<MetricKey, number> = { experience: expScore, skills: skillScore, role: roleScore, education: eduScore };
    const [worstKey, worstVal] = Object.entries(scores).sort((a, b) => a[1] - b[1])[0];
    const weakest: MetricKey | null = worstVal < 60 ? (worstKey as MetricKey) : null;

    return {
      metrics: {
        experience: { label: expLabel, hint: expHint },
        skills:     { label: skillLabel, hint: skillHint },
        role:       { label: roleLabel, hint: roleHint },
        education:  { label: eduLabel, hint: eduHint },
      },
      weakest,
    };
  }, [data]);

  return (
    <div className={`${className ?? 'w-72'} h-full flex flex-col rounded-xl shadow-lg border border-sky-100 overflow-hidden
      bg-gradient-to-br from-sky-50/70 via-white to-emerald-50/70
      hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-sky-100 shrink-0 bg-white/70">
        <Lightbulb className="w-3.5 h-3.5 text-sky-500 shrink-0" />
        <h3 className="font-semibold text-gray-800 text-sm">Resume Insights</h3>
      </div>

      {/* 2 × 2 grid */}
      <div className="grid grid-cols-2 grid-rows-2 flex-1 divide-x divide-y divide-sky-100/60">
        <InsightTile
          icon={<Briefcase className="w-3 h-3" />}
          label="EXPERIENCE"
          value={metrics.experience.label}
          hint={metrics.experience.hint}
          isWeak={weakest === 'experience'}
        />
        <InsightTile
          icon={<Code2 className="w-3 h-3" />}
          label="SKILLS"
          value={metrics.skills.label}
          hint={metrics.skills.hint}
          isWeak={weakest === 'skills'}
        />
        <InsightTile
          icon={<User className="w-3 h-3" />}
          label="LATEST ROLE"
          value={metrics.role.label}
          hint={metrics.role.hint}
          isWeak={weakest === 'role'}
          small
        />
        <InsightTile
          icon={<GraduationCap className="w-3 h-3" />}
          label="EDUCATION"
          value={metrics.education.label}
          hint={metrics.education.hint}
          isWeak={weakest === 'education'}
        />
      </div>
    </div>
  );
}

function InsightTile({
  icon, label, value, hint, isWeak, small = false,
}: {
  icon: ReactNode; label: string; value: string;
  hint: string; isWeak: boolean; small?: boolean;
}) {
  return (
    <div className={`group flex flex-col justify-between px-3 py-2.5 transition-colors duration-150 ${
      isWeak ? 'bg-red-50/80' : 'hover:bg-white/60'
    }`}>
      {/* Icon + value */}
      <div className="flex items-start gap-1.5">
        <span className={`mt-0.5 shrink-0 ${isWeak ? 'text-red-400' : 'text-gray-400'}`}>
          {icon}
        </span>
        <span
          className={`font-bold leading-none ${small ? 'text-sm' : 'text-[22px]'} ${
            isWeak ? 'text-red-600' : 'text-gray-800'
          }`}
          title={value}
        >
          {value}
        </span>
      </div>

      {/* Label */}
      <p className={`text-[9px] font-bold tracking-widest mt-1 uppercase ${
        isWeak ? 'text-red-400' : 'text-gray-400'
      }`}>
        {label}
      </p>

      {/* Action hint — hidden by default, fades in on tile hover */}
      <p className={`text-[10px] leading-snug mt-1 truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
        isWeak ? 'text-red-500 font-medium' : 'text-gray-400'
      }`}>
        {hint}
      </p>
    </div>
  );
}
