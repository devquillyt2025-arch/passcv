'use client';

import Link from 'next/link';
import { useEditedResume } from '@/lib/editedResumeContext';

export default function SummaryPage() {
  const { edited, setEdited } = useEditedResume();
  const value = edited?.summary || '';

  return (
    <div className="max-w-3xl mx-auto py-8">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/sections" className="mr-3">Sections</Link>
        / <Link href="/" className="ml-3">Home</Link>
      </nav>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Summary</h1>
        <div className="flex gap-2">
          <Link href="/sections/edit" className="text-sm text-indigo-600 hover:underline">Edit</Link>
        </div>
      </div>

      <textarea
        value={value}
        onChange={(e) => {
          if (edited && setEdited) {
            setEdited({ ...edited, summary: e.target.value });
          }
        }}
        className="w-full h-48 rounded-lg border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
      />
    </div>
  );
}
