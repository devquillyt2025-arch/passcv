import { v4 as uuidv4 } from 'uuid';
import { StoreSlice, PublicationSlice } from './types';

export const createPublicationSlice: StoreSlice<PublicationSlice> = (set) => ({
  addPublication: () =>
    set((state) => ({
      data: {
        ...state.data,
        publications: [
          ...(state.data.publications || []),
          { id: uuidv4(), title: '', publisher: '', date: '', coAuthors: '', url: '' },
        ],
      },
    })),
  updatePublication: (id, pub) =>
    set((state) => ({
      data: {
        ...state.data,
        publications: (state.data.publications || []).map((p) => (p.id === id ? { ...p, ...pub } : p)),
      },
    })),
  removePublication: (id) =>
    set((state) => ({
      data: {
        ...state.data,
        publications: (state.data.publications || []).filter((p) => p.id !== id),
      },
    })),
  reorderPublications: (startIndex, endIndex) =>
    set((state) => {
      const list = Array.from(state.data.publications || []);
      const [removed] = list.splice(startIndex, 1);
      list.splice(endIndex, 0, removed);
      return { data: { ...state.data, publications: list } };
    }),
});
