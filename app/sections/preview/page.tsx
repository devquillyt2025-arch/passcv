'use client';

import Link from 'next/link';
import { useEditedResume } from '@/lib/editedResumeContext';
import ResumePreview from '@/components/ResumePreview';

export default function PreviewPage() {
  const { edited } = useEditedResume();

  if (!edited) return <div className="max-w-3xl mx-auto py-8">No edited resume to preview.</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/sections" className="mr-3">Sections</Link>
        / <Link href="/" className="ml-3">Home</Link>
      </nav>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Preview</h1>
        <div className="flex gap-2">
          <Link href="/sections/edit" className="text-sm text-indigo-600 hover:underline">Edit</Link>
        </div>
      </div>

      <ResumePreview resume={edited} />
    </div>
  );
}
