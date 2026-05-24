'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const TAGLINES = [
  { before: 'Resumes that ', highlight: 'open doors.' },
  { before: 'Your story. ', highlight: 'Their first impression.' },
  { before: 'Build it. Send it. ', highlight: 'Get hired.' },
  { before: 'From blank page to ', highlight: 'dream job.' },
];

export default function Home() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % TAGLINES.length);
        setVisible(true);
      }, 350);
    }, 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="dark min-h-screen flex flex-col" style={{ background: '#0A0A0F', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Radial glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '1000px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.14) 0%, rgba(139,92,246,0.07) 45%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
        }}
      />

      {/* Nav */}
      <nav
        className="sticky top-0 z-30 flex items-center justify-between px-6 h-14"
        style={{ background: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em' }}>
          <span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Folio</span>
          <span style={{ color: '#fff' }}>X</span>
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
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '999px', padding: '4px 14px' }}>
            Free ATS check · ₹49 rewrite
          </span>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="relative z-10 px-4 text-center flex-1 flex flex-col justify-center items-center"
        style={{ paddingTop: '80px', paddingBottom: '48px' }}
      >
        <div className="mx-auto" style={{ maxWidth: 760 }}>

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(167,139,250,0.9)', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.22)', borderRadius: '999px', padding: '5px 16px', marginBottom: 40 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', display: 'inline-block', boxShadow: '0 0 6px rgba(167,139,250,0.8)' }} />
            AI-Powered Resume Builder
          </div>

          {/* Animated tagline */}
          <div style={{ minHeight: 'clamp(72px, 9vw, 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <h1
              style={{
                fontSize: 'clamp(40px, 7vw, 72px)',
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                margin: 0,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0px)' : 'translateY(10px)',
                transition: 'opacity 0.35s ease, transform 0.35s ease',
              }}
            >
              <span style={{ color: '#fff' }}>{TAGLINES[idx].before}</span>
              <span style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {TAGLINES[idx].highlight}
              </span>
            </h1>
          </div>

          {/* Progress dots — clickable */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 32 }}>
            {TAGLINES.map((_, i) => (
              <button
                key={i}
                onClick={() => { setVisible(false); setTimeout(() => { setIdx(i); setVisible(true); }, 200); }}
                aria-label={`Tagline ${i + 1}`}
                style={{ width: i === idx ? 24 : 6, height: 6, borderRadius: '999px', background: i === idx ? '#6366f1' : 'rgba(255,255,255,0.18)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s ease' }}
              />
            ))}
          </div>

          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.48)', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.6 }}>
            Upload your resume · paste the JD · get an ATS score and a Claude-rewritten version ready to send
          </p>

          {/* CTA */}
          <Link
            href="/dashboard"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 36px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff', fontWeight: 700, fontSize: 15, boxShadow: '0 4px 24px rgba(99,102,241,0.28)', transition: 'all 0.2s ease', textDecoration: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.28)'; }}
          >
            Build Your Resume →
          </Link>

          {/* Platform chips */}
          <div className="flex flex-wrap justify-center gap-2" style={{ marginTop: 32 }}>
            {['Naukri', 'LinkedIn', 'Taleo', 'Darwinbox', 'Keka', 'Workday'].map(name => (
              <span key={name} style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '999px', padding: '4px 13px' }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 py-12 border-t border-white/[0.06]">
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: 28 }}>
          How FolioX works
        </p>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            { icon: '📄', title: 'ATS Score (Free)', body: 'We check keyword match, formatting, Naukri-specific fields, and content quality — 100-point breakdown.' },
            { icon: '✏️', title: 'AI Rewrite (₹49)', body: 'Claude rewrites every section — summary, bullets, skills — using exact JD keywords. Never fabricates facts.' },
            { icon: '⬇️', title: 'DOCX Download', body: 'Get a single-column ATS-safe DOCX ready to upload. Plus a Naukri profile text block.' },
          ].map(item => (
            <FeatureCard key={item.title} icon={item.icon} title={item.title} body={item.body} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-white/[0.06] text-center text-xs text-slate-500 bg-[#0A0A0F]">
        FolioX · Resumes uploaded are auto-deleted after 24h · No human review
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
        display: 'flex', gap: 20,
        background: '#13131A',
        border: `1px solid ${hovered ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 16, padding: 22,
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 32px rgba(99,102,241,0.1)' : 'none',
        transition: 'all 0.22s ease',
        cursor: 'default',
      }}
    >
      <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontWeight: 600, fontSize: 14, color: 'rgba(255,255,255,0.88)', margin: 0 }}>{title}</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', marginTop: 6, lineHeight: 1.6 }}>{body}</p>
      </div>
    </div>
  );
}
