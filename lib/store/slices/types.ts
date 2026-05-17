import { StateCreator } from 'zustand';
import { ResumeData, ResumeExperience, ResumeEducation, ResumeSkill, ResumeProject, ResumeCertification, ResumeLanguage } from '../../types';

export interface GlobalSlice {
  resumeId: string | null;
  templateId: 'classic' | 'modern';
  data: ResumeData;
  sectionOrder: string[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setResumeId: (id: string | null) => void;
  setTemplateId: (templateId: 'classic' | 'modern') => void;
  setSectionOrder: (order: string[]) => void;
  loadResumeData: (data: ResumeData) => void;
  reset: () => void;
}

export interface ContactSlice {
  updateContact: (contact: Partial<ResumeData['contact']>) => void;
  updateSummary: (summary: string) => void;
}

export interface ExperienceSlice {
  addExperience: () => void;
  updateExperience: (id: string, experience: Partial<ResumeExperience>) => void;
  removeExperience: (id: string) => void;
  reorderExperience: (startIndex: number, endIndex: number) => void;
}

export interface EducationSlice {
  addEducation: () => void;
  updateEducation: (id: string, education: Partial<ResumeEducation>) => void;
  removeEducation: (id: string) => void;
  reorderEducation: (startIndex: number, endIndex: number) => void;
}

export interface SkillSlice {
  addSkill: () => void;
  updateSkill: (id: string, skill: Partial<ResumeSkill>) => void;
  removeSkill: (id: string) => void;
  reorderSkills: (startIndex: number, endIndex: number) => void;
  setSkills: (skills: ResumeSkill[]) => void;
}

export interface ProjectSlice {
  addProject: () => void;
  updateProject: (id: string, project: Partial<ResumeProject>) => void;
  removeProject: (id: string) => void;
  reorderProjects: (startIndex: number, endIndex: number) => void;
}

export interface CertificationSlice {
  addCertification: () => void;
  updateCertification: (id: string, cert: Partial<ResumeCertification>) => void;
  removeCertification: (id: string) => void;
  reorderCertifications: (startIndex: number, endIndex: number) => void;
}

export interface LanguageSlice {
  addLanguage: () => void;
  updateLanguage: (id: string, lang: Partial<ResumeLanguage>) => void;
  removeLanguage: (id: string) => void;
  reorderLanguages: (startIndex: number, endIndex: number) => void;
}

export type StoreState = GlobalSlice & ContactSlice & ExperienceSlice & EducationSlice & SkillSlice & ProjectSlice & CertificationSlice & LanguageSlice;
export type StoreSlice<T> = StateCreator<StoreState, [], [], T>;
