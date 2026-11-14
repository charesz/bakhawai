import type { SensorReading, SensorStatus } from '../types';

export interface SensorDeviceInfo {
  name: string;
  detail: string;
}

export interface SensorService {
  getStatus(): SensorStatus;
  getDeviceInfo(): SensorDeviceInfo | null;
  getLastReading(): SensorReading | null;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  readOnce(): Promise<SensorReading>;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Fake sensor for building screens.
export class MockSensorService implements SensorService {
  private status: SensorStatus = 'disconnected';
  private last: SensorReading | null = null;

  getStatus() {
    return this.status;
  }

  getDeviceInfo(): SensorDeviceInfo | null {
    // TODO(Phase 4): real name and detail from the USB device (for example "USB-SERIAL CH340").
    return this.status === 'connected' ? { name: 'Field Sensor Node v2.1', detail: 'USB-C · Serial' } : null;
  }

  getLastReading() {
    return this.last;
  }

  async connect() {
    this.status = 'connecting';
    await wait(800);
    this.status = 'connected';
  }

  async disconnect() {
    this.status = 'disconnected';
    this.last = null;
  }

  async readOnce(): Promise<SensorReading> {
    if (this.status !== 'connected') throw new Error('Sensor is not connected.');
    await wait(400);
    this.last = {
      ec_uScm: 36 + Math.round(Math.random() * 4),
      ph: 7.04,
      timestamp: new Date().toISOString(),
    };
    return this.last;
  }
}

// TODO(Phase 4): create UsbSensorService here. From your sensor tests:
//  - USB serial chip: CH340
//  - Modbus RTU, 9600 baud, device address 1
//  - Read 8 holding registers starting at 0 (function code 3)
//  - Register 2 = EC in µS/cm (no scaling)
//  - Register 7 = pH, divide by 100
//  - Ignore registers 0, 1, 3, 4, 5, 6 (temperature, moisture, salinity, N, P, K)
//  - Take 5-10 readings and use the middle value, because readings wobble
//  - Handle: cable unplugged, no response, odd values
//  - Needs a development build (not Expo Go) and a USB serial library