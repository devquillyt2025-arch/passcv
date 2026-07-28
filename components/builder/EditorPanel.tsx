'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { AnimatePresence, motion } from 'framer-motion';
import { useResumeStore } from '@/lib/store/useResumeStore';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@/lib/store/useUIStore';

const PersonalInfo = lazy(() => import('./steps/PersonalInfo'));
const SummaryStep = lazy(() => import('./steps/SummaryStep'));
const SkillsStep = lazy(() => import('./steps/SkillsStep'));
const ExperienceStep = lazy(() => import('./steps/ExperienceStep'));
const EducationStep = lazy(() => import('./steps/EducationStep'));
const ProjectsStep = lazy(() => import('./steps/ProjectsStep'));
const CertificationsStep = lazy(() => import('./steps/CertificationsStep'));
const LanguagesStep = lazy(() => import('./steps/LanguagesStep'));
const CustomSectionStep = lazy(() => import('./steps/CustomSectionStep'));
const VolunteerStep = lazy(() => import('./steps/VolunteerStep'));
const AwardsStep = lazy(() => import('./steps/AwardsStep'));
const PublicationsStep = lazy(() => import('./steps/PublicationsStep'));
const CoursesStep = lazy(() => import('./steps/CoursesStep'));
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
  PlusSquare,
  Trash2,
  LayoutList,
  Plus,
  BookOpen,
  BookMarked,
  Eye,
  EyeOff,
} from 'lucide-react';

const SECTION_META: Record<string, { label: string; icon: React.ElementType }> = {
  summary:          { label: 'Professional Summary', icon: FileText },
  skills:           { label: 'Skills',               icon: Zap },
  experience:       { label: 'Work Experience',      icon: Briefcase },
  education:        { label: 'Education',            icon: GraduationCap },
  certifications:   { label: 'Certifications',       icon: Award },
  languages:        { label: 'Languages',            icon: Languages },
  projects:         { label: 'Projects',             icon: FolderGit2 },
  volunteer:        { label: 'Volunteer Work',        icon: LayoutList },
  awards:           { label: 'Awards & Honors',       icon: Award },
  publications:     { label: 'Publications',          icon: BookOpen },
  courses:          { label: 'Courses & Training',    icon: BookMarked },
};

const SectionSkeleton = () => (
  <div className="animate-pulse space-y-4 py-2">
    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    <div className="h-10 bg-gray-200 rounded w-full"></div>
    <div className="h-10 bg-gray-200 rounded w-full"></div>
  </div>
);

interface SectionCardProps {
  id?: string;
  title: string;
  icon: React.ElementType;
  count?: number;
  isOpen: boolean;
  onToggle: () => void;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
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
  isVisible = true,
  onToggleVisibility,
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
      className={`overflow-hidden rounded-xl border border-[#e5e7eb] dark:border-gray-700 bg-white dark:bg-[#1e293b] shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none transition-opacity duration-200 ${isVisible ? '' : 'opacity-50'}`}
    >
      {/* Card header */}
      <div
        className="group flex cursor-pointer select-none items-center gap-2.5 px-4 py-3.5 transition-colors hover:bg-slate-50/60 dark:hover:bg-gray-700/40"
        onClick={onToggle}
      >
        {dragHandleProps && (
          <button
            {...dragHandleProps}
            title="Drag to reorder"
            className="shrink-0 rounded-md p-0.5 text-slate-300 dark:text-gray-600 opacity-0 transition-all group-hover:opacity-100 hover:text-slate-500 dark:hover:text-gray-400"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <span className="shrink-0 rounded-lg bg-[#ede9fe] dark:bg-indigo-900/30 p-1.5 text-indigo-600 dark:text-indigo-400 transition-colors">
          <Icon className="w-3.5 h-3.5" />
        </span>

        <div className="min-w-0 flex-1 flex items-center gap-2">
          <span className="truncate text-[15px] font-semibold leading-tight text-gray-800 dark:text-gray-100">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 rounded-full px-1.5 py-0.5 tabular-nums">{count}</span>
          )}
        </div>

