import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import GoogleSignInButton from '@/auth/GoogleSignInButton';
import { ArrowLeftIcon } from '@/app/icons';

export default function RegisterPage() {
  const { register, configured } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Kata sandi minimal 8 karakter ya.');
      return;
    }
    setBusy(true);
    try {
      await register(email, password);
      // New accounts go straight to code activation.
      navigate('/aktivasi', { replace: true });
    } catch {
      setError('Pendaftaran gagal. Email mungkin sudah terdaftar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 420 }}>
      <Link className="back-link" to="/">
        <ArrowLeftIcon /> Beranda
      </Link>
      <h1>Daftar Akun Orang Tua</h1>
      {!configured && (
        <p style={{ background: '#fff3cd', padding: 12, borderRadius: 12 }}>
          ⚠️ Firebase belum dikonfigurasi (.env kosong). Pendaftaran belum aktif.
        </p>
      )}
      <div style={{ display: 'grid', gap: 16 }}>
        {/* Akun Google datang dengan email yang sudah terverifikasi, jadi
            jalur ini langsung sampai ke layar aktivasi tanpa menunggu
            tautan verifikasi di kotak masuk. */}
        <GoogleSignInButton
          label="Daftar dengan Google"
          to="/aktivasi"
          busy={busy}
          setBusy={setBusy}
          onError={setError}
        />
        <p className="auth-or">atau</p>
        {/* Satu tempat pesan untuk kedua jalur daftar — lihat catatan yang
            sama di LoginPage. */}
        {error && <p style={{ color: '#c0392b', margin: 0 }}>{error}</p>}
      </div>
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
          placeholder="Kata sandi (min. 8 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        <button className="btn btn--primary" type="submit" disabled={busy || !configured}>
          {busy ? 'Memproses…' : 'Daftar'}
        </button>
      </form>
      <p>
        Sudah punya akun? <Link to="/masuk">Masuk di sini</Link>
      </p>
    </div>
  );
}
