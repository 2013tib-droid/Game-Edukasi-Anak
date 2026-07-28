/**
 * Callable wrappers for the Fase 5 access functions.
 *
 * Every message here is read by a parent on a phone, so Firebase error codes
 * are translated into plain Indonesian. Nothing in this file decides access
 * on its own — the server does; this only asks and reports.
 */

import type { GroupId } from '@/engine/core/types';
import { getFirebase } from '@/auth/firebase';
import { getDeviceId } from '@/auth/device';

export interface AccessInfo {
  groups: GroupId[];
  deviceCount: number;
  maxDevices: number;
}

export interface RedeemResult {
  group: GroupId;
  /** True when the account already had this group (double-tap, re-entry). */
  alreadyOwned: boolean;
}

/** Thrown with copy that can be shown to a parent as-is. */
export class AccessError extends Error {
  constructor(
    message: string,
    /** Raw Firebase code, for logging/branching — never shown to the user. */
    readonly code: string,
  ) {
    super(message);
    this.name = 'AccessError';
  }
}

function errorCode(error: unknown): string {
  const raw = (error as { code?: unknown } | null)?.code;
  return typeof raw === 'string' ? raw.replace(/^functions\//, '') : 'unknown';
}

/**
 * The function already sends parent-friendly Indonesian text for the cases
 * it rejects on purpose; anything else means the network or the deploy is
 * broken, and saying so is more useful than a raw code.
 */
function toAccessError(error: unknown): AccessError {
  const code = errorCode(error);
  const message = (error as { message?: unknown } | null)?.message;

  const expected = [
    'unauthenticated',
    'invalid-argument',
    'not-found',
    'already-exists',
    'failed-precondition',
    'resource-exhausted',
  ];
  if (expected.includes(code) && typeof message === 'string' && message.trim()) {
    return new AccessError(message, code);
  }
  return new AccessError(
    'Tidak bisa menghubungi server. Periksa koneksi internet lalu coba lagi ya.',
    code,
  );
}

async function callable<TReq, TRes>(name: string, payload: TReq): Promise<TRes> {
  try {
    const [{ functions }, { httpsCallable }] = await Promise.all([
      getFirebase(),
      import('firebase/functions'),
    ]);
    const fn = httpsCallable<TReq, TRes>(functions, name);
    const { data } = await fn(payload);
    return data;
  } catch (error) {
    throw toAccessError(error);
  }
}

/**
 * Online access check. Called after login and again when a premium game is
 * launched — CLAUDE.md requires the launch-time check, not just login.
 * Also registers this device against the 3-device limit.
 */
export function verifyAccess(): Promise<AccessInfo> {
  return callable<{ deviceId: string }, AccessInfo>('verifyAccess', {
    deviceId: getDeviceId(),
  });
}

/** Redeems an activation code onto the signed-in account. */
export function redeemActivationCode(code: string): Promise<RedeemResult> {
  return callable<{ code: string }, RedeemResult>('redeemActivationCode', { code });
}
