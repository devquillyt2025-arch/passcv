'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRewriteStore } from '@/lib/store/useRewriteStore';
import ScoreReport from '@/components/ScoreReport';
import { ThemeToggle } from '@/components/ThemeToggle';
import WizardProgress from '@/components/WizardProgress';

export default function ScorePage() {
  const router = useRouter();
  const { original, jdText, score, jd, setRewriteData, _hasHydrated } = useRewriteStore();
  const [rewriting, setRewriting] = useState(false);
  const [scoreError, setScoreError] = useState('');

  useEffect(() => {
    if (_hasHydrated && (!original || !jdText || !score || !jd)) {
      router.push('/tailor');
    }
  }, [original, jdText, score, jd, router, _hasHydrated]);

  if (!_hasHydrated || !original || !jdText || !score || !jd) {
    return null;
  }

  const handleRewriteClick = async () => {
    setRewriting(true);
    setScoreError('');
    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: original, jdText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Rewrite failed');
      
      setRewriteData({
        original,
        rewritten: data.rewritten,
        edited: data.rewritten,
        jd
      });
      
      router.push('/rewrite');
    } catch (e) {
      setScoreError(e instanceof Error ? e.message : 'Rewrite failed. Please try again.');
    } finally {
      setRewriting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-white relative transition-colors duration-200">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-gray-50/50 to-transparent dark:from-indigo-500/10 dark:via-[#0A0A0F]/0 dark:to-transparent"></div>
      
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white/80 dark:bg-[#0A0A0F]/40 backdrop-blur-[12px] border-b border-gray-200 dark:border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/tailor" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Back to Upload</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 pt-10 pb-20">
        <WizardProgress 
          currentStep={2} 
          canProceedToScore={true} 
          canProceedToRewrite={!!useRewriteStore.getState().rewritten} 
        />

        {scoreError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm text-center">
            {scoreError}
          </div>
        )}

        <ScoreReport
          score={score}
          onRewrite={handleRewriteClick}
          rewriting={rewriting}
        />

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
      </main>
    </div>
  );
}
