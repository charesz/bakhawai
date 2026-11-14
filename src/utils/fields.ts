import { formatEC, formatPH } from './format';

export type FieldKey =
  | 'elevation_m'
  | 'slope_deg'
  | 'distToRiver_m'
  | 'distToCoast_m'
  | 'ec_uScm'
  | 'ph';

export interface FieldDef {
  label: string;
  unit: string;
  min: number; // smallest value a user may type
  max: number; // largest value a user may type
  decimals: number;
}

// ONE list for every value the user can see or edit.
// To add a variable later, add it here, then add it to FieldKey above.
export const FIELDS: Record<FieldKey, FieldDef> = {
  elevation_m: { label: 'Elevation', unit: 'm', min: -50, max: 1000, decimals: 1 },
  slope_deg: { label: 'Slope Gradient', unit: '°', min: 0, max: 90, decimals: 1 },
  distToRiver_m: { label: 'Distance to River', unit: 'm', min: 0, max: 100000, decimals: 0 },
  distToCoast_m: { label: 'Distance to Coast', unit: 'm', min: 0, max: 100000, decimals: 0 },
  ec_uScm: { label: 'Soil EC', unit: 'µS/cm', min: 0, max: 100000, decimals: 0 },
  ph: { label: 'Soil pH', unit: '', min: 0, max: 14, decimals: 2 },
};

// Text shown on screen. EC switches to mS/cm above 1,000.
export function formatField(key: FieldKey, value: number | null): string {
  if (value === null) return '—';
  if (key === 'ec_uScm') {
    const ec = formatEC(value);
    return `${ec.value} ${ec.unit}`;
  }
  if (key === 'ph') return formatPH(value);
  const f = FIELDS[key];
  const n = value.toFixed(f.decimals);
  return f.unit === '°' ? `${n}°` : `${n} ${f.unit}`;
}
