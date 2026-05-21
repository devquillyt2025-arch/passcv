'use client';

import { useUIStore } from '@/lib/store/useUIStore';
import { useResumeStats } from '@/hooks/useResumeStats';
import { useStatsData } from '@/lib/store/selectors';
import { useState } from 'react';
import { BarChart2, ChevronDown, ChevronUp } from 'lucide-react';

export default function ResumeStatsWidget({ className }: { className?: string }) {
  const data                = useStatsData();
  const requestSectionFocus = useUIStore((s) => s.requestSectionFocus);
  const setHighlightExpId   = useUIStore((s) => s.setHighlightExpId);
  const [expanded, setExpanded]     = useState(false);
  const [kwExpanded, setKwExpanded] = useState(false); // keyword drill-down

  const stats = useResumeStats(data);

  // ── Weak-bullet click: open experience section + highlight the first flagged card ──
  const handleWeakBulletClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    requestSectionFocus('experience');
    const firstIssue = stats.weakBullets[0];
    if (firstIssue) setHighlightExpId(firstIssue.expId);
  };

  return (
    <div className={`${className ?? 'w-72'} h-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 ${stats.isPending ? 'opacity-80' : ''}`}>
      {/* ── Header (toggle) ── */}
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

      {/* ── Always-visible metric tiles ── */}
      <div className="px-4 pb-3 grid grid-cols-3 gap-3">
        <StatTile label="Pages" value={String(stats.pageCount)} />
        <StatTile label="Words" value={String(stats.wordCount)} />
        <StatTile label="Exp"   value={stats.expDisplay} />
      </div>

      {/* ── Expandable detail ── */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-3">
          {/* Quick counts */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Quick Stats</h4>
            <div className="space-y-1.5">
              <QuickRow label="Jobs"      value={stats.jobCount} />
              <QuickRow label="Skills"    value={stats.skillCount} />
              <QuickRow label="Education" value={stats.eduCount} />
              <QuickRow label="Projects"  value={stats.projCount} />
            </div>
          </div>

          {/* ATS quality */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">ATS Quality</h4>
            <div className="space-y-2.5">

              {/* ── Keyword Density (interactive drill-down) ── */}
              <div>
                <button
                  onClick={(e) => { e.stopPropagation(); setKwExpanded(v => !v); }}
                  className="flex justify-between items-center w-full text-xs text-left group"
                  title={kwExpanded ? 'Collapse keyword details' : 'See which keywords were found'}
                >
                  <span className="text-gray-600 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                    Keyword Density
                    <ChevronDown className={`w-3 h-3 transition-transform ${kwExpanded ? 'rotate-180' : ''}`} />
                  </span>
                  <span className="font-semibold text-gray-900">
                    {stats.keywordDensity.found}/{stats.keywordDensity.total}
                  </span>
                </button>

                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      stats.keywordDensity.found / stats.keywordDensity.total > 0.35 ? 'bg-green-500' :
                      stats.keywordDensity.found / stats.keywordDensity.total > 0.15 ? 'bg-amber-500' : 'bg-red-400'
                    }`}
                    style={{ width: `${(stats.keywordDensity.found / stats.keywordDensity.total) * 100}%` }}
                  />
                </div>

                {/* ── Keyword drill-down panel ── */}
                {kwExpanded && (
                  <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 space-y-2">
                    {stats.matchedKeywords.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                          Found ({Math.min(stats.matchedKeywords.length, 5)} of {stats.matchedKeywords.length})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {stats.matchedKeywords.slice(0, 5).map(kw => (
                            <span key={kw} className="text-[10px] bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 font-medium">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {stats.missingTopKeywords.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                          Top Missing
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {stats.missingTopKeywords.map(kw => (
                            <span key={kw} className="text-[10px] bg-red-50 text-red-600 border border-red-100 rounded-full px-2 py-0.5 font-medium opacity-75">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Metric coverage ── */}
              {stats.metricCoverage !== null && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Metrics in Bullets</span>
                    <span className={`font-semibold ${
                      stats.metricCoverage >= 60 ? 'text-green-600' :
                      stats.metricCoverage >= 30 ? 'text-amber-600' : 'text-red-500'
                    }`}>
                      {stats.metricCoverage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        stats.metricCoverage >= 60 ? 'bg-green-500' :
                        stats.metricCoverage >= 30 ? 'bg-amber-500' : 'bg-red-400'
                      }`}
                      style={{ width: `${stats.metricCoverage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* ── Weak bullets (click → scroll + highlight specific card) ── */}
              {stats.bulletTotal > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">Weak Bullets</span>
                  {stats.weakBulletCount === 0 ? (
                    <span className="font-semibold px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700">
                      None
                    </span>
                  ) : (
                    <button
                      onClick={handleWeakBulletClick}
                      className="font-semibold px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors hover:underline underline-offset-2"
                      title={`Click to jump to the first weak bullet (${stats.weakBullets[0]?.text})`}
                    >
                      {stats.weakBulletCount} flagged ↗
                    </button>
                  )}
                </div>
              )}
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
