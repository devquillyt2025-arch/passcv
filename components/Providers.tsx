'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/ThemeProvider';
import { EditedResumeProvider } from '@/lib/editedResumeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  // useState ensures a single QueryClient instance per app lifetime — important
  // in Next.js App Router where server components can render multiple times.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime:            30_000,
            retry:                false,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange={false}>
        <EditedResumeProvider>
          {children}
        </EditedResumeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
