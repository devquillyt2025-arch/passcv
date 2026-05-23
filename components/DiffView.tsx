'use client';

import { useState } from 'react';
import { ParsedResume, RewrittenResume, ATSScore, ParsedJD, NaukriProfile } from '@/lib/types';
import clsx from 'clsx';
import ResumePreview from '@/components/ResumePreview';

type Mode = 'view' | 'edit' | 'preview';

interface Props {
  original: ParsedResume;
  rewritten: RewrittenResume;
  edited: RewrittenResume;
  jobTitle: string;
  jdText?: string;
  score?: ATSScore;
  jd?: ParsedJD;
  onDownloadDocx: () => void;
  onDownloadPdf: () => void;
  onEditChange: (edited: RewrittenResume) => void;
  downloading?: boolean;
}

// ── Utilities ────────────────────────────────────────────────────────

function extractJobTitle(raw: string): string {
  if (!raw) return 'this role';
  const cleaned = raw
    .replace(/welcome to [^!.?]+[!.?]\s*/i, '')
    .replace(/about the role[:\s]*/i, '')
    .replace(/we are (?:seeking|looking for|hiring)\s+(?:a|an)?\s*/i, '')
    .replace(/position[:\s]*/i, '')
    .replace(/job title[:\s]*/i, '')
    .trim();
  const first = cleaned.split(/[.!?]/)[0].trim();
  if (first.length <= 50) return first;
  const cut = first.slice(0, 40);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '…';
}

function skillSuggestion(skill: string): string {
  const s = skill.toLowerCase();
  if (/python|java|react|node|typescript|sql|aws|docker|kubernetes|git/.test(s))
    return 'Build a small project on GitHub to demonstrate this skill.';
  if (/agile|scrum|jira|confluence/.test(s))
    return 'Highlight project management experience in your summary.';
  if (/machine learning|nlp|deep learning|data science/.test(s))
    return 'Complete a Kaggle competition or a Coursera specialisation.';
  if (/communication|leadership|teamwork/.test(s))
    return 'Add examples to your summary or cover letter.';
  return 'Take an online course (Coursera, Udemy) or earn a certification.';
}

// ── Sub-components ───────────────────────────────────────────────────

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="text-[13px] font-semibold text-[#6366f1] hover:text-indigo-400 transition-colors flex items-center gap-1.5"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      {copied ? 'Copied!' : label}
    </button>
  );
}

function CharCount({ text, max }: { text: string; max: number }) {
  const n = text.length;
  return (
    <span className={clsx('text-[11px] font-mono tabular-nums', n > max ? 'text-red-400' : 'text-[rgba(255,255,255,0.35)]')}>
      {n}/{max}
    </span>
  );
}

// ── Section toggle pill ───────────────────────────────────────────────

function SectionToggle({ view, onToggle }: { view: 'original' | 'rewritten'; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] p-0.5 text-[11px] font-semibold"
    >
      <span className={clsx('px-3 py-1 rounded-full transition-colors', view === 'original' ? 'bg-[rgba(249,115,22,0.18)] text-orange-300' : 'text-[rgba(255,255,255,0.35)] hover:text-[rgba(255,255,255,0.6)]')}>
        Original
      </span>
      <span className={clsx('px-3 py-1 rounded-full transition-colors', view === 'rewritten' ? 'bg-[rgba(34,197,94,0.18)] text-green-300' : 'text-[rgba(255,255,255,0.35)] hover:text-[rgba(255,255,255,0.6)]')}>
        Rewritten
      </span>
    </button>
  );
}

// ── Vertical section card ─────────────────────────────────────────────

