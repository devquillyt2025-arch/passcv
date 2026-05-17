import { StoreSlice, SkillSlice } from './types';
import { v4 as uuidv4 } from 'uuid';

export const createSkillSlice: StoreSlice<SkillSlice> = (set) => ({
  addSkill: () =>
    set((state) => ({
      data: {
        ...state.data,
        skills: [
          ...(state.data.skills || []),
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
        skills: (state.data.skills || []).map((s) => (s.id === id ? { ...s, ...skill } : s)),
      },
    })),
  removeSkill: (id) =>
    set((state) => ({
      data: {
        ...state.data,
        skills: (state.data.skills || []).filter((s) => s.id !== id),
      },
    })),
  reorderSkills: (startIndex, endIndex) =>
    set((state) => {
      const newSkills = Array.from(state.data.skills || []);
      const [removed] = newSkills.splice(startIndex, 1);
      newSkills.splice(endIndex, 0, removed);
      return { data: { ...state.data, skills: newSkills } };
    }),
  setSkills: (skills) =>
    set((state) => ({
      data: { ...state.data, skills },
    })),
});
