import { lazy, Suspense } from 'react';
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/auth/AuthContext';
import ProtectedRoute from '@/auth/ProtectedRoute';
import Layout from '@/app/Layout';
import SplashScreen from '@/app/SplashScreen';
import { syncTestModeFromUrl } from '@/data/access';

// `?test=1` in the URL turns on tester mode (shows the lock switch) and is
// remembered on the device; `?test=0` turns it off again.
syncTestModeFromUrl();

// Lazy-load every page so the initial bundle stays small on low-end devices.
const LandingPage = lazy(() => import('@/portal/LandingPage'));
const HomePage = lazy(() => import('@/portal/HomePage'));
const GroupPage = lazy(() => import('@/portal/GroupPage'));
const LoginPage = lazy(() => import('@/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/auth/RegisterPage'));
const ActivationPage = lazy(() => import('@/auth/ActivationPage'));
const GamePage = lazy(() => import('@/portal/GamePage'));

// HashRouter for static hosts without SPA rewrites (GitHub Pages testing);
// BrowserRouter everywhere else (Firebase Hosting has rewrites).
const Router = import.meta.env.VITE_USE_HASH_ROUTER === '1' ? HashRouter : BrowserRouter;

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<SplashScreen />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/portal" element={<HomePage />} />
              <Route path="/kelompok/:groupId" element={<GroupPage />} />
              <Route path="/game/:gameId" element={<GamePage />} />
              <Route path="/masuk" element={<LoginPage />} />
              <Route path="/daftar" element={<RegisterPage />} />
              <Route
                path="/aktivasi"
                element={
                  <ProtectedRoute>
                    <ActivationPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
