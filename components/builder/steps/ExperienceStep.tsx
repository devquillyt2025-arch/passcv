'use client';

import { useResumeStore } from '@/lib/store/useResumeStore';
import { useUIStore } from '@/lib/store/useUIStore';
import { useAiEnhancer } from '@/hooks/useAiEnhancer';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Sparkles, AlertTriangle, Loader2, RotateCcw, Square } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import MonthYearPicker from '@/components/builder/MonthYearPicker';

// ── Bullet weakness detection ─────────────────────────────────────────────────

const WEAK_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /^helped\b/i,              label: 'weak verb "Helped"' },
  { pattern: /^worked\s+(on|with)\b/i,  label: 'weak phrase "Worked on/with"' },
  { pattern: /^worked\b/i,              label: 'weak verb "Worked"' },
  { pattern: /^assisted\b/i,            label: 'weak verb "Assisted"' },
  { pattern: /^supported\b/i,           label: 'weak verb "Supported"' },
  { pattern: /^participated\b/i,        label: 'weak verb "Participated"' },
  { pattern: /^involved\b/i,            label: 'weak verb "Involved"' },
  { pattern: /^contributed\b/i,         label: 'weak verb "Contributed"' },
  { pattern: /^responsible for\b/i,     label: 'weak phrase "Responsible for"' },
  { pattern: /^handled\b/i,             label: 'weak verb "Handled"' },
  { pattern: /^utilized\b/i,            label: 'weak verb "Utilized"' },
  { pattern: /^made sure\b/i,           label: 'weak phrase "Made sure"' },
];

interface BulletIssue {
  index: number;
  text: string;
  type: 'weak-verb' | 'no-metric';
  message: string;
}

function analyzeBullets(description: string): BulletIssue[] {
  const bullets = description
    .split('\n')
    .map((b) => b.replace(/^[-•*]\s*/, '').trim())
    .filter((b) => b.length > 15);

  const issues: BulletIssue[] = [];
  bullets.forEach((bullet, i) => {
    const weakMatch = WEAK_PATTERNS.find(({ pattern }) => pattern.test(bullet));
    if (weakMatch) {
      issues.push({ index: i + 1, text: bullet.slice(0, 55) + (bullet.length > 55 ? '…' : ''), type: 'weak-verb', message: `Bullet ${i + 1}: ${weakMatch.label} — try Led, Built, Drove, Designed, Delivered` });
    } else if (!/\d/.test(bullet)) {
      issues.push({ index: i + 1, text: bullet.slice(0, 55) + (bullet.length > 55 ? '…' : ''), type: 'no-metric', message: `Bullet ${i + 1}: No metric — add a number, %, $, or time saved` });
    }
  });
  return issues;
}

