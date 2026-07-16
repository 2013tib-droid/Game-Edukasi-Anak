import { createContext, useContext, useEffect, useState } from 'react';
import { getFirebase, isFirebaseConfigured } from '../app/firebase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // users/{uid}: { email, access: {tk, sd1}, ... }
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    let unsubscribe = () => {};
    let cancelled = false;
    getFirebase().then(({ auth, authMod }) => {
      if (cancelled) return;
      unsubscribe = authMod.onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      });
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !user) {
      setProfile(null);
      return undefined;
    }
    let unsubscribe = () => {};
    let cancelled = false;
    getFirebase().then(({ db, firestoreMod }) => {
      if (cancelled) return;
      unsubscribe = firestoreMod.onSnapshot(
        firestoreMod.doc(db, 'users', user.uid),
        (snap) => setProfile(snap.exists() ? snap.data() : null)
      );
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [user]);

  async function register(email, password) {
    const { auth, db, authMod, firestoreMod } = await getFirebase();
    const cred = await authMod.createUserWithEmailAndPassword(auth, email, password);
    // access is granted only by Cloud Functions (payment webhook / code redeem);
    // security rules require it to be empty on create
    await firestoreMod.setDoc(
      firestoreMod.doc(db, 'users', cred.user.uid),
      { email, access: {}, createdAt: firestoreMod.serverTimestamp() },
      { merge: true }
    );
    return cred.user;
  }

  async function login(email, password) {
    const { auth, authMod } = await getFirebase();
    return authMod.signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    const { auth, authMod } = await getFirebase();
    return authMod.signOut(auth);
  }

  function hasAccess(groupId) {
    return Boolean(profile?.access?.[groupId]);
  }

  const value = {
    user,
    profile,
    loading,
    isFirebaseConfigured,
    register,
    login,
    logout,
    hasAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
