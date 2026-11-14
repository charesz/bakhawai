import type { Suitability } from '../types';

import type { AssessmentInput } from '../types';
import { formatField, type FieldKey } from '../utils/fields';

// While true, the Results screen shows a small SAMPLE tag on the species and synopsis.
// TODO(Phase 7): set this to false when the species table and reviewed synopsis templates are connected.
export const RESULTS_ARE_SAMPLE = true;

export interface SpeciesItem {
  name: string;
  commonName: string;
  description: string; // for recommended species
  limitation?: string; // for caution species: shown after "Environmental Limitation:"
}

// SAMPLE species copied from the Figma design. Replace with the real species table in Phase 7.
export const SAMPLE_RECOMMENDED: SpeciesItem[] = [
  {
    name: 'Rhizophora apiculata',
    commonName: 'Bakauan Lalaki',
    description: 'Highly ideal for high structural stability zones with regular muddy tidal exposure paths.',
  },
  {
    name: 'Rhizophora mucronata',
    commonName: 'Bakauan Babae',
    description: 'Thrives in fringes with softer muddy foundations along fringe zones.',
  },
  {
    name: 'Sonneratia alba',
    commonName: 'Pagatpat',
    description: 'High structural integrity and excellent resistance parameters matching soil conditions.',
  },
];

export const SAMPLE_CAUTION: SpeciesItem[] = [
  {
    name: 'Avicennia marina',
    commonName: 'Bungalon',
    description: '',
    limitation: 'Elevated salinity levels detected during assessment. Deploy only on higher spatial tidal lines.',
  },
];

// SAMPLE synopsis wording. Replace with reviewed templates (DENR / BFAR based) in Phase 7.
export function buildSynopsis(label: Suitability, topScore: number): string {
  if (label === 'Suitable') {
    return (
      'The assessed site shows favorable conditions for mangrove restoration based on its environmental ' +
      'measurements and geographic characteristics. The soil pH, electrical conductivity, elevation, slope, and ' +
      'proximity to river and coastal areas indicate a suitable habitat for mangrove growth and establishment. ' +
      `Based on these factors, the site has been classified as Suitable with a suitability score of ${topScore}%, ` +
      'suggesting strong potential for successful restoration.'
    );
  }
  if (label === 'Marginal') {
    return (
      'The assessed site shows mixed conditions for mangrove restoration. Some measurements are favorable, while ' +
      'others may limit mangrove growth and establishment. The site has been classified as Marginal with a ' +
      `suitability score of ${topScore}%. Restoration may be possible, but the limiting conditions need closer ` +
      'review and expert advice.'
    );
  }
  return (
    'The assessed site shows conditions that may not support mangrove growth and establishment, based on its ' +
    'environmental measurements and geographic characteristics. The site has been classified as Unsuitable with a ' +
    `suitability score of ${topScore}%. Planting is not recommended without further assessment and expert advice.`
  );
}

// SAMPLE wording for the report. Replace with reviewed text (DENR / BFAR based) in Phase 7.
export function classificationText(label: Suitability): string {
  if (label === 'Suitable') {
    return 'The targeted site demonstrates highly favorable ecological conditions for active mangrove restoration based on mathematical models analyzing local substrate chemistry and physical spatial markers.';
  }
  if (label === 'Marginal') {
    return 'The targeted site shows mixed ecological conditions for mangrove restoration. Some measurements are favorable and others may limit establishment, so closer review is advised.';
  }
  return 'The targeted site shows conditions that may not support mangrove restoration based on the recorded measurements. Further assessment and expert advice are advised before planting.';
}

// Field guidance built from the real recorded values. The wording is SAMPLE text.
export function buildGuidance(input: AssessmentInput): string {
  const f = (k: FieldKey) => formatField(k, input.values[k].value);
  return (
    `This site was recorded with a soil pH of ${f('ph')} and an electrical conductivity of ${f('ec_uScm')}. ` +
    `It sits at an elevation of ${f('elevation_m')} with a slope of ${f('slope_deg')}, ` +
    `${f('distToRiver_m')} from the nearest river and ${f('distToCoast_m')} from the coast. ` +
    'Field managers should confirm these conditions on site and consult the local DENR or BFAR office before planting.' +
    (RESULTS_ARE_SAMPLE ? ' (Sample guidance wording.)' : '')
  );
}