import { haversineDistance } from './geo';

describe('haversineDistance', () => {
  it('returns ~0 for the same point', () => {
    const p = { lat: -17.7833, lng: -63.1821 };
    expect(haversineDistance(p, p)).toBeLessThan(0.001);
  });

  it('returns a positive distance between two Santa Cruz points', () => {
    const a = { lat: -17.7833, lng: -63.1829 };
    const b = { lat: -17.7407, lng: -63.1659 };
    const km = haversineDistance(a, b);
    expect(km).toBeGreaterThan(4);
    expect(km).toBeLessThan(6);
  });
});
