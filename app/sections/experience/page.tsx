'use client';

import Link from 'next/link';
import { useEditedResume } from '@/lib/editedResumeContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ExperiencePage() {
  const { edited, setEdited } = useEditedResume();

  if (!edited) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-white flex items-center justify-center">
      <p className="text-gray-500 dark:text-gray-400">No edited resume found. Open the rewrite first.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-white transition-colors duration-200">
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-4">
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center justify-between">
          <div>
            <Link href="/sections" className="mr-3 hover:text-gray-700 dark:hover:text-gray-200">Sections</Link>
            / <Link href="/" className="ml-3 hover:text-gray-700 dark:hover:text-gray-200">Home</Link>
          </div>
          <ThemeToggle />
        </nav>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">Work Experience</h1>
          <Link href="/sections/edit" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Edit</Link>
        </div>

        {edited.experience.map((job, i) => (
          <div key={i} className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#13131A] p-4">
            <input
              type="text"
              value={job.title}
              onChange={(e) => {
                const newExp = [...edited.experience];
                newExp[i].title = e.target.value;
                if (setEdited) setEdited({ ...edited, experience: newExp });
              }}
              className="w-full mb-2 rounded border border-gray-300 dark:border-white/20 bg-white dark:bg-[#0A0A0F] text-gray-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              value={job.company}
              onChange={(e) => {
                const newExp = [...edited.experience];
                newExp[i].company = e.target.value;
                if (setEdited) setEdited({ ...edited, experience: newExp });
              }}
              className="w-full mb-2 rounded border border-gray-300 dark:border-white/20 bg-white dark:bg-[#0A0A0F] text-gray-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
            <textarea
              value={job.bullets.join('\n')}
              onChange={(e) => {
                const newExp = [...edited.experience];
                newExp[i].bullets = e.target.value.split('\n').filter(Boolean);
                if (setEdited) setEdited({ ...edited, experience: newExp });
              }}
              className="w-full h-24 rounded border border-gray-300 dark:border-white/20 bg-white dark:bg-[#0A0A0F] text-gray-900 dark:text-white p-3 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
