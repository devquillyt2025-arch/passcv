'use client';

import { useResumeStore } from '@/lib/store/useResumeStore';
import { useMemo, useState } from 'react';
import { BarChart2, ChevronDown, ChevronUp } from 'lucide-react';

function parseYYYYMM(dateStr: string): Date | null {
  if (!dateStr) return null;
  const m = dateStr.match(/^(\d{4})-(\d{2})/);
  if (m) return new Date(parseInt(m[1]), parseInt(m[2]) - 1, 1);
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function yearsElapsed(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
}

export default function ResumeStatsWidget() {
  const data = useResumeStore((state) => state.data);
  const [expanded, setExpanded] = useState(false);

  const stats = useMemo(() => {
    const experience = data.experience || [];
    const education  = data.education  || [];
    const skills     = data.skills     || [];
    const projects   = data.projects   || [];
    const certs      = data.certifications || [];

    // Word count
    const textParts: string[] = [];
    if (data.summary) textParts.push(data.summary);
    experience.forEach(e => { if (e.description) textParts.push(e.description); });
    projects.forEach(p => { if (p.description) textParts.push(p.description); });
    skills.forEach(s => { if (s.name) textParts.push(s.name); });
    const wordCount = textParts
      .join(' ')
      .split(/\s+/)
      .filter(w => w.length > 0).length;

    // Total experience in years
    let totalExpYears = 0;
    const now = new Date();
    experience.forEach(exp => {
      const start = parseYYYYMM(exp.startDate);
      if (!start) return;
      const end = exp.currentlyWorking ? now : (parseYYYYMM(exp.endDate) || now);
      const years = yearsElapsed(start, end);
      if (years > 0) totalExpYears += years;
    });

    // Page count estimate: ~600 words per A4 page at typical resume density
    // Use word count as a rough proxy (resume pages are denser than prose)
    const sectionCount = [
      data.summary ? 1 : 0,
      experience.length,
      education.length,
      skills.length > 0 ? 1 : 0,
      projects.length,
      certs.length,
    ].reduce((a, b) => a + b, 0);
    // Each section header + content block ≈ 60 words equivalent
    const estimatedWords = wordCount + sectionCount * 20;
    const pageCount = Math.max(1, Math.ceil(estimatedWords / 550));

    const expDisplay =
      totalExpYears < 1
        ? totalExpYears > 0 ? '< 1 yr' : '—'
        : `${Math.floor(totalExpYears)} yr${Math.floor(totalExpYears) !== 1 ? 's' : ''}`;

    return {
      pageCount,
      wordCount,
      expDisplay,
      jobCount:  experience.length,
      skillCount: skills.length,
      eduCount:  education.length,
      projCount: projects.length,
    };
  }, [data]);

  return (
    <div className="w-72 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300">
      <div
        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors ${expanded ? 'border-b border-gray-200' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 bg-indigo-50 flex items-center justify-center font-bold text-sm text-indigo-700">
            {stats.pageCount}p
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-gray-400" />
              Resume Stats
            </h3>
            <p className="text-xs text-gray-500">{stats.wordCount} words · {stats.expDisplay} exp</p>
          </div>
        </div>
        <div className="text-gray-400">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatTile label="Pages"     value={String(stats.pageCount)} />
            <StatTile label="Words"     value={String(stats.wordCount)} />
            <StatTile label="Exp"       value={stats.expDisplay} />
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Quick Stats</h4>
            <div className="space-y-1.5">
              <QuickRow label="Jobs"       value={stats.jobCount} />
              <QuickRow label="Skills"     value={stats.skillCount} />
              <QuickRow label="Education"  value={stats.eduCount} />
              <QuickRow label="Projects"   value={stats.projCount} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2 text-center border border-gray-100">
      <p className="text-base font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function QuickRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={`font-semibold ${value > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{value}</span>
    </div>
  );
}
