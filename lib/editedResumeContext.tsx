'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { RewrittenResume } from '@/lib/types';

const STORAGE_KEY = 'tailorcv:editedResume';

type ContextValue = {
  edited: RewrittenResume | null;
  setEdited: (r: RewrittenResume | null) => void;
};

const EditedResumeContext = createContext<ContextValue>({
  edited: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setEdited: () => {},
});

export const EditedResumeProvider = ({ children }: { children: React.ReactNode }) => {
  const [edited, setEditedState] = useState<RewrittenResume | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEditedState(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (edited) localStorage.setItem(STORAGE_KEY, JSON.stringify(edited));
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }, [edited]);

  return (
    <EditedResumeContext.Provider value={{ edited, setEdited: setEditedState }}>
      {children}
    </EditedResumeContext.Provider>
  );
};

export function useEditedResume() {
  return useContext(EditedResumeContext);
}
