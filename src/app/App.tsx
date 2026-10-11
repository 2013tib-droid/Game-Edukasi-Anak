import { lazy, Suspense } from 'react';
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/auth/AuthContext';
import ProtectedRoute from '@/auth/ProtectedRoute';
import Layout from '@/app/Layout';
import NotFoundPage from '@/app/NotFoundPage';
import ProgressSync from '@/app/ProgressSync';
import SplashScreen from '@/app/SplashScreen';
import LandingPage from '@/portal/LandingPage';
import { syncTestModeFromUrl, TEST_TOGGLE_ALLOWED } from '@/data/access';

// `?test=1` in the URL turns on tester mode (shows the lock switch) and is
// remembered on the device; `?test=0` turns it off again. Re-read on every
// hash change too: with HashRouter, opening a `…/#/kelompok/sd2?test=1` link in
// a tab that already shows the app does NOT reload it, so reading it once at
// start-up missed the flag and the switch never appeared (owner 2026-10-09).
syncTestModeFromUrl();
window.addEventListener('hashchange', syncTestModeFromUrl);

// The landing page is imported EAGERLY: it is the first screen every buyer
// sees (links from WhatsApp/TikTok land on "/"), and as a lazy chunk it cost a
// second round-trip of ~15 small files behind the entry bundle — measured
// ~0.7–1 s of "Memuat…" on a throttled phone. Every other page stays lazy so
// the initial bundle stays small on low-end devices.
const HomePage = lazy(() => import('@/portal/HomePage'));
const GroupPage = lazy(() => import('@/portal/GroupPage'));
const LoginPage = lazy(() => import('@/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/auth/RegisterPage'));
const ActivationPage = lazy(() => import('@/auth/ActivationPage'));
const GamePage = lazy(() => import('@/portal/GamePage'));
// Halaman hukum — area ORANG TUA, ditaut dari kaki landing. Jangan pernah
// ditaut dari area anak (/portal, /kelompok/*, /game/*).
const PrivacyPage = lazy(() => import('@/portal/PrivacyPage'));
const TermsPage = lazy(() => import('@/portal/TermsPage'));
// Simulasi "sudah bayar" — hanya dev server & build penguji/development.
const SimulasiBayarPage = TEST_TOGGLE_ALLOWED
  ? lazy(() => import('@/auth/SimulasiBayarPage'))
  : null;

// HashRouter for static hosts without SPA rewrites (GitHub Pages testing);
// BrowserRouter everywhere else (Firebase Hosting has rewrites).
const Router = import.meta.env.VITE_USE_HASH_ROUTER === '1' ? HashRouter : BrowserRouter;

export default function App() {
  return (
    <AuthProvider>
      {/* Cadangan bintang ke Firestore selagi ada akun yang masuk. Di luar
          <Router> karena tidak terikat halaman mana pun. */}
      <ProgressSync />
      <Router>
        <Suspense fallback={<SplashScreen />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/portal" element={<HomePage />} />
              <Route path="/kelompok/:groupId" element={<GroupPage />} />
              <Route path="/kelompok/:groupId/:subjectId" element={<GroupPage />} />
              <Route path="/game/:gameId" element={<GamePage />} />
              <Route path="/privasi" element={<PrivacyPage />} />
              <Route path="/ketentuan" element={<TermsPage />} />
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
              {SimulasiBayarPage && (
                <Route path="/simulasi-bayar" element={<SimulasiBayarPage />} />
              )}
              {/* Mistyped URL / old bookmark — never leave a blank page. */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
