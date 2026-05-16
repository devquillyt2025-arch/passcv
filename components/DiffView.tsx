'use client';

import { useState } from 'react';
import { ParsedResume, RewrittenResume, ATSScore, ParsedJD, NaukriProfile } from '@/lib/types';
import clsx from 'clsx';
import ResumePreview from '@/components/ResumePreview';

type Tab = 'summary' | 'experience' | 'skills' | 'naukri' | 'edit' | 'preview' | 'cover-letter' | 'gap';

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

// ── Shared sub-components ────────────────────────────────────────────

function SideBySide({ label, left, right }: { label?: string; left: string; right: string }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {label && <p className="col-span-2 text-[11px] font-semibold text-[rgba(255,255,255,0.5)] uppercase tracking-[0.08em]">{label}</p>}
      <div className="rounded-xl bg-[rgba(249,115,22,0.05)] border border-[rgba(249,115,22,0.15)] p-4 text-[14px] text-[rgba(255,255,255,0.7)] whitespace-pre-wrap leading-[1.7]">
        {left || <span className="italic text-[rgba(255,255,255,0.3)]">empty</span>}
      </div>
      <div className="rounded-xl bg-[rgba(34,197,94,0.05)] border border-[rgba(34,197,94,0.15)] p-4 text-[14px] text-[rgba(255,255,255,0.85)] whitespace-pre-wrap leading-[1.7]">
        {right || <span className="italic text-[rgba(255,255,255,0.3)]">empty</span>}
      </div>
    </div>
  );
}

