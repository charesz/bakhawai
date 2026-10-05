import type { FieldKey } from './utils/fields';

export type Suitability = 'Suitable' | 'Marginal' | 'Unsuitable';

export type SensorStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface SensorReading {
  ec_uScm: number; // always stored in µS/cm. Convert to mS/cm only when displaying.
  ph: number;
  timestamp: string; // ISO date string
}

export interface EnvVariables {
  latitude: number;
  longitude: number;
  elevation_m: number;
  slope_deg: number;
  distToRiver_m: number;
  distToCoast_m: number;
}

export interface AssessmentRecord {
  id: string;
  siteName: string;
  createdAt: string; // ISO date string
  suitability: Suitability;
  // TODO(Phase 2/3): add the full result here:
  // sensor reading, env variables, scores (suitable/marginal/unsuitable %),
  // recommended species, caution species, ecological synopsis.
}

// "gps" = the pin is where the phone's GPS says you are. "map" = placed by hand on the map.
export type LocationSource = 'gps' | 'map';

// Everything one assessment is based on. Saved with the record so a report can be rebuilt exactly.
export interface AssessmentInput {
  latitude: number;
  longitude: number;
  address: string;
  locationSource: LocationSource;
  gpsAccuracy_m: number | null;
  capturedAt: string; // ISO date string
  // "auto" = from GPS, files or the sensor. "manual" = typed by the user.
  values: Record<FieldKey, { value: number; source: 'auto' | 'manual' }>;
}

// Percentages that add up to 100
export interface ModelScores {
  suitable: number;
  marginal: number;
  unsuitable: number;
}

export interface AssessmentResult {
  scores: ModelScores;
  label: Suitability;
  warnings: string[]; // for example, "EC is outside the range the model was trained on"
  // TODO(Phase 7): recommended species, caution species, ecological synopsis
}