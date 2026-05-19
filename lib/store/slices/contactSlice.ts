import { StoreSlice, ContactSlice } from './types';

export const createContactSlice: StoreSlice<ContactSlice> = (set) => ({
  updateContact: (contact) =>
    set((state) => ({
      data: { ...state.data, contact: { ...state.data.contact, ...contact } },
    })),

  updateSummary: (summary) =>
    set((state) => ({
      data: { ...state.data, summary },
    })),
});
