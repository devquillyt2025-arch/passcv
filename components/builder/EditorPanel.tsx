'use client';

import { useState, useEffect } from 'react';
import { useResumeStore } from '@/lib/store/useResumeStore';
import { useUIStore } from '@/lib/store/useUIStore';
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
  children,
}: SectionCardProps) {
  return (
    <div
      id={id}
      className={`bg-white rounded-xl border overflow-hidden shadow-sm transition-colors ${
        isOpen ? 'border-indigo-200' : 'border-gray-200'
      }`}
    >
      {/* Card header */}
      <div
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition-colors ${
          isOpen ? 'bg-indigo-50/60' : 'hover:bg-gray-50'
        }`}
        onClick={onToggle}
      >
        <span
          className={`p-1.5 rounded-lg shrink-0 transition-colors ${
            isOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
        </span>

        <span className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-gray-900">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="ml-2 text-xs text-gray-400 tabular-nums">{count}</span>
          )}
        </span>

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
      {isOpen && (
        <div className="px-4 pt-3 pb-5 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

const ALL_SECTIONS = new Set(['personal', 'summary', 'skills', 'experience', 'education', 'certifications', 'languages', 'projects']);

export default function EditorPanel() {
  const { data, sectionOrder, setSectionOrder } = useResumeStore();
  const { pendingSectionFocus, clearSectionFocus } = useUIStore();
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

  return (
    <div className="p-4 space-y-3 pb-16">
      {/* Personal Info — always first, not reorderable */}
      <SectionCard
        id="editor-section-personal"
        title="Personal Info"
        icon={User}
        isOpen={openSections.has('personal')}
        onToggle={() => toggleSection('personal')}
      >
        <PersonalInfo headless />
      </SectionCard>

      {/* Reorderable sections */}
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
          <SectionCard
            key={sectionId}
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
          >
            {sectionId === 'summary'        && <SummaryStep headless />}
            {sectionId === 'skills'         && <SkillsStep headless />}
            {sectionId === 'experience'     && <ExperienceStep headless />}
            {sectionId === 'education'      && <EducationStep headless />}
            {sectionId === 'certifications' && <CertificationsStep headless />}
            {sectionId === 'languages'      && <LanguagesStep headless />}
            {sectionId === 'projects'       && <ProjectsStep headless />}
          </SectionCard>
        );
      })}
    </div>
  );
}
