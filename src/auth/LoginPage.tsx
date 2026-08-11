import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { ArrowLeftIcon } from '@/app/icons';

// Parent-area screen: plain form, Indonesian copy, generous touch targets.
export default function LoginPage() {
  const { login, resetPassword, configured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
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

  /**
   * Uses whatever is already typed in the email field, so recovery is one tap
   * from here instead of a separate screen.
   *
   * An unregistered address gets the SAME confirmation as a registered one —
   * otherwise this form would answer "does this person have an account here?"
   * for anyone who asks.
   */
  async function handleReset() {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError('Isi dulu emailnya di atas, lalu ketuk "Lupa kata sandi?" lagi ya.');
      return;
    }
    setBusy(true);
    try {
      await resetPassword(email.trim());
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code === 'auth/invalid-email') {
        setError('Format emailnya belum benar. Contoh: nama@email.com');
        setBusy(false);
        return;
      }
      if (code !== 'auth/user-not-found') {
        setError('Gagal mengirim email. Coba lagi sebentar lagi ya.');
        setBusy(false);
        return;
      }
      // auth/user-not-found falls through to the same message as success.
    }
    setNotice(
      'Kalau email itu terdaftar, kami sudah mengirim tautan untuk membuat kata sandi baru. Cek kotak masuk dan folder spam ya.',
    );
    setBusy(false);
  }

  return (
    <div className="page" style={{ maxWidth: 420 }}>
      <Link className="back-link" to="/">
        <ArrowLeftIcon /> Beranda
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
        {notice && (
          <p style={{ background: '#e8f6ec', padding: 12, borderRadius: 12, margin: 0 }}>
            ✉️ {notice}
          </p>
        )}
        <button className="btn btn--primary" type="submit" disabled={busy || !configured}>
          {busy ? 'Memproses…' : 'Masuk'}
        </button>
      </form>
      <p>
        <button
          type="button"
          onClick={() => void handleReset()}
          disabled={busy || !configured}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            font: 'inherit',
            color: '#2a6fb0',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          Lupa kata sandi?
        </button>
      </p>
      <p>
        Belum punya akun? <Link to="/daftar">Daftar di sini</Link>
      </p>
    </div>
  );
}
