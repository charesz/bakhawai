// EC is always stored in µS/cm. Show µS/cm below 1,000 and mS/cm from 1,000 up.
// Use this everywhere EC is shown (Device, Location, Results, Report) so the unit never mismatches.
export function formatEC(ec_uScm: number): { value: string; unit: string } {
  if (ec_uScm >= 1000) return { value: (ec_uScm / 1000).toFixed(2), unit: 'mS/cm' };
  return { value: String(Math.round(ec_uScm)), unit: 'µS/cm' };
}

export function formatPH(ph: number): string {
  return ph.toFixed(2);
}

// Example: 8.4542° N, 124.6319° E
export function formatCoords(latitude: number, longitude: number): string {
  const lat = `${Math.abs(latitude).toFixed(4)}° ${latitude >= 0 ? 'N' : 'S'}`;
  const lon = `${Math.abs(longitude).toFixed(4)}° ${longitude >= 0 ? 'E' : 'W'}`;
  return `${lat}, ${lon}`;
}