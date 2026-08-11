/**
 * Sisi client dari sistem akses berbayar (Fase 5).
 *
 * Modul ini TIDAK memutuskan apa pun — ia cuma menanyakan ke server dan
 * membawa jawabannya pulang. Keputusan "boleh main" ada di dua tempat:
 * `canPlayGame()` di `src/data/access.ts` untuk tampilannya, dan Cloud
 * Functions + firestore.rules untuk yang sesungguhnya mengikat.
 *
 * Ingat: apa pun di file ini berjalan di HP pembeli dan bisa diubah. Yang
 * membuatnya berarti adalah `users/{uid}.groups` cuma bisa ditulis Cloud
 * Function, dan kode aktivasi tak pernah terbaca dari client.
 */
import { getFirebase } from '@/auth/firebase';

const DEVICE_KEY = 'pp_device_v1';

export interface DeviceInfo {
  id: string;
  label: string;
  lastSeenAt: number | null;
}

/** Kelompok yang sudah dimiliki akun ini. */
export async function fetchOwnedGroups(uid: string): Promise<string[]> {
  const [{ db }, { doc, getDoc }] = await Promise.all([
    getFirebase(),
    import('firebase/firestore'),
  ]);
  const snap = await getDoc(doc(db, 'users', uid));
  const groups = snap.data()?.groups;
  return Array.isArray(groups) ? (groups as string[]).filter((g) => typeof g === 'string') : [];
}

/**
 * Id perangkat: nomor acak yang disimpan di HP ini.
 *
 * Sengaja BUKAN sidik jari perangkat sungguhan (canvas/font fingerprinting) —
 * itu melanggar privasi, sering meleset, dan CLAUDE.md memang meminta yang
 * "sederhana". Konsekuensinya: menghapus data browser = perangkat baru, jadi
 * tombol "lepas perangkat" di layar batas perangkat itu WAJIB ada.
 */
export function getDeviceId(): string {
  try {
    const saved = localStorage.getItem(DEVICE_KEY);
    if (saved && /^[A-Za-z0-9_-]{8,64}$/.test(saved)) return saved;
    const fresh = crypto.randomUUID().replace(/-/g, '');
    localStorage.setItem(DEVICE_KEY, fresh);
    return fresh;
  } catch {
    // Mode privat / storage penuh: tetap kembalikan id yang sah supaya
    // permainannya jalan, walaupun tiap sesi terhitung perangkat baru.
    return crypto.randomUUID().replace(/-/g, '');
  }
}

/** Label yang dilihat orang tua di daftar perangkat, mis. "Android · Chrome". */
export function describeDevice(): string {
  const ua = navigator.userAgent;
  const system = /Android/i.test(ua)
    ? 'Android'
    : /iPhone|iPad|iPod/i.test(ua)
      ? 'iPhone/iPad'
      : /Windows/i.test(ua)
        ? 'Windows'
        : /Mac/i.test(ua)
          ? 'Mac'
          : 'Perangkat';
  const browser = /EdgA?\//i.test(ua)
    ? 'Edge'
    : /OPR\//i.test(ua)
      ? 'Opera'
      : /Chrome\//i.test(ua)
        ? 'Chrome'
        : /Firefox\//i.test(ua)
          ? 'Firefox'
          : /Safari\//i.test(ua)
            ? 'Safari'
            : 'Browser';
  return `${system} · ${browser}`;
}

/** Perangkat yang terdaftar di akun ini (dibaca langsung, rules mengizinkan). */
export async function fetchDevices(uid: string): Promise<DeviceInfo[]> {
  const [{ db }, { collection, getDocs }] = await Promise.all([
    getFirebase(),
    import('firebase/firestore'),
  ]);
  const snap = await getDocs(collection(db, 'users', uid, 'devices'));
  return snap.docs.map((d) => {
    const data = d.data();
    const seen = data.lastSeenAt as { toMillis?: () => number } | undefined;
    return {
      id: d.id,
      label: (data.label as string | undefined) ?? 'Perangkat',
      lastSeenAt: seen?.toMillis ? seen.toMillis() : null,
    };
  });
}

async function call<TIn, TOut>(name: string, payload: TIn): Promise<TOut> {
  const [{ functions }, { httpsCallable }] = await Promise.all([
    getFirebase(),
    import('firebase/functions'),
  ]);
  const fn = httpsCallable<TIn, TOut>(functions, name);
  const res = await fn(payload);
  return res.data;
}

export interface RedeemResult {
  group: string;
  already: boolean;
}

/** Menukar kode aktivasi. Melempar FirebaseError dengan pesan siap tampil. */
export function redeemActivationCode(code: string): Promise<RedeemResult> {
  return call<{ code: string }, RedeemResult>('redeemActivationCode', { code });
}

export interface DeviceFullError {
  devices: DeviceInfo[];
  max: number;
}

/**
 * Memastikan perangkat ini terdaftar. Dipanggil hanya untuk game berbayar —
 * pengunjung yang main Hutan Hewan gratis tidak pernah didaftarkan.
 */
export function registerDevice(): Promise<{ deviceCount: number; max: number }> {
  return call('registerDevice', { deviceId: getDeviceId(), label: describeDevice() });
}

export function removeDevice(deviceId: string): Promise<{ ok: boolean }> {
  return call('removeDevice', { deviceId });
}

/** Kode error dari Cloud Functions yang perlu dibedakan di UI. */
export function errorCode(e: unknown): string {
  return (e as { code?: string }).code ?? '';
}

export function errorMessage(e: unknown, fallback: string): string {
  const msg = (e as { message?: string }).message;
  return typeof msg === 'string' && msg.length > 0 ? msg : fallback;
}

export function errorDetails<T>(e: unknown): T | undefined {
  return (e as { details?: T }).details;
}
