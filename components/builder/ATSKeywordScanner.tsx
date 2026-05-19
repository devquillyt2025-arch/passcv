'use client';

import { useResumeStore } from '@/lib/store/useResumeStore';
import { useMemo, useState } from 'react';
import { Search, ChevronDown, ChevronUp, CheckCircle2, XCircle, X } from 'lucide-react';

// Predefined keyword list for fast client-side matching
const TECH_KEYWORDS = [
  'python', 'java', 'javascript', 'typescript', 'react', 'node', 'nodejs', 'angular', 'vue',
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'aws', 'azure', 'gcp', 'docker', 'kubernetes',
  'git', 'linux', 'rest', 'api', 'graphql', 'microservices', 'agile', 'scrum', 'jira', 'confluence',
  'spring', 'django', 'flask', 'express', 'tailwind', 'css', 'html', 'figma', 'excel', 'powerbi',
  'power bi', 'tableau', 'spark', 'hadoop', 'kafka', 'elasticsearch', 'terraform', 'jenkins', 'ci/cd',
  'machine learning', 'deep learning', 'nlp', 'tensorflow', 'pytorch', 'pandas', 'numpy',
  'product management', 'roadmap', 'stakeholder', 'analytics', 'ab testing', 'user research',
  'salesforce', 'sap', 'data analysis', 'data science', 'etl', 'data warehouse',
  'airflow', 'dbt', 'looker', 'redshift', 'snowflake', 'bigquery', 'databricks',
  'scikit-learn', 'r programming', 'matlab', 'linux', 'bash', 'c++', 'c#', 'go', 'rust', 'swift',
  'flutter', 'react native', 'android', 'ios', 'firebase', 'supabase', 'vercel', 'netlify',
  'openai', 'langchain', 'vector database', 'llm', 'prompt engineering',
];

// Words too generic to be useful keywords
const SKIP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'up', 'about', 'into', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'you', 'we',
  'our', 'your', 'this', 'that', 'these', 'those', 'not', 'no', 'as', 'if', 'then', 'than',
  'experience', 'skills', 'required', 'preferred', 'job', 'role', 'team', 'work', 'good',
  'strong', 'excellent', 'ability', 'knowledge', 'understanding', 'proven', 'minimum',
  'years', 'year', 'plus', 'must', 'need', 'need', 'also', 'both', 'other', 'including',
  'such', 'well', 'highly', 'demonstrated', 'proficiency', 'working', 'familiarity',
]);

function extractKeywordsFromJD(jd: string): string[] {
  const lower = jd.toLowerCase();
  const found = new Set<string>();

  // Match predefined tech keywords (handles multi-word ones too)
  for (const kw of TECH_KEYWORDS) {
    if (lower.includes(kw)) found.add(kw);
  }

  // Extract capitalized tool/product names from the raw JD text
  const capPattern = /\b([A-Z][a-zA-Z0-9+#.-]{1,})\b/g;
  let m: RegExpExecArray | null;
  while ((m = capPattern.exec(jd)) !== null) {
    const word = m[1];
    const lw = word.toLowerCase();
    if (word.length >= 2 && !SKIP_WORDS.has(lw) && !SKIP_WORDS.has(word)) {
      found.add(lw);
    }
  }

  return [...found];
}

function buildResumeText(data: ReturnType<typeof useResumeStore.getState>['data']): string {
  return [
    data.summary || '',
    (data.skills || []).map(s => s.name).join(' '),
    ...(data.experience || []).map(e => `${e.position} ${e.company} ${e.description}`),
    ...(data.education || []).map(e => `${e.degree} ${e.field} ${e.institution}`),
    ...(data.certifications || []).map(c => c.name),
  ].join(' ').toLowerCase();
}

export default function ATSKeywordScanner() {
  const data = useResumeStore((state) => state.data);
  const [jd, setJd] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [showAllMissing, setShowAllMissing] = useState(false);

  const results = useMemo(() => {
    if (!jd.trim()) return null;
    const keywords = extractKeywordsFromJD(jd);
    if (keywords.length === 0) return null;
    const resumeText = buildResumeText(data);
    const matched = keywords.filter(kw => resumeText.includes(kw));
    const missing = keywords.filter(kw => !resumeText.includes(kw));
    const pct = Math.round((matched.length / keywords.length) * 100);
    return { matched, missing, total: keywords.length, pct };
  }, [jd, data]);

  const clearJD = () => {
    setJd('');
    setShowAllMissing(false);
  };

  const scoreColor = results
    ? results.pct >= 60 ? 'text-green-600 bg-green-50 border-green-200'
    : results.pct >= 35 ? 'text-amber-600 bg-amber-50 border-amber-200'
    : 'text-red-600 bg-red-50 border-red-200'
    : 'text-indigo-600 bg-indigo-50 border-indigo-200';

  const barColor = results
    ? results.pct >= 60 ? 'bg-green-500'
    : results.pct >= 35 ? 'bg-amber-500'
    : 'bg-red-500'
    : 'bg-indigo-400';

  return (
    <div className="w-[680px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* ── Header ── */}
      <div
        className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${expanded ? 'border-b border-gray-200' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${scoreColor}`}>
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">ATS Keyword Scanner</h3>
            <p className="text-xs text-gray-500">
              {results
                ? `${results.matched.length}/${results.total} keywords matched (${results.pct}%)`
                : 'Paste a job description to find keyword gaps'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {results && (
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${scoreColor}`}>
              {results.pct}%
            </span>
          )}
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {/* ── Body ── */}
      {expanded && (
        <div className="p-4 space-y-4">
          {/* JD textarea */}
          <div className="relative">
            <textarea
              value={jd}
              onChange={(e) => { setJd(e.target.value); setShowAllMissing(false); }}
              placeholder="Paste the target job description here…"
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none pr-8"
            />
            {jd && (
              <button
                onClick={clearJD}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results */}
          {results && (
            <div className="space-y-3">
              {/* Score bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${results.pct}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900 shrink-0 w-16 text-right">
                  {results.matched.length}/{results.total}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Matched */}
                {results.matched.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Matched ({results.matched.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {results.matched.map(kw => (
                        <span
                          key={kw}
                          className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 font-medium"
                        >
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing */}
                {results.missing.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Missing ({results.missing.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(showAllMissing ? results.missing : results.missing.slice(0, 10)).map(kw => (
                        <span
                          key={kw}
                          className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded-full px-2 py-0.5 font-medium"
                        >
                          <XCircle className="w-3 h-3 shrink-0" />
                          {kw}
                        </span>
                      ))}
                      {!showAllMissing && results.missing.length > 10 && (
                        <button
                          onClick={() => setShowAllMissing(true)}
                          className="text-xs text-indigo-600 hover:underline px-1 py-0.5"
                        >
                          +{results.missing.length - 10} more
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {results.missing.length === 0 && (
                <p className="text-sm text-green-600 font-medium text-center py-1">
                  All detected keywords are present in your resume.
                </p>
              )}
            </div>
          )}

          {jd.trim() && !results && (
            <p className="text-sm text-gray-500 text-center py-2">
              No recognizable technical keywords found in the pasted text.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
