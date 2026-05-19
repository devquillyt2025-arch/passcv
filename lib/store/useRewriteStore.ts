import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ParsedResume, RewrittenResume, ParsedJD, ATSScore } from '../types';

interface RewriteState {
  original: ParsedResume | null;
  jdText: string | null;
  score: ATSScore | null;
  rewritten: RewrittenResume | null;
  edited: RewrittenResume | null;
  jd: ParsedJD | null;
  _hasHydrated: boolean;
  
  setHasHydrated: (state: boolean) => void;
  setOriginal: (original: ParsedResume | null) => void;
  setJdText: (jdText: string) => void;
  setScoreData: (data: {
    original: ParsedResume;
    jdText: string;
    score: ATSScore;
    jd: ParsedJD;
  }) => void;

  setRewriteData: (data: {
    original: ParsedResume;
    rewritten: RewrittenResume;
    edited: RewrittenResume;
    jd: ParsedJD;
  }) => void;
  
  setEdited: (edited: RewrittenResume) => void;
  reset: () => void;
}

export const useRewriteStore = create<RewriteState>()(
  persist(
    (set) => ({
      original: null,
      jdText: null,
      score: null,
      rewritten: null,
      edited: null,
      jd: null,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setOriginal: (original) => set({ original }),
      setJdText: (jdText) => set({ jdText }),
      setScoreData: (data) => set({ ...data }),
      setRewriteData: (data) => set({ ...data }),
      setEdited: (edited) => set({ edited }),
      reset: () => set({ original: null, jdText: null, score: null, rewritten: null, edited: null, jd: null }),
    }),
    {
      name: 'rewrite-storage', // name of the item in the storage
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage to clear when tab closes
      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true);
      },
    }
  )
);
