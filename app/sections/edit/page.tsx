'use client';

import Link from 'next/link';
import { useEditedResume } from '@/lib/editedResumeContext';

export default function EditPage() {
  const { edited, setEdited } = useEditedResume();

  if (!edited) return <div className="max-w-3xl mx-auto py-8">No edited resume found.</div>;

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/sections" className="mr-3">Sections</Link>
        / <Link href="/" className="ml-3">Home</Link>
      </nav>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Edit Resume</h1>
        <div className="flex gap-2">
          <Link href="/sections/preview" className="text-sm text-indigo-600 hover:underline">Preview</Link>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-semibold">Name</label>
        <input
          value={edited.contact?.name || ''}
          onChange={(e) => setEdited && setEdited({ ...edited, contact: { ...(edited.contact || {}), name: e.target.value } })}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />

        <label className="text-sm font-semibold">Summary</label>
        <textarea value={edited.summary} onChange={(e) => setEdited && setEdited({ ...edited, summary: e.target.value })} className="w-full h-24 rounded border border-gray-300 p-3" />

        <label className="text-sm font-semibold">Skills (comma-separated)</label>
        <input value={edited.skills.join(', ')} onChange={(e) => setEdited && setEdited({ ...edited, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="w-full rounded border border-gray-300 px-3 py-2" />

        <label className="text-sm font-semibold">Naukri Profile Text</label>
        <textarea value={edited.naukriProfileText} onChange={(e) => setEdited && setEdited({ ...edited, naukriProfileText: e.target.value })} className="w-full h-28 rounded border border-gray-300 p-3" />
      </div>

    </div>
  );
}
