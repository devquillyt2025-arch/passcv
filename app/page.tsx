'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import UploadZone from '@/components/UploadZone';
import ScoreReport from '@/components/ScoreReport';
import DiffView from '@/components/DiffView';
import { ParsedResume, ATSScore, ParsedJD, RewrittenResume } from '@/lib/types';
import { ThemeToggle } from '@/components/ThemeToggle';

type Stage = 'input' | 'scored' | 'rewritten';

export default function Home() {
  const [resume, setResume] = useState<ParsedResume | null>(null);
  const [jdText, setJdText] = useState('');
  const [stage, setStage] = useState<Stage>('input');
  const [score, setScore] = useState<ATSScore | null>(null);
  const [jd, setJd] = useState<ParsedJD | null>(null);
  const [rewritten, setRewritten] = useState<RewrittenResume | null>(null);
  const [edited, setEdited] = useState<RewrittenResume | null>(null);
  const [scoring, setScoring] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [parseError, setParseError] = useState('');
  const [scoreError, setScoreError] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);

  const getDownloadFilename = (resume: RewrittenResume, jobTitle: string, ext: string) => {
    const name = resume.contact?.name?.replace(/\s+/g, '_') || 'Resume';
    const title = jobTitle?.replace(/\s+/g, '_').slice(0, 30) || 'Role';
    return `${name}_${title}_TailorCV.${ext}`;
  };

  const handleDownloadDocx = async () => {
    if (!edited || !jd) return;
    setDownloading(true);
    setScoreError('');
    try {
      console.log('DOCX download start', { jobTitle: jd.jobTitle, resumeName: edited.contact?.name });
      const res = await fetch('/api/generate_docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: edited, jobTitle: jd.jobTitle }),
      });

      console.log('DOCX response', { status: res.status, statusText: res.statusText });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('DOCX response error body', errorText);
        throw new Error(errorText || 'Download failed');
      }

      const blob = await res.blob();
      console.log('DOCX blob received', { size: blob.size, type: blob.type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getDownloadFilename(edited, jd.jobTitle, 'docx');
      a.click();
      URL.revokeObjectURL(url);
      console.log('DOCX download finished');
    } catch (e) {
      console.error('DOCX download error', e);
      setScoreError(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!edited || !jd) return;
    setDownloading(true);
    setScoreError('');
    try {
      const { generateResumePdfBlob } = await import('@/lib/resumePdf');
      const blob = await generateResumePdfBlob(edited);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getDownloadFilename(edited, jd.jobTitle, 'pdf');
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('PDF generation error', e);
      setScoreError(e instanceof Error ? e.message : 'PDF download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resume || !jdText.trim()) return;
    setScoring(true);
    setScoreError('');

    try {
      console.log('Starting score request', { resumeName: resume.contact?.name, jdLength: jdText.length });
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
      console.log('Starting rewrite request', { resumeName: resume.contact?.name, jdLength: jdText.length });
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jdText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Rewrite failed');
      setRewritten(data.rewritten);
      setEdited(data.rewritten);
      setStage('rewritten');
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e) {
      setScoreError(e instanceof Error ? e.message : 'Rewrite failed. Please try again.');
    } finally {
      setRewriting(false);
    }
  };

  const canAnalyze = resume && jdText.trim().length > 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-white relative transition-colors duration-200">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-gray-50/50 to-transparent dark:from-indigo-500/10 dark:via-[#0A0A0F]/0 dark:to-transparent"></div>
      
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white/80 dark:bg-[#0A0A0F]/40 backdrop-blur-[12px] border-b border-gray-200 dark:border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[20px] font-bold text-indigo-700 dark:text-white tracking-tight">TailorCV</span>
          <div className="flex items-center gap-4">
            <Link
              href="/builder"
              className="text-[13px] font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white transition-all duration-200 ease-in-out"
            >
              Build Resume →
            </Link>
            <span className="text-[13px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/[0.06] rounded-full px-3 py-1">
              Free ATS check · ₹49 rewrite
            </span>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-[64px] pb-0 px-4 relative overflow-hidden">
        <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[40px] z-0 pointer-events-none hidden dark:block" style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)' }}></div>
        <div className="mx-auto max-w-3xl text-center relative z-[1]">
          <h1 className="text-[56px] leading-[1.1] font-bold tracking-tight text-gray-900 dark:text-white">
            Job-ready in <span className="bg-gradient-to-r from-[#6366f1] to-[#a78bfa] bg-clip-text text-transparent">60 seconds</span>
          </h1>
          <p className="mt-[24px] text-[20px] text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Upload your resume · paste the JD · get an ATS score and a Claude-rewritten version
            ready to upload to Naukri
          </p>
          <div className="mt-[24px] flex flex-wrap justify-center gap-3">
            {['Naukri', 'LinkedIn', 'Taleo', 'Darwinbox', 'Keka', 'Workday'].map(name => (
              <span key={name} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full px-4 py-1.5 text-[13px] text-gray-600 dark:text-gray-300 shadow-sm dark:shadow-none">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Main form */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 pt-[48px] pb-[48px] space-y-[48px]">
        {/* Step indicators */}
        <div className="flex items-center w-full max-w-2xl text-[13px] font-medium">
          {[
            { n: 1, label: 'Upload resume', active: true },
            { n: 2, label: 'Paste JD', active: !!resume },
            { n: 3, label: 'Get score', active: !!resume && jdText.trim().length > 100 },
          ].map((s, i, arr) => (
            <div key={s.n} className={`flex items-center ${i < arr.length - 1 ? 'flex-1' : ''}`}>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`flex w-[28px] h-[28px] items-center justify-center rounded-full text-[13px] font-bold transition-all duration-200 ease-in-out ${s.active ? 'bg-[#6366f1] text-white' : 'border-[1.5px] border-gray-300 dark:border-[rgba(255,255,255,0.2)] text-gray-400 dark:text-[rgba(255,255,255,0.35)]'}`}>
                  {s.n}
                </span>
                <span className={s.active ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-[rgba(255,255,255,0.35)]'}>{s.label}</span>
              </div>
              {i < arr.length - 1 && <div className="h-[1px] flex-1 mx-[8px] bg-gray-200 dark:bg-[rgba(255,255,255,0.1)]"></div>}
            </div>
          ))}
        </div>

        {/* Upload + JD */}
        <div className="grid gap-[24px] md:grid-cols-2 items-stretch">
          <div className="flex flex-col h-full">
            <label className="mb-[12px] block text-[11px] font-medium tracking-[0.08em] uppercase text-gray-500 dark:text-[rgba(255,255,255,0.45)]">
              Step 1 — Your resume
            </label>
            <div className="flex-1">
            <UploadZone onParsed={setResume} onError={setParseError} />
            </div>
            {parseError && (
              <p className="mt-2 text-[13px] text-red-500 dark:text-red-400">{parseError}</p>
            )}
            {resume && (
              <p className="mt-2 text-[13px] text-green-600 dark:text-green-400 font-medium">
                ✓ Parsed: {resume.contact.name || 'Resume'} · {resume.experience.length} jobs · {resume.skills.length} skills
              </p>
            )}
          </div>

          <div className="flex flex-col h-full">
            <label className="mb-[12px] block text-[11px] font-medium tracking-[0.08em] uppercase text-gray-500 dark:text-[rgba(255,255,255,0.45)]">
              Step 2 — Job description
            </label>
            <div className="flex-1 h-[320px] min-h-[320px] max-h-[320px] w-full rounded-[16px] border-2 border-dashed border-gray-300 dark:border-[rgba(99,102,241,0.4)] bg-white dark:bg-[rgba(99,102,241,0.04)] focus-within:border-indigo-400 dark:focus-within:border-[rgba(99,102,241,0.8)] focus-within:bg-indigo-50/50 dark:focus-within:bg-[rgba(99,102,241,0.08)] transition-all duration-200 ease shadow-sm dark:shadow-none flex overflow-hidden">
              <textarea
                value={jdText}
                onChange={e => setJdText(e.target.value)}
                placeholder="Paste the full job description from Naukri, LinkedIn or any portal…"
                className="flex-1 h-full w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-[16px] text-gray-800 dark:text-white text-[14px] leading-[1.6] placeholder-gray-400 dark:placeholder-[rgba(255,255,255,0.3)] resize-none scrollbar-hide"
              />
            </div>
            <p className="mt-2 text-[12px] text-gray-500 dark:text-[rgba(255,255,255,0.4)]">{jdText.length} characters</p>
          </div>
        </div>

        {/* Analyze button */}
        <div className="flex flex-col items-center gap-[24px]">
          {scoreError && (
            <p className="text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{scoreError}</p>
          )}
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze || scoring || rewriting}
            className="w-full md:w-auto h-[56px] px-10 rounded-[14px] bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_100%)] text-white text-[16px] font-bold border-none hover:-translate-y-[1px] hover:shadow-[0_0_32px_rgba(99,102,241,0.5)] disabled:opacity-[0.35] disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0 transition-all duration-200 ease flex items-center justify-center"
          >
            {scoring ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Analysing…
              </span>
            ) : 'Analyse my resume — free'}
          </button>
          {!resume && <p className="text-[13px] text-gray-500 dark:text-[rgba(255,255,255,0.4)]">Upload a resume to get started</p>}
          {resume && !jdText.trim() && <p className="text-[13px] text-gray-500 dark:text-[rgba(255,255,255,0.4)]">Paste a job description to continue</p>}
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
            <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#13131A] shadow-sm dark:shadow-none p-[24px] text-center mt-[48px]">
              <div className="flex flex-col items-center gap-[24px]">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#6366f1] border-t-transparent" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-200">Claude is rewriting your resume…</p>
                  <p className="text-[13px] text-gray-500 mt-1">This takes about 20–30 seconds</p>
                </div>
              </div>
            </div>
          )}

          {stage === 'rewritten' && rewritten && edited && jd && (
            <div className="mt-[48px]">
              <DiffView
                original={resume!}
                rewritten={rewritten}
                edited={edited}
                jobTitle={jd.jobTitle}
                onDownloadDocx={handleDownloadDocx}
                onDownloadPdf={handleDownloadPdf}
                onEditChange={setEdited}
                downloading={downloading}
              />
            </div>
          )}
        </div>

        {/* How it works */}
        {stage === 'input' && (
          <section className="pt-[64px] border-t border-gray-200 dark:border-[rgba(255,255,255,0.06)]">
            <h2 className="text-[13px] font-semibold tracking-[0.08em] uppercase text-gray-500 dark:text-[rgba(255,255,255,0.4)] mb-[32px]">How TailorCV works</h2>
            <div className="grid gap-[24px] sm:grid-cols-3">
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
                <div key={item.title} className="flex gap-[24px] bg-white dark:bg-[#0f0f17] border border-gray-200 dark:border-[rgba(255,255,255,0.07)] p-[24px] rounded-[16px] hover:-translate-y-[2px] hover:border-gray-300 dark:hover:border-[rgba(99,102,241,0.3)] transition-all duration-200 ease shadow-sm dark:shadow-none">
                  <div className="shrink-0 w-[40px] h-[40px] rounded-[10px] bg-indigo-50 dark:bg-[rgba(99,102,241,0.12)] flex items-center justify-center text-indigo-600 dark:text-white text-xl">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-[15px] text-gray-900 dark:text-gray-200">{item.title}</p>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-white/[0.06] mt-[48px] py-[24px] px-4 text-center text-[13px] text-gray-400 dark:text-gray-500">
        <p>TailorCV · Resumes uploaded are auto-deleted after 24h · No human review</p>
        <p className="mt-1">Built for Indian job seekers · Naukri · LinkedIn · Company portals</p>
      </footer>

    </div>
  );
}
