import { calculateScore, mapResumeDataToParsedResume, parseJD } from '../scoring';
import type { ResumeData } from '../types';

self.onmessage = (e: MessageEvent<{ data: ResumeData; jdText: string }>) => {
  try {
    const { data, jdText } = e.data;
    const parsedResume = mapResumeDataToParsedResume(data);
    const score = calculateScore(parsedResume, parseJD(jdText));
    self.postMessage({ type: 'SUCCESS', score });
  } catch (error) {
    self.postMessage({ type: 'ERROR', error: (error as Error).message });
  }
};
