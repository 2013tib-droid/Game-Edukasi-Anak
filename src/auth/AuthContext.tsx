import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';
import type { GroupId } from '@/engine/core/types';
import { getFirebase, isFirebaseConfigured } from '@/auth/firebase';
import { verifyAccess, type AccessError } from '@/auth/access';

interface AuthContextValue {
  /** Current Firebase user, or null when signed out. */
  user: User | null;
  /** True until the first auth state resolves — gate redirects on this. */
  loading: boolean;
  /** False when .env has no Firebase keys; auth screens show a notice. */
  configured: boolean;
  /** Groups unlocked on this account, from the last online check. */
  groups: GroupId[];
  /** True while an access check is in flight. */
  accessLoading: boolean;
  /** Parent-friendly message when the last check failed (e.g. device limit). */
  accessError: string | null;
  /**
   * Re-runs the online access check. Premium game launches call this so
   * access is validated at launch, not just at login (CLAUDE.md).
   */
  refreshAccess: () => Promise<GroupId[]>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [groups, setGroups] = useState<GroupId[]>([]);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

  const refreshAccess = useCallback(async (): Promise<GroupId[]> => {
    if (!isFirebaseConfigured) return [];
    setAccessLoading(true);
    setAccessError(null);
    try {
      const info = await verifyAccess();
      setGroups(info.groups);
      return info.groups;
    } catch (error) {
      // Access stays at whatever the last successful check said — failing
      // closed on a flaky connection would lock out a paying customer.
      setAccessError((error as AccessError).message);
      throw error;
    } finally {
      setAccessLoading(false);
    }
  }, []);

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
        if (u) {
          // Registers this device and pulls the unlocked groups.
          void refreshAccess().catch(() => {
            /* message already surfaced via accessError */
          });
        } else {
          setGroups([]);
          setAccessError(null);
        }
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [refreshAccess]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured: isFirebaseConfigured,
      groups,
      accessLoading,
      accessError,
      refreshAccess,
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
    }),
    [user, loading, groups, accessLoading, accessError, refreshAccess],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
