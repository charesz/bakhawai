import type { AssessmentInput } from '../types';
import { formatCoords } from '../utils/format';
import { assessmentDraft } from './assessmentDraft';
import { recordsService } from './index';

const pad = (n: number) => String(n).padStart(2, '0');

// Example: Assessment-2026-1021-043012 (year, month and day, hour, minute, second)
export function makeAssessmentId(d: Date) {
  return `Assessment-${d.getFullYear()}-${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

// The name shown in Records, taken from the address found for the pin.
export function siteNameFrom(input: AssessmentInput) {
  const a = input.address.replace(/^Near\s+/i, '').trim();
  if (a === '' || a.startsWith('Move the map')) return formatCoords(input.latitude, input.longitude);
  return a;
}

// Saves the assessment in progress to Records. Safe to call twice: it only saves once.
export async function saveCurrentAssessment(): Promise<string | null> {
  const draft = assessmentDraft.get();
  if (!draft) return null;
  if (draft.savedId) return draft.savedId;

  const { input, result } = draft;
  const id = makeAssessmentId(new Date(input.capturedAt));
  await recordsService.add({
    id,
    siteName: siteNameFrom(input),
    createdAt: input.capturedAt,
    suitability: result.label,
    input,
    result,
  });
  assessmentDraft.setSavedId(id);
  return id;
}