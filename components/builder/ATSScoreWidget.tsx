'use client';

import { useResumeStore } from '@/lib/store/useResumeStore';
import { calculateScore, mapResumeDataToParsedResume, parseJD } from '@/lib/scoring';
import { useState, useMemo } from 'react';
import { Target, ChevronUp, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ATSScoreWidget() {
  const data = useResumeStore((state) => state.data);
  const [jdText, setJdText] = useState('');
  const [expanded, setExpanded] = useState(false);

  // Run calculation immediately as data changes
  const scoreResult = useMemo(() => {
    const parsedResume = mapResumeDataToParsedResume(data);
    const jd = parseJD(jdText);
    return calculateScore(parsedResume, jd);
  }, [data, jdText]);

  const { total, topFixes, breakdown } = scoreResult;

  let colorClass = 'text-red-600 bg-red-50 border-red-200';
  let progressClass = 'bg-red-500';
  if (total >= 80) {
    colorClass = 'text-green-700 bg-green-50 border-green-200';
    progressClass = 'bg-green-500';
  } else if (total >= 50) {
    colorClass = 'text-amber-700 bg-amber-50 border-amber-200';
    progressClass = 'bg-amber-500';
  }

  return (
    <div className="absolute top-4 right-4 z-10 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden transition-all duration-300">
      <div 
        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors ${expanded ? 'border-b border-gray-200' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-lg ${colorClass}`}>
            {total}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-gray-400" />
              ATS Score
            </h3>
            <p className="text-xs text-gray-500">Real-time Feedback</p>
          </div>
        </div>
        <div className="text-gray-400">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 bg-white max-h-[60vh] overflow-y-auto">
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Target Job Description (Optional)</label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste job description to score against specific keywords..."
              className="w-full h-20 rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 outline-none resize-none"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Score Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Keywords (40)</span>
                  <span className="font-medium text-gray-900">{breakdown.keyword}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${progressClass}`} style={{ width: `${(breakdown.keyword / 40) * 100}%` }} />
                </div>

                <div className="flex justify-between items-center mt-3">
                  <span className="text-gray-600">Formatting (20)</span>
                  <span className="font-medium text-gray-900">{breakdown.formatting}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${progressClass}`} style={{ width: `${(breakdown.formatting / 20) * 100}%` }} />
                </div>

                <div className="flex justify-between items-center mt-3">
                  <span className="text-gray-600">Content Quality (20)</span>
                  <span className="font-medium text-gray-900">{breakdown.content}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${progressClass}`} style={{ width: `${(breakdown.content / 20) * 100}%` }} />
                </div>

                <div className="flex justify-between items-center mt-3">
                  <span className="text-gray-600">Recruiter Checks (20)</span>
                  <span className="font-medium text-gray-900">{breakdown.naukri}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${progressClass}`} style={{ width: `${(breakdown.naukri / 20) * 100}%` }} />
                </div>
              </div>
            </div>

            {topFixes.length > 0 ? (
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  Top Fixes
                </h4>
                <ul className="space-y-2">
                  {topFixes.map((fix, i) => (
                    <li key={i} className="text-xs text-gray-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                      {fix}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-medium">Looking great! No major issues found.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
