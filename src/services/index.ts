import { MockModel, type AssessmentModel } from './assessmentService';
import { MockLocationService, type LocationService } from './locationService';
import { MockRecordsService, type RecordsService } from './recordsService';
import { MockSensorService, type SensorService } from './sensorService';

// TODO(Phase 4): swap in UsbSensorService
export const sensorService: SensorService = new MockSensorService();

// TODO(Phase 3): swap in SqliteRecordsService
export const recordsService: RecordsService = new MockRecordsService();

// TODO(Phase 5): swap in the real location service
export const locationService: LocationService = new MockLocationService();

// TODO(Phase 7): swap in the real model
export const assessmentModel: AssessmentModel = new MockModel();

// TODO(Phase 6): replace with the name from the local account.
export const currentUser = { name: 'Albert II' };