import type { AssessmentRecord } from '../types';

export interface RecordsService {
  list(): Promise<AssessmentRecord[]>;
  add(record: AssessmentRecord): Promise<void>;
}

// In-memory sample data from your design. It disappears when the app closes.
export class MockRecordsService implements RecordsService {
  private items: AssessmentRecord[] = [
    { id: '1', siteName: 'Cogon, Cagayan de Oro', createdAt: '2026-06-19T16:04:00', suitability: 'Unsuitable' },
    { id: '2', siteName: 'Gusa, Cagayan de Oro', createdAt: '2026-06-20T16:30:00', suitability: 'Marginal' },
    { id: '3', siteName: 'Lapasan, Cagayan de Oro', createdAt: '2026-06-22T16:04:00', suitability: 'Unsuitable' },
    { id: '4', siteName: 'Bonbon, Cagayan de Oro', createdAt: '2026-06-27T17:04:00', suitability: 'Suitable' },
    { id: '5', siteName: 'Taytay, El Salvador', createdAt: '2026-06-28T16:04:00', suitability: 'Suitable' },
    { id: '6', siteName: 'Barra, Opol', createdAt: '2026-06-29T15:04:00', suitability: 'Suitable' },
  ];

  // Newest first
  async list() {
    return [...this.items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async add(record: AssessmentRecord) {
    this.items.push(record);
  }
}

// TODO(Phase 3): create SqliteRecordsService using expo-sqlite (saved on the phone).
