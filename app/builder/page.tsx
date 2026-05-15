'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useResumeStore } from '@/lib/store/useResumeStore';
import { createClient } from '@/utils/supabase/client';
import ResumeCanvas from '@/components/builder/ResumeCanvas';
import PreviewModal from '@/components/builder/PreviewModal';
import PersonalInfo from '@/components/builder/steps/PersonalInfo';
import SummaryStep from '@/components/builder/steps/SummaryStep';
import SkillsStep from '@/components/builder/steps/SkillsStep';
import ExperienceStep from '@/components/builder/steps/ExperienceStep';
import EducationStep from '@/components/builder/steps/EducationStep';
import ProjectsStep from '@/components/builder/steps/ProjectsStep';
import ATSScoreWidget from '@/components/builder/ATSScoreWidget';
import { Loader2, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { id: 'personal',       label: 'Personal Info' },
  { id: 'summary',        label: 'Summary' },
  { id: 'skills',         label: 'Skills' },
  { id: 'experience',     label: 'Experience' },
  { id: 'education',      label: 'Education' },
  { id: 'projects',       label: 'Projects' },
  { id: 'preview',        label: 'Preview & Download' },
];

export default function BuilderPage() {
  const [step, setStep] = useState(0);
  const { data, resumeId, templateId, setTemplateId } = useResumeStore();
  const [showModal, setShowModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const supabase = createClient();
  const initialRender = useRef(true);

  const isLastStep = step === STEPS.length - 1;

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    if (!resumeId) return;

    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      const { error } = await supabase
        .from('resumes')
        .update({ 
          data: data,
          name: data.contact.firstName ? `${data.contact.firstName} ${data.contact.lastName} Resume` : 'Untitled Resume',
          updated_at: new Date().toISOString()
        })
        .eq('id', resumeId);

      if (error) {
        console.error('Error auto-saving:', error);
        setSaveStatus('error');
      } else {
        setSaveStatus('saved');
      }
    }, 1000); // 1-second debounce

    return () => clearTimeout(timer);
  }, [data, resumeId, supabase]);

  const handleDownload = async () => {
    setDownloading(true);
    setDlError('');
    try {
      const { generateBuilderPdfBlob } = await import('@/lib/resumePdf');
      const blob = await generateBuilderPdfBlob(data, templateId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fullName = [data.contact.firstName, data.contact.lastName].filter(Boolean).join('_') || 'Resume';
      a.download = `${fullName}_TailorCV.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setDlError(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors">
            ← Dashboard
          </Link>
          <div className="w-px h-4 bg-gray-300"></div>
          <span className="text-lg font-bold text-indigo-700 tracking-tight">
            TailorCV
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5 text-amber-600">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-green-600">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved to cloud
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-500">Error saving to cloud</span>
          )}
        </div>
      </nav>

      {/* Step bar */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="max-w-7xl mx-auto py-2.5 flex gap-1 overflow-x-auto">
          {STEPS.map((s, i) => {
            const state = i === step ? 'active' : i < step ? 'done' : 'upcoming';
            return (
              <button
                key={s.id}
                onClick={() => setStep(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  state === 'active'
                    ? 'bg-indigo-600 text-white'
                    : state === 'done'
                    ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span
                  className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    state === 'active'
                      ? 'bg-white text-indigo-600'
                      : state === 'done'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {state === 'done' ? '✓' : i + 1}
                </span>
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main two-column layout */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-5 items-start">
        {/* Left — form panel */}
        <div className="w-[55%] min-w-0">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="p-6">
              {step === 0 && <PersonalInfo />}
              {step === 1 && <SummaryStep />}
              {step === 2 && <SkillsStep />}
              {step === 3 && <ExperienceStep />}
              {step === 4 && <EducationStep />}
              {step === 5 && <ProjectsStep />}
              {step === 6 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Preview & Download</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Review your resume in the panel on the right. Click on your name, summary, or
                      any bullet point in the preview to edit it directly.
                    </p>
                  </div>

                  {dlError && (
                    <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{dlError}</p>
                  )}

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Resume Template</label>
                      <select 
                        value={templateId}
                        onChange={(e) => setTemplateId(e.target.value as 'classic' | 'modern')}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      >
                        <option value="classic">Classic ATS (Standard Typography)</option>
                        <option value="modern">Modern ATS (Roboto Typography)</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setShowModal(true)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-indigo-300 bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Preview PDF
                    </button>

                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {downloading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      )}
                      {downloading ? 'Generating…' : 'Download PDF'}
                    </button>
                  </div>

                  <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                    <p className="text-xs text-amber-700">
                      <strong>Tip:</strong> The highlighted fields in the live preview are editable
                      at any step — click them to make quick changes without navigating back.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Step navigation */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Back
              </button>

              <span className="text-xs text-gray-400">
                Step {step + 1} of {STEPS.length}
              </span>

              {!isLastStep ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Next →
                </button>
              ) : (
                <div className="w-20" />
              )}
            </div>
          </div>
        </div>

        {/* Right — live preview */}
        <div className="w-[45%] min-w-0">
          <div className="sticky top-20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Live Preview
              </span>
              <span className="text-xs text-amber-600 font-medium">✏ Editable</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
              <ATSScoreWidget />
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 9rem)' }}>
                <div className="p-6">
                  <ResumeCanvas
                    editable={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <PreviewModal
          data={data}
          templateId={templateId}
          onClose={() => setShowModal(false)}
          onDownload={() => { setShowModal(false); handleDownload(); }}
        />
      )}
    </div>
  );
}
