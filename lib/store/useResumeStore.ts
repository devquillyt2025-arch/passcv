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
import { createPublicationSlice } from './slices/publicationSlice';
import { createCourseSlice } from './slices/courseSlice';
import { createAwardSlice } from './slices/awardSlice';
import { createVolunteerSlice } from './slices/volunteerSlice';
import { createCustomSectionSlice } from './slices/customSectionSlice';
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
      ...createPublicationSlice(...a),
      ...createCourseSlice(...a),
      ...createAwardSlice(...a),
      ...createVolunteerSlice(...a),
      ...createCustomSectionSlice(...a),
    }),
    {
      name: 'resume-builder-storage',
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          return {}; // Discard v0 data; empty object merges with initial state
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.setHasHydrated(true);
        if (!state.builderDesign) {
          state.setBuilderDesign({});
        } else if (state.builderDesign.zoom === 0.82) {
          state.setBuilderDesign({ zoom: 0.9 });
        }
        // Migrate old persisted data that predates the certifications / languages / custom sections fields
        if (!state.data.certifications || !state.data.languages || !state.data.customSections
          || !state.data.publications || !state.data.courses || !state.data.awards || !state.data.volunteer) {
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
        // Ensure publications appears in sectionOrder (after projects)
        if (state.sectionOrder && !state.sectionOrder.includes('publications')) {
          const projIdx = state.sectionOrder.indexOf('projects');
          const next = [...state.sectionOrder];
          next.splice(projIdx >= 0 ? projIdx + 1 : next.length, 0, 'publications');
          state.setSectionOrder(next);
        }
        // Ensure courses appears in sectionOrder (after certifications)
        if (state.sectionOrder && !state.sectionOrder.includes('courses')) {
          const certIdx = state.sectionOrder.indexOf('certifications');
          const next = [...state.sectionOrder];
          next.splice(certIdx >= 0 ? certIdx + 1 : next.length, 0, 'courses');
          state.setSectionOrder(next);
        }
        // Ensure awards appears in sectionOrder (after volunteer)
        if (state.sectionOrder && !state.sectionOrder.includes('awards')) {
          const volIdx = state.sectionOrder.indexOf('volunteer');
          const next = [...state.sectionOrder];
          next.splice(volIdx >= 0 ? volIdx + 1 : next.length, 0, 'awards');
          state.setSectionOrder(next);
        }
        // Ensure volunteer appears in sectionOrder (after projects)
        if (state.sectionOrder && !state.sectionOrder.includes('volunteer')) {
          const projIdx = state.sectionOrder.indexOf('projects');
          const next = [...state.sectionOrder];
          next.splice(projIdx >= 0 ? projIdx + 1 : next.length, 0, 'volunteer');
          state.setSectionOrder(next);
        }
      },
    }
  )
);
