/**
 * Device identity for the 3-device limit.
 *
 * Deliberately a random id in localStorage, not a browser fingerprint: it is
 * honest, needs no tracking, and survives reloads. Clearing browser data
 * looks like a new device — acceptable, because the limit exists to stop
 * account sharing, not to punish an ordinary family.
 */

const KEY = 'gea.deviceId';

function randomId(): string {
  // randomUUID is missing on older Android WebViews and on plain-HTTP
  // origins, so fall back to getRandomValues — still 128 bits.
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '');
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Stable per-browser id. Falls back to a per-session id when storage is
 * blocked (private mode) so access checks still work — that session just
 * counts as a fresh device.
 */
export function getDeviceId(): string {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored && /^[A-Za-z0-9_-]{8,64}$/.test(stored)) return stored;
    const id = randomId();
    localStorage.setItem(KEY, id);
    return id;
  } catch {
    sessionDeviceId ??= randomId();
    return sessionDeviceId;
  }
}

let sessionDeviceId: string | null = null;
