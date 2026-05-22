import { v4 as uuidv4 } from 'uuid';
import { StoreSlice, AwardSlice } from './types';

export const createAwardSlice: StoreSlice<AwardSlice> = (set) => ({
  addAward: () =>
    set((state) => ({
      data: {
        ...state.data,
        awards: [
          ...(state.data.awards || []),
          {
            id: uuidv4(),
            name: '',
            issuer: '',
            date: '',
            description: '',
          },
        ],
      },
    })),
  updateAward: (id, award) =>
    set((state) => ({
      data: {
        ...state.data,
        awards: (state.data.awards || []).map((a) => (a.id === id ? { ...a, ...award } : a)),
      },
    })),
  removeAward: (id) =>
    set((state) => ({
      data: {
        ...state.data,
        awards: (state.data.awards || []).filter((a) => a.id !== id),
      },
    })),
  reorderAwards: (startIndex, endIndex) =>
    set((state) => {
      const list = Array.from(state.data.awards || []);
      const [removed] = list.splice(startIndex, 1);
      list.splice(endIndex, 0, removed);
      return { data: { ...state.data, awards: list } };
    }),
});
