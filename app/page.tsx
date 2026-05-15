'use client';

import { useState, useRef } from 'react';
import UploadZone from '@/components/UploadZone';
import ScoreReport from '@/components/ScoreReport';
import DiffView from '@/components/DiffView';
import { ParsedResume, ATSScore, ParsedJD, RewrittenResume } from '@/lib/types';

type Stage = 'input' | 'scored' | 'rewritten';

export default function Home() {
  const [resume, setResume] = useState<ParsedResume | null>(null);
  const [jdText, setJdText] = useState('');
  const [stage, setStage] = useState<Stage>('input');
  const [score, setScore] = useState<ATSScore | null>(null);
  const [jd, setJd] = useState<ParsedJD | null>(null);
  const [rewritten, setRewritten] = useState<RewrittenResume | null>(null);
  const [scoring, setScoring] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [parseError, setParseError] = useState('');
  const [scoreError, setScoreError] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (!resume || !jdText.trim()) return;
    setScoring(true);
    setScoreError('');

    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jdText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scoring failed');
      setScore(data.score);
      setJd(data.jd);
      setStage('scored');
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e) {
      setScoreError(e instanceof Error ? e.message : 'Analysis failed. Please try again.');
    } finally {
      setScoring(false);
    }
  };

  const handleRewriteClick = async () => {
    if (!resume) return;
    setRewriting(true);
    setScoreError('');
    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jdText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Rewrite failed');
      setRewritten(data.rewritten);
      setStage('rewritten');
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e) {
      setScoreError(e instanceof Error ? e.message : 'Rewrite failed. Please try again.');
    } finally {
      setRewriting(false);
    }
  };

  const handleDownload = async () => {
    if (!rewritten || !jd) return;
    setDownloading(true);
    try {
      const res = await fetch('/api/generate-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: rewritten, jobTitle: jd.jobTitle }),
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const name = rewritten.contact?.name?.replace(/\s+/g, '_') || 'Resume';
      const title = jd.jobTitle?.replace(/\s+/g, '_').slice(0, 30) || 'Role';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}_${title}_TailorCV.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setScoreError(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const canAnalyze = resume && jdText.trim().length > 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold text-indigo-700 tracking-tight">TailorCV</span>
          <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2.5 py-0.5">
            Free ATS check · ₹49 rewrite
          </span>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-indigo-900 text-white py-12 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Job-ready in 60 seconds
          </h1>
          <p className="mt-3 text-indigo-300 text-lg max-w-xl mx-auto">
            Upload your resume · paste the JD · get an ATS score and a Claude-rewritten version
            ready to upload to Naukri
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm">
            {['Naukri', 'LinkedIn', 'Taleo', 'Darwinbox', 'Keka', 'Workday'].map(name => (
              <span key={name} className="bg-indigo-800/60 border border-indigo-700 rounded-full px-3 py-1 text-indigo-200">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Main form */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
        {/* Step indicators */}
        <div className="flex items-center gap-3 text-sm font-medium">
          {[
            { n: 1, label: 'Upload resume' },
            { n: 2, label: 'Paste JD' },
            { n: 3, label: 'Get score' },
          ].map((s, i, arr) => (
            <div key={s.n} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                  {s.n}
                </span>
                <span className="text-gray-600">{s.label}</span>
              </div>
              {i < arr.length - 1 && <span className="text-gray-300">→</span>}
            </div>
          ))}
        </div>

        {/* Upload + JD */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Step 1 — Your resume
            </label>
            <UploadZone onParsed={setResume} onError={setParseError} />
            {parseError && (
              <p className="mt-2 text-sm text-red-600">{parseError}</p>
            )}
            {resume && (
              <p className="mt-2 text-xs text-green-600 font-medium">
                ✓ Parsed: {resume.contact.name || 'Resume'} · {resume.experience.length} jobs · {resume.skills.length} skills
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Step 2 — Job description
            </label>
            <textarea
              value={jdText}
              onChange={e => setJdText(e.target.value)}
              placeholder="Paste the full job description from Naukri, LinkedIn or any portal…"
              className="flex-1 min-h-[200px] rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
            />
            <p className="mt-1.5 text-xs text-gray-400">{jdText.length} characters</p>
          </div>
        </div>

        {/* Analyze button */}
        <div className="flex flex-col items-center gap-3">
          {scoreError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{scoreError}</p>
          )}
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze || scoring || rewriting}
            className="rounded-xl bg-indigo-600 px-10 py-3 text-base font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            {scoring ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Analysing…
              </span>
            ) : 'Analyse my resume — free'}
          </button>
          {!resume && <p className="text-xs text-gray-400">Upload a resume to get started</p>}
          {resume && !jdText.trim() && <p className="text-xs text-gray-400">Paste a job description to continue</p>}
        </div>

        {/* Results */}
        <div ref={resultsRef}>
          {stage === 'scored' && score && (
            <ScoreReport
              score={score}
              onRewrite={handleRewriteClick}
              rewriting={rewriting}
            />
          )}

          {rewriting && (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                <div>
                  <p className="font-semibold text-gray-800">Claude is rewriting your resume…</p>
                  <p className="text-sm text-gray-500 mt-1">This takes about 20–30 seconds</p>
                </div>
              </div>
            </div>
          )}

          {stage === 'rewritten' && rewritten && jd && (
            <DiffView
              original={resume!}
              rewritten={rewritten}
              jobTitle={jd.jobTitle}
              onDownload={handleDownload}
              downloading={downloading}
            />
          )}
        </div>

        {/* How it works */}
        {stage === 'input' && (
          <section className="rounded-2xl bg-white border border-gray-200 p-6 mt-4">
            <h2 className="text-base font-semibold text-gray-900 mb-4">How TailorCV works</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: '📄',
                  title: 'ATS Score (Free)',
                  body: 'We check keyword match, formatting, Naukri-specific fields, and content quality — 100-point breakdown.',
                },
                {
                  icon: '✏️',
                  title: 'AI Rewrite (₹49)',
                  body: 'Claude rewrites every section — summary, bullets, skills — using exact JD keywords. Never fabricates facts.',
                },
                {
                  icon: '⬇️',
                  title: 'DOCX Download',
                  body: 'Get a single-column ATS-safe DOCX ready to upload to Naukri. Plus a Naukri profile text block.',
                },
              ].map(item => (
                <div key={item.title} className="flex gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 py-6 px-4 text-center text-xs text-gray-400">
        <p>TailorCV · Resumes uploaded are auto-deleted after 24h · No human review</p>
        <p className="mt-1">Built for Indian job seekers · Naukri · LinkedIn · Company portals</p>
      </footer>

    </div>
  );
}
