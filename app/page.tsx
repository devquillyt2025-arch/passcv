'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="dark min-h-screen flex flex-col" style={{ background: '#0A0A0F', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

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
            href="/dashboard"
            style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s ease' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          >
            Dashboard
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
      <section className="relative z-10 pt-24 pb-12 px-4 text-center flex-1 flex flex-col justify-center items-center">
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

          {/* Get Started CTA Button */}
          <div className="mt-8 flex justify-center">
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 36px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 16,
                boxShadow: '0 4px 20px rgba(99,102,241,0.25)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.25)';
              }}
            >
              Get Started →
            </Link>
          </div>

          {/* Platform badge chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
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

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 py-12 border-t border-white/[0.06]">
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

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer
        className="relative z-10 py-6 border-t border-white/[0.06] text-center text-xs text-slate-500 bg-[#0A0A0F]"
      >
        TailorCV · Resumes uploaded are auto-deleted after 24h · No human review
      </footer>

    </div>
  );
}

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
