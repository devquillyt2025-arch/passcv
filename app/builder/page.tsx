'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Eye,
  LayoutTemplate,
  Loader2,
  Maximize2,
  Minus,
  Palette,
  Plus,
  Text,
  Upload,
} from 'lucide-react';
import { useResumeStore } from '@/lib/store/useResumeStore';
import { useUIStore } from '@/lib/store/useUIStore';
import { useAutosaveSync } from '@/hooks/useAutosaveSync';
import { useResumeStats } from '@/hooks/useResumeStats';
import EditorPanel from '@/components/builder/EditorPanel';
import ResumePreview from '@/components/builder/ResumePreview';
import PreviewModal from '@/components/builder/PreviewModal';
import ImportResumeModal from '@/components/builder/ImportResumeModal';
import { calculateScore, mapResumeDataToParsedResume, parseJD } from '@/lib/scoring';

const ACCENTS = ['#4F46E5', '#0F766E', '#B45309', '#BE123C', '#2563EB'];
const FONT_PAIRS = [
  { id: 'modern', label: 'Inter' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'classic', label: 'Classic' },
] as const;
const SPACING = [
  { id: 'compact', label: 'Compact' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'airy', label: 'Airy' },
] as const;

function IconButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm shadow-slate-200/60 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex rounded-xl bg-slate-100 p-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            value === option.id
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function BuilderPage() {
  const {
    data,
    resumeId,
    templateId,
    setTemplateId,
    builderDesign,
    setBuilderDesign,
    _hasHydrated,
    sectionOrder,
  } = useResumeStore();
  const { saveStatus } = useAutosaveSync(resumeId, data);
  const { jdText } = useUIStore();
  const stats = useResumeStats(data);

  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [activeScoreChip, setActiveScoreChip] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState('');

  const fullName = [data.contact.firstName, data.contact.lastName].filter(Boolean).join(' ') || 'Untitled resume';
  const completion = useMemo(() => {
    const checks = [
      data.contact.email,
      data.contact.phone,
      data.summary,
      data.skills.length,
      data.experience.length,
      data.education.length,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [data]);

  const score = useMemo(() => {
    const parsedResume = mapResumeDataToParsedResume(data);
    return calculateScore(parsedResume, parseJD(jdText));
  }, [data, jdText]);

  const scoreChips = [
    {
      id: 'ats',
      label: 'ATS Score',
      value: `${score.total}/100`,
      pct: score.total,
      details: score.topFixes.length ? score.topFixes : ['No major issues found.'],
    },
    {
      id: 'keywords',
      label: 'Keywords',
      value: `${score.breakdown.keyword}/40`,
      pct: (score.breakdown.keyword / 40) * 100,
      details: [
        score.matchedKeywords.length ? `Matched: ${score.matchedKeywords.slice(0, 8).join(', ')}` : 'No JD keywords matched yet.',
        score.missingKeywords.length ? `Missing: ${score.missingKeywords.slice(0, 8).join(', ')}` : 'No missing keywords detected.',
      ],
    },
    {
      id: 'formatting',
      label: 'Formatting',
      value: `${score.breakdown.formatting}/20`,
      pct: (score.breakdown.formatting / 20) * 100,
      details: score.formattingIssues.length ? score.formattingIssues : ['ATS-safe formatting looks good.'],
    },
    {
      id: 'content',
      label: 'Content',
      value: `${score.breakdown.content}/20`,
      pct: (score.breakdown.content / 20) * 100,
      details: score.contentIssues.length ? score.contentIssues : ['Content quality checks look good.'],
    },
    {
      id: 'recruiter',
      label: 'Recruiter',
      value: `${score.breakdown.naukri}/20`,
      pct: (score.breakdown.naukri / 20) * 100,
      details: score.naukriIssues.length ? score.naukriIssues : ['Recruiter checks look good.'],
    },
  ];

  const handleDownload = async () => {
    setDownloading(true);
    setDlError('');
    try {
      const { generateBuilderPdfBlob } = await import('@/lib/resumePdf');
      const blob = await generateBuilderPdfBlob(data, templateId, sectionOrder);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fullName.replace(/\s+/g, '_')}_TailorCV.pdf`;
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#eef1f6] text-slate-950">
      <header className="relative z-20 border-b border-slate-200/80 bg-white/90 px-6 py-3.5 shadow-sm shadow-slate-200/40 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            title="Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">{fullName}</p>
            <p className="text-xs text-[#888]">
              {stats.wordCount} words · {stats.pageCount} page estimate · {completion}% complete
            </p>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowImport(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              <Upload className="h-3.5 w-3.5" />
              Import
            </button>

            <div className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm sm:flex">
              {saveStatus === 'saving' && <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />}
              {saveStatus === 'saved' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
              {saveStatus === 'error' ? 'Save error' : saveStatus === 'saving' ? 'Saving' : 'Saved'}
            </div>

            <IconButton label="Preview" onClick={() => setShowModal(true)}>
              <Eye className="h-4 w-4" />
            </IconButton>

            <div className="mx-1 hidden h-8 w-px bg-slate-200 sm:block" />

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-60"
            >
              {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              {downloading ? 'Generating' : 'Download'}
            </button>
          </div>
        </div>
      </header>

      {dlError && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-center text-xs font-medium text-red-600">
          {dlError}
        </div>
      )}

      <div className="sticky top-0 z-10 flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-white/90 px-6 py-3 backdrop-blur-xl">
        <div className="inline-flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <LayoutTemplate className="h-4 w-4" />
            Theme:
          </div>
          <Segmented
            value={templateId}
            options={[{ id: 'classic', label: 'Classic' }, { id: 'modern', label: 'Modern' }]}
            onChange={setTemplateId}
          />
        </div>

        <div className="h-6 w-px bg-slate-200" />

        <div className="inline-flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Text className="h-4 w-4" />
            Font:
          </div>
          <Segmented
            value={builderDesign.fontPair}
            options={FONT_PAIRS}
            onChange={(fontPair) => setBuilderDesign({ fontPair })}
          />
        </div>

        <div className="h-6 w-px bg-slate-200" />

        <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <Palette className="mx-2 h-4 w-4 text-slate-400" />
          {ACCENTS.map((color) => (
            <button
              key={color}
              type="button"
              title={color}
              onClick={() => setBuilderDesign({ accentColor: color })}
              className={`h-6 w-6 rounded-full border-2 transition ${
                builderDesign.accentColor === color ? 'border-slate-950' : 'border-white'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <div className="h-6 w-px bg-slate-200" />

        <div className="inline-flex items-center gap-2">
          <Segmented
            value={builderDesign.spacing}
            options={SPACING}
            onChange={(spacing) => setBuilderDesign({ spacing })}
          />

          <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <IconButton
              label="Zoom out"
              onClick={() => setBuilderDesign({ zoom: Math.max(0.55, Number((builderDesign.zoom - 0.05).toFixed(2))) })}
            >
              <Minus className="h-3.5 w-3.5" />
            </IconButton>
            <span className="w-11 text-center text-xs font-semibold tabular-nums text-slate-600">
              {Math.round(builderDesign.zoom * 100)}%
            </span>
            <IconButton
              label="Zoom in"
              onClick={() => setBuilderDesign({ zoom: Math.min(1, Number((builderDesign.zoom + 0.05).toFixed(2))) })}
            >
              <Plus className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton label="Fit preview" onClick={() => setBuilderDesign({ zoom: 0.9 })}>
              <Maximize2 className="h-3.5 w-3.5" />
            </IconButton>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 overflow-hidden bg-white">
        <section className="builder-editor hover-scrollbar min-h-0 w-[50vw] overflow-y-auto border-r border-slate-200 bg-slate-50">
          <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-slate-50/95 px-5 py-4 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Editor</p>
                <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Resume studio</h1>
              </div>
            </div>
          </div>

          <EditorPanel />
        </section>

        <section className="flex min-h-0 w-[50vw] flex-col bg-[#e8e8e8]">
          <div className="hover-scrollbar min-h-0 flex-1 overflow-y-auto py-10 pl-8 pr-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mx-auto flex min-h-full max-w-[794px] justify-center"
            >
              <div className="mx-auto origin-top" style={{ transform: `scale(${builderDesign.zoom})` }}>
                <ResumePreview />
              </div>
            </motion.div>
          </div>

          <div className="scrollbar-hide relative flex h-11 shrink-0 items-center gap-2 overflow-x-auto border-t border-slate-200 bg-white/95 px-4 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur">
            {scoreChips.map((chip) => (
              <div key={chip.id} className="relative">
                <button
                  type="button"
                  onClick={() => setActiveScoreChip((current) => current === chip.id ? null : chip.id)}
                  className={`inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-[14px] py-1.5 text-xs font-semibold transition ${
                    activeScoreChip === chip.id
                      ? 'bg-slate-800 text-white'
                      : 'bg-[#f1f5f9] text-slate-700 hover:bg-[#e2e8f0]'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      chip.pct >= 80 ? 'bg-emerald-500' : chip.pct >= 50 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                  />
                  <span>{chip.label}</span>
                  <span className="tabular-nums">{chip.value}</span>
                </button>

                <AnimatePresence>
                  {activeScoreChip === chip.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute bottom-10 left-0 z-30 w-72 rounded-xl border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-600 shadow-2xl shadow-slate-400/30"
                    >
                      <p className="mb-2 font-semibold text-slate-950">{chip.label} details</p>
                      <ul className="space-y-1.5">
                        {chip.details.map((detail, index) => (
                          <li key={index}>{detail}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>
      </div>

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
