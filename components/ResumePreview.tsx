'use client';

import { useEffect, useRef, useState } from 'react';
import type { ResumeInput } from '@/lib/resumePdf';
import { generateResumePdfBlob } from '@/lib/resumePdf';

interface Props {
  resume: ResumeInput;
}

export default function ResumePreview({ resume }: Props) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const activeUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    generateResumePdfBlob(resume)
      .then(blob => {
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        if (activeUrlRef.current) URL.revokeObjectURL(activeUrlRef.current);
        activeUrlRef.current = url;
        setPdfUrl(url);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('PDF preview error', err);
        setError('Failed to generate preview');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [resume]);

  useEffect(() => {
    return () => {
      if (activeUrlRef.current) URL.revokeObjectURL(activeUrlRef.current);
    };
  }, []);

  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-gray-100" style={{ height: '800px' }}>
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-600 border-t-transparent" />
          <p className="text-sm text-gray-500">Generating PDF preview…</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
      {pdfUrl && !loading && (
        <iframe
          src={pdfUrl}
          className="w-full h-full border-0"
          title="Resume PDF Preview"
        />
      )}
    </div>
  );
}
