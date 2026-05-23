'use client';

import Link from 'next/link';
import { useEditedResume } from '@/lib/editedResumeContext';
import ResumePreview from '@/components/ResumePreview';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function PreviewPage() {
  const { edited } = useEditedResume();

  if (!edited) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-white flex items-center justify-center">
      <p className="text-gray-500 dark:text-gray-400">No edited resume to preview.</p>
    </div>
  );

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
          <h1 className="text-lg font-semibold">Preview</h1>
          <Link href="/sections/edit" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Edit</Link>
        </div>

        <ResumePreview resume={edited} />
      </div>
    </div>
  );
}
