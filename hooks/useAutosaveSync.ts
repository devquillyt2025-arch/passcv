import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ResumeData } from '@/lib/types';

type SaveStatus = 'saved' | 'saving' | 'error' | 'idle';

export function useAutosaveSync(resumeId: string | null, data: ResumeData) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const supabase = createClient();
  const initialRender = useRef(true);
  const previousDataRef = useRef<string>('');

  useEffect(() => {
    // Skip first render
    if (initialRender.current) {
      initialRender.current = false;
      previousDataRef.current = JSON.stringify(data);
      return;
    }

    if (!resumeId) return;

    // Dirty state tracker: only save if data actually changed
    const currentDataString = JSON.stringify(data);
    if (currentDataString === previousDataRef.current) {
      return;
    }

    setSaveStatus('saving');

    const timer = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('resumes')
          .update({ 
            data: data,
            name: data.contact.firstName ? `${data.contact.firstName} ${data.contact.lastName} Resume` : 'Untitled Resume',
            updated_at: new Date().toISOString()
          })
          .eq('id', resumeId);

        if (error) throw error;
        
        setSaveStatus('saved');
        previousDataRef.current = currentDataString;
      } catch (error) {
        console.error('Error auto-saving:', error);
        setSaveStatus('error');
      }
    }, 1500); // 1.5 second debounce

    return () => clearTimeout(timer);
  }, [data, resumeId, supabase]);

  return { saveStatus };
}
