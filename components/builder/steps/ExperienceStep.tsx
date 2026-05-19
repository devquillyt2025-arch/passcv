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
      issues.push({
        index: i + 1,
        text: bullet.slice(0, 55) + (bullet.length > 55 ? '…' : ''),
        type: 'weak-verb',
        message: `Bullet ${i + 1}: ${weakMatch.label} — try Led, Built, Drove, Designed, Delivered`,
      });
    } else if (!/\d/.test(bullet)) {
      issues.push({
        index: i + 1,
        text: bullet.slice(0, 55) + (bullet.length > 55 ? '…' : ''),
        type: 'no-metric',
        message: `Bullet ${i + 1}: No metric — add a number, %, $, or time saved`,
      });
    }
  });

  return issues;
}

function BulletWeaknessPanel({ description }: { description: string }) {
  const issues = analyzeBullets(description);
  if (issues.length === 0) return null;

  return (
    <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 space-y-1.5">
      <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        {issues.length} bullet{issues.length > 1 ? 's' : ''} need improvement
      </p>
      {issues.map((issue) => (
        <p key={issue.index} className="text-xs text-amber-800 leading-snug pl-5">
          {issue.type === 'weak-verb' ? '⚠' : '📊'} {issue.message}
        </p>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ExperienceStep({ headless = false }: { headless?: boolean }) {
  const experience = useResumeStore((state) => state.data.experience || []);
  const { addExperience, updateExperience, removeExperience, reorderExperience } = useResumeStore();
  const jdText            = useUIStore((s) => s.jdText);
  const highlightExpId    = useUIStore((s) => s.highlightExpId);
  const setHighlightExpId = useUIStore((s) => s.setHighlightExpId);
  const [expandedId, setExpandedId] = useState<string | null>(experience[0]?.id || null);

  // When ResumeStatsWidget dispatches a highlight signal, open the matching card,
  // scroll to it, and auto-clear the ring after 3 s.
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!highlightExpId) return;
    setExpandedId(highlightExpId);
    const scrollTimer = setTimeout(() => {
      document.getElementById(`exp-desc-${highlightExpId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    clearTimerRef.current = setTimeout(() => {
      setHighlightExpId(null);
    }, 3000);
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

  const { isLoading, isStreaming, canRevert, error, enhance, revert, abort, buildPayload } = useAiEnhancer(
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
      {
        rawText: description,
        validationErrors: errors,
        jobTitle: `Role: ${position} at ${company}`,
      },
    );
  };

  const handleRevert = () => {
    revert();
    setActiveExpId(null);
  };

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
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {experience.map((exp, index) => {
                const isExpanded = expandedId === exp.id;
                return (
                  <Draggable key={exp.id} draggableId={exp.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-white rounded-xl border overflow-hidden transition-all ${
                          snapshot.isDragging ? 'shadow-lg border-indigo-300' : 'border-gray-200 shadow-sm'
                        }`}
                      >
                        {/* ── Card header ── */}
                        <div
                          className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 ${isExpanded ? 'bg-gray-50 border-b border-gray-200' : ''}`}
                          onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing text-gray-400 focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {exp.position || '(Not specified)'}
                            </h3>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {exp.company || 'Company Name'} · {exp.startDate || 'Start'} -{' '}
                              {exp.currentlyWorking ? 'Present' : exp.endDate || 'End'}
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeExperience(exp.id); }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mr-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="text-gray-400">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </div>

                        {/* ── Expanded form ── */}
                        {isExpanded && (
                          <div className="p-4 space-y-4 bg-white">
                            {/* Per-job error */}
                            {error && activeExpId === exp.id && (
                              <p className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">{error}</p>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                                <input
                                  type="text"
                                  value={exp.position}
                                  onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                  placeholder="e.g. Frontend Developer"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                <input
                                  type="text"
                                  value={exp.company}
                                  onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                  placeholder="e.g. Google"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                  type="text"
                                  value={exp.location}
                                  onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                  placeholder="e.g. New York, NY"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                  <MonthYearPicker
                                    value={exp.startDate}
                                    onChange={(v) => updateExperience(exp.id, { startDate: v })}
                                    placeholder="Start date"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
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
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`current-${exp.id}`}
                                checked={exp.currentlyWorking}
                                onChange={(e) => updateExperience(exp.id, { currentlyWorking: e.target.checked, endDate: '' })}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label htmlFor={`current-${exp.id}`} className="text-sm text-gray-700 cursor-pointer">
                                I currently work here
                              </label>
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <div className="flex items-center gap-2">
                                  {/* Revert — 8s window after successful rewrite of this job */}
                                  {canRevert && activeExpId === exp.id && (
                                    <button
                                      onClick={handleRevert}
                                      className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors"
                                    >
                                      <RotateCcw className="w-3 h-3" /> Revert
                                    </button>
                                  )}
                                  {/* Stop — only while this job is streaming */}
                                  {isStreaming && activeExpId === exp.id && (
                                    <button
                                      onClick={abort}
                                      className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                      <Square className="w-3 h-3 fill-current" /> Stop
                                    </button>
                                  )}
                                  {/* Rewrite */}
                                  <button
                                    onClick={() => handleRewrite(exp.id, exp.description, exp.position, exp.company)}
                                    disabled={!exp.description.trim() || (isBusy && activeExpId === exp.id)}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-50"
                                  >
                                    {isBusy && activeExpId === exp.id
                                      ? <><Loader2 className="w-3 h-3 animate-spin" />{isLoading ? 'Generating…' : 'Streaming…'}</>
                                      : <><Sparkles className="w-3 h-3" /> Enhance with AI</>}
                                  </button>
                                </div>
                              </div>
                              <div
                                id={`exp-desc-${exp.id}`}
                                className={`relative rounded-lg border transition-colors ${
                                  highlightExpId === exp.id
                                    ? 'border-indigo-400 ring-2 ring-indigo-200'
                                    : isStreaming && activeExpId === exp.id
                                    ? 'border-indigo-400 ring-1 ring-indigo-200'
                                    : 'border-gray-300'
                                }`}
                              >
                                <textarea
                                  value={exp.description}
                                  onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                                  disabled={isBusy && activeExpId === exp.id}
                                  className="w-full min-h-[150px] rounded-lg px-3 py-2 text-sm text-gray-900 bg-white outline-none disabled:bg-gray-50 disabled:text-gray-500"
                                  placeholder="- Developed new features...&#10;- Improved performance by..."
                                />
                                {isStreaming && activeExpId === exp.id && (
                                  <span className="absolute bottom-2 right-2 w-1.5 h-4 bg-indigo-500 rounded-sm animate-pulse" />
                                )}
                                {canRevert && activeExpId === exp.id && !isStreaming && (
                                  <button
                                    onClick={handleRevert}
                                    className="absolute top-3 right-3 rounded-full bg-white border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm hover:bg-amber-50 transition-colors"
                                  >
                                    Undo AI Changes
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Separate bullets with a new line.</p>
                              <BulletWeaknessPanel description={exp.description} />
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

      <button
        onClick={() => addExperience()}
        className="flex items-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2.5 rounded-xl hover:bg-indigo-100 transition-colors w-full justify-center border border-indigo-100 mt-2"
      >
        <Plus className="w-4 h-4" />
        Add Experience
      </button>
    </div>
  );
}
