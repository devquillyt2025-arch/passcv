'use client';

import Link from 'next/link';
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

const PLATFORMS = ['Naukri', 'LinkedIn', 'Taleo', 'Darwinbox', 'Keka', 'Workday'];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F] text-white font-sans">

      {/* Radial glow — keep style only for the non-Tailwind radial-gradient */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full pointer-events-none z-0 blur-[40px]"
        style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.13) 0%, rgba(139,92,246,0.06) 45%, transparent 70%)' }}
      />

      {/* Nav */}
      <nav className="sticky top-0 z-30 flex items-center justify-between px-6 h-14 bg-[#0A0A0F]/60 backdrop-blur-md border-b border-white/[0.06]">
        <span className="text-xl font-bold tracking-tight">TailorCV</span>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-[13px] text-white/60 hover:text-white transition-colors duration-200">
            Dashboard
          </Link>
          <span className="text-[13px] text-white/45 bg-white/5 border border-white/10 rounded-full px-3.5 py-1">
            Free ATS check · ₹49 rewrite
          </span>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-24 pb-12 px-4 text-center flex-1 flex flex-col justify-center items-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-[clamp(36px,6vw,56px)] font-bold leading-[1.1] tracking-[-0.02em] m-0">
            Job-ready in{' '}
            <span className="bg-gradient-to-br from-indigo-500 to-violet-400 bg-clip-text text-transparent">
              60 seconds
            </span>
          </h1>

          <p className="text-xl text-white/50 max-w-[520px] mx-auto mt-6 leading-relaxed">
            Upload your resume · paste the JD · get an ATS score and a Claude-rewritten
            version ready to upload to Naukri
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-9 py-3.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-semibold text-base shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_24px_rgba(99,102,241,0.4)] hover:-translate-y-px transition-all duration-200"
            >
              Get Started →
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {PLATFORMS.map(name => (
              <span key={name} className="text-[13px] text-white/55 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 py-12 border-t border-white/[0.06]">
        <p className="text-[13px] font-semibold tracking-[0.08em] uppercase text-white/35 mb-8">
          How TailorCV works
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          {HOW_IT_WORKS.map(item => (
            <FeatureCard key={item.title} icon={item.icon} title={item.title} body={item.body} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-white/[0.06] text-center text-xs text-slate-500 bg-[#0A0A0F]">
        TailorCV · Resumes are processed in-memory and never stored · No human review
      </footer>

    </div>
  );
}
