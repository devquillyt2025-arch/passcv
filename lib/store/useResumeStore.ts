import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ResumeData, ResumeExperience, ResumeEducation, ResumeSkill, ResumeProject } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const initialResumeData: ResumeData = {
  contact: {
    firstName: '',
    lastName: '',
    jobTitle: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    linkedin: '',
    github: '',
    website: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
};

interface ResumeState {
  resumeId: string | null;
  templateId: 'classic' | 'modern';
  data: ResumeData;
  setResumeId: (id: string | null) => void;
  setTemplateId: (templateId: 'classic' | 'modern') => void;
  updateContact: (contact: Partial<ResumeData['contact']>) => void;
  updateSummary: (summary: string) => void;
  
  // Experience
  addExperience: () => void;
  updateExperience: (id: string, experience: Partial<ResumeExperience>) => void;
  removeExperience: (id: string) => void;
  reorderExperience: (startIndex: number, endIndex: number) => void;

  // Education
  addEducation: () => void;
  updateEducation: (id: string, education: Partial<ResumeEducation>) => void;
  removeEducation: (id: string) => void;
  reorderEducation: (startIndex: number, endIndex: number) => void;

  // Skills
  // Skills
  addSkill: () => void;
  updateSkill: (id: string, skill: Partial<ResumeSkill>) => void;
  removeSkill: (id: string) => void;
  reorderSkills: (startIndex: number, endIndex: number) => void;
  setSkills: (skills: ResumeSkill[]) => void;

  // Projects
  addProject: () => void;
  updateProject: (id: string, project: Partial<ResumeProject>) => void;
  removeProject: (id: string) => void;
  reorderProjects: (startIndex: number, endIndex: number) => void;

  // Global
  loadResumeData: (data: ResumeData) => void;
  reset: () => void;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      resumeId: null,
      templateId: 'classic',
      data: initialResumeData,

      setResumeId: (id) => set({ resumeId: id }),
      setTemplateId: (id) => set({ templateId: id }),

      updateContact: (contact) =>
        set((state) => ({
          data: { ...state.data, contact: { ...state.data.contact, ...contact } },
        })),

      updateSummary: (summary) =>
        set((state) => ({
          data: { ...state.data, summary },
        })),

      // Experience
      addExperience: () =>
        set((state) => ({
          data: {
            ...state.data,
            experience: [
              ...state.data.experience,
              {
                id: uuidv4(),
                company: '',
                position: '',
                location: '',
                startDate: '',
                endDate: '',
                currentlyWorking: false,
                description: '',
              },
            ],
          },
        })),
      updateExperience: (id, exp) =>
        set((state) => ({
          data: {
            ...state.data,
            experience: state.data.experience.map((e) => (e.id === id ? { ...e, ...exp } : e)),
          },
        })),
      removeExperience: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            experience: state.data.experience.filter((e) => e.id !== id),
          },
        })),
      reorderExperience: (startIndex, endIndex) =>
        set((state) => {
          const newExp = Array.from(state.data.experience);
          const [removed] = newExp.splice(startIndex, 1);
          newExp.splice(endIndex, 0, removed);
          return { data: { ...state.data, experience: newExp } };
        }),

      // Education
      addEducation: () =>
        set((state) => ({
          data: {
            ...state.data,
            education: [
              ...state.data.education,
              {
                id: uuidv4(),
                institution: '',
                degree: '',
                field: '',
                location: '',
                startDate: '',
                endDate: '',
                currentlyStudying: false,
                score: '',
              },
            ],
          },
        })),
      updateEducation: (id, edu) =>
        set((state) => ({
          data: {
            ...state.data,
            education: state.data.education.map((e) => (e.id === id ? { ...e, ...edu } : e)),
          },
        })),
      removeEducation: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            education: state.data.education.filter((e) => e.id !== id),
          },
        })),
      reorderEducation: (startIndex, endIndex) =>
        set((state) => {
          const newEdu = Array.from(state.data.education);
          const [removed] = newEdu.splice(startIndex, 1);
          newEdu.splice(endIndex, 0, removed);
          return { data: { ...state.data, education: newEdu } };
        }),

      // Skills
      addSkill: () =>
        set((state) => ({
          data: {
            ...state.data,
            skills: [
              ...state.data.skills,
              {
                id: uuidv4(),
                name: '',
                level: 'Intermediate',
              },
            ],
          },
        })),
      updateSkill: (id, skill) =>
        set((state) => ({
          data: {
            ...state.data,
            skills: state.data.skills.map((s) => (s.id === id ? { ...s, ...skill } : s)),
          },
        })),
      removeSkill: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            skills: state.data.skills.filter((s) => s.id !== id),
          },
        })),
      reorderSkills: (startIndex, endIndex) =>
        set((state) => {
          const newSkills = Array.from(state.data.skills);
          const [removed] = newSkills.splice(startIndex, 1);
          newSkills.splice(endIndex, 0, removed);
          return { data: { ...state.data, skills: newSkills } };
        }),
      setSkills: (skills) =>
        set((state) => ({
          data: { ...state.data, skills },
        })),

      // Projects
      addProject: () =>
        set((state) => ({
          data: {
            ...state.data,
            projects: [
              ...state.data.projects,
              {
                id: uuidv4(),
                name: '',
                description: '',
                url: '',
                startDate: '',
                endDate: '',
              },
            ],
          },
        })),
      updateProject: (id, proj) =>
        set((state) => ({
          data: {
            ...state.data,
            projects: state.data.projects.map((p) => (p.id === id ? { ...p, ...proj } : p)),
          },
        })),
      removeProject: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            projects: state.data.projects.filter((p) => p.id !== id),
          },
        })),
      reorderProjects: (startIndex, endIndex) =>
        set((state) => {
          const newProj = Array.from(state.data.projects);
          const [removed] = newProj.splice(startIndex, 1);
          newProj.splice(endIndex, 0, removed);
          return { data: { ...state.data, projects: newProj } };
        }),

      loadResumeData: (data) => set({ data }),
      reset: () => set({ data: initialResumeData, resumeId: null }),
    }),
    {
      name: 'resume-builder-storage', // unique name for localStorage
    }
  )
);