        {/* Utility pill: delete + reorder + eye + chevron */}
        <div className="flex items-center gap-0.5 rounded-full bg-[#f9fafb] dark:bg-gray-700 border border-[#e5e7eb] dark:border-gray-600 px-1.5 py-[3px] shrink-0">
          {headerAction && (
            <div onClick={(e) => e.stopPropagation()}>
              {headerAction}
            </div>
          )}
          {canMoveUp !== undefined && (
            <button
              onClick={(e) => { e.stopPropagation(); onMoveUp?.(); }}
              disabled={!canMoveUp}
              title="Move section up"
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 dark:text-gray-500 hover:bg-[#f0f0f0] dark:hover:bg-gray-600 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-0 disabled:pointer-events-none transition-all"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          )}
          {canMoveDown !== undefined && (
            <button
              onClick={(e) => { e.stopPropagation(); onMoveDown?.(); }}
              disabled={!canMoveDown}
              title="Move section down"
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 dark:text-gray-500 hover:bg-[#f0f0f0] dark:hover:bg-gray-600 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-0 disabled:pointer-events-none transition-all"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}
          {onToggleVisibility && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
              title={isVisible ? 'Hide from resume' : 'Show in resume'}
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 dark:text-gray-500 hover:bg-[#f0f0f0] dark:hover:bg-gray-600 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
            >
              {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          )}
          <div className="w-7 h-7 flex items-center justify-center pointer-events-none">
            <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden border-t border-[#f0f0f0] dark:border-gray-700"
          >
            <div className="px-4 pt-4 pb-5">
              <Suspense fallback={<SectionSkeleton />}>
                {children}
              </Suspense>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const ALL_SECTIONS = new Set(['personal', 'summary', 'skills', 'experience', 'education', 'certifications', 'languages', 'projects']);

export default function EditorPanel() {
  const { data, sectionOrder, setSectionOrder, hiddenSections, toggleSectionVisibility, addCustomSection, removeCustomSection } = useResumeStore(useShallow(state => ({
    data: state.data,
    sectionOrder: state.sectionOrder,
    setSectionOrder: state.setSectionOrder,
    hiddenSections: state.hiddenSections,
    toggleSectionVisibility: state.toggleSectionVisibility,
    addCustomSection: state.addCustomSection,
    removeCustomSection: state.removeCustomSection
  })));
  const { pendingSectionFocus, clearSectionFocus } = useUIStore();
  // Open sections can include custom ones too, start by grabbing all current custom sections.
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set([...ALL_SECTIONS, ...(data.customSections?.map(s => s.id) || [])])
  );

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
    
    if (result.type === 'section' || result.source.droppableId === 'resume-sections') {
      const order = [...sectionOrder];
      const [moved] = order.splice(result.source.index, 1);
      order.splice(result.destination.index, 0, moved);
      setSectionOrder(order);
      return;
    }

    const { source, destination } = result;
    const store = useResumeStore.getState();

    switch (source.droppableId) {
      case 'experience-list': return store.reorderExperience(source.index, destination.index);
      case 'education-list': return store.reorderEducation(source.index, destination.index);
      case 'skills-list': return store.reorderSkills(source.index, destination.index);
      case 'projects-list': return store.reorderProjects(source.index, destination.index);
      case 'certifications-list': return store.reorderCertifications(source.index, destination.index);
      case 'languages-list': return store.reorderLanguages(source.index, destination.index);
      case 'publications-list': return store.reorderPublications(source.index, destination.index);
      case 'courses-list': return store.reorderCourses(source.index, destination.index);
      case 'awards-list': return store.reorderAwards(source.index, destination.index);
      case 'volunteer-list': return store.reorderVolunteer(source.index, destination.index);
      default:
        if (source.droppableId.startsWith('custom-list-')) {
          const sectionId = source.droppableId.replace('custom-list-', '');
          store.reorderCustomItems(sectionId, source.index, destination.index);
        }
        break;
    }
  };

  const handleAddCustomSection = () => {
    const title = window.prompt("Enter a title for the new section (e.g., 'Hobbies', 'Open Source'):");
    if (title && title.trim()) {
      addCustomSection(title.trim());
      // The new section id will be generated by the store, but it takes effect next render.
      // Easiest way to open it is to just ensure it's added.
      // Because we can't get the ID synchronously here without refactoring the store, 
      // we'll let it be initially closed or opened next time. 
    }
  };

  return (
    <div className="p-5 pb-16 bg-[#f5f6fa] dark:bg-[#0f172a]">
      {/* Personal Info — always first, not reorderable */}
      <div className="mb-3">
      <SectionCard
        id="editor-section-personal"
        title="Personal Info"
        icon={User}
        isOpen={openSections.has('personal')}
        onToggle={() => toggleSection('personal')}
        isVisible={!hiddenSections.includes('personal')}
        onToggleVisibility={() => toggleSectionVisibility('personal')}
      >
        <PersonalInfo headless />
      </SectionCard>
      </div>

      {/* Reorderable sections */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="resume-sections" type="section">
          {(dropProvided) => (
            <div
              ref={dropProvided.innerRef}
              {...dropProvided.droppableProps}
              className="space-y-2"
            >
              {sectionOrder.map((sectionId, idx) => {
                let meta = SECTION_META[sectionId];
                
                // If it's a custom section, build the meta dynamically
                const isCustom = sectionId.startsWith('custom-');
                if (isCustom) {
                  const cSec = data.customSections?.find(s => s.id === sectionId);
                  if (cSec) {
                    meta = { label: cSec.title || 'Custom Section', icon: PlusSquare };
                  }
                }

                if (!meta) return null;

                const countMap: Record<string, number | undefined> = {
                  skills:         data.skills.length,
                  experience:     data.experience.length,
                  education:      data.education.length,
                  projects:       data.projects.length,
                  certifications: (data.certifications || []).length,
                  languages:      (data.languages || []).length,
                  volunteer:      (data.volunteer || []).length,
                  awards:         (data.awards || []).length,
                  publications:   (data.publications || []).length,
                  courses:        (data.courses || []).length,
                };
                
                if (isCustom) {
                  const cSec = data.customSections?.find(s => s.id === sectionId);
                  countMap[sectionId] = cSec?.items?.length || 0;
                }

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
                          isVisible={!hiddenSections.includes(sectionId)}
                          onToggleVisibility={() => toggleSectionVisibility(sectionId)}
                          canMoveUp={idx > 0}
                          canMoveDown={idx < sectionOrder.length - 1}
                          onMoveUp={() => moveSection(sectionId, -1)}
                          onMoveDown={() => moveSection(sectionId, 1)}
                          dragHandleProps={dragProvided.dragHandleProps}
                          headerAction={
                            isCustom ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('Are you sure you want to delete this custom section?')) {
                                    removeCustomSection(sectionId);
                                  }
                                }}
                                className="w-7 h-7 flex items-center justify-center rounded-full text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                                title="Delete Section"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : undefined
                          }
                        >
                          {sectionId === 'summary'        && <SummaryStep headless />}
                          {sectionId === 'skills'         && <SkillsStep headless />}
                          {sectionId === 'experience'     && <ExperienceStep headless />}
                          {sectionId === 'education'      && <EducationStep headless />}
                          {sectionId === 'certifications' && <CertificationsStep headless />}
                          {sectionId === 'languages'      && <LanguagesStep headless />}
                          {sectionId === 'projects'       && <ProjectsStep headless />}
                          {sectionId === 'volunteer'      && <VolunteerStep headless />}
                          {sectionId === 'awards'         && <AwardsStep headless />}
                          {sectionId === 'publications'   && <PublicationsStep headless />}
                          {sectionId === 'courses'        && <CoursesStep headless />}
                          {isCustom                       && <CustomSectionStep headless sectionId={sectionId} />}
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

      <div className="mt-8">
        <button
          onClick={handleAddCustomSection}
          className="flex items-center justify-center gap-2 w-full py-[14px] text-sm font-semibold text-white bg-[#7c3aed] rounded-xl hover:bg-violet-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Custom Section
        </button>
      </div>
    </div>
  );
}
