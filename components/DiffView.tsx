'use client';

import { useState } from 'react';
import { ParsedResume, RewrittenResume } from '@/lib/types';
import clsx from 'clsx';
import ResumePreview from '@/components/ResumePreview';

type Tab = 'summary' | 'experience' | 'skills' | 'naukri' | 'edit' | 'preview';

interface Props {
  original: ParsedResume;
  rewritten: RewrittenResume;
  edited: RewrittenResume;
  jobTitle: string;
  onDownloadDocx: () => void;
  onDownloadPdf: () => void;
  onEditChange: (edited: RewrittenResume) => void;
  downloading?: boolean;
}

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

export default function DiffView({ original, rewritten, edited, jobTitle, onDownloadDocx, onDownloadPdf, onEditChange, downloading }: Props) {
  const [tab, setTab] = useState<Tab>('summary');
  const [focusedExpIndex, setFocusedExpIndex] = useState<number | null>(null);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'summary',    label: 'Summary' },
    { id: 'experience', label: 'Experience' },
    { id: 'skills',     label: 'Skills' },
    { id: 'naukri',     label: 'Naukri text' },
    { id: 'edit',       label: '✏️ Edit' },
    { id: 'preview',    label: '📄 Preview' },
  ];

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
            {downloading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            Download DOCX
          </button>
          <button
            onClick={onDownloadPdf}
            disabled={downloading}
            className="flex items-center gap-2 rounded-[10px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] px-[16px] py-[8px] text-[13px] font-medium text-[rgba(255,255,255,0.85)] hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] disabled:opacity-60 transition-all duration-200 ease"
          >
            {downloading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 5v14m7-7H5" />
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

      {tab !== 'edit' && tab !== 'preview' && (
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
      <div className="flex flex-wrap gap-6 border-b border-[rgba(255,255,255,0.08)] mb-[24px] mt-2">
        {tabs.map(t => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id)} 
            className={clsx(
              "text-[13px] pb-[8px] transition-colors relative",
              tab === t.id 
                ? "text-[#ffffff] font-semibold border-b-2 border-[#6366f1]" 
                : "text-[rgba(255,255,255,0.35)] font-normal border-b-2 border-transparent hover:text-[rgba(255,255,255,0.6)]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-5">
        {tab === 'summary' && (
          <SideBySide
            left={original.summary}
            right={rewritten.summary}
          />
        )}

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
                  <BulletDiff
                    original={orig?.bullets || []}
                    rewritten={job.bullets}
                  />
                </div>
              );
            })}
          </div>
        )}

        {tab === 'skills' && (
          <SideBySide
            label="Skills (ordered by JD relevance)"
            left={original.skills.join(', ')}
            right={rewritten.skills.join(', ')}
          />
        )}

        {tab === 'naukri' && (
          <div className="space-y-4">
            <p className="text-[14px] text-[rgba(255,255,255,0.6)]">
              Copy-paste this into your Naukri profile &ldquo;About Me&rdquo; section — keyword-optimised for this role.
            </p>
            <div className="rounded-xl bg-[rgba(34,197,94,0.05)] border border-[rgba(34,197,94,0.15)] p-5 text-[14px] text-[rgba(255,255,255,0.85)] leading-[1.7] whitespace-pre-wrap">
              {rewritten.naukriProfileText}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(rewritten.naukriProfileText)}
              className="text-[13px] font-semibold text-[#6366f1] hover:text-indigo-400 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to clipboard
            </button>
          </div>
        )}

        {tab === 'edit' && (
          <div className="space-y-8">
            {/* Edit Summary */}
            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-[rgba(255,255,255,0.5)] uppercase tracking-[0.08em]">Summary</label>
              <textarea
                value={edited.summary}
                onChange={(e) => onEditChange({ ...edited, summary: e.target.value })}
                className="w-full min-h-[120px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-[#ffffff] text-[14px] leading-[1.7] p-[16px] focus:border-[#6366f1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] outline-none resize-y transition-all duration-200"
              />
            </div>

            {/* Edit Skills */}
            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-[rgba(255,255,255,0.5)] uppercase tracking-[0.08em]">Skills (comma-separated)</label>
              <textarea
                value={edited.skills.join(', ')}
                onChange={(e) => onEditChange({ ...edited, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                className="w-full min-h-[120px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-[#ffffff] text-[14px] leading-[1.7] p-[16px] focus:border-[#6366f1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] outline-none resize-y transition-all duration-200"
              />
            </div>

            {/* Edit Experience */}
            <div className="space-y-4">
              <label className="text-[11px] font-semibold text-[rgba(255,255,255,0.5)] uppercase tracking-[0.08em]">Work Experience</label>
              {edited.experience.map((job, i) => (
                <div 
                  key={i} 
                  className={clsx(
                    "border border-[rgba(255,255,255,0.07)] rounded-[14px] p-[20px] mb-[16px] transition-colors duration-200",
                    focusedExpIndex === i ? "bg-[rgba(99,102,241,0.05)] border-[rgba(99,102,241,0.3)]" : "bg-[rgba(255,255,255,0.03)]"
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
                        newExp[i].title = e.target.value;
                        onEditChange({ ...edited, experience: newExp });
                      }}
                      className="bg-transparent border-none border-b border-[rgba(255,255,255,0.1)] text-[#ffffff] text-[15px] font-semibold py-1 outline-none focus:border-[#6366f1] transition-colors w-full"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={job.company}
                      onChange={(e) => {
                        const newExp = [...edited.experience];
                        newExp[i].company = e.target.value;
                        onEditChange({ ...edited, experience: newExp });
                      }}
                      className="bg-transparent border-none border-b border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.6)] text-[14px] font-normal py-1 outline-none focus:border-[#6366f1] transition-colors w-full"
                    />
                  </div>
                  <textarea
                    placeholder="Bullet points (one per line)"
                    value={job.bullets.join('\n')}
                    onChange={(e) => {
                      const newExp = [...edited.experience];
                      newExp[i].bullets = e.target.value.split('\n');
                      onEditChange({ ...edited, experience: newExp });
                    }}
                    className="w-full bg-transparent border-none text-[rgba(255,255,255,0.8)] text-[14px] leading-[1.7] resize-none min-h-[80px] outline-none"
                    style={{ height: `${Math.max(80, job.bullets.length * 24)}px` }}
                  />
                </div>
              ))}
            </div>

            {/* Edit Naukri Text */}
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
          Claude preserves your facts but always read through the rewrite to confirm accuracy before uploading.
        </p>
      </div>
    </div>
  );
}
