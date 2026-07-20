// Firebase is loaded lazily (dynamic import) so its SDK never sits in the
// initial bundle — critical for low-end Android. Only type imports here.
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

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

export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

let servicesPromise: Promise<FirebaseServices> | null = null;

/** Lazy singleton: first call downloads the SDK chunks and initializes. */
export function getFirebase(): Promise<FirebaseServices> {
  if (!isFirebaseConfigured) {
    return Promise.reject(new Error('Firebase belum dikonfigurasi (.env kosong).'));
  }
  servicesPromise ??= (async () => {
    const [{ initializeApp }, { getAuth }, { getFirestore }] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('firebase/firestore'),
    ]);
    const app = initializeApp(config);
    return { app, auth: getAuth(app), db: getFirestore(app) };
  })();
  return servicesPromise;
}
