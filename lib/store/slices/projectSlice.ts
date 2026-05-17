import { StoreSlice, ProjectSlice } from './types';
import { v4 as uuidv4 } from 'uuid';

export const createProjectSlice: StoreSlice<ProjectSlice> = (set) => ({
  addProject: () =>
    set((state) => ({
      data: {
        ...state.data,
        projects: [
          ...(state.data.projects || []),
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
        projects: (state.data.projects || []).map((p) => (p.id === id ? { ...p, ...proj } : p)),
      },
    })),
  removeProject: (id) =>
    set((state) => ({
      data: {
        ...state.data,
        projects: (state.data.projects || []).filter((p) => p.id !== id),
      },
    })),
  reorderProjects: (startIndex, endIndex) =>
    set((state) => {
      const newProj = Array.from(state.data.projects || []);
      const [removed] = newProj.splice(startIndex, 1);
      newProj.splice(endIndex, 0, removed);
      return { data: { ...state.data, projects: newProj } };
    }),
});
