'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  Loader2,
  Maximize2,
  Minus,
  Plus,
  Upload,
} from 'lucide-react';
import { useResumeStore } from '@/lib/store/useResumeStore';
import { useUIStore } from '@/lib/store/useUIStore';
import { useAutosaveSync } from '@/hooks/useAutosaveSync';
import { useResumeStats } from '@/hooks/useResumeStats';
import { useDebounce } from '@/hooks/useDebounce';
import EditorPanel from '@/components/builder/EditorPanel';
import ResumePreview from '@/components/builder/ResumePreview';
import PreviewModal from '@/components/builder/PreviewModal';
import ImportResumeModal from '@/components/builder/ImportResumeModal';
import ScoreFooterBar from '@/components/builder/ScoreFooterBar';
import PortalPopover from '@/components/ui/PortalPopover';
import { calculateScore, mapResumeDataToParsedResume, parseJD } from '@/lib/scoring';

const ACCENTS = [
  { color: '#4F46E5', name: 'Indigo' },
  { color: '#0F766E', name: 'Teal' },
  { color: '#B45309', name: 'Amber' },
  { color: '#BE123C', name: 'Rose' },
  { color: '#2563EB', name: 'Blue' },
] as const;
const FONT_PAIRS = [
  { id: 'editorial', label: 'Georgia (Editorial)' },
  { id: 'modern', label: 'Inter (Modern)' },
  { id: 'helvetica', label: 'Helvetica' },
  { id: 'verdana', label: 'Verdana' },
  { id: 'times', label: 'Times New Roman' },
  { id: 'calibri', label: 'Calibri' },
  { id: 'courier', label: 'Courier New' },
  { id: 'classic', label: 'Classic (Times)' },
  { id: 'arial', label: 'Arial' },
] as const;
const FONT_CSS_MAP: Record<string, string> = {
  modern: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
  arial: 'Arial, Helvetica, sans-serif',
  helvetica: 'Helvetica, Arial, sans-serif',
  verdana: 'Verdana, Geneva, sans-serif',
  times: '"Times New Roman", Times, serif',
  calibri: 'Calibri, Roboto, sans-serif',
  courier: '"Courier New", Courier, monospace',
  editorial: '"Georgia", "Times New Roman", serif',
  classic: '"Times New Roman", Georgia, serif',
};
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
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] text-slate-600 dark:text-gray-300 shadow-sm shadow-slate-200/60 dark:shadow-none transition hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-gray-600 hover:text-slate-950 dark:hover:text-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
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
    <div className="inline-flex rounded-[8px] bg-slate-100 dark:bg-gray-800 p-[3px]">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`rounded-[5px] px-3 py-[3px] text-[11px] font-semibold transition-all ${
            value === option.id
              ? 'bg-[#1E293B] dark:bg-gray-700 text-white shadow-sm'
              : 'text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

const TEMPLATE_OPTIONS = [
  { id: 'classic'   as const, label: 'Classic'   },
  { id: 'modern'    as const, label: 'Modern'    },
  { id: 'minimal'   as const, label: 'Minimal'   },
  { id: 'executive' as const, label: 'Executive' },
  { id: 'sidebar'   as const, label: 'Sidebar'   },
];

function TemplateSwitch({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: 'classic' | 'modern' | 'minimal' | 'executive' | 'sidebar') => void;
}) {
  return (
    <div className="inline-flex rounded-[8px] bg-slate-100 dark:bg-gray-800 p-[3px]">
      {TEMPLATE_OPTIONS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`rounded-[5px] px-3 py-[3px] text-[11px] font-semibold transition-all ${
            value === id
              ? 'bg-[#1E293B] dark:bg-gray-700 text-white shadow-sm'
              : 'text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ColorSwatchStrip({
  accents,
  value,
  onChange,
}: {
  accents: readonly { color: string; name: string }[];
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-[8px] bg-slate-100 dark:bg-gray-800 p-[3px]">
      {accents.map(({ color, name }) => {
        const isActive = value === color;
        return (
          <button
            key={color}
            type="button"
            title={name}
            onClick={() => onChange(color)}
            className={`relative h-[22px] w-8 flex-shrink-0 rounded-[5px] border transition-all duration-150 ${
              isActive
                ? 'z-10 border-white shadow-md ring-2 ring-black/20'
                : 'border-black/[0.08] hover:opacity-90 hover:shadow-sm'
            }`}
            style={{ backgroundColor: color }}
          >
            {isActive && (
              <span aria-hidden className="absolute inset-0 flex items-center justify-center">
                <Check className="h-[11px] w-[11px] text-white [filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.3))]" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ToolbarGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-[5px] px-4">
      <span className="select-none text-[9px] font-bold uppercase leading-none tracking-[0.14em] text-slate-400 dark:text-gray-500">
        {label}
      </span>
      {children}
    </div>
  );
}

function ToolbarDivider() {
  return <div className="h-9 w-px flex-shrink-0 self-center bg-slate-100 dark:bg-gray-800" />;
}

function FontSelect<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  const current = options.find((o) => o.id === value) ?? options[0];

  return (
    <>
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-8 min-w-[148px] items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] px-3 text-xs font-medium text-slate-900 dark:text-gray-100 shadow-sm transition hover:border-slate-300 dark:hover:border-gray-600 hover:shadow focus:outline-none"
        style={{ fontFamily: FONT_CSS_MAP[value] ?? 'sans-serif' }}
      >
        <span className="truncate">{current.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 flex-shrink-0 text-slate-400 dark:text-gray-500 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <PortalPopover isOpen={open} onClose={() => setOpen(false)} anchorRef={ref}>
        <div className="min-w-[220px] overflow-hidden rounded-xl border border-slate-100 dark:border-gray-700 bg-white dark:bg-[#1e293b] py-1 shadow-2xl shadow-slate-300/40 dark:shadow-black/40 ring-1 ring-slate-900/[0.06] dark:ring-white/[0.06]">
          {options.map((option) => {
            const fontCss = FONT_CSS_MAP[option.id] ?? 'sans-serif';
            const isSelected = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => { onChange(option.id); setOpen(false); }}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                    : 'text-slate-700 dark:text-gray-300 hover:bg-slate-50/80 dark:hover:bg-gray-700'
                }`}
              >
                <span
                  className="w-7 flex-shrink-0 text-[15px] leading-none text-slate-400 dark:text-gray-500"
                  style={{ fontFamily: fontCss }}
                  aria-hidden
                >
                  Aa
                </span>
                <span className="flex-1 text-xs font-medium leading-none" style={{ fontFamily: fontCss }}>
                  {option.label}
                </span>
                {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0 text-indigo-500" />}
              </button>
            );
          })}
        </div>
      </PortalPopover>
    </>
  );
}

export default function BuilderPage() {
  const { data, resumeId, templateId, sectionOrder, hiddenSections, builderDesign, _hasHydrated, setBuilderDesign, setTemplateId } = useResumeStore();
  const debouncedData = useDebounce(data, 300);
  const { jdText } = useUIStore();
  const stats = useResumeStats(debouncedData);
  const { saveStatus } = useAutosaveSync(resumeId, data);

  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState('');

  // ── Resizable split ──────────────────────────────────────────────────────────
  const splitRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; width: number } | null>(null);
  const [leftWidth, setLeftWidth] = useState<number | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (leftWidth !== undefined || !splitRef.current) return;
    setLeftWidth(splitRef.current.offsetWidth / 2);
  }, [leftWidth]);

  const handleSplitMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragStartRef.current = { x: e.clientX, width: leftWidth ?? 0 };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      if (!dragStartRef.current || !splitRef.current) return;
      const cw = splitRef.current.offsetWidth;
      const delta = e.clientX - dragStartRef.current.x;
      setLeftWidth(Math.max(340, Math.min(cw - 340, dragStartRef.current.width + delta)));
    };
    const onUp = () => { setIsDragging(false); dragStartRef.current = null; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (!_hasHydrated) return;
    const saved = localStorage.getItem('resumeBuilder_font');
    setBuilderDesign({ fontPair: (saved || 'editorial') as 'modern' | 'arial' | 'helvetica' | 'verdana' | 'times' | 'calibri' | 'courier' | 'editorial' | 'classic' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated]);

  const fullName = [debouncedData.contact.firstName, debouncedData.contact.lastName].filter(Boolean).join(' ') || 'Untitled resume';
  const completion = useMemo(() => {
    const checks = [
      debouncedData.contact.email,
      debouncedData.contact.phone,
      debouncedData.summary,
      debouncedData.skills.length,
      debouncedData.experience.length,
      debouncedData.education.length,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [debouncedData]);

  const [score, setScore] = useState(() => {
    const parsedResume = mapResumeDataToParsedResume(debouncedData);
    return calculateScore(parsedResume, parseJD(jdText));
  });

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../../lib/workers/score.worker.ts', import.meta.url));
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'SUCCESS') {
        setScore(e.data.score);
      }
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ data: debouncedData, jdText });
    }
  }, [debouncedData, jdText]);

  const handleDownload = async () => {
    setDownloading(true);
    setDlError('');
    try {
      const { generateBuilderPdfBlob } = await import('@/lib/resumePdf');
      const blob = await generateBuilderPdfBlob(debouncedData, templateId, sectionOrder, accentColor);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fullName.replace(/\s+/g, '_')}_FolioX.pdf`;
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#080d1a]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const accentColor = builderDesign?.accentColor || '#4F46E5';

  return (
    <div
      className="flex h-screen flex-col overflow-hidden bg-[#eef1f6] dark:bg-[#080d1a] text-slate-950 dark:text-slate-100"
      style={{
        ...(isDragging ? { cursor: 'col-resize', userSelect: 'none' } : {}),
        '--accent-color': accentColor,
        '--accent-ring': `${accentColor}26`,
      } as React.CSSProperties}
    >
      <header className="relative z-20 border-b border-slate-200/80 dark:border-gray-800/80 bg-white/90 dark:bg-[#0a0a0f]/90 px-6 py-3.5 shadow-sm shadow-slate-200/40 dark:shadow-none backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 dark:text-gray-400 transition hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-950 dark:hover:text-gray-100"
            title="Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight dark:text-gray-100">{fullName}</p>
            <p className="text-xs text-[#888] dark:text-gray-500">
              {stats.wordCount} words · {stats.pageCount} page estimate · {completion}% complete
            </p>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowImport(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-gray-300 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-gray-600"
            >
              <Upload className="h-3.5 w-3.5" />
              Import
            </button>

            <div className="hidden items-center gap-1 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] px-3 py-2 text-xs font-medium text-slate-500 dark:text-gray-400 shadow-sm sm:flex">
              {saveStatus === 'saving' && <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />}
              {saveStatus === 'saved' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
              {saveStatus === 'error' ? 'Save error' : saveStatus === 'saving' ? 'Saving' : 'Saved'}
            </div>

            <IconButton label="Preview" onClick={() => setShowModal(true)}>
              <Eye className="h-4 w-4" />
            </IconButton>

            <div className="mx-1 hidden h-8 w-px bg-slate-200 dark:bg-gray-700 sm:block" />

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 dark:bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-slate-300 dark:shadow-indigo-900/30 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:hover:bg-indigo-500 disabled:opacity-60"
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

      <div className="sticky top-0 z-10 shrink-0 border-b border-slate-200 dark:border-gray-800 bg-white/90 dark:bg-[#0a0a0f]/90 backdrop-blur-xl">
        <div className="flex items-center overflow-x-auto py-2">

          {/* ─ Template ─────────────────────────────── */}
          <ToolbarGroup label="Template">
            <TemplateSwitch value={templateId} onChange={setTemplateId} />
          </ToolbarGroup>

          <ToolbarDivider />

          {/* ─ Font ─────────────────────────────────── */}
          <ToolbarGroup label="Font">
            <FontSelect
              value={builderDesign.fontPair || 'editorial'}
              options={FONT_PAIRS}
              onChange={(fontPair) => {
                setBuilderDesign({ fontPair });
                localStorage.setItem('resumeBuilder_font', fontPair);
              }}
            />
          </ToolbarGroup>

          <ToolbarDivider />

          {/* ─ Accent color ─────────────────────────── */}
          <ToolbarGroup label="Accent Color">
            <ColorSwatchStrip
              accents={ACCENTS}
              value={builderDesign.accentColor}
              onChange={(accentColor) => setBuilderDesign({ accentColor })}
            />
          </ToolbarGroup>

          <ToolbarDivider />

          {/* ─ Spacing & Zoom ───────────────────────── */}
          <ToolbarGroup label="Spacing & Zoom">
            <div className="flex items-center gap-2">
              <Segmented
                value={builderDesign.spacing}
                options={SPACING}
                onChange={(spacing) => setBuilderDesign({ spacing })}
              />
              <div className="inline-flex items-center divide-x divide-slate-200 dark:divide-gray-700 rounded-[8px] border border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] shadow-sm">
                <button
                  type="button"
                  title="Zoom out"
                  onClick={() => setBuilderDesign({ zoom: Math.max(0.55, Number((builderDesign.zoom - 0.05).toFixed(2))) })}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-l-[7px] text-slate-500 dark:text-gray-400 transition-colors hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-gray-100"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-10 py-1 text-center text-[11px] font-semibold tabular-nums text-slate-600 dark:text-gray-300">
                  {Math.round(builderDesign.zoom * 100)}%
                </span>
                <button
                  type="button"
                  title="Zoom in"
                  onClick={() => setBuilderDesign({ zoom: Math.min(1, Number((builderDesign.zoom + 0.05).toFixed(2))) })}
                  className="inline-flex h-7 w-7 items-center justify-center text-slate-500 dark:text-gray-400 transition-colors hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-gray-100"
                >
                  <Plus className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  title="Fit preview"
                  onClick={() => setBuilderDesign({ zoom: 0.9 })}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-r-[7px] text-slate-500 dark:text-gray-400 transition-colors hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-gray-100"
                >
                  <Maximize2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </ToolbarGroup>

        </div>
      </div>

      {/* ── Split layout ──────────────────────────────────────────────────────── */}
      <div ref={splitRef} className="flex min-h-0 flex-1 overflow-hidden">

        {/* ── Left: Editor panel ──────────────────────────────────────────────── */}
        <section
          className="builder-editor hover-scrollbar flex-none overflow-y-auto bg-[#F7F8FA] dark:bg-[#0f172a]"
          style={{ width: leftWidth ?? '50%', minWidth: 0 }}
        >
          <div
            className="sticky top-0 z-10 border-b border-slate-200/60 dark:border-gray-800/60 bg-[rgba(247,248,250,0.95)] dark:bg-[rgba(15,23,42,0.95)] px-5 py-4 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] text-slate-500 dark:text-gray-400">
                  <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-gray-100 transition-colors">← Resume Builder</Link>
                  <span className="mx-2 text-slate-300 dark:text-gray-600">&gt;</span>
                  <span className="font-medium text-slate-900 dark:text-gray-100">{fullName}</span>
                </p>
              </div>
            </div>
          </div>

          <EditorPanel />
        </section>

        {/* ── Drag handle ─────────────────────────────────────────────────────── */}
        <div
          role="separator"
          aria-label="Drag to resize panels"
          onMouseDown={handleSplitMouseDown}
          className="group relative z-10 flex-none cursor-col-resize select-none"
          style={{ width: 10 }}
        >
          {/* Visible line */}
          <div
            className={`absolute inset-y-0 left-[4px] w-[1.5px] transition-colors duration-150 ${
              isDragging ? 'bg-indigo-400' : 'bg-slate-200 group-hover:bg-indigo-300'
            }`}
          />
          {/* Gripper chip — fades in on hover, stays visible while dragging */}
          <div
            className={`absolute left-[1px] top-1/2 z-10 -translate-y-1/2 flex flex-col items-center justify-center gap-[4px] rounded-full border bg-white dark:bg-gray-800 px-[3px] py-[7px] shadow-md transition-all duration-200 ${
              isDragging
                ? 'opacity-100 border-indigo-300 bg-indigo-50 dark:bg-indigo-900/30'
                : 'opacity-0 group-hover:opacity-100 border-slate-200 dark:border-gray-700 group-hover:border-indigo-200 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30'
            }`}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`block h-[3px] w-[3px] rounded-full transition-colors duration-150 ${
                  isDragging ? 'bg-indigo-400' : 'bg-slate-400 group-hover:bg-indigo-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── Right: Preview panel ────────────────────────────────────────────── */}
        <section className="flex min-h-0 flex-1 flex-col bg-[#E8E8E8] dark:bg-[#0a0a0f]">
          <div className="hover-scrollbar min-h-0 flex-1 overflow-y-auto py-12 pl-8 pr-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mx-auto flex min-h-full max-w-[794px] justify-center"
            >
              <div className="mx-auto origin-top" style={{ transform: `scale(${builderDesign.zoom})` }}>
                <ResumePreview
                  data={debouncedData}
                  templateId={templateId}
                  sectionOrder={sectionOrder}
                  hiddenSections={hiddenSections}
                  builderDesign={builderDesign}
                />
              </div>
            </motion.div>
          </div>

          <ScoreFooterBar score={score} />
        </section>
      </div>

      {showImport && <ImportResumeModal onClose={() => setShowImport(false)} />}

      {showModal && (
        <PreviewModal
          data={data}
          templateId={templateId}
          accentColor={accentColor}
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
