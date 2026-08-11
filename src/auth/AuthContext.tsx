import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';
import { getFirebase, isFirebaseConfigured } from '@/auth/firebase';

interface AuthContextValue {
  /** Current Firebase user, or null when signed out. */
  user: User | null;
  /** True until the first auth state resolves — gate redirects on this. */
  loading: boolean;
  /** False when .env has no Firebase keys; auth screens show a notice. */
  configured: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Send the "reset your password" email. See the note in `resetPassword`. */
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      const [{ auth }, { onAuthStateChanged }] = await Promise.all([
        getFirebase(),
        import('firebase/auth'),
      ]);
      if (cancelled) return;
      unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured: isFirebaseConfigured,
      async login(email, password) {
        const [{ auth }, { signInWithEmailAndPassword }] = await Promise.all([
          getFirebase(),
          import('firebase/auth'),
        ]);
        await signInWithEmailAndPassword(auth, email, password);
      },
      async register(email, password) {
        const [{ auth }, { createUserWithEmailAndPassword }] = await Promise.all([
          getFirebase(),
          import('firebase/auth'),
        ]);
        await createUserWithEmailAndPassword(auth, email, password);
      },
      async logout() {
        const [{ auth }, { signOut }] = await Promise.all([
          getFirebase(),
          import('firebase/auth'),
        ]);
        await signOut(auth);
      },
      /**
       * A parent who forgets their password would otherwise lose the group
       * they paid for, and the only recovery path would be messaging the
       * owner on WhatsApp one by one.
       *
       * Callers must show the SAME confirmation whether or not the address is
       * registered: Firebase reports unknown addresses as `auth/user-not-found`,
       * and surfacing that would turn this form into a way to check which
       * emails have an account here.
       */
      async resetPassword(email) {
        const [{ auth }, { sendPasswordResetEmail }] = await Promise.all([
          getFirebase(),
          import('firebase/auth'),
        ]);
        await sendPasswordResetEmail(auth, email);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
