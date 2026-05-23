'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import UploadZone from '@/components/UploadZone';
import { useRewriteStore } from '@/lib/store/useRewriteStore';
import WizardProgress from '@/components/WizardProgress';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FeatureCard } from '@/components/FeatureCard';

const HOW_IT_WORKS = [
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
];

export default function TailorPage() {
  const router = useRouter();
  const store = useRewriteStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const resume     = mounted ? store.original : null;
  const jdText     = mounted ? store.jdText   : null;
  const setResume    = store.setOriginal;
  const setJdText    = store.setJdText;
  const setScoreData = store.setScoreData;

  const [scoring,    setScoring]    = useState(false);
  const [parseError, setParseError] = useState('');
  const [scoreError, setScoreError] = useState('');

  const handleAnalyze = async () => {
    if (!resume || !(jdText || '').trim()) return;
    setScoring(true);
    setScoreError('');
    try {
      const res = await fetch('/api/score', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ resume, jdText }),
      });
      const data = await res.json();
      setScoreData({ original: resume, jdText: jdText || '', score: data.score, jd: data.jd });
      router.push('/score');
    } catch (e) {
      setScoreError(e instanceof Error ? e.message : 'Analysis failed. Please try again.');
    } finally {
      setScoring(false);
    }
  };

  const canAnalyze = resume && (jdText || '').trim().length > 100;

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F] text-white font-sans">

      {/* Radial glow — keep style only for the non-Tailwind radial-gradient */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full pointer-events-none z-0 blur-[40px]"
        style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.13) 0%, rgba(139,92,246,0.06) 45%, transparent 70%)' }}
      />

      {/* Nav */}
      <nav className="sticky top-0 z-30 flex items-center justify-between px-6 h-16 bg-[rgba(10,10,15,0.7)] backdrop-blur-md border-b border-white/[0.06]">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
            ←
          </div>
          <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
            Back to Dashboard
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-[13px] text-white/60 hover:text-white transition-colors duration-200">
            Home
          </Link>
          <span className="text-[13px] text-white/45 bg-white/5 border border-white/10 rounded-full px-3.5 py-1">
            Free ATS check · ₹49 rewrite
          </span>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 pt-12 pb-0 px-4 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-[clamp(32px,5vw,48px)] font-extrabold leading-[1.1] tracking-[-0.02em] m-0">
            Tailor Your Resume to{' '}
            <span className="bg-gradient-to-br from-indigo-500 to-violet-400 bg-clip-text text-transparent">
              Any Job
            </span>
          </h1>
          <p className="text-base text-white/45 max-w-[520px] mx-auto mt-4 leading-relaxed">
            Upload your resume, paste the target job description, and get a highly optimized ATS-compliant resume rewrite.
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 flex-1 pt-8 pb-12">

        <WizardProgress
          currentStep={1}
          canProceedToScore={!!resume && (jdText || '').trim().length > 100}
          canProceedToRewrite={mounted ? !!useRewriteStore.getState().score : false}
        />

        <div className="grid gap-6 md:grid-cols-2 items-stretch mt-8">

          {/* Step 1 — Upload */}
          <div className="flex flex-col">
            <label className="block mb-3 text-[11px] font-semibold tracking-[0.08em] uppercase text-white/40">
              Step 1 — Your resume
            </label>
            <div className="flex-1">
              <UploadZone onParsed={setResume} onError={setParseError} />
            </div>
            {parseError && (
              <p className="mt-2 text-[13px] text-red-400">{parseError}</p>
            )}
            {resume && (
              <p className="mt-2 text-[13px] text-emerald-400 font-medium">
                ✓ Parsed: {resume.contact.name || 'Resume'} · {resume.experience.length} jobs · {resume.skills.length} skills
              </p>
            )}
          </div>

          {/* Step 2 — JD */}
          <div className="flex flex-col">
            <label className="block mb-3 text-[11px] font-semibold tracking-[0.08em] uppercase text-white/40">
              Step 2 — Job description
            </label>
            <div className="flex-1 flex overflow-hidden bg-[#13131A] border-2 border-dashed border-indigo-500/35 rounded-2xl min-h-[320px] max-h-[320px] transition-all duration-200 focus-within:border-solid focus-within:border-indigo-500 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.15),inset_0_0_20px_rgba(99,102,241,0.04)]">
              <textarea
                value={jdText || ''}
                onChange={e => setJdText(e.target.value)}
                placeholder="Paste the full job description from Naukri, LinkedIn or any portal…"
                className="flex-1 w-full h-full bg-transparent border-none outline-none p-4 text-sm leading-relaxed text-white resize-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden placeholder:text-white/[0.28]"
              />
            </div>
            <p className="mt-2 text-xs text-white/30">{(jdText || '').length} characters</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-6 mt-12">
          {scoreError && (
            <p className="text-[13px] text-red-300 bg-red-500/10 border border-red-500/20 rounded-[10px] px-4 py-2">
              {scoreError}
            </p>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze || scoring}
            className={clsx(
              'w-full md:w-auto h-14 px-10 rounded-[14px] bg-gradient-to-br from-indigo-500 to-violet-500',
              'text-white text-base font-bold flex items-center justify-center gap-2 transition-all duration-200',
              (!canAnalyze || scoring)
                ? 'cursor-not-allowed opacity-30'
                : 'cursor-pointer hover:shadow-[0_0_32px_rgba(99,102,241,0.5)] hover:-translate-y-px',
            )}
          >
            {scoring ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
                Analysing…
              </>
            ) : 'Analyse my resume — free'}
          </button>

          {!resume && (
            <p className="text-[13px] text-white/35">Upload a resume to get started</p>
          )}
          {resume && !(jdText || '').trim() && (
            <p className="text-[13px] text-white/35">Paste a job description to continue</p>
          )}
        </div>

        {/* Feature Highlights */}
        <section className="pt-16 border-t border-white/[0.06] mt-16">
          <p className="text-[13px] font-semibold tracking-[0.08em] uppercase text-white/35 mb-8">
            How TailorCV works
          </p>
          <div className="grid gap-6 sm:grid-cols-3 text-left">
            {HOW_IT_WORKS.map(item => (
              <FeatureCard key={item.title} icon={item.icon} title={item.title} body={item.body} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] mt-12 py-6 px-6 text-center text-[13px] text-white/30">
        TailorCV · Resumes are processed in-memory and never stored · No human review
      </footer>

    </div>
  );
}
