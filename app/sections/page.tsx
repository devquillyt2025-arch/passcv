'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function SectionsIndex() {
  const sections = [
    { id: 'summary', label: 'Summary' },
    { id: 'experience', label: 'Experience' },
    { id: 'skills', label: 'Skills' },
    { id: 'naukri', label: 'Naukri' },
    { id: 'edit', label: 'Edit' },
    { id: 'preview', label: 'Preview' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-white transition-colors duration-200">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Sections</h1>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Home</Link>
            <ThemeToggle />
          </div>
        </div>

        <div className="grid gap-3">
          {sections.map(s => (
            <Link
              key={s.id}
              href={`/sections/${s.id}`}
              className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#13131A] p-4 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors"
            >
              <div className="text-lg font-medium">{s.label}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Open and edit this section</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
