import type { AssessmentInput, AssessmentResult, ModelScores, Suitability } from '../types';

// The inputs your model needs. Keep the order and units the SAME as in training.
export interface ModelInput {
  ph: number;
  ec_dSm: number; // dS/m. The app stores µS/cm, so toModelInput divides by 1000.
  elevation_m: number;
  slope_deg: number;
  distToRiver_m: number;
  distToCoast_m: number;
}

export interface AssessmentModel {
  predict(input: ModelInput): Promise<ModelScores>;
}

// Fake model: always returns the sample numbers from your design.
export class MockModel implements AssessmentModel {
  async predict(_input: ModelInput): Promise<ModelScores> {
    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    return { suitable: 82, marginal: 12, unsuitable: 6 };
  }
}

// The EC range the model was trained on. From the project lead: 0 to 1 dS/m (inland data).
// TODO: confirm with the lead. Add pH and the other inputs when their trained ranges are known.
export const MODEL_EC_RANGE_DSM = { min: 0, max: 1 };

export function toModelInput(input: AssessmentInput): ModelInput {
  const v = input.values;
  return {
    ph: v.ph.value,
    ec_dSm: v.ec_uScm.value / 1000, // 1 dS/m = 1,000 µS/cm
    elevation_m: v.elevation_m.value,
    slope_deg: v.slope_deg.value,
    distToRiver_m: v.distToRiver_m.value,
    distToCoast_m: v.distToCoast_m.value,
  };
}

// Plain-language warnings when an input is outside what the model has seen.
export function checkInputRange(m: ModelInput): string[] {
  const warnings: string[] = [];
  if (m.ec_dSm < MODEL_EC_RANGE_DSM.min || m.ec_dSm > MODEL_EC_RANGE_DSM.max) {
    warnings.push(
      `Soil EC is ${m.ec_dSm.toFixed(1)} dS/m, outside the range the model was trained on ` +
        `(${MODEL_EC_RANGE_DSM.min} to ${MODEL_EC_RANGE_DSM.max} dS/m). ` +
        'The suitability score may not be reliable at this salinity.',
    );
  }
  return warnings;
}

// The label shown on screen is the class with the highest percentage.
export function labelFrom(scores: ModelScores): Suitability {
  if (scores.suitable >= scores.marginal && scores.suitable >= scores.unsuitable) return 'Suitable';
  if (scores.marginal >= scores.unsuitable) return 'Marginal';
  return 'Unsuitable';
}

export async function runAssessment(model: AssessmentModel, input: AssessmentInput): Promise<AssessmentResult> {
  const modelInput = toModelInput(input);
  const scores = await model.predict(modelInput);
  return { scores, label: labelFrom(scores), warnings: checkInputRange(modelInput) };
}

// TODO(Phase 7): create the real model here and swap it in services/index.ts.
//  Option A, on the phone (works offline): convert the model to a small file the app runs itself.
//  Option B, on a server: the app sends the inputs and gets the percentages back (needs internet).
//  Check before connecting: the order and units of the inputs, any scaling the model expects,
//  and the order of the output classes.
//  Species, synopsis and guidance are NOT part of the model. They come from a species table
//  and reviewed text, so keep them in their own files.