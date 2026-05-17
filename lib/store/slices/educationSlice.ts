import { StoreSlice, EducationSlice } from './types';
import { v4 as uuidv4 } from 'uuid';

export const createEducationSlice: StoreSlice<EducationSlice> = (set) => ({
  addEducation: () =>
    set((state) => ({
      data: {
        ...state.data,
        education: [
          ...(state.data.education || []),
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
        education: (state.data.education || []).map((e) => (e.id === id ? { ...e, ...edu } : e)),
      },
    })),
  removeEducation: (id) =>
    set((state) => ({
      data: {
        ...state.data,
        education: (state.data.education || []).filter((e) => e.id !== id),
      },
    })),
  reorderEducation: (startIndex, endIndex) =>
    set((state) => {
      const newEdu = Array.from(state.data.education || []);
      const [removed] = newEdu.splice(startIndex, 1);
      newEdu.splice(endIndex, 0, removed);
      return { data: { ...state.data, education: newEdu } };
    }),
});
