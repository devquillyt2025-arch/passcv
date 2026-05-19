'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { AnimatePresence, motion } from 'framer-motion';
import { useResumeStore } from '@/lib/store/useResumeStore';
import { useUIStore } from '@/lib/store/useUIStore';
import { useAiRewrite } from '@/hooks/useAiRewrite';
import PersonalInfo from './steps/PersonalInfo';
import SummaryStep from './steps/SummaryStep';
import SkillsStep from './steps/SkillsStep';
import ExperienceStep from './steps/ExperienceStep';
import EducationStep from './steps/EducationStep';
import ProjectsStep from './steps/ProjectsStep';
import CertificationsStep from './steps/CertificationsStep';
import LanguagesStep from './steps/LanguagesStep';
import {
  User,
  FileText,
  Zap,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
  Languages,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Loader2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const SECTION_META: Record<string, { label: string; icon: React.ElementType }> = {
  summary:          { label: 'Professional Summary', icon: FileText },
  skills:           { label: 'Skills',               icon: Zap },
  experience:       { label: 'Work Experience',      icon: Briefcase },
  education:        { label: 'Education',            icon: GraduationCap },
  certifications:   { label: 'Certifications',       icon: Award },
  languages:        { label: 'Languages',            icon: Languages },
  projects:         { label: 'Projects',             icon: FolderGit2 },
};

interface SectionCardProps {
  id?: string;
  title: string;
  icon: React.ElementType;
  count?: number;
  isOpen: boolean;
  onToggle: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLElement> | null;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

function SectionCard({
  id,
  title,
  icon: Icon,
  count,
  isOpen,
  onToggle,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  dragHandleProps,
  headerAction,
  children,
}: SectionCardProps) {
  return (
    <motion.div
      layout
      id={id}
      className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white p-5 shadow-sm shadow-slate-200/60"
    >
      {/* Card header */}
      <div
        className="group flex cursor-pointer select-none items-center gap-3 pb-4 transition-colors hover:bg-white"
        onClick={onToggle}
      >
        {dragHandleProps && (
          <button
            {...dragHandleProps}
            title="Drag to reorder"
            className="rounded-lg p-1 text-slate-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-white hover:text-slate-600"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <span
          className="shrink-0 rounded-lg bg-gray-100 p-1.5 text-gray-500 transition-colors"
        >
          <Icon className="w-3.5 h-3.5" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-gray-900">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="ml-2 text-xs text-gray-400 tabular-nums">{count}</span>
          )}
        </span>

        {headerAction && (
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            {headerAction}
          </div>
        )}

        {/* Reorder buttons */}
        {(canMoveUp !== undefined || canMoveDown !== undefined) && (
          <div
            className="flex gap-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onMoveUp}
              disabled={!canMoveUp}
              title="Move section up"
              className="p-1 rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-0 disabled:pointer-events-none transition-all"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onMoveDown}
              disabled={!canMoveDown}
              title="Move section down"
              className="p-1 rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-0 disabled:pointer-events-none transition-all"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="pt-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const ALL_SECTIONS = new Set(['personal', 'summary', 'skills', 'experience', 'education', 'certifications', 'languages', 'projects']);

export default function EditorPanel() {
  const { data, sectionOrder, setSectionOrder, updateSummary } = useResumeStore();
  const { pendingSectionFocus, clearSectionFocus, jdText } = useUIStore();
  const summaryRewrite = useAiRewrite();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(ALL_SECTIONS));

  // Respond to external navigation requests (from dashboard cards)
  useEffect(() => {
    if (!pendingSectionFocus) return;
    const id = pendingSectionFocus;
    // Open the target accordion first, then scroll after React commits
    setOpenSections(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    clearSectionFocus();
    const t = setTimeout(() => {
      document.getElementById(`editor-section-${id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
    return () => clearTimeout(t);
  }, [pendingSectionFocus, clearSectionFocus]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const moveSection = (id: string, direction: -1 | 1) => {
    const order = [...sectionOrder];
    const idx = order.indexOf(id);
    if (idx === -1) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= order.length) return;
    [order[idx], order[newIdx]] = [order[newIdx], order[idx]];
    setSectionOrder(order);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const order = [...sectionOrder];
    const [moved] = order.splice(result.source.index, 1);
    order.splice(result.destination.index, 0, moved);
    setSectionOrder(order);
  };

  const handleSummaryRewrite = () => {
    summaryRewrite.rewrite(
      data.summary,
      jdText,
      'summary',
      updateSummary,
      `${data.contact.jobTitle || 'Candidate'} resume summary`,
    );
  };

  const summaryHeaderAction = (
    <div className="flex items-center gap-1.5">
      {summaryRewrite.canRevert && (
        <button
          type="button"
          onClick={summaryRewrite.revert}
          className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-2 py-1 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-50"
        >
          <RotateCcw className="h-3 w-3" />
          Revert
        </button>
      )}
      <button
        type="button"
        onClick={handleSummaryRewrite}
        disabled={!data.summary || summaryRewrite.isLoading || summaryRewrite.isStreaming}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {summaryRewrite.isLoading || summaryRewrite.isStreaming
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <Sparkles className="h-3.5 w-3.5" />}
        AI rewrite
      </button>
    </div>
  );

  return (
    <div className="p-6 pb-16">
      {/* Personal Info — always first, not reorderable */}
      <div className="mb-5">
      <SectionCard
        id="editor-section-personal"
        title="Personal Info"
        icon={User}
        isOpen={openSections.has('personal')}
        onToggle={() => toggleSection('personal')}
      >
        <PersonalInfo headless />
      </SectionCard>
      </div>

      {/* Reorderable sections */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="resume-sections">
          {(dropProvided) => (
            <div
              ref={dropProvided.innerRef}
              {...dropProvided.droppableProps}
              className="space-y-2.5"
            >
              {sectionOrder.map((sectionId, idx) => {
                const meta = SECTION_META[sectionId];
                if (!meta) return null;

                const countMap: Record<string, number | undefined> = {
                  skills:         data.skills.length,
                  experience:     data.experience.length,
                  education:      data.education.length,
                  projects:       data.projects.length,
                  certifications: (data.certifications || []).length,
                  languages:      (data.languages || []).length,
                };

                return (
                  <Draggable key={sectionId} draggableId={sectionId} index={idx}>
                    {(dragProvided, snapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        className={snapshot.isDragging ? 'rotate-[0.4deg] shadow-2xl rounded-2xl' : ''}
                      >
                        <SectionCard
                          id={`editor-section-${sectionId}`}
                          title={meta.label}
                          icon={meta.icon}
                          count={countMap[sectionId]}
                          isOpen={openSections.has(sectionId)}
                          onToggle={() => toggleSection(sectionId)}
                          canMoveUp={idx > 0}
                          canMoveDown={idx < sectionOrder.length - 1}
                          onMoveUp={() => moveSection(sectionId, -1)}
                          onMoveDown={() => moveSection(sectionId, 1)}
                          dragHandleProps={dragProvided.dragHandleProps}
                          headerAction={sectionId === 'summary' ? summaryHeaderAction : undefined}
                        >
                          {sectionId === 'summary' && summaryRewrite.error && (
                            <p className="mb-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-500">
                              {summaryRewrite.error}
                            </p>
                          )}
                          {sectionId === 'summary'        && <SummaryStep headless />}
                          {sectionId === 'skills'         && <SkillsStep headless />}
                          {sectionId === 'experience'     && <ExperienceStep headless />}
                          {sectionId === 'education'      && <EducationStep headless />}
                          {sectionId === 'certifications' && <CertificationsStep headless />}
                          {sectionId === 'languages'      && <LanguagesStep headless />}
                          {sectionId === 'projects'       && <ProjectsStep headless />}
                        </SectionCard>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {dropProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
