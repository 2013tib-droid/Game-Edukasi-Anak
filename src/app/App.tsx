import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/auth/AuthContext';
import ProtectedRoute from '@/auth/ProtectedRoute';
import Layout from '@/app/Layout';
import SplashScreen from '@/app/SplashScreen';

// Lazy-load every page so the initial bundle stays small on low-end devices.
const HomePage = lazy(() => import('@/portal/HomePage'));
const GroupPage = lazy(() => import('@/portal/GroupPage'));
const LoginPage = lazy(() => import('@/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/auth/RegisterPage'));
const ActivationPage = lazy(() => import('@/auth/ActivationPage'));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<SplashScreen />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/kelompok/:groupId" element={<GroupPage />} />
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
      </BrowserRouter>
    </AuthProvider>
  );
}
