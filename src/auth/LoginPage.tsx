import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';

// Parent-area screen: plain form, Indonesian copy, generous touch targets.
export default function LoginPage() {
  const { login, configured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      const from = (location.state as { from?: string } | null)?.from ?? '/portal';
      navigate(from, { replace: true });
    } catch {
      setError('Email atau kata sandi salah. Coba lagi ya.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 420 }}>
      <Link className="back-link" to="/">
        <span aria-hidden>⬅️</span> Beranda
      </Link>
      <h1>Masuk Akun Orang Tua</h1>
      {!configured && (
        <p style={{ background: '#fff3cd', padding: 12, borderRadius: 12 }}>
          ⚠️ Firebase belum dikonfigurasi (.env kosong). Login belum aktif.
        </p>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Kata sandi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        {error && <p style={{ color: '#c0392b' }}>{error}</p>}
        <button className="btn btn--primary" type="submit" disabled={busy || !configured}>
          {busy ? 'Memproses…' : 'Masuk'}
        </button>
      </form>
      <p>
        Belum punya akun? <Link to="/daftar">Daftar di sini</Link>
      </p>
    </div>
  );
}
