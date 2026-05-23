'use client';

import Link from 'next/link';
import { useEditedResume } from '@/lib/editedResumeContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function EditPage() {
  const { edited, setEdited } = useEditedResume();

  if (!edited) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-white flex items-center justify-center">
      <p className="text-gray-500 dark:text-gray-400">No edited resume found.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-white transition-colors duration-200">
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center justify-between">
          <div>
            <Link href="/sections" className="mr-3 hover:text-gray-700 dark:hover:text-gray-200">Sections</Link>
            / <Link href="/" className="ml-3 hover:text-gray-700 dark:hover:text-gray-200">Home</Link>
          </div>
          <ThemeToggle />
        </nav>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">Edit Resume</h1>
          <Link href="/sections/preview" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Preview</Link>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-semibold">Name</label>
          <input
            value={edited.contact?.name || ''}
            onChange={(e) => setEdited && setEdited({ ...edited, contact: { ...(edited.contact || {}), name: e.target.value } })}
            className="w-full rounded border border-gray-300 dark:border-white/20 bg-white dark:bg-[#13131A] text-gray-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />

          <label className="text-sm font-semibold">Summary</label>
          <textarea
            value={edited.summary}
            onChange={(e) => setEdited && setEdited({ ...edited, summary: e.target.value })}
            className="w-full h-24 rounded border border-gray-300 dark:border-white/20 bg-white dark:bg-[#13131A] text-gray-900 dark:text-white p-3 text-sm outline-none focus:border-indigo-500"
          />

          <label className="text-sm font-semibold">Skills (comma-separated)</label>
          <input
            value={edited.skills.join(', ')}
            onChange={(e) => setEdited && setEdited({ ...edited, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
            className="w-full rounded border border-gray-300 dark:border-white/20 bg-white dark:bg-[#13131A] text-gray-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />

          <label className="text-sm font-semibold">Naukri Profile Text</label>
          <textarea
            value={edited.naukriProfileText}
            onChange={(e) => setEdited && setEdited({ ...edited, naukriProfileText: e.target.value })}
            className="w-full h-28 rounded border border-gray-300 dark:border-white/20 bg-white dark:bg-[#13131A] text-gray-900 dark:text-white p-3 text-sm outline-none focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}
