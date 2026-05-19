'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useResumeStore } from '@/lib/store/useResumeStore';
import { useAutosaveSync } from '@/hooks/useAutosaveSync';
import EditorPanel from '@/components/builder/EditorPanel';
import ResumePreview from '@/components/builder/ResumePreview';
import PreviewModal from '@/components/builder/PreviewModal';
import ImportResumeModal from '@/components/builder/ImportResumeModal';
import ATSScoreWidget from '@/components/builder/ATSScoreWidget';
import ResumeStatsWidget from '@/components/builder/ResumeStatsWidget';
import ATSKeywordScanner from '@/components/builder/ATSKeywordScanner';
import ScoreBreakdownWidget from '@/components/builder/ScoreBreakdownWidget';
import ResumeHealthWidget from '@/components/builder/ResumeHealthWidget';
import { useUIStore } from '@/lib/store/useUIStore';
import {
  Loader2,
  CheckCircle2,
  Download,
  Eye,
  ArrowLeft,
  Upload,
} from 'lucide-react';

export default function BuilderPage() {
  const { data, resumeId, templateId, setTemplateId, _hasHydrated, sectionOrder } = useResumeStore();
  const { saveStatus } = useAutosaveSync(resumeId, data);

  const { jdText, setJdText } = useUIStore();

  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState('');

  const handleDownload = async () => {
    setDownloading(true);
    setDlError('');
    try {
      const { generateBuilderPdfBlob } = await import('@/lib/resumePdf');
      const blob = await generateBuilderPdfBlob(data, templateId, sectionOrder);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fullName =
        [data.contact.firstName, data.contact.lastName].filter(Boolean).join('_') || 'Resume';
      a.download = `${fullName}_TailorCV.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setDlError(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* ── Toolbar ── */}
      <header className="h-14 shrink-0 bg-white border-b border-gray-200 flex items-center px-4 gap-3 z-20">
        {/* Left group */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <div className="w-px h-4 bg-gray-200" />
          <span className="text-sm font-bold text-indigo-700 tracking-tight">TailorCV</span>
          <div className="w-px h-4 bg-gray-200" />
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Import
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Template switcher — center */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 shrink-0">
          <button
            onClick={() => setTemplateId('classic')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              templateId === 'classic'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Classic
          </button>
          <button
            onClick={() => setTemplateId('modern')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              templateId === 'modern'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Modern
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right group */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Save status */}
          <div className="text-xs min-w-[70px] text-right">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-amber-600 justify-end">
                <Loader2 className="w-3 h-3 animate-spin" /> Saving…
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-green-600 justify-end">
                <CheckCircle2 className="w-3 h-3" /> Saved
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-500">Save error</span>
            )}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {downloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            {downloading ? 'Generating…' : 'Download PDF'}
          </button>
        </div>
      </header>

      {/* Error bar */}
      {dlError && (
        <div className="shrink-0 bg-red-50 border-b border-red-200 px-4 py-2 text-xs text-red-600 text-center">
          {dlError}
        </div>
      )}

      {/* ── Split pane ── */}
      <div className="flex flex-1 min-h-0">
        {/* Left — editor */}
        <div className="w-[50%] overflow-y-auto bg-gray-50 border-r border-gray-200">
          <EditorPanel />
        </div>

        {/* Right — live preview */}
        <div className="w-[50%] overflow-y-auto bg-[#DCDDE1] flex flex-col items-center py-8 px-4 gap-3">
          {/* Row 1: three equal columns — Stats | Insights | ATS Score */}
          <div className="w-[680px] flex gap-3 items-stretch">
            <div className="flex-1 min-w-0 h-full">
              <ResumeStatsWidget className="w-full h-full" />
            </div>
            <div className="flex-1 min-w-0 h-full">
              <ResumeHealthWidget className="w-full h-full" />
            </div>
            <div className="flex-1 min-w-0 h-full">
              <ATSScoreWidget className="w-full h-full" jdText={jdText} onJdChange={setJdText} />
            </div>
          </div>

          {/* Row 2: Score Breakdown — full width, 4-column tile grid */}
          <ScoreBreakdownWidget jdText={jdText} />

          {/* Row 3: ATS keyword scanner — full width, collapsible */}
          <ATSKeywordScanner />

          {/* A4 paper */}
          <ResumePreview />

          {/* Bottom padding buffer */}
          <div className="h-8" />
        </div>
      </div>

      {/* Modals */}
      {showImport && <ImportResumeModal onClose={() => setShowImport(false)} />}

      {showModal && (
        <PreviewModal
          data={data}
          templateId={templateId}
          onClose={() => setShowModal(false)}
          onDownload={() => {
            setShowModal(false);
            handleDownload();
          }}
        />
      )}
    </div>
  );
}
