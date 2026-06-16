'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

const TAGLINES = [
  { before: 'Resumes that ', highlight: 'open doors.' },
  { before: 'Your story. ', highlight: 'Their first impression.' },
  { before: 'Build it. Send it. ', highlight: 'Get hired.' },
  { before: 'From blank page to ', highlight: 'dream job.' },
];

/* ── Theme-invariant brand tokens ──────────────────────────────────────────── */
const GRAD      = 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)';
const GLOW      = 'rgba(108,99,255,0.40)';
const GLOW_H    = 'rgba(108,99,255,0.65)';
const BORDER    = 'rgba(108,99,255,0.30)';

/* ── FX SVG monogram ───────────────────────────────────────────────────────── */
function FXMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 0.78)} viewBox="0 0 36 28" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="fxg" x1="0" y1="0" x2="36" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6C63FF" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <line x1="3"  y1="3"  x2="3"  y2="25" stroke="url(#fxg)" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="3"  y1="3"  x2="14" y2="3"  stroke="url(#fxg)" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="3"  y1="14" x2="11" y2="14" stroke="url(#fxg)" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="19" y1="3"  x2="33" y2="25" stroke="url(#fxg)" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="33" y1="3"  x2="19" y2="25" stroke="url(#fxg)" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

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
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--lp-bg)', color: 'var(--lp-heading)', fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >

      {/* ── Background radial glow ───────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: '1400px', height: '800px',
          background: 'radial-gradient(ellipse at 50% 40%, var(--lp-glow) 0%, transparent 65%)',
          pointerEvents: 'none', zIndex: 0,
        }}
      />

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-8 h-16"
        style={{
          background: 'var(--lp-nav-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--lp-nav-border)',
        }}
      >
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <FXMark size={34} />
          <span style={{ width: 1, height: 20, background: 'var(--lp-nav-sep)', display: 'inline-block' }} />
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--lp-heading)' }}>
            Folio<span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>X</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            style={{
              fontSize: 14, fontWeight: 500, color: 'var(--lp-login-color)',
              background: 'transparent', border: '1px solid transparent',
              borderRadius: '999px', padding: '6px 18px',
              transition: 'border-color 0.2s ease, color 0.2s ease', textDecoration: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--lp-pill-border)'; e.currentTarget.style.color = 'var(--lp-login-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--lp-login-color)'; }}
          >
            Log in
          </Link>

          <ThemeToggle />

          <Link
            href="/dashboard"
            style={{
              fontSize: 13, fontWeight: 700, color: '#fff',
              background: GRAD, borderRadius: '999px', padding: '7px 20px',
              boxShadow: `0 0 18px ${GLOW}`,
              transition: 'box-shadow 0.2s ease, transform 0.2s ease',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 28px ${GLOW_H}`; e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 18px ${GLOW}`;  e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section
        className="relative z-10 flex flex-col justify-center items-center text-center px-4"
        style={{ minHeight: '100vh', paddingTop: '128px', paddingBottom: '128px' }}
      >
        <div className="mx-auto" style={{ maxWidth: 780 }}>

          {/* Badge pill */}
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: 11, fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: 'var(--lp-badge-text)',
              background: 'var(--lp-pill-bg)',
              border: '1px solid var(--lp-pill-border)',
              borderRadius: '999px', padding: '6px 18px', marginBottom: 44,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6C63FF', display: 'inline-block', boxShadow: '0 0 8px rgba(108,99,255,0.9)' }} />
            AI-Powered Resume Builder
          </div>

          {/* Animated tagline */}
          <div style={{ minHeight: 'clamp(80px, 10vw, 140px)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
            <h1
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 'clamp(36px, 6.5vw, 64px)', fontWeight: 600,
                lineHeight: 1.05, letterSpacing: '-0.03em', margin: 0,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0px)' : 'translateY(12px)',
                transition: 'opacity 0.35s ease, transform 0.35s ease',
              }}
            >
              <span style={{ color: 'var(--lp-heading)' }}>{TAGLINES[idx].before}</span>
              <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {TAGLINES[idx].highlight}
              </span>
            </h1>
          </div>

          {/* Subtext */}
          <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 18, color: 'var(--lp-body)', maxWidth: 512, margin: '0 auto 40px', lineHeight: 1.65 }}>
            Upload your resume · paste the JD · get an ATS score and a Claude-rewritten version ready to send
          </p>

          {/* CTA */}
          <Link
            href="/dashboard"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '16px 40px', borderRadius: '999px',
              background: GRAD, color: '#fff', fontWeight: 700, fontSize: 16,
              boxShadow: 'var(--lp-cta-shadow)', transition: 'all 0.22s ease', textDecoration: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = 'var(--lp-cta-shadow-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.boxShadow = 'var(--lp-cta-shadow)'; }}
          >
            Build Your Resume →
          </Link>

          {/* Value proposition */}
          <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: 'var(--lp-valueprop)', letterSpacing: '0.02em', marginTop: 20, marginBottom: 0 }}>
            Upload once.&nbsp; Get your ATS score free.&nbsp; Rewrite with AI for ₹49.
          </p>

          {/* Platform pills */}
          <div style={{ marginTop: 32 }}>
            <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--lp-muted)', marginBottom: 12 }}>
              Works with every major ATS
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Naukri', 'LinkedIn', 'Taleo', 'Darwinbox', 'Keka', 'Workday'].map(name => (
                <AtsChip key={name} name={name} />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section
        className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-20"
        style={{ borderTop: '1px solid var(--lp-section-border)', paddingTop: '56px' }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--lp-section-label)', marginBottom: 32 }}>
          How FolioX works
        </p>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            { icon: '📊', title: "Know exactly why you're being ignored.",      body: "Free 100-point scan: keywords, formatting, and ATS field coverage — instant.", badge: 'FREE',         variant: 'free' as const },
            { icon: '✨', title: '₹49 to rewrite. Nothing to stay rejected.',   body: "Claude rewrites every section using your JD's exact keywords. Never fabricates facts.", badge: 'MOST POPULAR', variant: 'paid' as const },
            { icon: '📥', title: 'Download a recruiter-ready DOCX instantly.',  body: 'ATS-safe single-column format, plus a Naukri profile text block — included.',    badge: undefined,      variant: 'paid' as const },
          ].map(item => (
            <FeatureCard key={item.title} icon={item.icon} title={item.title} body={item.body} badge={item.badge} variant={item.variant} />
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer
        className="relative z-10 py-6 text-center text-xs"
        style={{ borderTop: '1px solid var(--lp-footer-border)', background: 'var(--lp-bg)', color: 'var(--lp-footer-text)' }}
      >
        FolioX · Resumes uploaded are auto-deleted after 24h · No human review
      </footer>

    </div>
  );
}

