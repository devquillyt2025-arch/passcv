import { v4 as uuidv4 } from 'uuid';
import { StoreSlice } from './types';
import { emptyResumeData, DEMO_RESUME_DATA } from './defaultData';

export const DEFAULT_SECTION_ORDER = ['summary', 'skills', 'experience', 'education', 'certifications', 'languages', 'projects'];

export const DEFAULT_BUILDER_DESIGN = {
  accentColor: '#4F46E5',
  fontPair: 'modern' as const,
  spacing: 'balanced' as const,
  zoom: 0.9,
};

export const createGlobalSlice: StoreSlice<Pick<import('./types').StoreState, 'resumeId' | 'templateId' | 'builderDesign' | 'data' | 'sectionOrder' | '_hasHydrated' | 'setHasHydrated' | 'setResumeId' | 'setTemplateId' | 'setBuilderDesign' | 'setSectionOrder' | 'loadResumeData' | 'reset'>> = (set) => ({
  resumeId: null,
  templateId: 'classic',
  builderDesign: DEFAULT_BUILDER_DESIGN,
  data: DEMO_RESUME_DATA,
  sectionOrder: DEFAULT_SECTION_ORDER,
  _hasHydrated: false,

  setHasHydrated: (state) => set({ _hasHydrated: state }),
  setResumeId: (id) => set({ resumeId: id }),
  setTemplateId: (id) => set({ templateId: id }),
  setBuilderDesign: (design) => set((state) => ({
    builderDesign: { ...DEFAULT_BUILDER_DESIGN, ...state.builderDesign, ...design },
  })),
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
