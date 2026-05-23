'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, ArrowRight, Sparkles } from 'lucide-react';
import { useResumeStore } from '@/lib/store/useResumeStore';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function DashboardPage() {
  const router = useRouter();
  const { reset } = useResumeStore();

  const handleCreateNew = () => {
    reset();
    router.push('/builder');
  };

  const handleOpenExisting = () => {
    router.push('/builder');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0F] flex flex-col pb-20 transition-colors duration-200 font-sans">
      {/* Nav */}
      <nav className="bg-white dark:bg-[#0A0A0F]/80 backdrop-blur border-b border-gray-200 dark:border-white/[0.06] px-6 h-16 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 tracking-tight">
          TailorCV
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Home
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 pt-12 pb-16">

        {/* Prominent Action Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

          {/* Card 1: Tailor My Resume */}
          <div className="bg-gradient-to-tr from-indigo-900 to-indigo-950 text-white rounded-2xl border border-indigo-500/20 p-5 flex flex-col justify-between hover:shadow-xl transition-all shadow-md h-[210px]">
            <div>
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-3 border border-indigo-500/30">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-100">Tailor My Resume</h2>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                Upload resume + job description, get ATS score & AI rewrite
              </p>
            </div>
            <button
              onClick={() => router.push('/tailor')}
              className="mt-4 mb-6 flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all self-start text-xs shadow shadow-indigo-600/30"
            >
              Tailor Resume <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Build New Resume */}
          <div className="bg-gradient-to-tr from-teal-900 to-slate-900 text-white rounded-2xl border border-teal-500/20 p-5 flex flex-col justify-between hover:shadow-xl transition-all shadow-md h-[210px]">
            <div>
              <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center mb-3 border border-teal-500/30">
                <Plus className="w-5 h-5 text-teal-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-100">Build New Resume</h2>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                Start from scratch with live preview
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="mt-4 mb-6 flex items-center gap-1.5 bg-teal-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-teal-700 transition-all self-start text-xs shadow shadow-teal-600/30"
            >
              Build Resume <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Saved Resumes Header */}
        <div className="mb-8 border-t border-gray-200/60 dark:border-white/[0.06] pt-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Resumes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Continue editing your resume</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Demo resume card */}
          <div className="group flex flex-col">
            <div className="max-h-[320px] overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#13131A] hover:shadow-lg transition-all">
              <div
                className="bg-gray-50 dark:bg-[#0d0d14] cursor-pointer relative overflow-hidden h-[240px]"
                onClick={handleOpenExisting}
              >
                {/* A4 mini-page thumbnail */}
                <div className="absolute inset-3 bg-white dark:bg-[#1a1a2e] shadow-sm border border-gray-200 dark:border-white/10 rounded flex flex-col px-4 pt-5 pb-3 gap-1.5">
                  <div className="h-2 bg-indigo-200 dark:bg-indigo-800 rounded w-2/5 mx-auto mb-1" />
                  <div className="h-1.5 bg-gray-200 dark:bg-white/10 rounded w-3/4 mx-auto mb-2" />
                  <div className="h-px bg-gray-100 dark:bg-white/[0.05] w-full mb-1" />
                  <div className="h-1.5 bg-gray-100 dark:bg-white/[0.07] rounded w-1/3 mb-1" />
                  <div className="h-1 bg-gray-100 dark:bg-white/[0.05] rounded w-full" />
                  <div className="h-1 bg-gray-100 dark:bg-white/[0.05] rounded w-5/6" />
                  <div className="h-1 bg-gray-100 dark:bg-white/[0.05] rounded w-full" />
                  <div className="h-px bg-gray-100 dark:bg-white/[0.05] w-full my-1" />
                  <div className="h-1.5 bg-gray-100 dark:bg-white/[0.07] rounded w-1/3 mb-1" />
                  <div className="h-1 bg-gray-100 dark:bg-white/[0.05] rounded w-full" />
                  <div className="h-1 bg-gray-100 dark:bg-white/[0.05] rounded w-4/5" />
                  <div className="h-1 bg-gray-100 dark:bg-white/[0.05] rounded w-full" />
                  <div className="h-px bg-gray-100 dark:bg-white/[0.05] w-full my-1" />
                  <div className="h-1.5 bg-gray-100 dark:bg-white/[0.07] rounded w-1/3 mb-1" />
                  <div className="h-1 bg-gray-100 dark:bg-white/[0.05] rounded w-3/4" />
                  <div className="h-1 bg-gray-100 dark:bg-white/[0.05] rounded w-full" />
                </div>
                <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <span className="bg-white dark:bg-[#13131A] text-indigo-600 dark:text-indigo-400 font-semibold px-4 py-2 rounded-full shadow-sm flex items-center gap-2 text-sm">
                      <ArrowRight className="w-4 h-4" /> Open
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-3 px-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">My Resume</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Last edited today</p>
            </div>
          </div>

        </div>

      </main>

      <footer className="border-t border-gray-200 dark:border-white/[0.06] py-5 px-6 text-center text-xs text-gray-400 dark:text-gray-600 bg-white dark:bg-[#0A0A0F]">
        TailorCV · Resumes are processed in-memory and never stored · No human review
      </footer>
    </div>
  );
}
