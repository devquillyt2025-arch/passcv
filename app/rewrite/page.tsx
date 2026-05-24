'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRewriteStore } from '@/lib/store/useRewriteStore';
import DiffView from '@/components/DiffView';
import { ThemeToggle } from '@/components/ThemeToggle';
import { RewrittenResume } from '@/lib/types';
import WizardProgress from '@/components/WizardProgress';

export default function RewritePage() {
  const router = useRouter();
  const { original, rewritten, edited, jd, score, jdText, setEdited, _hasHydrated } = useRewriteStore();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    if (_hasHydrated && (!original || !rewritten || !edited || !jd)) {
      router.push('/tailor');
    }
  }, [original, rewritten, edited, jd, router, _hasHydrated]);

  if (!_hasHydrated || !original || !rewritten || !edited || !jd) {
    return null; // Will redirect
  }

  const getDownloadFilename = (resume: RewrittenResume, jobTitle: string, ext: string) => {
    const name = resume.contact?.name?.replace(/\s+/g, '_') || 'Resume';
    const title = jobTitle?.replace(/\s+/g, '_').slice(0, 30) || 'Role';
    return `${name}_${title}_FolioX.${ext}`;
  };

  const handleDownloadDocx = async () => {
    setDownloading(true);
    setDownloadError('');
    try {
      const res = await fetch('/api/generate_docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: edited, jobTitle: jd.jobTitle }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Download failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getDownloadFilename(edited, jd.jobTitle, 'docx');
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('DOCX download error', e);
      setDownloadError(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    setDownloadError('');
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
      setDownloadError(e instanceof Error ? e.message : 'PDF download failed');
    } finally {
      setDownloading(false);
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
          currentStep={3} 
          canProceedToScore={true} 
          canProceedToRewrite={true} 
        />

        {downloadError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
            {downloadError}
          </div>
        )}
        
        <DiffView
          original={original}
          rewritten={rewritten}
          edited={edited}
          jobTitle={jd.jobTitle}
          jdText={jdText || undefined}
          score={score || undefined}
          jd={jd}
          onDownloadDocx={handleDownloadDocx}
          onDownloadPdf={handleDownloadPdf}
          onEditChange={setEdited}
          downloading={downloading}
        />
      </main>
    </div>
  );
}
