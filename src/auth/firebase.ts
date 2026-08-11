// Firebase is loaded lazily (dynamic import) so its SDK never sits in the
// initial bundle — critical for low-end Android. Only type imports here.
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { Functions } from 'firebase/functions';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

/**
 * True when .env contains real Firebase keys. The app must still boot
 * without them (local dev before the Firebase project exists), so every
 * consumer checks this flag before calling getFirebase().
 */
export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

/**
 * Region Cloud Functions — HARUS sama persis dengan `setGlobalOptions` di
 * `functions/src/index.ts`. Kalau berbeda, panggilan callable-nya menjadi 404
 * dan halaman aktivasi gagal tanpa penjelasan yang jelas.
 */
export const FUNCTIONS_REGION = 'asia-southeast2';

export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  functions: Functions;
}

let servicesPromise: Promise<FirebaseServices> | null = null;

/** Lazy singleton: first call downloads the SDK chunks and initializes. */
export function getFirebase(): Promise<FirebaseServices> {
  if (!isFirebaseConfigured) {
    return Promise.reject(new Error('Firebase belum dikonfigurasi (.env kosong).'));
  }
  servicesPromise ??= (async () => {
    const [{ initializeApp }, { getAuth }, { getFirestore }, { getFunctions }] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('firebase/firestore'),
      import('firebase/functions'),
    ]);
    const app = initializeApp(config);
    const services: FirebaseServices = {
      app,
      auth: getAuth(app),
      db: getFirestore(app),
      functions: getFunctions(app, FUNCTIONS_REGION),
    };
    await connectEmulatorsIfAsked(services);
    return services;
  })();
  return servicesPromise;
}

/**
 * Menyambung ke Firebase Emulator Suite kalau `VITE_USE_EMULATOR=1`.
 *
 * Ini yang membuat seluruh alur berbayar (kode aktivasi, batas perangkat,
 * security rules) bisa diuji tanpa project Firebase sungguhan dan tanpa
 * menyentuh data pembeli.
 */
async function connectEmulatorsIfAsked(services: FirebaseServices): Promise<void> {
  if (import.meta.env.VITE_USE_EMULATOR !== '1') return;
  const host = (import.meta.env.VITE_EMULATOR_HOST as string | undefined) ?? '127.0.0.1';
  const [{ connectAuthEmulator }, { connectFirestoreEmulator }, { connectFunctionsEmulator }] =
    await Promise.all([
      import('firebase/auth'),
      import('firebase/firestore'),
      import('firebase/functions'),
    ]);
  connectAuthEmulator(services.auth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(services.db, host, 8080);
  connectFunctionsEmulator(services.functions, host, 5001);
}
