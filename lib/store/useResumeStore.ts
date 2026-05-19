import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StoreState } from './slices/types';
import { createGlobalSlice } from './slices/globalSlice';
import { createContactSlice } from './slices/contactSlice';
import { createExperienceSlice } from './slices/experienceSlice';
import { createEducationSlice } from './slices/educationSlice';
import { createSkillSlice } from './slices/skillSlice';
import { createProjectSlice } from './slices/projectSlice';
import { createCertificationSlice } from './slices/certificationSlice';
import { createLanguageSlice } from './slices/languageSlice';
import { emptyResumeData } from './slices/defaultData';

// Kept for backward compatibility with any code that imports this
export const initialResumeData = emptyResumeData;

export const useResumeStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createGlobalSlice(...a),
      ...createContactSlice(...a),
      ...createExperienceSlice(...a),
      ...createEducationSlice(...a),
      ...createSkillSlice(...a),
      ...createProjectSlice(...a),
      ...createCertificationSlice(...a),
      ...createLanguageSlice(...a),
    }),
    {
      name: 'resume-builder-storage',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.setHasHydrated(true);
        if (!state.builderDesign) {
          state.setBuilderDesign({});
        } else if (state.builderDesign.zoom === 0.82) {
          state.setBuilderDesign({ zoom: 0.9 });
        }
        // Migrate old persisted data that predates the certifications / languages fields
        if (!state.data.certifications || !state.data.languages) {
          state.loadResumeData(state.data);
        }
        // Ensure certifications appears in sectionOrder
        if (state.sectionOrder && !state.sectionOrder.includes('certifications')) {
          const eduIdx = state.sectionOrder.indexOf('education');
          const next = [...state.sectionOrder];
          next.splice(eduIdx >= 0 ? eduIdx + 1 : next.length, 0, 'certifications');
          state.setSectionOrder(next);
        }
        // Ensure languages appears in sectionOrder (between certifications and projects)
        if (state.sectionOrder && !state.sectionOrder.includes('languages')) {
          const certIdx = state.sectionOrder.indexOf('certifications');
          const next = [...state.sectionOrder];
          next.splice(certIdx >= 0 ? certIdx + 1 : next.length, 0, 'languages');
          state.setSectionOrder(next);
        }
      },
    }
  )
);
