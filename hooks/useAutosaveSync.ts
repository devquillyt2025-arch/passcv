import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ResumeData } from '@/lib/types';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const DEBOUNCE_MS   = 1500;
const SAVED_RESET_MS = 3000; // how long to show "Saved ✓" before going back to idle

export function useAutosaveSync(resumeId: string | null, data: ResumeData, setResumeId: (id: string) => void) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Stable Supabase client — null when env vars aren't configured (autosave disabled).
  const supabaseRef = useRef(createClient());

  // Refs that track debounce state without putting them in effect deps.
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousJsonRef  = useRef<string>('');
  const isFirstRender    = useRef(true);
  const isInsertingRef   = useRef(false);
  // Always holds the latest data so the debounced callback never reads stale values.
  const latestDataRef    = useRef<ResumeData>(data);

  // Stable save function — captured in useEffect without needing to be in deps.
  const persist = useCallback(async (snapshot: ResumeData, snapshotJson: string) => {
    const client = supabaseRef.current;
    if (!client) return;

    try {
      if (!resumeId) {
        if (isInsertingRef.current) return;
        isInsertingRef.current = true;
        
        // We need the user session to link it, though RLS uses auth.uid() automatically.
        // The DB migration handles DEFAULT auth.uid(), so we just insert the name and data.
        const { data: newResume, error } = await client
          .from('resumes')
          .insert({
            data: snapshot,
            name: snapshot.contact.firstName
              ? `${snapshot.contact.firstName} ${snapshot.contact.lastName} Resume`
              : 'Untitled Resume',
          })
          .select('id')
          .single();

        isInsertingRef.current = false;
        
        if (error) throw error;
        if (newResume) {
          setResumeId(newResume.id);
        }
      } else {
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
      }

      previousJsonRef.current = snapshotJson;
      setSaveStatus('saved');

      // Auto-reset "Saved" → "idle" so the indicator doesn't persist forever.
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setSaveStatus('idle'), SAVED_RESET_MS);
    } catch {
      setSaveStatus('error');
      isInsertingRef.current = false;
    }
  }, [resumeId, setResumeId]); // resumeId is the only true dep; supabaseRef is stable

  useEffect(() => {
    // Keep the latest-data ref in sync on every render.
    latestDataRef.current = data;

    // Skip the very first mount — the initial data is not a "change", UNLESS we need to hydrate local-only
    let isHydrationSave = false;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousJsonRef.current = JSON.stringify(data);
      // If there is local data but no resumeId, we force an insert
      if (!resumeId && data.contact.firstName) {
         isHydrationSave = true;
      } else {
         return;
      }
    }

    const currentJson = JSON.stringify(data);
    if (!isHydrationSave && currentJson === previousJsonRef.current) return; // nothing changed

    previousJsonRef.current = currentJson;
    setSaveStatus('saving');

    // Cancel any in-flight debounce; start a fresh one with the latest snapshot.
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      // Always read the freshest data at fire-time (avoids stale-closure bug).
      const snapshot = latestDataRef.current;
      const snapshotJson = JSON.stringify(snapshot);
      persist(snapshot, snapshotJson);
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