function BulletWeaknessPanel({ description }: { description: string }) {
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);
  const issues = analyzeBullets(description);
  if (issues.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        {issues.length} AI suggestion{issues.length > 1 ? 's' : ''}
      </p>
      {issues.map((issue) => (
        <button
          key={issue.index}
          type="button"
          onClick={() => setExpandedIssue((current) => current === issue.index ? null : issue.index)}
          className="flex w-full items-start gap-2 rounded-lg border border-slate-200 bg-[#f9fafb] px-3 py-2.5 text-left transition hover:border-indigo-200 hover:bg-white"
          title={issue.message}
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-amber-600 shadow-sm">
            <AlertTriangle className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className={`block text-xs font-medium leading-5 text-slate-700 ${expandedIssue === issue.index ? '' : 'truncate'}`}>
              {issue.message}
            </span>
            {expandedIssue === issue.index && (
              <span className="mt-1 block text-[11px] leading-5 text-slate-500">{issue.text}</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">{children}</p>;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ExperienceStep({ headless = false }: { headless?: boolean }) {
  const experience = useResumeStore((state) => state.data.experience || []);
  const { addExperience, updateExperience, removeExperience, reorderExperience } = useResumeStore();
  const highlightExpId    = useUIStore((s) => s.highlightExpId);
  const setHighlightExpId = useUIStore((s) => s.setHighlightExpId);
  const [expandedId, setExpandedId] = useState<string | null>(experience[0]?.id || null);

  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!highlightExpId) return;
    setExpandedId(highlightExpId);
    const scrollTimer = setTimeout(() => {
      document.getElementById(`exp-desc-${highlightExpId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    clearTimerRef.current = setTimeout(() => setHighlightExpId(null), 3000);
    return () => {
      clearTimeout(scrollTimer);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, [highlightExpId, setHighlightExpId]);

  const [activeExpId, setActiveExpId] = useState<string | null>(null);

  const activeExperience = experience.find((exp) => exp.id === activeExpId);
  const validationErrors = activeExperience
    ? analyzeBullets(activeExperience.description).map((issue) => issue.message)
    : [];
  const jobTitleContext = activeExperience
    ? `Role: ${activeExperience.position || 'Role'} at ${activeExperience.company || 'Company'}`
    : '';

  const { isLoading, isStreaming, canRevert, error, enhance, revert, abort } = useAiEnhancer(
    activeExperience?.description ?? '',
    validationErrors,
    jobTitleContext,
  );
  const isBusy = isLoading || isStreaming;

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderExperience(result.source.index, result.destination.index);
  };

  const handleRewrite = (expId: string, description: string, position: string, company: string) => {
    setActiveExpId(expId);
    const errors = analyzeBullets(description).map((issue) => issue.message);
    enhance(
      (text) => updateExperience(expId, { description: text }),
      { rawText: description, validationErrors: errors, jobTitle: `Role: ${position} at ${company}` },
    );
  };

  const handleRevert = () => {
    revert();
    setActiveExpId(null);
  };

  const inputCls =
    'w-full rounded-[8px] border border-[#E2E8F0] bg-white px-[14px] py-[10px] text-[14px] text-slate-900 transition-colors duration-150 placeholder:text-slate-400 focus:border-[var(--accent-color)] focus:ring-[3px] focus:ring-[var(--accent-ring)] focus:outline-none';

  return (
    <div className="space-y-5">
      {!headless && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Work Experience</h2>
          <p className="text-sm text-gray-500 mt-1">
            Show your relevant experience (last 10 years). Use bullet points to note your achievements.
          </p>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="experience-list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
              {experience.map((exp, index) => {
                const isExpanded = expandedId === exp.id;
                return (
                  <Draggable key={exp.id} draggableId={exp.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`rounded-xl border overflow-hidden transition-all ${
                          snapshot.isDragging ? 'shadow-lg border-indigo-300' : 'border-gray-200 shadow-sm'
                        }`}
                      >
                        {/* ── Card header ── */}
                        <div
                          className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-gray-50 border-b border-gray-200' : 'bg-white'}`}
                          onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {exp.position || '(Not specified)'}
                            </h3>
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {exp.company || 'Company Name'} · {exp.startDate || 'Start'} –{' '}
                              {exp.currentlyWorking ? 'Present' : exp.endDate || 'End'}
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeExperience(exp.id); }}
                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mr-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="text-gray-400">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>

                        {/* ── Expanded form ── */}
                        {isExpanded && (
                          <div className="divide-y divide-slate-100 bg-white">
                            {/* Per-job error */}
                            {error && activeExpId === exp.id && (
                              <div className="px-4 pt-4 pb-0">
                                <p className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">{error}</p>
                              </div>
                            )}

                            {/* ─ Position Details ─ */}
                            <div className="px-4 py-4 space-y-3">
                              <GroupLabel>Position Details</GroupLabel>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Job Title</label>
                                  <input
                                    type="text"
                                    value={exp.position}
                                    onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                                    className={inputCls}
                                    placeholder="e.g. Frontend Developer"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Company</label>
                                  <input
                                    type="text"
                                    value={exp.company}
                                    onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                                    className={inputCls}
                                    placeholder="e.g. Google"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Location</label>
                                <input
                                  type="text"
                                  value={exp.location}
                                  onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                                  className={inputCls}
                                  placeholder="e.g. New York, NY"
                                />
                              </div>
                            </div>

                            {/* ─ Duration ─ */}
                            <div className="px-4 py-4 space-y-3">
                              <GroupLabel>Duration</GroupLabel>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Start Date</label>
                                  <MonthYearPicker
                                    value={exp.startDate}
                                    onChange={(v) => updateExperience(exp.id, { startDate: v })}
                                    placeholder="Start date"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1.5">End Date</label>
                                  {exp.currentlyWorking ? (
                                    <div className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400 bg-gray-50">
                                      Present
                                    </div>
                                  ) : (
                                    <MonthYearPicker
                                      value={exp.endDate}
                                      onChange={(v) => updateExperience(exp.id, { endDate: v })}
                                      placeholder="End date"
                                    />
                                  )}
                                </div>
                              </div>
                              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  id={`current-${exp.id}`}
                                  checked={exp.currentlyWorking}
                                  onChange={(e) => updateExperience(exp.id, { currentlyWorking: e.target.checked, endDate: '' })}
                                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-400"
                                />
                                <span className="text-xs text-gray-600">I currently work here</span>
                              </label>
                            </div>

                            {/* ─ Description ─ */}
                            <div className="px-4 py-4 space-y-3">
                              <GroupLabel>Description</GroupLabel>
                              <div>
                                <div
                                  id={`exp-desc-${exp.id}`}
                                  className={`relative rounded-[8px] border transition-colors duration-150 ${
                                    highlightExpId === exp.id
                                      ? 'border-[var(--accent-color)] ring-[3px] ring-[var(--accent-ring)]'
                                      : isStreaming && activeExpId === exp.id
                                      ? 'border-[var(--accent-color)] ring-[3px] ring-[var(--accent-ring)]'
                                      : 'border-[#E2E8F0] focus-within:border-[var(--accent-color)] focus-within:ring-[3px] focus-within:ring-[var(--accent-ring)]'
                                  }`}
                                >
                                  <textarea
                                    value={exp.description}
                                    onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                                    disabled={isBusy && activeExpId === exp.id}
                                    className="w-full min-h-[150px] rounded-[8px] px-[14px] py-[10px] text-[14px] text-slate-900 bg-transparent outline-none disabled:bg-slate-50 disabled:text-slate-500 resize-none"
                                    placeholder={"- Developed new features...\n- Improved performance by..."}
                                  />
                                  {isStreaming && activeExpId === exp.id && (
                                    <span className="absolute bottom-2.5 right-2.5 w-1.5 h-4 rounded-sm animate-pulse" style={{ backgroundColor: 'var(--accent-color)' }} />
                                  )}
                                </div>
                                <p className="mt-1.5 text-[11px] text-gray-400">One bullet per line. Start with strong action verbs.</p>
                                <BulletWeaknessPanel description={exp.description} />
                              </div>

                              {/* Revert / Stop strip */}
                              {(canRevert || isStreaming) && activeExpId === exp.id && (
                                <div className="flex items-center gap-2">
                                  {canRevert && (
                                    <button
                                      onClick={handleRevert}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                                    >
                                      <RotateCcw className="w-3 h-3" /> Revert
                                    </button>
                                  )}
                                  {isStreaming && (
                                    <button
                                      onClick={abort}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                                    >
                                      <Square className="w-3 h-3 fill-current" /> Stop
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* ── AI Enhance CTA ── */}
                              <button
                                onClick={() => handleRewrite(exp.id, exp.description, exp.position, exp.company)}
                                disabled={!exp.description.trim() || (isBusy && activeExpId === exp.id)}
                                style={{ backgroundColor: 'var(--accent-color)' }}
                                className="group relative w-full overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg hover:opacity-90 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
                              >
                                <span className="relative flex items-center justify-center gap-2">
                                  {isBusy && activeExpId === exp.id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      {isLoading ? 'Generating…' : 'Streaming…'}
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-4 h-4" />
                                      Enhance bullets with AI
                                    </>
                                  )}
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {experience.length === 0 && (
        <p className="text-[13px] text-gray-400 italic text-center py-4">No entries yet.</p>
      )}
      <button
        onClick={() => addExperience()}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-violet-700 border border-dashed border-violet-300 rounded-[10px] bg-transparent hover:bg-violet-50 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Experience
      </button>
    </div>
  );
}
