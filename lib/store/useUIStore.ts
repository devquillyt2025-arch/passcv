import { create } from 'zustand';

interface UIState {
  // ── Section focus — signals EditorPanel to expand + scroll to a section ──
  pendingSectionFocus: string | null;
  requestSectionFocus: (id: string) => void;
  clearSectionFocus: () => void;

  // ── Experience card highlight — signals ExperienceStep to open and ring a
  //    specific experience card after a "weak bullet" click in the stats panel.
  //    The value is an experience entry ID (exp.id from the Zustand store).
  highlightExpId: string | null;
  setHighlightExpId: (id: string | null) => void;

  // ── Shared JD text — written by ATSScoreWidget, read by AI Rewrite hooks ──
  jdText: string;
  setJdText: (text: string) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  pendingSectionFocus: null,
  requestSectionFocus: (id) => set({ pendingSectionFocus: id }),
  clearSectionFocus:   ()   => set({ pendingSectionFocus: null }),

  highlightExpId:    null,
  setHighlightExpId: (id) => set({ highlightExpId: id }),

  jdText:    '',
  setJdText: (text) => set({ jdText: text }),
}));
