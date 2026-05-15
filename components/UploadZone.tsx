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
        'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all cursor-pointer select-none',
        isDragActive
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/40',
        loading && 'opacity-60 cursor-wait'
      )}
    >
      <input {...getInputProps()} />

      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm text-gray-500">Parsing your resume…</p>
        </div>
      ) : fileName ? (
        <div className="flex flex-col items-center gap-2">
          <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm font-medium text-gray-700">{fileName}</p>
          <p className="text-xs text-indigo-600 hover:underline">Click to replace</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-center">
          <svg className="h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
          </svg>
          <div>
            <p className="font-semibold text-gray-800">
              {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
            </p>
            <p className="mt-1 text-sm text-gray-500">PDF or DOCX · max 2 MB</p>
          </div>
          <span className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
            Browse file
          </span>
        </div>
      )}
    </div>
  );
}
