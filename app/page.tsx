'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UploadZone from '@/components/UploadZone';
import { useRewriteStore } from '@/lib/store/useRewriteStore';
import WizardProgress from '@/components/WizardProgress';

export default function Home() {
  const router = useRouter();
  const store = useRewriteStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const resume   = mounted ? store.original : null;
  const jdText   = mounted ? store.jdText   : null;
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
    // "dark" class enables Tailwind dark: variants in child components (UploadZone, WizardProgress)
    <div className="dark min-h-screen flex flex-col" style={{ background: '#0A0A0F', color: '#fff' }}>

      {/* ── Radial glow behind hero ─────────────────────────────────────────── */}
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

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-30 flex items-center justify-between px-6 h-14"
        style={{
          background:   'rgba(10,10,15,0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
          TailorCV
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/builder"
            style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s ease' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          >
            Build Resume →
          </Link>
          <span
            style={{
              fontSize:   13,
              color:      'rgba(255,255,255,0.45)',
              background: 'rgba(255,255,255,0.05)',
              border:     '1px solid rgba(255,255,255,0.1)',
              borderRadius: '999px',
              padding:    '4px 14px',
            }}
          >
            Free ATS check · ₹49 rewrite
          </span>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-16 pb-0 px-4 text-center">
        <div className="mx-auto max-w-3xl">
          <h1
            style={{
              fontSize:   'clamp(36px, 6vw, 56px)',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#fff',
              margin: 0,
            }}
          >
            Job-ready in{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              60 seconds
            </span>
          </h1>

          <p
            style={{
              marginTop: 24,
              fontSize:  20,
              color:     'rgba(255,255,255,0.5)',
              maxWidth:  520,
              margin:    '24px auto 0',
              lineHeight: 1.5,
            }}
          >
            Upload your resume · paste the JD · get an ATS score and a Claude-rewritten
            version ready to upload to Naukri
          </p>

          {/* Platform badge chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['Naukri', 'LinkedIn', 'Taleo', 'Darwinbox', 'Keka', 'Workday'].map(name => (
              <span
                key={name}
                style={{
                  fontSize:     13,
                  color:        'rgba(255,255,255,0.55)',
                  background:   'rgba(255,255,255,0.05)',
                  border:       '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '999px',
                  padding:      '5px 14px',
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main tool ───────────────────────────────────────────────────────── */}
      <main
        className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6"
        style={{ paddingTop: 48, paddingBottom: 48 }}
      >
        {/* Step indicators */}
        <WizardProgress
          currentStep={1}
          canProceedToScore={!!resume && (jdText || '').trim().length > 100}
          canProceedToRewrite={mounted ? !!useRewriteStore.getState().score : false}
        />

        {/* Upload + JD two-column */}
        <div className="grid gap-6 md:grid-cols-2 items-stretch">

          {/* Step 1 — Upload */}
          <div className="flex flex-col">
            <label
              style={{
                display:       'block',
                marginBottom:  12,
                fontSize:      11,
                fontWeight:    600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color:         'rgba(255,255,255,0.4)',
              }}
            >
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
            <label
              style={{
                display:       'block',
                marginBottom:  12,
                fontSize:      11,
                fontWeight:    600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color:         'rgba(255,255,255,0.4)',
              }}
            >
              Step 2 — Job description
            </label>
            <div
              className="flex-1 flex overflow-hidden"
              style={{
                background:   '#13131A',
                border:       '2px dashed rgba(99,102,241,0.35)',
                borderRadius: 16,
                minHeight:    320,
                maxHeight:    320,
                transition:   'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onFocusCapture={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor  = '#6366f1';
                el.style.borderStyle  = 'solid';
                el.style.boxShadow    = '0 0 0 3px rgba(99,102,241,0.15), inset 0 0 20px rgba(99,102,241,0.04)';
              }}
              onBlurCapture={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor  = 'rgba(99,102,241,0.35)';
                el.style.borderStyle  = 'dashed';
                el.style.boxShadow    = 'none';
              }}
            >
              <textarea
                value={jdText || ''}
                onChange={e => setJdText(e.target.value)}
                placeholder="Paste the full job description from Naukri, LinkedIn or any portal…"
                style={{
                  flex:        1,
                  width:       '100%',
                  height:      '100%',
                  background:  'transparent',
                  border:      'none',
                  outline:     'none',
                  padding:     16,
                  fontSize:    14,
                  lineHeight:  1.6,
                  color:       '#fff',
                  resize:      'none',
                  scrollbarWidth: 'none',
                }}
                className="[&::-webkit-scrollbar]:hidden placeholder:text-[rgba(255,255,255,0.28)]"
              />
            </div>
            <p style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
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
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
              Upload a resume to get started
            </p>
          )}
          {resume && !(jdText || '').trim() && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
              Paste a job description to continue
            </p>
          )}
        </div>

        {/* ── How it works ──────────────────────────────────────────────────── */}
        <section style={{ paddingTop: 64, borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 64 }}>
          <p
            style={{
              fontSize:      13,
              fontWeight:    600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color:         'rgba(255,255,255,0.35)',
              marginBottom:  32,
            }}
          >
            How TailorCV works
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
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

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer
        className="relative z-10"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          marginTop: 48,
          padding:   '24px 24px',
          textAlign: 'center',
          fontSize:  13,
          color:     'rgba(255,255,255,0.3)',
        }}
      >
        TailorCV · Resumes uploaded are auto-deleted after 24h · No human review
      </footer>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Feature card — lifted out to use hover state cleanly ─────────────────────
function FeatureCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:      'flex',
        gap:          24,
        background:   '#13131A',
        border:       `1px solid ${hovered ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 16,
        padding:      24,
        transform:    hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition:   'all 0.2s ease',
        cursor:       'default',
      }}
    >
      <div
        style={{
          flexShrink:   0,
          width:        40,
          height:       40,
          borderRadius: 10,
          background:   'rgba(99,102,241,0.12)',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          fontSize:     20,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ fontWeight: 600, fontSize: 15, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
          {title}
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 6, lineHeight: 1.6 }}>
          {body}
        </p>
      </div>
    </div>
  );
}
