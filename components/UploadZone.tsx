'use client';

import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { ParsedResume } from '@/lib/types';
import clsx from 'clsx';

interface Props {
  onParsed: (resume: ParsedResume) => void;
  onError: (msg: string) => void;
}

export default function UploadZone({ onParsed, onError }: Props) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    setLoading(true);
    setFileName(file.name);
    onError('');

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

      if (!res.ok || data.error) {
        onError(data.error || 'Failed to parse resume');
        setFileName(null);
        return;
      }

      onParsed(data as ParsedResume);
    } catch {
      onError('Could not read file. Please try again.');
      setFileName(null);
    } finally {
      setLoading(false);
    }
  }, [onParsed, onError]);

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    if (rejected.length > 0) {
      onError('Only PDF and DOCX files are supported.');
      return;
    }
    if (accepted[0]) processFile(accepted[0]);
  }, [processFile, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: loading,
  });

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'relative flex flex-col items-center justify-center rounded-xl p-[24px] transition-all duration-200 ease cursor-pointer select-none h-[320px] min-h-[320px] max-h-[320px]',
        isDragActive
          ? 'border-2 border-solid border-[#6366f1] bg-indigo-50 dark:bg-[rgba(99,102,241,0.08)] shadow-[inset_0_0_20px_rgba(99,102,241,0.15)]'
          : 'border-2 border-dashed border-gray-300 dark:border-[rgba(99,102,241,0.4)] bg-white dark:bg-[rgba(99,102,241,0.04)] hover:border-indigo-400 dark:hover:border-[rgba(99,102,241,0.8)] hover:bg-indigo-50/50 dark:hover:bg-[rgba(99,102,241,0.08)] shadow-sm dark:shadow-none',
        loading && 'opacity-60 cursor-wait'
      )}
    >
      <input {...getInputProps()} />

      {loading ? (
        <div className="flex flex-col items-center gap-[24px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6366f1] border-t-transparent" />
          <p className="text-[13px] text-gray-500 dark:text-gray-400">Parsing your resume…</p>
        </div>
      ) : fileName ? (
        <div className="flex flex-col items-center gap-2">
          <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-[15px] font-medium text-gray-800 dark:text-gray-200">{fileName}</p>
          <p className="text-[13px] text-[#6366f1] hover:underline">Click to replace</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-[24px] text-center">
          <svg className="h-[32px] w-[32px] text-[#6366f1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
          </svg>
          <div>
            <p className="font-semibold text-[16px] text-gray-800 dark:text-white">
              {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
            </p>
            <p className="mt-1 text-[13px] text-gray-500 dark:text-[rgba(255,255,255,0.55)]">PDF or DOCX · max 2 MB</p>
          </div>
          <span className="rounded-[10px] bg-[#6366f1] border-none px-[24px] py-[10px] text-[14px] font-semibold text-white hover:bg-[#4f46e5] hover:-translate-y-[1px] hover:shadow-[0_4px_16px_rgba(99,102,241,0.4)] transition-all">
            Browse file
          </span>
        </div>
      )}
    </div>
  );
}
