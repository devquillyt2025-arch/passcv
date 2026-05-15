'use client';

import Link from 'next/link';

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
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Sections</h1>
        <Link href="/" className="text-sm text-gray-500">Home</Link>
      </div>

      <div className="grid gap-3">
        {sections.map(s => (
          <Link key={s.id} href={`/sections/${s.id}`} className="rounded-lg border p-4 hover:bg-gray-50">
            <div className="text-lg font-medium">{s.label}</div>
            <div className="text-sm text-gray-500 mt-1">Open and edit this section</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
