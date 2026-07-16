import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Layout() {
  const { isFirebaseConfigured } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand" aria-label="Beranda">
          <span className="brand-emoji" aria-hidden="true">🌈</span>
          <span className="brand-text">Petualangan Pintar</span>
        </Link>
        <Link to="/orangtua" className="btn btn-ghost parent-link">
          👨‍👩‍👧 Orang Tua
        </Link>
      </header>

      {!isFirebaseConfigured && (
        <div className="demo-banner" role="status">
          Mode demo: login &amp; pembelian belum aktif (Firebase belum dikonfigurasi).
        </div>
      )}

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
