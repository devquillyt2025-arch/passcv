import { v4 as uuidv4 } from 'uuid';
import { StoreSlice, VolunteerSlice } from './types';

export const createVolunteerSlice: StoreSlice<VolunteerSlice> = (set) => ({
  addVolunteer: () =>
    set((state) => ({
      data: {
        ...state.data,
        volunteer: [
          ...(state.data.volunteer || []),
          {
            id: uuidv4(),
            organization: '',
            role: '',
            location: '',
            startDate: '',
            endDate: '',
            currentlyVolunteering: false,
            description: '',
          },
        ],
      },
    })),
  updateVolunteer: (id, vol) =>
    set((state) => ({
      data: {
        ...state.data,
        volunteer: (state.data.volunteer || []).map((v) => (v.id === id ? { ...v, ...vol } : v)),
      },
    })),
  removeVolunteer: (id) =>
    set((state) => ({
      data: {
        ...state.data,
        volunteer: (state.data.volunteer || []).filter((v) => v.id !== id),
      },
    })),
  reorderVolunteer: (startIndex, endIndex) =>
    set((state) => {
      const list = Array.from(state.data.volunteer || []);
      const [removed] = list.splice(startIndex, 1);
      list.splice(endIndex, 0, removed);
      return { data: { ...state.data, volunteer: list } };
    }),
});
