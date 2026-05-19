'use client';

import { useEffect, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { ParsedResume } from '@/lib/types';
import { parsedToBuilderData } from '@/lib/resumeImport';
import { useResumeStore } from '@/lib/store/useResumeStore';

interface Props {
  onClose: () => void;
}

export default function ImportResumeModal({ onClose }: Props) {
  const loadResumeData = useResumeStore(s => s.loadResumeData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsed, setParsed] = useState<ParsedResume | null>(null);
  const [fileName, setFileName] = useState('');

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const processFile = async (file: File) => {
    setLoading(true);
    setError('');
    setParsed(null);
    setFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      const base64 = btoa(binary);

      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: base64, filename: file.name }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Parse failed');
      setParsed(data as ParsedResume);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not parse file. Please try again.');
      setFileName('');
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) { setError('Only PDF and DOCX files are supported.'); return; }
      if (accepted[0]) processFile(accepted[0]);
    },
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: loading,
  });

  const handleConfirmImport = () => {
    if (!parsed) return;
    loadResumeData(parsedToBuilderData(parsed));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-[#12121a] rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-white/[0.07]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/[0.07]">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Import Existing Resume</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">We&apos;ll parse your file and pre-fill the builder</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 dark:border-white/10 p-1.5 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Drop zone */}
          {!parsed && (
            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center rounded-xl p-8 text-center cursor-pointer transition-all duration-200 border-2 border-dashed ${
                isDragActive
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                  : 'border-gray-300 dark:border-white/15 hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:bg-gray-50 dark:hover:bg-white/[0.03]'
              } ${loading ? 'opacity-60 cursor-wait' : ''}`}
            >
              <input {...getInputProps()} />
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Parsing {fileName}…</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <svg className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {isDragActive ? 'Drop your resume' : 'Upload your resume'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PDF or DOCX · max 2 MB</p>
                  </div>
                  <span className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
                    Browse file
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Parse error */}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-lg px-4 py-2">{error}</p>
          )}

          {/* Parsed preview */}
          {parsed && (
            <div className="space-y-3">
              <div className="rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 px-4 py-3">
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  ✓ Parsed: {fileName}
                </p>
                <ul className="mt-1.5 text-xs text-green-600 dark:text-green-500 space-y-0.5">
                  <li>Name: {parsed.contact.name || '—'}</li>
                  <li>{parsed.experience.length} work experience{parsed.experience.length !== 1 ? 's' : ''}</li>
                  <li>{parsed.education.length} education entr{parsed.education.length !== 1 ? 'ies' : 'y'}</li>
                  <li>{parsed.skills.length} skills</li>
                </ul>
              </div>

              <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-4 py-2.5">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <strong>Note:</strong> This will overwrite any data currently in the builder. You can undo by closing without saving.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-white/[0.07]">
          <button
            onClick={() => { setParsed(null); setFileName(''); setError(''); }}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            {parsed ? 'Upload different file' : 'Cancel'}
          </button>
          <button
            onClick={parsed ? handleConfirmImport : onClose}
            disabled={!parsed}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {parsed ? 'Import into Builder' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
