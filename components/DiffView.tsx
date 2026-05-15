'use client';

import { useState } from 'react';
import Link from 'next/link';
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
      {label && <p className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>}
      <div className="rounded-lg bg-red-50/60 border border-red-100 p-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
        {left || <span className="italic text-gray-400">empty</span>}
      </div>
      <div className="rounded-lg bg-green-50/60 border border-green-100 p-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
        {right || <span className="italic text-gray-400">empty</span>}
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
            'rounded-lg p-2 text-sm leading-snug',
            original[i] ? 'bg-red-50/60 border border-red-100 text-gray-700' : 'invisible'
          )}>
            {original[i] && <><span className="text-red-400 mr-1">•</span>{original[i]}</>}
          </li>
        ))}
      </ul>
      <ul className="space-y-1.5">
        {Array.from({ length: maxLen }).map((_, i) => (
          <li key={i} className={clsx(
            'rounded-lg p-2 text-sm leading-snug',
            rewritten[i] ? 'bg-green-50/60 border border-green-100 text-gray-700' : 'invisible'
          )}>
            {rewritten[i] && <><span className="text-green-500 mr-1">•</span>{rewritten[i]}</>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DiffView({ original, rewritten, edited, jobTitle, onDownloadDocx, onDownloadPdf, onEditChange, downloading }: Props) {
  const [tab, setTab] = useState<Tab>('summary');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'summary',    label: 'Summary' },
    { id: 'experience', label: 'Experience' },
    { id: 'skills',     label: 'Skills' },
    { id: 'naukri',     label: 'Naukri text' },
    { id: 'edit',       label: '✏️ Edit' },
    { id: 'preview',    label: '📄 Preview' },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-green-800 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Resume Rewritten</h2>
          <p className="text-green-300 text-sm mt-0.5">
            Optimised for: <span className="font-medium text-white">{jobTitle}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onDownloadDocx}
            disabled={downloading}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2 text-sm font-semibold text-green-800 hover:bg-green-50 disabled:opacity-60 transition-colors shadow-sm"
          >
            {downloading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-green-700 border-t-transparent" />
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            Download DOCX
          </button>
          <button
            onClick={onDownloadPdf}
            disabled={downloading}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2 text-sm font-semibold text-indigo-800 hover:bg-indigo-50 disabled:opacity-60 transition-colors shadow-sm"
          >
            {downloading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-700 border-t-transparent" />
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 5v14m7-7H5" />
              </svg>
            )}
            Download PDF
          </button>
          <button
            onClick={() => setTab('edit')}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            ✏️ Edit Inline
          </button>
        </div>
      </div>

      {/* Column labels */}
      <div className="grid grid-cols-2 gap-4 px-6 pt-4 pb-0">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Original</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rewritten</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-3 pb-0 border-b border-gray-100">
        {tabs.map(t => (
          <Link key={t.id} href={`/sections/${t.id}`} className="px-4 py-2 text-sm font-medium rounded-t-lg text-gray-500 hover:text-gray-700">
            {t.label}
          </Link>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-6 py-5 space-y-5">
        {tab === 'summary' && (
          <SideBySide
            left={original.summary}
            right={rewritten.summary}
          />
        )}

        {tab === 'experience' && (
          <div className="space-y-6">
            {rewritten.experience.map((job, i) => {
              const orig = original.experience[i];
              return (
                <div key={i} className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-sm font-semibold text-gray-700">
                      {orig ? `${orig.title} @ ${orig.company}` : '—'}
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
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
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Copy-paste this into your Naukri profile &ldquo;About Me&rdquo; section — keyword-optimised for this role.
            </p>
            <div className="rounded-lg bg-green-50/60 border border-green-100 p-4 text-sm text-gray-700 leading-relaxed">
              {rewritten.naukriProfileText}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(rewritten.naukriProfileText)}
              className="text-xs font-medium text-indigo-600 hover:underline"
            >
              Copy to clipboard
            </button>
          </div>
        )}

        {tab === 'edit' && (
          <div className="space-y-6">
            {/* Edit Summary */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Summary</label>
              <textarea
                value={edited.summary}
                onChange={(e) => onEditChange({ ...edited, summary: e.target.value })}
                className="w-full h-24 rounded-lg border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>

            {/* Edit Skills */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Skills (comma-separated)</label>
              <textarea
                value={edited.skills.join(', ')}
                onChange={(e) => onEditChange({ ...edited, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                className="w-full h-20 rounded-lg border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>

            {/* Edit Experience */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700">Work Experience</label>
              {edited.experience.map((job, i) => (
                <div key={i} className="rounded-lg border border-gray-300 p-4 space-y-3 bg-gray-50">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={job.title}
                      onChange={(e) => {
                        const newExp = [...edited.experience];
                        newExp[i].title = e.target.value;
                        onEditChange({ ...edited, experience: newExp });
                      }}
                      className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
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
                      className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <textarea
                    placeholder="Bullet points (one per line)"
                    value={job.bullets.join('\n')}
                    onChange={(e) => {
                      const newExp = [...edited.experience];
                      newExp[i].bullets = e.target.value.split('\n').filter(b => b.trim());
                      onEditChange({ ...edited, experience: newExp });
                    }}
                    className="w-full h-24 rounded border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                  />
                </div>
              ))}
            </div>

            {/* Edit Naukri Text */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Naukri Profile Text</label>
              <textarea
                value={edited.naukriProfileText}
                onChange={(e) => onEditChange({ ...edited, naukriProfileText: e.target.value })}
                className="w-full h-28 rounded-lg border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>
          </div>
        )}

        {tab === 'preview' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Live preview of your edited resume — exactly as it will appear when downloaded as PDF.
            </p>
            <ResumePreview resume={edited} />
          </div>
        )}
      </div>

      {/* Footer warning */}
      <div className="border-t border-gray-100 bg-amber-50 px-6 py-3">
        <p className="text-xs text-amber-700">
          <strong>Review before sending.</strong>{' '}
          Claude preserves your facts but always read through the rewrite to confirm accuracy before uploading.
        </p>
      </div>
    </div>
  );
}
