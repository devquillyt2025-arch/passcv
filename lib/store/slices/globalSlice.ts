import { v4 as uuidv4 } from 'uuid';
import { StoreSlice } from './types';
import { emptyResumeData, DEMO_RESUME_DATA } from './defaultData';

export const DEFAULT_SECTION_ORDER = ['summary', 'skills', 'experience', 'education', 'certifications', 'languages', 'projects'];

export const createGlobalSlice: StoreSlice<Pick<import('./types').StoreState, 'resumeId' | 'templateId' | 'data' | 'sectionOrder' | '_hasHydrated' | 'setHasHydrated' | 'setResumeId' | 'setTemplateId' | 'setSectionOrder' | 'loadResumeData' | 'reset'>> = (set) => ({
  resumeId: null,
  templateId: 'classic',
  data: DEMO_RESUME_DATA,
  sectionOrder: DEFAULT_SECTION_ORDER,
  _hasHydrated: false,

  setHasHydrated: (state) => set({ _hasHydrated: state }),
  setResumeId: (id) => set({ resumeId: id }),
  setTemplateId: (id) => set({ templateId: id }),
  setSectionOrder: (order) => set({ sectionOrder: order }),

  loadResumeData: (data) => set({
    data: {
      ...emptyResumeData,
      ...data,
      experience: data.experience || [],
      education: data.education || [],
      skills: (data.skills || []).map((s) => ({ ...s, id: s.id || uuidv4() })),
      projects: data.projects || [],
      certifications: data.certifications || [],
      languages: data.languages || [],
      contact: { ...emptyResumeData.contact, ...(data.contact || {}) },
    },
  }),
  reset: () => set({ data: emptyResumeData, resumeId: null }),
});
