import { StoreSlice, ExperienceSlice } from './types';
import { v4 as uuidv4 } from 'uuid';

export const createExperienceSlice: StoreSlice<ExperienceSlice> = (set) => ({
  addExperience: () =>
    set((state) => ({
      data: {
        ...state.data,
        experience: [
          ...(state.data.experience || []),
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
        experience: (state.data.experience || []).map((e) => (e.id === id ? { ...e, ...exp } : e)),
      },
    })),
  removeExperience: (id) =>
    set((state) => ({
      data: {
        ...state.data,
        experience: (state.data.experience || []).filter((e) => e.id !== id),
      },
    })),
  reorderExperience: (startIndex, endIndex) =>
    set((state) => {
      const newExp = Array.from(state.data.experience || []);
      const [removed] = newExp.splice(startIndex, 1);
      newExp.splice(endIndex, 0, removed);
      return { data: { ...state.data, experience: newExp } };
    }),
});
