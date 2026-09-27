/**
 * Asks for the user's position only when they tap a button. Never resolves
 * later than `timeoutMs`: the browser's own timeout does not start until the
 * permission prompt is answered, so an ignored prompt would otherwise leave
 * the screen waiting forever.
 */
export type UserPosition = { lat: number; lon: number };

export const DEFAULT_POSITION: UserPosition = { lat: 48.8566, lon: 2.3522 };

export function requestUserPosition(timeoutMs = 10_000): Promise<UserPosition | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return Promise.resolve(null);
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    navigator.geolocation.getCurrentPosition(
      (pos) => { clearTimeout(timer); resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }); },
      () => { clearTimeout(timer); resolve(null); },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 600_000 },
    );
  });
}

export function formatPosition(p: UserPosition): string {
  return `${p.lat.toFixed(2)}°, ${p.lon.toFixed(2)}°`;
}
