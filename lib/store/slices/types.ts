import { StateCreator } from 'zustand';
import { ResumeData, ResumeExperience, ResumeEducation, ResumeSkill, ResumeProject, ResumeCertification, ResumeLanguage, ResumePublication, ResumeCourse, ResumeAward, ResumeVolunteer, ResumeCustomItem } from '../../types';

export interface GlobalSlice {
  resumeId: string | null;
  templateId: 'classic' | 'modern' | 'minimal' | 'executive' | 'sidebar';
  builderDesign: {
    accentColor: string;
    fontPair: 'modern' | 'arial' | 'helvetica' | 'verdana' | 'times' | 'calibri' | 'courier' | 'editorial' | 'classic';
    spacing: 'compact' | 'balanced' | 'airy';
    zoom: number;
  };
  data: ResumeData;
  sectionOrder: string[];
  hiddenSections: string[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setResumeId: (id: string | null) => void;
  setTemplateId: (templateId: 'classic' | 'modern' | 'minimal' | 'executive' | 'sidebar') => void;
  setBuilderDesign: (design: Partial<GlobalSlice['builderDesign']>) => void;
  setSectionOrder: (order: string[]) => void;
  toggleSectionVisibility: (id: string) => void;
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

export interface PublicationSlice {
  addPublication: () => void;
  updatePublication: (id: string, pub: Partial<ResumePublication>) => void;
  removePublication: (id: string) => void;
  reorderPublications: (startIndex: number, endIndex: number) => void;
}

export interface CourseSlice {
  addCourse: () => void;
  updateCourse: (id: string, course: Partial<ResumeCourse>) => void;
  removeCourse: (id: string) => void;
  reorderCourses: (startIndex: number, endIndex: number) => void;
}

export interface AwardSlice {
  addAward: () => void;
  updateAward: (id: string, award: Partial<ResumeAward>) => void;
  removeAward: (id: string) => void;
  reorderAwards: (startIndex: number, endIndex: number) => void;
}

export interface VolunteerSlice {
  addVolunteer: () => void;
  updateVolunteer: (id: string, vol: Partial<ResumeVolunteer>) => void;
  removeVolunteer: (id: string) => void;
  reorderVolunteer: (startIndex: number, endIndex: number) => void;
}

export interface CustomSectionSlice {
  addCustomSection: (title: string) => void;
  updateCustomSectionTitle: (sectionId: string, title: string) => void;
  removeCustomSection: (sectionId: string) => void;
  addCustomItem: (sectionId: string) => void;
  updateCustomItem: (sectionId: string, itemId: string, itemData: Partial<ResumeCustomItem>) => void;
  removeCustomItem: (sectionId: string, itemId: string) => void;
  reorderCustomItems: (sectionId: string, startIndex: number, endIndex: number) => void;
}

export type StoreState = GlobalSlice & ContactSlice & ExperienceSlice & EducationSlice & SkillSlice & ProjectSlice & CertificationSlice & LanguageSlice & PublicationSlice & CourseSlice & AwardSlice & VolunteerSlice & CustomSectionSlice;
export type StoreSlice<T> = StateCreator<StoreState, [], [], T>;
