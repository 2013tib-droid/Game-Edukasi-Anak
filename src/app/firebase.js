const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Without a .env the portal still runs in demo mode: free-demo games are
// playable, but login/registration/purchases are disabled with a notice.
export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId);

let instancePromise = null;

// The Firebase SDK (~160 kB gzip) is imported lazily: the kids' portal
// must load fast on low-end Android, and demo mode ships zero Firebase bytes.
export function getFirebase() {
  if (!isFirebaseConfigured) {
    return Promise.reject(new Error('Firebase is not configured (see .env.example)'));
  }
  if (!instancePromise) {
    instancePromise = Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('firebase/firestore'),
    ]).then(([appMod, authMod, firestoreMod]) => {
      const app = appMod.initializeApp(config);
      return {
        app,
        auth: authMod.getAuth(app),
        db: firestoreMod.getFirestore(app),
        authMod,
        firestoreMod,
      };
    });
  }
  return instancePromise;
}
