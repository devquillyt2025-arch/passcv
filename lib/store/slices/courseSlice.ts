import { v4 as uuidv4 } from 'uuid';
import { StoreSlice, CourseSlice } from './types';

export const createCourseSlice: StoreSlice<CourseSlice> = (set) => ({
  addCourse: () =>
    set((state) => ({
      data: {
        ...state.data,
        courses: [
          ...(state.data.courses || []),
          { id: uuidv4(), name: '', platform: '', completionDate: '', certificateUrl: '' },
        ],
      },
    })),
  updateCourse: (id, course) =>
    set((state) => ({
      data: {
        ...state.data,
        courses: (state.data.courses || []).map((c) => (c.id === id ? { ...c, ...course } : c)),
      },
    })),
  removeCourse: (id) =>
    set((state) => ({
      data: {
        ...state.data,
        courses: (state.data.courses || []).filter((c) => c.id !== id),
      },
    })),
  reorderCourses: (startIndex, endIndex) =>
    set((state) => {
      const list = Array.from(state.data.courses || []);
      const [removed] = list.splice(startIndex, 1);
      list.splice(endIndex, 0, removed);
      return { data: { ...state.data, courses: list } };
    }),
});
