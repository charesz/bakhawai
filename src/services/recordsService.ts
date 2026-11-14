import type { AssessmentInput, AssessmentRecord, AssessmentResult, Suitability } from '../types';

export interface RecordsService {
  list(): Promise<AssessmentRecord[]>;
  get(id: string): Promise<AssessmentRecord | null>;
  add(record: AssessmentRecord): Promise<void>;
}

// SAMPLE details so the sample records can be opened as reports.
function sample(id: string, siteName: string, createdAt: string, label: Suitability, n: number): AssessmentRecord {
  const scores =
    label === 'Suitable'
      ? { suitable: 82, marginal: 12, unsuitable: 6 }
      : label === 'Marginal'
        ? { suitable: 25, marginal: 55, unsuitable: 20 }
        : { suitable: 8, marginal: 22, unsuitable: 70 };

  const input: AssessmentInput = {
    latitude: 8.4542 + n * 0.01,
    longitude: 124.6319 + n * 0.01,
    address: siteName,
    locationSource: 'map',
    gpsAccuracy_m: null,
    capturedAt: createdAt,
    deviceName: 'Field Sensor Node v2.1',
    values: {
      elevation_m: { value: 2.5, source: 'auto' },
      slope_deg: { value: 1.8, source: 'auto' },
      distToRiver_m: { value: 350, source: 'auto' },
      distToCoast_m: { value: 120, source: 'auto' },
      ec_uScm: { value: 36, source: 'auto' },
      ph: { value: 7.04, source: 'auto' },
    },
  };
  const result: AssessmentResult = { scores, label, warnings: [] };
  return { id, siteName, createdAt, suitability: label, input, result };
}

// In-memory records. New assessments are added here. They disappear when the app closes.
// TODO(Phase 3): replace with SqliteRecordsService so records stay on the phone.
export class MockRecordsService implements RecordsService {
  private items: AssessmentRecord[] = [
    sample('Assessment-2026-0619', 'Cogon, Cagayan de Oro', '2026-06-19T16:04:00', 'Unsuitable', 1),
    sample('Assessment-2026-0620', 'Gusa, Cagayan de Oro', '2026-06-20T16:30:00', 'Marginal', 2),
    sample('Assessment-2026-0622', 'Lapasan, Cagayan de Oro', '2026-06-22T16:04:00', 'Unsuitable', 3),
    sample('Assessment-2026-0627', 'Bonbon, Cagayan de Oro', '2026-06-27T17:04:00', 'Suitable', 4),
    sample('Assessment-2026-0628', 'Taytay, El Salvador', '2026-06-28T16:04:00', 'Suitable', 5),
    sample('Assessment-2026-0629', 'Barra, Opol', '2026-06-29T15:04:00', 'Suitable', 6),
  ];

  // Newest first
  async list() {
    return [...this.items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async get(id: string) {
    return this.items.find((r) => r.id === id) ?? null;
  }
  async add(record: AssessmentRecord) {
    this.items.push(record);
  }
}