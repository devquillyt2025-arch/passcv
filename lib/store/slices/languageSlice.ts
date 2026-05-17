import { v4 as uuidv4 } from 'uuid';
import { StoreSlice, LanguageSlice } from './types';

export const createLanguageSlice: StoreSlice<LanguageSlice> = (set) => ({
  addLanguage: () =>
    set((state) => ({
      data: {
        ...state.data,
        languages: [
          ...(state.data.languages || []),
          { id: uuidv4(), name: '', proficiency: 'Fluent' },
        ],
      },
    })),

  updateLanguage: (id, lang) =>
    set((state) => ({
      data: {
        ...state.data,
        languages: (state.data.languages || []).map((l) =>
          l.id === id ? { ...l, ...lang } : l
        ),
      },
    })),

  removeLanguage: (id) =>
    set((state) => ({
      data: {
        ...state.data,
        languages: (state.data.languages || []).filter((l) => l.id !== id),
      },
    })),

  reorderLanguages: (startIndex, endIndex) =>
    set((state) => {
      const items = Array.from(state.data.languages || []);
      const [removed] = items.splice(startIndex, 1);
      items.splice(endIndex, 0, removed);
      return { data: { ...state.data, languages: items } };
    }),
});
