'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UploadZone from '@/components/UploadZone';
import { useRewriteStore } from '@/lib/store/useRewriteStore';
import WizardProgress from '@/components/WizardProgress';

export default function TailorPage() {
  const router = useRouter();
  const store = useRewriteStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const resume   = mounted ? store.original : null;
  const jdText   = mounted ? store.jdText   : null;
  const hasScore = useRewriteStore(s => !!s.score);
  const setResume   = store.setOriginal;
  const setJdText   = store.setJdText;
  const setScoreData = store.setScoreData;

  const [scoring,    setScoring]    = useState(false);
  const [parseError, setParseError] = useState('');
  const [scoreError, setScoreError] = useState('');

  const handleAnalyze = async () => {
    if (!resume || !(jdText || '').trim()) return;
    setScoring(true);
    setScoreError('');
    try {
      const res  = await fetch('/api/score', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ resume, jdText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze resume');
      setScoreData({ original: resume, jdText: jdText || '', score: data.score, jd: data.jd });
      router.push('/score');
    } catch (e: any) {
      setScoreError(e.message || 'Analysis failed. Please try again.');
    } finally {
      setScoring(false);
    }
  };

  const canAnalyze = resume && (jdText || '').trim().length > 100;

  return (
    <div
      className="min-h-screen flex flex-col bg-white dark:bg-[#080d1a]"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >

      {/* Radial glow background */}
      <div
        aria-hidden="true"
        style={{
          position:  'fixed',
          top:        0,
          left:      '50%',
          transform: 'translateX(-50%)',
          width:     '900px',
          height:    '500px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.13) 0%, rgba(139,92,246,0.06) 45%, transparent 70%)',
          filter:    'blur(40px)',
          pointerEvents: 'none',
          zIndex:    0,
        }}
      />

      {/* Nav */}
      <nav
        className="sticky top-0 z-30 flex items-center justify-between px-6 h-16 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-[#0a0f1e]/80"
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs text-white group-hover:scale-105 transition-transform">
            ←
          </div>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
            Back to Dashboard
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-[13px] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Home
          </Link>
          <span className="text-[13px] text-gray-500 dark:text-[rgba(255,255,255,0.45)] bg-gray-100 dark:bg-[rgba(255,255,255,0.05)] border border-gray-200 dark:border-[rgba(255,255,255,0.1)] rounded-full px-[14px] py-[4px]">
            Free ATS check · ₹49 rewrite
          </span>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="relative z-10 pt-12 pb-0 px-4 text-center">
        <div className="mx-auto max-w-3xl">
          <h1
            className="text-gray-900 dark:text-white"
            style={{
              fontSize:   'clamp(32px, 5vw, 48px)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Tailor Your Resume to{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Any Job
            </span>
          </h1>
          <p
            className="text-gray-600 dark:text-gray-400"
            style={{
              marginTop: 16,
              fontSize:  16,
              maxWidth:  520,
              margin:    '16px auto 0',
              lineHeight: 1.5,
            }}
          >
            Upload your resume, paste the target job description, and get a highly optimized ATS-compliant resume rewrite.
          </p>
        </div>
      </header>

      {/* Main stepper and inputs */}
      <main
        className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 flex-1"
        style={{ paddingTop: 32, paddingBottom: 48 }}
      >
        {/* Step indicators */}
        <WizardProgress
          currentStep={1}
          canProceedToScore={!!resume && (jdText || '').trim().length > 100}
          canProceedToRewrite={mounted ? hasScore : false}
        />

        {/* Upload + JD two-column */}
        <div className="grid gap-6 md:grid-cols-2 items-stretch mt-8">

          {/* Step 1 — Upload */}
          <div className="flex flex-col">
            <label className="block mb-3 text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-400 dark:text-gray-500">
              Step 1 — Your resume
            </label>
            <div className="flex-1">
              <UploadZone onParsed={setResume} onError={setParseError} />
            </div>
            {parseError && (
              <p style={{ marginTop: 8, fontSize: 13, color: '#f87171' }}>{parseError}</p>
            )}
            {resume && (
              <p style={{ marginTop: 8, fontSize: 13, color: '#34d399', fontWeight: 500 }}>
                ✓ Parsed: {resume.contact.name || 'Resume'} · {resume.experience.length} jobs · {resume.skills.length} skills
              </p>
            )}
          </div>

          {/* Step 2 — JD */}
          <div className="flex flex-col">
            <label className="block mb-3 text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-400 dark:text-gray-500">
              Step 2 — Job description
            </label>
            <div
              className="flex-1 flex overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827]"
              style={{
                minHeight:  320,
                maxHeight:  320,
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onFocusCapture={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = '#8b5cf6';
                el.style.boxShadow   = '0 0 0 3px rgba(139,92,246,0.15)';
              }}
              onBlurCapture={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = '';
                el.style.boxShadow   = 'none';
              }}
            >
              <textarea
                value={jdText || ''}
                onChange={e => setJdText(e.target.value)}
                placeholder="Paste the full job description from Naukri, LinkedIn or any portal…"
                className="flex-1 w-full h-full bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 text-[14px] leading-relaxed resize-none [&::-webkit-scrollbar]:hidden placeholder:text-gray-400 dark:placeholder:text-gray-600"
                style={{
                  padding:        16,
                  scrollbarWidth: 'none',
                }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-600">
              {(jdText || '').length} characters
            </p>
          </div>
        </div>

        {/* CTA + errors */}
        <div className="flex flex-col items-center gap-6 mt-12">
          {scoreError && (
            <p
              style={{
                fontSize:     13,
                color:        '#fca5a5',
                background:   'rgba(239,68,68,0.1)',
                border:       '1px solid rgba(239,68,68,0.2)',
                borderRadius: 10,
                padding:      '8px 16px',
              }}
            >
              {scoreError}
            </p>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze || scoring}
            className="w-full md:w-auto"
            style={{
              height:         56,
              paddingLeft:    40,
              paddingRight:   40,
              borderRadius:   14,
              background:     'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color:          '#fff',
              fontSize:       16,
              fontWeight:     700,
              border:         'none',
              cursor:         (!canAnalyze || scoring) ? 'not-allowed' : 'pointer',
              opacity:        (!canAnalyze || scoring) ? 0.3 : 1,
              transition:     'all 0.2s ease',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            8,
            }}
            onMouseEnter={e => {
              if (!canAnalyze || scoring) return;
              const b = e.currentTarget as HTMLButtonElement;
              b.style.boxShadow = '0 0 32px rgba(99,102,241,0.5)';
              b.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.boxShadow = 'none';
              b.style.transform = 'none';
            }}
          >
            {scoring ? (
              <>
                <span
                  style={{
                    width: 16, height: 16,
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }}
                />
                Analysing…
              </>
            ) : 'Analyse my resume — free'}
          </button>

          {!resume && (
            <p className="text-[13px] text-gray-400 dark:text-gray-500">
              Upload a resume to get started
            </p>
          )}
          {resume && !(jdText || '').trim() && (
            <p className="text-[13px] text-gray-400 dark:text-gray-500">
              Paste a job description to continue
            </p>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <section className="pt-16 mt-16 border-t border-gray-200 dark:border-white/[0.06]">
          <p className="text-[13px] font-semibold tracking-[0.08em] uppercase text-gray-400 dark:text-[rgba(255,255,255,0.35)] mb-8">
            How FolioX works
          </p>
          <div className="grid gap-6 sm:grid-cols-3 text-left">
            {[
              {
                icon: '📄',
                title: 'ATS Score (Free)',
                body:  'We check keyword match, formatting, Naukri-specific fields, and content quality — 100-point breakdown.',
              },
              {
                icon: '✏️',
                title: 'AI Rewrite (₹49)',
                body:  'Claude rewrites every section — summary, bullets, skills — using exact JD keywords. Never fabricates facts.',
              },
              {
                icon: '⬇️',
                title: 'DOCX Download',
                body:  'Get a single-column ATS-safe DOCX ready to upload to Naukri. Plus a Naukri profile text block.',
              },
            ].map(item => (
              <FeatureCard key={item.title} icon={item.icon} title={item.title} body={item.body} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 dark:border-white/[0.06] mt-12 py-6 px-6 text-center text-[13px] text-gray-400 dark:text-[rgba(255,255,255,0.3)]">
        FolioX · Resumes uploaded are auto-deleted after 24h · No human review
      </footer>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex gap-6 rounded-2xl p-6 transition-all duration-200 cursor-default border bg-gray-50 dark:bg-[#13131A] ${
        hovered
          ? 'border-indigo-300 dark:border-[rgba(99,102,241,0.3)] -translate-y-0.5'
          : 'border-gray-200 dark:border-[rgba(255,255,255,0.07)]'
      }`}
    >
      <div
        className="shrink-0 w-10 h-10 rounded-[10px] bg-indigo-50 dark:bg-[rgba(99,102,241,0.12)] flex items-center justify-center text-xl"
      >
        {icon}
      </div>
      <div>
        <p className="font-semibold text-[15px] text-gray-800 dark:text-[rgba(255,255,255,0.9)] m-0">
          {title}
        </p>
        <p className="text-[13px] text-gray-500 dark:text-[rgba(255,255,255,0.45)] mt-1.5 leading-relaxed">
          {body}
        </p>
      </div>
    </div>
  );
}
