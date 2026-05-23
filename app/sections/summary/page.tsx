'use client';

import Link from 'next/link';
import { useEditedResume } from '@/lib/editedResumeContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function SummaryPage() {
  const { edited, setEdited } = useEditedResume();
  const value = edited?.summary || '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-white transition-colors duration-200">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center justify-between">
          <div>
            <Link href="/sections" className="mr-3 hover:text-gray-700 dark:hover:text-gray-200">Sections</Link>
            / <Link href="/" className="ml-3 hover:text-gray-700 dark:hover:text-gray-200">Home</Link>
          </div>
          <ThemeToggle />
        </nav>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">Summary</h1>
          <Link href="/sections/edit" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Edit</Link>
        </div>

        <textarea
          value={value}
          onChange={(e) => {
            if (edited && setEdited) {
              setEdited({ ...edited, summary: e.target.value });
            }
          }}
          className="w-full h-48 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-[#13131A] text-gray-900 dark:text-white p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
        />
      </div>
    </div>
  );
}