function BulletDiff({ original, rewritten }: { original: string[]; rewritten: string[] }) {
  const maxLen = Math.max(original.length, rewritten.length);
  return (
    <div className="grid grid-cols-2 gap-4">
      <ul className="space-y-1.5">
        {Array.from({ length: maxLen }).map((_, i) => (
          <li key={i} className={clsx(
            'rounded-xl p-3 text-[14px] leading-[1.7]',
            original[i] ? 'bg-[rgba(249,115,22,0.05)] border border-[rgba(249,115,22,0.15)] text-[rgba(255,255,255,0.7)]' : 'invisible'
          )}>
            {original[i] && <><span className="text-[#f97316] mr-2">•</span>{original[i]}</>}
          </li>
        ))}
      </ul>
      <ul className="space-y-1.5">
        {Array.from({ length: maxLen }).map((_, i) => (
          <li key={i} className={clsx(
            'rounded-xl p-3 text-[14px] leading-[1.7]',
            rewritten[i] ? 'bg-[rgba(34,197,94,0.05)] border border-[rgba(34,197,94,0.15)] text-[rgba(255,255,255,0.85)]' : 'invisible'
          )}>
            {rewritten[i] && <><span className="text-[#22c55e] mr-2">•</span>{rewritten[i]}</>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
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
  const over = n > max;
  return (
    <span className={clsx('text-[11px] font-mono tabular-nums', over ? 'text-red-400' : 'text-[rgba(255,255,255,0.35)]')}>
      {n}/{max}
    </span>
  );
}

// ── Gap Analysis helpers ─────────────────────────────────────────────

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

// ── Main component ───────────────────────────────────────────────────

export default function DiffView({
  original, rewritten, edited, jobTitle, jdText, score, jd,
  onDownloadDocx, onDownloadPdf, onEditChange, downloading,
}: Props) {
  const [tab, setTab] = useState<Tab>('summary');
  const [focusedExpIndex, setFocusedExpIndex] = useState<number | null>(null);

  // Cover letter state
  const [coverLetter, setCoverLetter] = useState('');
  const [generatingCL, setGeneratingCL] = useState(false);
  const [clError, setClError] = useState('');
  const [downloadingCL, setDownloadingCL] = useState(false);

  // Naukri structured profile state
  const [naukriProfile, setNaukriProfile] = useState<NaukriProfile | null>(null);
  const [generatingNaukri, setGeneratingNaukri] = useState(false);
  const [naukriError, setNaukriError] = useState('');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'summary',      label: 'Summary' },
    { id: 'experience',   label: 'Experience' },
    { id: 'skills',       label: 'Skills' },
    { id: 'gap',          label: '🎯 Gap Analysis' },
    { id: 'naukri',       label: 'Naukri' },
    { id: 'cover-letter', label: '📝 Cover Letter' },
    { id: 'edit',         label: '✏️ Edit' },
    { id: 'preview',      label: '📄 Preview' },
  ];

  const handleGenerateCoverLetter = async () => {
    if (!jdText) return;
    setGeneratingCL(true);
    setClError('');
    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: original, jdText, jobTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setCoverLetter(data.coverLetter);
    } catch (e) {
      setClError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setGeneratingCL(false);
    }
  };

  const handleDownloadCoverLetterDocx = async () => {
    setDownloadingCL(true);
    try {
      const res = await fetch('/api/generate_docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'cover_letter',
          coverLetter,
          name: original.contact.name,
          jobTitle,
        }),
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(original.contact.name || 'Candidate').replace(/\s+/g, '_')}_CoverLetter_TailorCV.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setClError(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setDownloadingCL(false);
    }
  };

  const handleGenerateNaukriProfile = async () => {
    setGeneratingNaukri(true);
    setNaukriError('');
    try {
      const res = await fetch('/api/naukri-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: rewritten, jobTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setNaukriProfile(data as NaukriProfile);
    } catch (e) {
      setNaukriError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setGeneratingNaukri(false);
    }
  };

  // Gap analysis computed values
  const resumeSkillsLower = new Set((original.skills || []).map(s => s.toLowerCase()));
  const requiredMissing = (jd?.requiredSkills || []).filter(s => !resumeSkillsLower.has(s.toLowerCase()));
  const preferredMissing = (jd?.preferredSkills || []).filter(s => !resumeSkillsLower.has(s.toLowerCase()));
  const missingFromScore = (score?.missingKeywords || []).filter(
    kw => !resumeSkillsLower.has(kw.toLowerCase()) &&
          !requiredMissing.some(s => s.toLowerCase() === kw.toLowerCase()) &&
          !preferredMissing.some(s => s.toLowerCase() === kw.toLowerCase())
  );

  const showOrigRewrittenColumns = tab !== 'edit' && tab !== 'preview' && tab !== 'cover-letter' && tab !== 'gap' && tab !== 'naukri';

  return (
    <div className="bg-[#0f0f17] border border-[rgba(255,255,255,0.07)] rounded-[20px] p-[32px]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-6 border-b border-[rgba(255,255,255,0.08)]">
        <div>
          <h2 className="text-[22px] font-bold text-[#ffffff]">Resume Rewritten</h2>
          <p className="text-[13px] text-[rgba(255,255,255,0.4)] font-normal mt-1">
            Optimised for: {jobTitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onDownloadDocx}
            disabled={downloading}
            className="flex items-center gap-2 rounded-[10px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] px-[16px] py-[8px] text-[13px] font-medium text-[rgba(255,255,255,0.85)] hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] disabled:opacity-60 transition-all duration-200 ease"
          >
            {downloading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : (
              <svg className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            Download DOCX
          </button>
          <button
            onClick={onDownloadPdf}
            disabled={downloading}
            className="flex items-center gap-2 rounded-[10px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] px-[16px] py-[8px] text-[13px] font-medium text-[rgba(255,255,255,0.85)] hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] disabled:opacity-60 transition-all duration-200 ease"
          >
            {downloading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : (
              <svg className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
              </svg>
            )}
            Download PDF
          </button>
          <button
            onClick={() => setTab('edit')}
            className="flex items-center gap-2 rounded-[10px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] px-[16px] py-[8px] text-[13px] font-medium text-[rgba(255,255,255,0.85)] hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] transition-all duration-200 ease"
          >
            <span className="opacity-70">✏️</span> Edit Inline
          </button>
        </div>
      </div>

      {showOrigRewrittenColumns && (
        <div className="grid grid-cols-2 gap-4 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#f97316]" />
            <span className="text-[11px] font-semibold text-[rgba(255,255,255,0.5)] uppercase tracking-[0.08em]">Original</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
            <span className="text-[11px] font-semibold text-[rgba(255,255,255,0.5)] uppercase tracking-[0.08em]">Rewritten</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-5 overflow-x-auto border-b border-[rgba(255,255,255,0.08)] mb-[24px] mt-2 pb-px scrollbar-hide">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'text-[13px] pb-[8px] transition-colors relative whitespace-nowrap shrink-0',
              tab === t.id
                ? 'text-[#ffffff] font-semibold border-b-2 border-[#6366f1]'
                : 'text-[rgba(255,255,255,0.5)] font-normal border-b-2 border-transparent hover:text-[rgba(255,255,255,0.8)]'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-5">

        {/* ── Summary ── */}
        {tab === 'summary' && (
          <SideBySide left={original.summary} right={rewritten.summary} />
        )}

        {/* ── Experience ── */}
        {tab === 'experience' && (
          <div className="space-y-8">
            {rewritten.experience.map((job, i) => {
              const orig = original.experience[i];
              return (
                <div key={i} className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-[15px] font-semibold text-[rgba(255,255,255,0.7)]">
                      {orig ? `${orig.title} @ ${orig.company}` : '—'}
                    </div>
                    <div className="text-[15px] font-semibold text-[#ffffff]">
                      {`${job.title} @ ${job.company}`}
                    </div>
                  </div>
                  <BulletDiff original={orig?.bullets || []} rewritten={job.bullets} />
                </div>
              );
            })}
          </div>
        )}

        {/* ── Skills ── */}
        {tab === 'skills' && (
          <SideBySide
            label="Skills (ordered by JD relevance)"
            left={original.skills.join(', ')}
            right={rewritten.skills.join(', ')}
          />
        )}

        {/* ── Gap Analysis ── */}
        {tab === 'gap' && (
          <div className="space-y-6">
            {!score && !jd ? (
              <p className="text-[14px] text-[rgba(255,255,255,0.5)] italic">
                Run an ATS score check first to see the gap analysis.
              </p>
            ) : (
              <>
                <p className="text-[13px] text-[rgba(255,255,255,0.5)]">
                  Skills and keywords from the JD compared against your resume. Focus on critical gaps first.
                </p>

                {requiredMissing.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold text-red-400 uppercase tracking-widest">
                      Critical — Required Skills Missing ({requiredMissing.length})
                    </h3>
                    <div className="space-y-2">
                      {requiredMissing.map(skill => (
                        <div key={skill} className="rounded-xl bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.2)] px-4 py-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[14px] font-semibold text-red-300">{skill}</span>
                            <span className="text-[10px] bg-red-500/20 text-red-400 rounded-full px-2 py-0.5 shrink-0">Required</span>
                          </div>
                          <p className="text-[12px] text-[rgba(255,255,255,0.4)] mt-1">{skillSuggestion(skill)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {preferredMissing.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                      Preferred — Nice-to-Have Missing ({preferredMissing.length})
                    </h3>
                    <div className="space-y-2">
                      {preferredMissing.map(skill => (
                        <div key={skill} className="rounded-xl bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.2)] px-4 py-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[14px] font-semibold text-amber-300">{skill}</span>
                            <span className="text-[10px] bg-amber-500/20 text-amber-400 rounded-full px-2 py-0.5 shrink-0">Preferred</span>
                          </div>
                          <p className="text-[12px] text-[rgba(255,255,255,0.4)] mt-1">{skillSuggestion(skill)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {missingFromScore.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold text-[rgba(255,255,255,0.4)] uppercase tracking-widest">
                      Other Missing Keywords ({missingFromScore.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {missingFromScore.map(kw => (
                        <span key={kw} className="text-[12px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.6)] rounded-full px-3 py-1">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {score && score.matchedKeywords.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold text-green-400 uppercase tracking-widest">
                      Already Matched ({score.matchedKeywords.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {score.matchedKeywords.map(kw => (
                        <span key={kw} className="text-[12px] bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)] text-green-300 rounded-full px-3 py-1">
                          ✓ {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {requiredMissing.length === 0 && preferredMissing.length === 0 && missingFromScore.length === 0 && (
                  <div className="rounded-xl bg-[rgba(34,197,94,0.07)] border border-[rgba(34,197,94,0.2)] px-5 py-4 text-[14px] text-green-300">
                    No skill gaps found — your resume already covers the JD requirements.
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Naukri ── */}
        {tab === 'naukri' && (
          <div className="space-y-6">
            {/* Existing naukriProfileText */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-[rgba(255,255,255,0.5)] uppercase tracking-[0.08em]">About Me (Naukri)</p>
              </div>
              <p className="text-[13px] text-[rgba(255,255,255,0.5)]">
                Copy-paste into your Naukri &ldquo;About Me&rdquo; section — keyword-optimised for this role.
              </p>
              <div className="rounded-xl bg-[rgba(34,197,94,0.05)] border border-[rgba(34,197,94,0.15)] p-5 text-[14px] text-[rgba(255,255,255,0.85)] leading-[1.7] whitespace-pre-wrap">
                {rewritten.naukriProfileText}
              </div>
              <CopyButton text={rewritten.naukriProfileText} label="Copy About Me" />
            </div>

            {/* Structured Naukri profile */}
            <div className="border-t border-[rgba(255,255,255,0.07)] pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-white">Structured Naukri Profile</p>
                  <p className="text-[12px] text-[rgba(255,255,255,0.4)] mt-0.5">Headline · Summary · Key Skills with character counts</p>
                </div>
                {!naukriProfile && (
                  <button
                    onClick={handleGenerateNaukriProfile}
                    disabled={generatingNaukri}
                    className="flex items-center gap-2 rounded-[10px] bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors"
                  >
                    {generatingNaukri ? (
                      <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Generating…</>
                    ) : 'Generate'}
                  </button>
                )}
              </div>

              {naukriError && (
                <p className="text-[13px] text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{naukriError}</p>
              )}

              {naukriProfile && (
                <div className="space-y-5">
                  {/* Headline */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-[rgba(255,255,255,0.5)] uppercase tracking-widest">Headline</label>
                      <CharCount text={naukriProfile.headline} max={250} />
                    </div>
                    <div className="rounded-xl bg-[rgba(99,102,241,0.06)] border border-[rgba(99,102,241,0.2)] px-4 py-3 text-[14px] text-white leading-[1.6]">
                      {naukriProfile.headline}
                    </div>
                    <CopyButton text={naukriProfile.headline} label="Copy Headline" />
                  </div>

                  {/* Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-[rgba(255,255,255,0.5)] uppercase tracking-widest">Summary</label>
                      <CharCount text={naukriProfile.summary} max={3000} />
                    </div>
                    <div className="rounded-xl bg-[rgba(99,102,241,0.06)] border border-[rgba(99,102,241,0.2)] px-4 py-3 text-[14px] text-[rgba(255,255,255,0.85)] leading-[1.7] whitespace-pre-wrap">
                      {naukriProfile.summary}
                    </div>
                    <CopyButton text={naukriProfile.summary} label="Copy Summary" />
                  </div>

                  {/* Key Skills */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-[rgba(255,255,255,0.5)] uppercase tracking-widest">Key Skills ({naukriProfile.keySkills.length})</label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {naukriProfile.keySkills.map((skill, i) => (
                        <span key={i} className="text-[12px] bg-[rgba(99,102,241,0.12)] border border-[rgba(99,102,241,0.25)] text-indigo-300 rounded-full px-3 py-1">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <CopyButton text={naukriProfile.keySkills.join(', ')} label="Copy Skills" />
                  </div>

                  <button
                    onClick={() => { setNaukriProfile(null); setNaukriError(''); }}
                    className="text-[12px] text-[rgba(255,255,255,0.35)] hover:text-[rgba(255,255,255,0.6)] transition-colors"
                  >
                    Regenerate
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Cover Letter ── */}
        {tab === 'cover-letter' && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[14px] text-[rgba(255,255,255,0.7)]">
                  AI-written cover letter tailored to the job description. Review and personalise before sending.
                </p>
              </div>
              {!coverLetter && (
                <button
                  onClick={handleGenerateCoverLetter}
                  disabled={generatingCL || !jdText}
                  className="shrink-0 flex items-center gap-2 rounded-[10px] bg-indigo-600 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors"
                >
                  {generatingCL ? (
                    <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Generating…</>
                  ) : 'Generate Cover Letter'}
                </button>
              )}
            </div>

            {!jdText && !coverLetter && (
              <p className="text-[13px] text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2">
                JD text is not available. Go back and re-run the analysis to enable cover letter generation.
              </p>
            )}

            {clError && (
              <p className="text-[13px] text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{clError}</p>
            )}

            {generatingCL && (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-500 border-t-transparent" />
                <p className="text-[13px] text-[rgba(255,255,255,0.5)]">Claude is writing your cover letter…</p>
              </div>
            )}

            {coverLetter && !generatingCL && (
              <div className="space-y-4">
                <div className="rounded-xl bg-[rgba(99,102,241,0.06)] border border-[rgba(99,102,241,0.2)] px-6 py-5 text-[14px] text-[rgba(255,255,255,0.85)] leading-[1.8] whitespace-pre-wrap">
                  {coverLetter}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <CopyButton text={coverLetter} label="Copy to clipboard" />
                  <button
                    onClick={handleDownloadCoverLetterDocx}
                    disabled={downloadingCL}
                    className="flex items-center gap-2 text-[13px] font-semibold text-[rgba(255,255,255,0.7)] hover:text-white transition-colors"
                  >
                    {downloadingCL ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    )}
                    Download as DOCX
                  </button>
                  <button
                    onClick={() => { setCoverLetter(''); setClError(''); }}
                    className="text-[12px] text-[rgba(255,255,255,0.35)] hover:text-[rgba(255,255,255,0.6)] transition-colors"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Edit ── */}
        {tab === 'edit' && (
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-[rgba(255,255,255,0.5)] uppercase tracking-[0.08em]">Summary</label>
              <textarea
                value={edited.summary}
                onChange={(e) => onEditChange({ ...edited, summary: e.target.value })}
                className="w-full min-h-[120px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-[#ffffff] text-[14px] leading-[1.7] p-[16px] focus:border-[#6366f1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] outline-none resize-y transition-all duration-200"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-[rgba(255,255,255,0.5)] uppercase tracking-[0.08em]">Skills (comma-separated)</label>
              <textarea
                value={edited.skills.join(', ')}
                onChange={(e) => onEditChange({ ...edited, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                className="w-full min-h-[80px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-[#ffffff] text-[14px] leading-[1.7] p-[16px] focus:border-[#6366f1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] outline-none resize-y transition-all duration-200"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-semibold text-[rgba(255,255,255,0.5)] uppercase tracking-[0.08em]">Work Experience</label>
              {edited.experience.map((job, i) => (
                <div
                  key={i}
                  className={clsx(
                    'border border-[rgba(255,255,255,0.07)] rounded-[14px] p-[20px] mb-[16px] transition-colors duration-200',
                    focusedExpIndex === i ? 'bg-[rgba(99,102,241,0.05)] border-[rgba(99,102,241,0.3)]' : 'bg-[rgba(255,255,255,0.03)]'
                  )}
                  onFocus={() => setFocusedExpIndex(i)}
                  onBlur={() => setFocusedExpIndex(null)}
                >
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={job.title}
                      onChange={(e) => {
                        const newExp = [...edited.experience];
                        newExp[i] = { ...newExp[i], title: e.target.value };
                        onEditChange({ ...edited, experience: newExp });
                      }}
                      className="bg-transparent border-b border-[rgba(255,255,255,0.1)] text-[#ffffff] text-[15px] font-semibold py-1 outline-none focus:border-[#6366f1] transition-colors w-full"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={job.company}
                      onChange={(e) => {
                        const newExp = [...edited.experience];
                        newExp[i] = { ...newExp[i], company: e.target.value };
                        onEditChange({ ...edited, experience: newExp });
                      }}
                      className="bg-transparent border-b border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.6)] text-[14px] py-1 outline-none focus:border-[#6366f1] transition-colors w-full"
                    />
                  </div>
                  <textarea
                    placeholder="Bullet points (one per line)"
                    value={job.bullets.join('\n')}
                    onChange={(e) => {
                      const newExp = [...edited.experience];
                      newExp[i] = { ...newExp[i], bullets: e.target.value.split('\n') };
                      onEditChange({ ...edited, experience: newExp });
                    }}
                    className="w-full bg-transparent border-none text-[rgba(255,255,255,0.8)] text-[14px] leading-[1.7] resize-none min-h-[80px] outline-none"
                    style={{ height: `${Math.max(80, job.bullets.length * 24)}px` }}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-[rgba(255,255,255,0.5)] uppercase tracking-[0.08em]">Naukri Profile Text</label>
              <textarea
                value={edited.naukriProfileText}
                onChange={(e) => onEditChange({ ...edited, naukriProfileText: e.target.value })}
                className="w-full min-h-[120px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-[#ffffff] text-[14px] leading-[1.7] p-[16px] focus:border-[#6366f1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] outline-none resize-y transition-all duration-200"
              />
            </div>
          </div>
        )}

        {/* ── Preview ── */}
        {tab === 'preview' && (
          <div className="space-y-4">
            <p className="text-[14px] text-[rgba(255,255,255,0.6)]">
              Live preview of your edited resume — exactly as it will appear when downloaded as PDF.
            </p>
            <div className="rounded-xl overflow-hidden border border-[rgba(255,255,255,0.07)]">
              <ResumePreview resume={edited} />
            </div>
          </div>
        )}
      </div>

      {/* Footer warning */}
      <div className="mt-8 border-t border-[rgba(255,255,255,0.08)] pt-4 flex items-center gap-3">
        <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-[12px] text-[rgba(255,255,255,0.4)]">
          <strong className="text-[rgba(255,255,255,0.6)] font-semibold">Review before sending.</strong>{' '}
          Claude preserves your facts but always read through before uploading.
        </p>
      </div>
    </div>
  );
}
