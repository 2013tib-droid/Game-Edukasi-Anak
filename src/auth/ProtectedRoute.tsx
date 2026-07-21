import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/auth/AuthContext';
import SplashScreen from '@/app/SplashScreen';

// Wraps routes that require a signed-in account (parent area, activation).
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <SplashScreen />;
  if (!user) return <Navigate to="/masuk" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
