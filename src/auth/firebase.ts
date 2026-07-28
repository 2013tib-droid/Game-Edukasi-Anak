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
 * Cloud Functions region — Jakarta, closest to our buyers. Must match REGION
 * in functions/src/index.ts or every callable 404s.
 */
export const FUNCTIONS_REGION = 'asia-southeast2';

/** Set VITE_USE_EMULATOR=1 in .env to point at the local Firebase emulators. */
const useEmulator = import.meta.env.VITE_USE_EMULATOR === '1';

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
    const [
      { initializeApp },
      { getAuth, connectAuthEmulator },
      { getFirestore, connectFirestoreEmulator },
      { getFunctions, connectFunctionsEmulator },
    ] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('firebase/firestore'),
      import('firebase/functions'),
    ]);
    const app = initializeApp(config);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const functions = getFunctions(app, FUNCTIONS_REGION);

    if (useEmulator) {
      const host = window.location.hostname;
      connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
      connectFirestoreEmulator(db, host, 8080);
      connectFunctionsEmulator(functions, host, 5001);
    }

    return { app, auth, db, functions };
  })();
  return servicesPromise;
}