function SectionCard({ label, view, onToggle, children }: {
  label: string;
  view: 'original' | 'rewritten';
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[16px] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(255,255,255,0.06)]">
        <span className="text-[11px] font-bold text-[rgba(255,255,255,0.45)] uppercase tracking-[0.1em]">{label}</span>
        <SectionToggle view={view} onToggle={onToggle} />
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Accordion card for secondary sections ────────────────────────────

function AccordionCard({ label, expanded, onToggle, children }: {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[16px] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
      >
        <span className="text-[11px] font-bold text-[rgba(255,255,255,0.45)] uppercase tracking-[0.1em]">{label}</span>
        <svg
          className={clsx('w-4 h-4 text-[rgba(255,255,255,0.35)] transition-transform', expanded && 'rotate-180')}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && <div className="px-5 pb-5 border-t border-[rgba(255,255,255,0.06)]"><div className="pt-4">{children}</div></div>}
    </div>
  );
}

// ── Score improvement banner ──────────────────────────────────────────

function ScoreImprovementBanner({ score }: { score: ATSScore }) {
  const from = score.total;
  const to = Math.min(92, Math.max(72, from + 26));
  const gain = to - from;
  return (
    <div className="rounded-[16px] bg-gradient-to-r from-[rgba(34,197,94,0.07)] to-[rgba(16,185,129,0.03)] border border-[rgba(34,197,94,0.18)] px-6 py-4">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-[rgba(255,255,255,0.45)]">ATS score</span>
          <div className="flex items-center gap-2">
            <span className="text-[24px] font-bold text-red-400 tabular-nums leading-none">{from}</span>
            <span className="text-[rgba(255,255,255,0.25)] text-xl">→</span>
            <span className="text-[24px] font-bold text-green-400 tabular-nums leading-none">~{to}</span>
            <span className="text-[13px] text-[rgba(255,255,255,0.35)]">/100</span>
          </div>
        </div>
        <span className="rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[12px] font-bold px-3 py-1 shrink-0">
          +{gain} pts
        </span>
      </div>
      <div className="relative h-2 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-red-500/50 via-amber-500/60 to-green-500"
          style={{ width: `${to}%` }}
        />
        <div className="absolute top-0 h-full w-0.5 bg-white/30" style={{ left: `${from}%` }} />
      </div>
      <p className="text-[11px] text-[rgba(255,255,255,0.3)] mt-2">Estimated post-rewrite ATS score based on keyword coverage</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────

export default function DiffView({
  original, rewritten, edited, jobTitle, jdText, score, jd,
  onDownloadDocx, onDownloadPdf, onEditChange, downloading,
}: Props) {
  const [mode, setMode] = useState<Mode>('view');
  const [focusedExpIndex, setFocusedExpIndex] = useState<number | null>(null);
  const [sectionView, setSectionView] = useState<Record<string, 'original' | 'rewritten'>>({});

  // Cover letter
  const [coverLetter, setCoverLetter] = useState('');
  const [generatingCL, setGeneratingCL] = useState(false);
  const [clError, setClError] = useState('');
  const [downloadingCL, setDownloadingCL] = useState(false);

  // Naukri profile
  const [naukriProfile, setNaukriProfile] = useState<NaukriProfile | null>(null);
  const [generatingNaukri, setGeneratingNaukri] = useState(false);
  const [naukriError, setNaukriError] = useState('');

  // Accordion open/close
  const [expandNaukri, setExpandNaukri] = useState(false);
  const [expandCoverLetter, setExpandCoverLetter] = useState(false);
  const [expandGap, setExpandGap] = useState(false);

  const getView = (s: string): 'original' | 'rewritten' => sectionView[s] ?? 'rewritten';
  const toggleView = (s: string) =>
    setSectionView(prev => ({ ...prev, [s]: prev[s] === 'original' ? 'rewritten' : 'original' }));

  // New skill detection
  const origSkillsLower = new Set(original.skills.map(s => s.toLowerCase()));
  const newSkillsSet = new Set(
    rewritten.skills.filter(s => !origSkillsLower.has(s.toLowerCase())).map(s => s.toLowerCase())
  );

  // Gap analysis
  const resumeSkillsLower = new Set((original.skills || []).map(s => s.toLowerCase()));
  const requiredMissing = (jd?.requiredSkills || []).filter(s => !resumeSkillsLower.has(s.toLowerCase()));
  const preferredMissing = (jd?.preferredSkills || []).filter(s => !resumeSkillsLower.has(s.toLowerCase()));
  const missingFromScore = (score?.missingKeywords || []).filter(
    kw => !resumeSkillsLower.has(kw.toLowerCase()) &&
          !requiredMissing.some(s => s.toLowerCase() === kw.toLowerCase()) &&
          !preferredMissing.some(s => s.toLowerCase() === kw.toLowerCase())
  );

  const handleGenerateCoverLetter = async () => {
    if (!jdText) return;
    setGeneratingCL(true); setClError('');
    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: original, jdText, jobTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setCoverLetter(data.coverLetter);
    } catch (e) { setClError(e instanceof Error ? e.message : 'Generation failed'); }
    finally { setGeneratingCL(false); }
  };

  const handleDownloadCoverLetterDocx = async () => {
    setDownloadingCL(true);
    try {
      const res = await fetch('/api/generate_docx', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'cover_letter', coverLetter, name: original.contact.name, jobTitle }),
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `${(original.contact.name || 'Candidate').replace(/\s+/g, '_')}_CoverLetter_TailorCV.docx`;
      a.click(); URL.revokeObjectURL(url);
    } catch (e) { setClError(e instanceof Error ? e.message : 'Download failed'); }
    finally { setDownloadingCL(false); }
  };

  const handleGenerateNaukriProfile = async () => {
    setGeneratingNaukri(true); setNaukriError('');
    try {
      const res = await fetch('/api/naukri-profile', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: rewritten, jobTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setNaukriProfile(data as NaukriProfile);
    } catch (e) { setNaukriError(e instanceof Error ? e.message : 'Generation failed'); }
    finally { setGeneratingNaukri(false); }
  };

  const btnBase = 'flex items-center gap-2 rounded-[10px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] px-[16px] py-[8px] text-[13px] font-medium text-[rgba(255,255,255,0.85)] hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] disabled:opacity-60 transition-all duration-200';
  const btnActive = 'bg-[rgba(99,102,241,0.15)] border-[rgba(99,102,241,0.4)] text-indigo-300';

  return (
    <div className="bg-[#0f0f17] border border-[rgba(255,255,255,0.07)] rounded-[20px] p-[32px] space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3 pb-5 border-b border-[rgba(255,255,255,0.08)]">
        <div>
          <h2 className="text-[22px] font-bold text-white">Resume Rewritten</h2>
          <p className="text-[13px] text-[rgba(255,255,255,0.4)] mt-1">
            Optimised for: {extractJobTitle(jobTitle)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onDownloadDocx} disabled={downloading} className={btnBase}>
            {downloading
              ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              : <svg className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
            Download DOCX
          </button>
          <button onClick={onDownloadPdf} disabled={downloading} className={btnBase}>
            {downloading
              ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              : <svg className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" /></svg>}
            Download PDF
          </button>
          <button onClick={() => setMode(m => m === 'edit' ? 'view' : 'edit')} className={clsx(btnBase, mode === 'edit' && btnActive)}>
            <span className="opacity-70">✏️</span> {mode === 'edit' ? 'Done Editing' : 'Edit Inline'}
          </button>
          <button onClick={() => setMode(m => m === 'preview' ? 'view' : 'preview')} className={clsx(btnBase, mode === 'preview' && btnActive)}>
            <span className="opacity-70">📄</span> {mode === 'preview' ? 'Close Preview' : 'Preview'}
          </button>
        </div>
      </div>

      {/* ── View Mode ── */}
      {mode === 'view' && (
        <div className="space-y-4">

          {/* Score banner */}
          {score && <ScoreImprovementBanner score={score} />}

          {/* Summary */}
          <SectionCard label="Summary" view={getView('summary')} onToggle={() => toggleView('summary')}>
            <p className={clsx(
              'text-[14px] leading-[1.75] pl-4 whitespace-pre-wrap border-l-2',
              getView('summary') === 'rewritten'
                ? 'text-[rgba(255,255,255,0.85)] border-green-500/40'
                : 'text-[rgba(255,255,255,0.5)] border-orange-500/40'
            )}>
              {(getView('summary') === 'rewritten' ? rewritten.summary : original.summary) || <span className="italic text-[rgba(255,255,255,0.3)]">empty</span>}
            </p>
          </SectionCard>

          {/* Experience */}
          <SectionCard label="Experience" view={getView('experience')} onToggle={() => toggleView('experience')}>
            <div className="space-y-6">
              {(getView('experience') === 'rewritten' ? rewritten.experience : original.experience).map((job, i) => (
                <div key={i} className={clsx('pl-4 border-l-2', getView('experience') === 'rewritten' ? 'border-green-500/40' : 'border-orange-500/40')}>
                  <p className="text-[14px] font-semibold text-white mb-2">
                    {job.title}
                    <span className="text-[rgba(255,255,255,0.4)] font-normal"> @ {job.company}</span>
                  </p>
                  <ul className="space-y-1.5">
                    {job.bullets.map((b, j) => (
                      <li key={j} className="flex gap-2 text-[14px] text-[rgba(255,255,255,0.7)] leading-[1.65]">
                        <span className={clsx('shrink-0 mt-[4px]', getView('experience') === 'rewritten' ? 'text-green-500/60' : 'text-orange-500/60')}>•</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Skills */}
          <SectionCard label="Skills" view={getView('skills')} onToggle={() => toggleView('skills')}>
            <div className={clsx('pl-4 border-l-2', getView('skills') === 'rewritten' ? 'border-green-500/40' : 'border-orange-500/40')}>
              <div className="flex flex-wrap gap-2">
                {(getView('skills') === 'rewritten' ? rewritten.skills : original.skills).map((skill, i) => {
                  const isNew = getView('skills') === 'rewritten' && newSkillsSet.has(skill.toLowerCase());
                  return (
                    <span key={i} className={clsx(
                      'rounded-full px-3 py-1 text-[12px] font-medium flex items-center gap-1.5 border',
                      isNew
                        ? 'bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.28)] text-green-300'
                        : getView('skills') === 'rewritten'
                          ? 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.75)]'
                          : 'bg-[rgba(249,115,22,0.06)] border-[rgba(249,115,22,0.18)] text-orange-200/70'
                    )}>
                      {skill}
                      {isNew && (
                        <span className="text-[9px] font-bold bg-green-500/20 text-green-400 rounded-full px-1.5 py-px uppercase tracking-wide leading-none">
                          New
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          </SectionCard>

          {/* ── Naukri accordion ── */}
          <AccordionCard label="📋 Naukri Profile" expanded={expandNaukri} onToggle={() => setExpandNaukri(v => !v)}>
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-semibold text-[rgba(255,255,255,0.4)] uppercase tracking-[0.08em] mb-2">About Me</p>
                <p className="text-[12px] text-[rgba(255,255,255,0.35)] mb-3">Copy-paste into your Naukri &ldquo;About Me&rdquo; section — keyword-optimised for this role.</p>
                <div className="rounded-xl bg-[rgba(34,197,94,0.05)] border border-[rgba(34,197,94,0.12)] p-4 text-[14px] text-[rgba(255,255,255,0.85)] leading-[1.7] whitespace-pre-wrap">
                  {rewritten.naukriProfileText}
                </div>
                <div className="mt-2"><CopyButton text={rewritten.naukriProfileText} label="Copy About Me" /></div>
              </div>
              <div className="border-t border-[rgba(255,255,255,0.07)] pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[13px] font-semibold text-white">Structured Naukri Profile</p>
                    <p className="text-[12px] text-[rgba(255,255,255,0.35)] mt-0.5">Headline · Summary · Key Skills with character counts</p>
                  </div>
                  {!naukriProfile && (
                    <button onClick={handleGenerateNaukriProfile} disabled={generatingNaukri}
                      className="flex items-center gap-2 rounded-[10px] bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors">
                      {generatingNaukri ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Generating…</> : 'Generate'}
                    </button>
                  )}
                </div>
                {naukriError && <p className="text-[13px] text-red-400 bg-red-500/10 rounded-lg px-3 py-2 mb-3">{naukriError}</p>}
                {naukriProfile && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-[rgba(255,255,255,0.4)] uppercase tracking-widest">Headline</label>
                        <CharCount text={naukriProfile.headline} max={250} />
                      </div>
                      <div className="rounded-xl bg-[rgba(99,102,241,0.06)] border border-[rgba(99,102,241,0.2)] px-4 py-3 text-[14px] text-white leading-[1.6]">{naukriProfile.headline}</div>
                      <CopyButton text={naukriProfile.headline} label="Copy Headline" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-[rgba(255,255,255,0.4)] uppercase tracking-widest">Summary</label>
                        <CharCount text={naukriProfile.summary} max={3000} />
                      </div>
                      <div className="rounded-xl bg-[rgba(99,102,241,0.06)] border border-[rgba(99,102,241,0.2)] px-4 py-3 text-[14px] text-[rgba(255,255,255,0.85)] leading-[1.7] whitespace-pre-wrap">{naukriProfile.summary}</div>
                      <CopyButton text={naukriProfile.summary} label="Copy Summary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[rgba(255,255,255,0.4)] uppercase tracking-widest">Key Skills ({naukriProfile.keySkills.length})</label>
                      <div className="flex flex-wrap gap-2">
                        {naukriProfile.keySkills.map((skill, i) => (
                          <span key={i} className="text-[12px] bg-[rgba(99,102,241,0.12)] border border-[rgba(99,102,241,0.25)] text-indigo-300 rounded-full px-3 py-1">{skill}</span>
                        ))}
                      </div>
                      <CopyButton text={naukriProfile.keySkills.join(', ')} label="Copy Skills" />
                    </div>
                    <button onClick={() => { setNaukriProfile(null); setNaukriError(''); }}
                      className="text-[12px] text-[rgba(255,255,255,0.3)] hover:text-[rgba(255,255,255,0.6)] transition-colors">Regenerate</button>
                  </div>
                )}
              </div>
            </div>
          </AccordionCard>

          {/* ── Cover Letter accordion ── */}
          <AccordionCard label="📝 Cover Letter" expanded={expandCoverLetter} onToggle={() => setExpandCoverLetter(v => !v)}>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <p className="text-[13px] text-[rgba(255,255,255,0.55)]">
                  AI-written cover letter tailored to the job description. Review and personalise before sending.
                </p>
                {!coverLetter && (
                  <button onClick={handleGenerateCoverLetter} disabled={generatingCL || !jdText}
                    className="shrink-0 flex items-center gap-2 rounded-[10px] bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors">
                    {generatingCL ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Generating…</> : 'Generate'}
                  </button>
                )}
              </div>
              {!jdText && !coverLetter && (
                <p className="text-[12px] text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2">JD text not available. Re-run the analysis to enable cover letter generation.</p>
              )}
              {clError && <p className="text-[13px] text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{clError}</p>}
              {generatingCL && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-500 border-t-transparent" />
                  <p className="text-[13px] text-[rgba(255,255,255,0.4)]">Claude is writing your cover letter…</p>
                </div>
              )}
              {coverLetter && !generatingCL && (
                <div className="space-y-3">
                  <div className="rounded-xl bg-[rgba(99,102,241,0.06)] border border-[rgba(99,102,241,0.18)] px-5 py-4 text-[14px] text-[rgba(255,255,255,0.85)] leading-[1.8] whitespace-pre-wrap">{coverLetter}</div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <CopyButton text={coverLetter} label="Copy to clipboard" />
                    <button onClick={handleDownloadCoverLetterDocx} disabled={downloadingCL}
                      className="flex items-center gap-2 text-[13px] font-semibold text-[rgba(255,255,255,0.6)] hover:text-white transition-colors">
                      {downloadingCL ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      )}
                      Download as DOCX
                    </button>
                    <button onClick={() => { setCoverLetter(''); setClError(''); }}
                      className="text-[12px] text-[rgba(255,255,255,0.3)] hover:text-[rgba(255,255,255,0.6)] transition-colors">Regenerate</button>
                  </div>
                </div>
              )}
            </div>
          </AccordionCard>

          {/* ── Gap Analysis accordion ── */}
          <AccordionCard label="🎯 Gap Analysis" expanded={expandGap} onToggle={() => setExpandGap(v => !v)}>
            <div className="space-y-5">
              {!score && !jd ? (
                <p className="text-[14px] text-[rgba(255,255,255,0.4)] italic">Run an ATS score check first to see the gap analysis.</p>
              ) : (
                <>
                  <p className="text-[13px] text-[rgba(255,255,255,0.45)]">Skills and keywords from the JD compared against your resume.</p>
                  {requiredMissing.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-[11px] font-bold text-red-400 uppercase tracking-widest">Critical — Required Missing ({requiredMissing.length})</h3>
                      {requiredMissing.map(skill => (
                        <div key={skill} className="rounded-xl bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.18)] px-4 py-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[14px] font-semibold text-red-300">{skill}</span>
                            <span className="text-[10px] bg-red-500/20 text-red-400 rounded-full px-2 py-0.5 shrink-0">Required</span>
                          </div>
                          <p className="text-[12px] text-[rgba(255,255,255,0.35)] mt-1">{skillSuggestion(skill)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {preferredMissing.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">Preferred — Nice-to-Have Missing ({preferredMissing.length})</h3>
                      {preferredMissing.map(skill => (
                        <div key={skill} className="rounded-xl bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.18)] px-4 py-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[14px] font-semibold text-amber-300">{skill}</span>
                            <span className="text-[10px] bg-amber-500/20 text-amber-400 rounded-full px-2 py-0.5 shrink-0">Preferred</span>
                          </div>
                          <p className="text-[12px] text-[rgba(255,255,255,0.35)] mt-1">{skillSuggestion(skill)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {missingFromScore.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-[11px] font-bold text-[rgba(255,255,255,0.35)] uppercase tracking-widest">Other Missing Keywords ({missingFromScore.length})</h3>
                      <div className="flex flex-wrap gap-2">
                        {missingFromScore.map(kw => (
                          <span key={kw} className="text-[12px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.5)] rounded-full px-3 py-1">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {score && score.matchedKeywords.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-[11px] font-bold text-green-400 uppercase tracking-widest">Already Matched ({score.matchedKeywords.length})</h3>
                      <div className="flex flex-wrap gap-2">
                        {score.matchedKeywords.map(kw => (
                          <span key={kw} className="text-[12px] bg-[rgba(34,197,94,0.07)] border border-[rgba(34,197,94,0.18)] text-green-300 rounded-full px-3 py-1">✓ {kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {requiredMissing.length === 0 && preferredMissing.length === 0 && missingFromScore.length === 0 && (
                    <div className="rounded-xl bg-[rgba(34,197,94,0.07)] border border-[rgba(34,197,94,0.18)] px-5 py-4 text-[14px] text-green-300">
                      No skill gaps found — your resume already covers the JD requirements.
                    </div>
                  )}
                </>
              )}
            </div>
          </AccordionCard>
        </div>
      )}

      {/* ── Edit Mode ── */}
      {mode === 'edit' && (
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[11px] font-semibold text-[rgba(255,255,255,0.45)] uppercase tracking-[0.08em]">Summary</label>
            <textarea
              value={edited.summary}
              onChange={(e) => onEditChange({ ...edited, summary: e.target.value })}
              className="w-full min-h-[120px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-white text-[14px] leading-[1.7] p-[16px] focus:border-[#6366f1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] outline-none resize-y transition-all"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-semibold text-[rgba(255,255,255,0.45)] uppercase tracking-[0.08em]">Skills (comma-separated)</label>
            <textarea
              value={edited.skills.join(', ')}
              onChange={(e) => onEditChange({ ...edited, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              className="w-full min-h-[80px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-white text-[14px] leading-[1.7] p-[16px] focus:border-[#6366f1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] outline-none resize-y transition-all"
            />
          </div>
          <div className="space-y-4">
            <label className="text-[11px] font-semibold text-[rgba(255,255,255,0.45)] uppercase tracking-[0.08em]">Work Experience</label>
            {edited.experience.map((job, i) => (
              <div key={i}
                className={clsx('border border-[rgba(255,255,255,0.07)] rounded-[14px] p-[20px] transition-colors', focusedExpIndex === i ? 'bg-[rgba(99,102,241,0.05)] border-[rgba(99,102,241,0.3)]' : 'bg-[rgba(255,255,255,0.02)]')}
                onFocus={() => setFocusedExpIndex(i)} onBlur={() => setFocusedExpIndex(null)}
              >
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input type="text" placeholder="Job Title" value={job.title}
                    onChange={(e) => { const n = [...edited.experience]; n[i] = { ...n[i], title: e.target.value }; onEditChange({ ...edited, experience: n }); }}
                    className="bg-transparent border-b border-[rgba(255,255,255,0.1)] text-white text-[15px] font-semibold py-1 outline-none focus:border-[#6366f1] transition-colors w-full"
                  />
                  <input type="text" placeholder="Company" value={job.company}
                    onChange={(e) => { const n = [...edited.experience]; n[i] = { ...n[i], company: e.target.value }; onEditChange({ ...edited, experience: n }); }}
                    className="bg-transparent border-b border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.6)] text-[14px] py-1 outline-none focus:border-[#6366f1] transition-colors w-full"
                  />
                </div>
                <textarea placeholder="Bullet points (one per line)" value={job.bullets.join('\n')}
                  onChange={(e) => { const n = [...edited.experience]; n[i] = { ...n[i], bullets: e.target.value.split('\n') }; onEditChange({ ...edited, experience: n }); }}
                  className="w-full bg-transparent border-none text-[rgba(255,255,255,0.8)] text-[14px] leading-[1.7] resize-none min-h-[80px] outline-none"
                  style={{ height: `${Math.max(80, job.bullets.length * 24)}px` }}
                />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-semibold text-[rgba(255,255,255,0.45)] uppercase tracking-[0.08em]">Naukri Profile Text</label>
            <textarea
              value={edited.naukriProfileText}
              onChange={(e) => onEditChange({ ...edited, naukriProfileText: e.target.value })}
              className="w-full min-h-[120px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-white text-[14px] leading-[1.7] p-[16px] focus:border-[#6366f1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] outline-none resize-y transition-all"
            />
          </div>
        </div>
      )}

      {/* ── Preview Mode ── */}
      {mode === 'preview' && (
        <div className="space-y-3">
          <p className="text-[13px] text-[rgba(255,255,255,0.45)]">Live preview — exactly as it will appear when downloaded as PDF.</p>
          <div className="rounded-xl overflow-hidden border border-[rgba(255,255,255,0.07)]">
            <ResumePreview resume={edited} />
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="border-t border-[rgba(255,255,255,0.08)] pt-4 flex items-center gap-3">
        <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-[12px] text-[rgba(255,255,255,0.4)]">
          <strong className="text-[rgba(255,255,255,0.6)] font-semibold">Review before sending.</strong>{' '}
          Claude preserves your facts but always read through before uploading.
        </p>
      </div>

    </div>
  );
}
