import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

const ERROR_MESSAGES = {
  'auth/invalid-credential': 'Email atau kata sandi salah.',
  'auth/invalid-email': 'Format email tidak valid.',
  'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.',
};

export default function LoginPage() {
  const { login, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate('/orangtua');
    } catch (err) {
      setError(ERROR_MESSAGES[err.code] || 'Gagal masuk. Periksa koneksi lalu coba lagi.');
    } finally {
      setBusy(false);
    }
  }

  if (!isFirebaseConfigured) {
    return (
      <section className="page">
        <h1 className="page-title">Masuk</h1>
        <p className="page-text">
          Login belum aktif — Firebase belum dikonfigurasi (lihat <code>.env.example</code>).
        </p>
        <Link to="/" className="btn btn-primary">Kembali ke Beranda</Link>
      </section>
    );
  }

  return (
    <section className="page">
      <h1 className="page-title">Masuk</h1>
      <form onSubmit={submit} className="auth-form">
        <label className="field">
          Email
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className="field">
          Kata sandi
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Memproses…' : 'Masuk'}
        </button>
      </form>
      <p className="page-text">
        Belum punya akun? <Link to="/daftar">Daftar di sini</Link>
      </p>
    </section>
  );
}
