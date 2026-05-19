'use client';

import Link from 'next/link';
import { useEditedResume } from '@/lib/editedResumeContext';

export default function ExperiencePage() {
  const { edited, setEdited } = useEditedResume();

  if (!edited) return (
    <div className="max-w-3xl mx-auto py-8">No edited resume found. Open the rewrite first.</div>
  );

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-4">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/sections" className="mr-3">Sections</Link>
        / <Link href="/" className="ml-3">Home</Link>
      </nav>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Work Experience</h1>
        <div className="flex gap-2">
          <Link href="/sections/edit" className="text-sm text-indigo-600 hover:underline">Edit</Link>
        </div>
      </div>

      {edited.experience.map((job, i) => (
        <div key={i} className="rounded-lg border border-gray-200 p-4 bg-white">
          <input
            type="text"
            value={job.title}
            onChange={(e) => {
              const newExp = [...edited.experience];
              newExp[i].title = e.target.value;
              if (setEdited) setEdited({ ...edited, experience: newExp });
            }}
            className="w-full mb-2 rounded border border-gray-300 px-3 py-2"
          />

          <input
            type="text"
            value={job.company}
            onChange={(e) => {
              const newExp = [...edited.experience];
              newExp[i].company = e.target.value;
              if (setEdited) setEdited({ ...edited, experience: newExp });
            }}
            className="w-full mb-2 rounded border border-gray-300 px-3 py-2"
          />

          <textarea
            value={job.bullets.join('\n')}
            onChange={(e) => {
              const newExp = [...edited.experience];
              newExp[i].bullets = e.target.value.split('\n').filter(Boolean);
              if (setEdited) setEdited({ ...edited, experience: newExp });
            }}
            className="w-full h-24 rounded border border-gray-300 p-3 text-sm"
          />
        </div>
      ))}
    </div>
  );
}
