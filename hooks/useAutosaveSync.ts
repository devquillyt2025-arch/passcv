import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ResumeData } from '@/lib/types';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const DEBOUNCE_MS   = 1500;
const SAVED_RESET_MS = 3000; // how long to show "Saved ✓" before going back to idle

export function useAutosaveSync(resumeId: string | null, data: ResumeData) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Stable Supabase client — null when env vars aren't configured (autosave disabled).
  const supabaseRef = useRef(createClient());

  // Refs that track debounce state without putting them in effect deps.
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousJsonRef  = useRef<string>('');
  const isFirstRender    = useRef(true);

  // Stable save function — captured in useEffect without needing to be in deps.
  const persist = useCallback(async (snapshot: ResumeData, snapshotJson: string) => {
    const client = supabaseRef.current;
    if (!resumeId || !client) return;
    try {
      const { error } = await client
        .from('resumes')
        .update({
          data: snapshot,
          name: snapshot.contact.firstName
            ? `${snapshot.contact.firstName} ${snapshot.contact.lastName} Resume`
            : 'Untitled Resume',
          updated_at: new Date().toISOString(),
        })
        .eq('id', resumeId);

      if (error) throw error;

      previousJsonRef.current = snapshotJson;
      setSaveStatus('saved');

      // Auto-reset "Saved" → "idle" so the indicator doesn't persist forever.
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setSaveStatus('idle'), SAVED_RESET_MS);
    } catch {
      setSaveStatus('error');
    }
  }, [resumeId]); // resumeId is the only true dep; supabaseRef is stable

  useEffect(() => {
    // Skip the very first mount — the initial data is not a "change".
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousJsonRef.current = JSON.stringify(data);
      return;
    }

    if (!resumeId) return;

    const currentJson = JSON.stringify(data);
    if (currentJson === previousJsonRef.current) return; // nothing changed

    // Show "Saving…" immediately so the user knows their change was registered.
    setSaveStatus('saving');

    // Cancel any in-flight debounce; start a fresh one with the latest snapshot.
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      // Capture the current data at the moment the debounce fires (latest value).
      persist(data, currentJson);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
    // data is the key trigger; persist is stable (useCallback with resumeId dep).
  }, [data, persist]);

  // Cleanup all timers on unmount.
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (resetTimerRef.current)    clearTimeout(resetTimerRef.current);
    };
  }, []);

  return { saveStatus };
}
