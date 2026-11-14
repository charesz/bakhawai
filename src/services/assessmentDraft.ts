import type { AssessmentInput, AssessmentResult } from '../types';

// Holds the assessment in progress, so the Location, Results and Report screens share the same data.
// It lives in memory only and is cleared when the app closes.
// savedId is set once the assessment has been saved to Records, so it is never saved twice.
let current: { input: AssessmentInput; result: AssessmentResult; savedId: string | null } | null = null;

export const assessmentDraft = {
  get: () => current,
  set: (input: AssessmentInput, result: AssessmentResult) => {
    current = { input, result, savedId: null };
  },
  setSavedId: (id: string) => {
    if (current) current.savedId = id;
  },
  clear: () => {
    current = null;
  },
};