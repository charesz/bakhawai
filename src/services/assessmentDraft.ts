import type { AssessmentInput, AssessmentResult } from '../types';

// Holds the assessment in progress, so the Location, Results and Report screens share the same data.
// It lives in memory only and is cleared when the app closes.
// TODO(Phase 3): when the user taps Done, save the finished assessment with the Records service.
let current: { input: AssessmentInput; result: AssessmentResult } | null = null;

export const assessmentDraft = {
  get: () => current,
  set: (input: AssessmentInput, result: AssessmentResult) => {
    current = { input, result };
  },
  clear: () => {
    current = null;
  },
};
