'use client';

import { useEffect, useRef, useState } from 'react';
import type { ResumeRenderInput } from '@/lib/resume-render/types';

interface Props {
  input: ResumeRenderInput;
  onClose: () => void;
  onDownload: () => void;
}

export default function PreviewModal({ input, onClose, onDownload }: Props) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    setLoading(true);
    // Same generator the download button uses, on the same tuple — that is what
    // makes the header's "exactly how your resume will look" claim true. It
    // previously called generateBuilderPdfBlob directly with its own argument
    // list, so the two could drift.
    import('@/lib/resume-render/client')
      .then(({ generateResumePdf }) => generateResumePdf(input))
      .then(blob => {
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        setPdfUrl(url);
        setLoading(false);
      })
      .catch(err => {
        console.error('PDF preview error', err);
        setLoading(false);
      });

    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [input]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleDownloadATS = async () => {
    const { generateResumeTxtBlob } = await import('@/lib/resumeTxt');
    const blob = generateResumeTxtBlob(input.data, input.sectionOrder);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const name = [input.data.contact.firstName, input.data.contact.lastName].filter(Boolean).join('_') || 'Untitled';
    a.download = `${name}_FolioX.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden"
        style={{ height: '92vh' }}>

        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">PDF Preview</h2>
            <p className="text-xs text-gray-500">Exactly how your resume will look when downloaded</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadATS}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              ATS Text
            </button>
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 transition-colors"
              aria-label="Close preview"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* PDF iframe */}
        <div className="flex-1 bg-gray-200 relative">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-600 border-t-transparent" />
              <p className="text-sm text-gray-500">Generating PDF…</p>
            </div>
          )}
          {pdfUrl && !loading && (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="PDF Preview"
            />
          )}
        </div>
      </div>
    </div>
  );
}
