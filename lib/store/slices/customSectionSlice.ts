import { v4 as uuidv4 } from 'uuid';
import { StoreSlice } from './types';
import { ResumeCustomSection } from '../../types';

export const createCustomSectionSlice: StoreSlice<import('./types').CustomSectionSlice> = (set) => ({
  addCustomSection: (title) => set((state) => {
    const id = `custom-${uuidv4()}`;
    const newSection: ResumeCustomSection = {
      id,
      title,
      items: [{ id: uuidv4(), name: '', description: '' }],
    };
    return {
      data: {
        ...state.data,
        customSections: [...(state.data.customSections || []), newSection],
      },
      sectionOrder: [...state.sectionOrder, id],
    };
  }),
  updateCustomSectionTitle: (sectionId, title) => set((state) => {
    const customSections = state.data.customSections || [];
    return {
      data: {
        ...state.data,
        customSections: customSections.map((sec) => sec.id === sectionId ? { ...sec, title } : sec),
      },
    };
  }),
  removeCustomSection: (sectionId) => set((state) => {
    const customSections = state.data.customSections || [];
    return {
      data: {
        ...state.data,
        customSections: customSections.filter((sec) => sec.id !== sectionId),
      },
      sectionOrder: state.sectionOrder.filter((id) => id !== sectionId),
    };
  }),
  addCustomItem: (sectionId) => set((state) => {
    const customSections = state.data.customSections || [];
    return {
      data: {
        ...state.data,
        customSections: customSections.map((sec) => {
          if (sec.id === sectionId) {
            return {
              ...sec,
              items: [...(sec.items || []), { id: uuidv4(), name: '', description: '' }],
            };
          }
          return sec;
        }),
      },
    };
  }),
  updateCustomItem: (sectionId, itemId, itemData) => set((state) => {
    const customSections = state.data.customSections || [];
    return {
      data: {
        ...state.data,
        customSections: customSections.map((sec) => {
          if (sec.id === sectionId) {
            return {
              ...sec,
              items: (sec.items || []).map((item) => item.id === itemId ? { ...item, ...itemData } : item),
            };
          }
          return sec;
        }),
      },
    };
  }),
  removeCustomItem: (sectionId, itemId) => set((state) => {
    const customSections = state.data.customSections || [];
    return {
      data: {
        ...state.data,
        customSections: customSections.map((sec) => {
          if (sec.id === sectionId) {
            return {
              ...sec,
              items: (sec.items || []).filter((item) => item.id !== itemId),
            };
          }
          return sec;
        }),
      },
    };
  }),
  reorderCustomItems: (sectionId, startIndex, endIndex) => set((state) => {
    const customSections = state.data.customSections || [];
    return {
      data: {
        ...state.data,
        customSections: customSections.map((sec) => {
          if (sec.id === sectionId) {
            const items = [...(sec.items || [])];
            const [moved] = items.splice(startIndex, 1);
            items.splice(endIndex, 0, moved);
            return { ...sec, items };
          }
          return sec;
        }),
      },
    };
  }),
});
