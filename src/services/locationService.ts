import type { EnvVariables } from '../types';

export interface LocationService {
  getEnvironment(latitude: number, longitude: number): Promise<EnvVariables>;
}

// While true, the screen labels these numbers as "Sample values".
// TODO(Phase 5): set this to false when the real service is connected.
export const ENV_IS_SAMPLE = true;

// A repeatable "random" number between 0 and 1 from the coordinates,
// so the same spot always gives the same sample values.
function seeded(lat: number, lon: number, salt: number) {
  const x = Math.sin(lat * 12.9898 + lon * 78.233 + salt) * 43758.5453;
  return x - Math.floor(x);
}

// Fake service for building screens.
export class MockLocationService implements LocationService {
  async getEnvironment(latitude: number, longitude: number): Promise<EnvVariables> {
    await new Promise<void>((resolve) => setTimeout(resolve, 300));
    return {
      latitude,
      longitude,
      elevation_m: Math.round((0.5 + seeded(latitude, longitude, 1) * 4) * 10) / 10,
      slope_deg: Math.round((0.5 + seeded(latitude, longitude, 2) * 4) * 10) / 10,
      distToRiver_m: Math.round(50 + seeded(latitude, longitude, 3) * 800),
      distToCoast_m: Math.round(20 + seeded(latitude, longitude, 4) * 400),
    };
  }
}

// TODO(Phase 5): create the real service here.
//  - Elevation and slope from an elevation file stored in the app (the SAME source the model was trained on)
//  - Distance to river and coast from river and coastline map data stored in the app
//  - Everything must work offline
