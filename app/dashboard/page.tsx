'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Plus, ArrowRight } from 'lucide-react';
import { useResumeStore } from '@/lib/store/useResumeStore';

export default function DashboardPage() {
  const router = useRouter();
  const { reset } = useResumeStore();

  const handleCreateNew = () => {
    reset();
    router.push('/builder');
  };

  const handleOpenExisting = () => {
    // Demo resume is already loaded in the store as default state
    router.push('/builder');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="text-xl font-bold text-indigo-700 tracking-tight">
          TailorCV
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          Home
        </Link>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Resumes</h1>
            <p className="text-gray-500 mt-1 text-sm">Create or continue editing your resume</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow text-sm"
          >
            <Plus className="w-4 h-4" />
            New Resume
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Demo resume card */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
            <div
              className="aspect-[1/1.2] bg-gray-50 flex flex-col items-center justify-center p-6 cursor-pointer relative overflow-hidden"
              onClick={handleOpenExisting}
            >
              <div className="w-3/4 h-full bg-white shadow-sm border border-gray-200 rounded absolute -bottom-6 flex flex-col pt-8 px-6 gap-3">
                <div className="h-2 bg-indigo-200 rounded w-1/2 mx-auto" />
                <div className="h-1.5 bg-gray-100 rounded w-full mt-4" />
                <div className="h-1.5 bg-gray-100 rounded w-5/6" />
                <div className="h-1.5 bg-gray-100 rounded w-full mt-2" />
                <div className="h-1.5 bg-gray-100 rounded w-4/6" />
                <div className="h-1.5 bg-gray-100 rounded w-full mt-2" />
                <div className="h-1.5 bg-gray-100 rounded w-3/4" />
              </div>
              <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <span className="bg-white text-indigo-600 font-semibold px-4 py-2 rounded-full shadow-sm flex items-center gap-2 text-sm">
                    <ArrowRight className="w-4 h-4" /> Open
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">My Resume</h3>
              <p className="text-xs text-gray-500 mt-1">Last edited today</p>
            </div>
          </div>

          {/* Create new card */}
          <button
            onClick={handleCreateNew}
            className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex flex-col items-center justify-center gap-3 p-12 text-center group aspect-[1/1.2] min-h-[200px]"
          >
            <div className="w-12 h-12 bg-indigo-50 group-hover:bg-indigo-100 rounded-xl flex items-center justify-center transition-colors">
              <Plus className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-700 text-sm">Create New Resume</p>
              <p className="text-xs text-gray-400 mt-1">Start from a blank template</p>
            </div>
          </button>
        </div>

        {/* Quick link to builder */}
        <div className="mt-12 bg-white border border-gray-200 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Resume Builder</p>
              <p className="text-xs text-gray-500">Live editor with real-time preview</p>
            </div>
          </div>
          <Link
            href="/builder"
            className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Open Builder <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-5 px-6 text-center text-xs text-gray-400">
        TailorCV · Resumes are processed securely and never shared
      </footer>
    </div>
  );
}