function AtsChip({ name }: { name: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 12, fontWeight: 500,
        color: 'var(--lp-accent-text)',
        background: hovered ? 'var(--lp-chip-bg-hover)' : 'var(--lp-chip-bg)',
        border: '1px solid var(--lp-pill-border)',
        borderRadius: '999px', padding: '5px 13px',
        boxShadow: 'var(--lp-chip-shadow)',
        transition: 'background 0.15s ease',
        cursor: 'default',
      }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path d="M2 5.5L4 7.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {name}
    </span>
  );
}

function FeatureCard({
  icon, title, body, badge, variant = 'default',
}: {
  icon: string; title: string; body: string;
  badge?: string; variant?: 'free' | 'paid' | 'default';
}) {
  const [hovered, setHovered] = useState(false);

  const isFree = variant === 'free';
  const isPaid = variant === 'paid';

  const badgeBg     = isFree ? 'rgba(16,185,129,0.12)' : 'rgba(108,99,255,0.15)';
  const badgeColor  = isFree ? '#10b981' : '#a78bfa';
  const badgeBorder = isFree ? 'rgba(16,185,129,0.30)' : 'rgba(108,99,255,0.35)';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column', gap: 16,
        background: isFree ? 'var(--lp-free-card-bg)' : 'var(--lp-card-bg)',
        border: `1px solid ${hovered
          ? (isFree ? 'var(--lp-free-border-h)' : 'var(--lp-card-border-h)')
          : (isFree ? 'var(--lp-free-border)'   : 'var(--lp-card-border)')}`,
        borderRadius: 14, padding: 24,
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered && isPaid ? '0 0 28px rgba(108,99,255,0.12)' : 'none',
        transition: 'all 0.22s ease',
        cursor: 'default',
      }}
    >
      {badge && (
        <span style={{ position: 'absolute', top: 16, right: 16, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: badgeColor, background: badgeBg, border: `1px solid ${badgeBorder}`, borderRadius: '999px', padding: '3px 9px' }}>
          {badge}
        </span>
      )}

      <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 12, background: isFree ? 'var(--lp-free-icon-bg)' : 'var(--lp-icon-bg)', border: `1px solid ${isFree ? 'var(--lp-free-icon-border)' : 'var(--lp-icon-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
        {icon}
      </div>

      <div>
        <p style={{ fontWeight: 700, fontSize: 14, color: isFree ? 'var(--lp-free-title)' : 'var(--lp-card-title)', margin: 0, lineHeight: 1.4, paddingRight: badge ? 64 : 0 }}>
          {title}
        </p>
        <p style={{ fontSize: 13, color: 'var(--lp-card-body)', marginTop: 8, lineHeight: 1.65 }}>
          {body}
        </p>
      </div>
    </div>
  );
}
