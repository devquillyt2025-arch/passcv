'use client';

import React from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { EditedResumeProvider } from '@/lib/editedResumeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <EditedResumeProvider>
        {children}
      </EditedResumeProvider>
    </ThemeProvider>
  );
}
