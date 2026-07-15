import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import Layout from '../app/Layout';
import { auth, db, firebaseReady } from '../firebase';

function describeAuthError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Email ini sudah terdaftar. Silakan masuk.';
    case 'auth/weak-password':
      return 'Kata sandi terlalu pendek — minimal 6 karakter.';
    case 'auth/invalid-email':
      return 'Format email tidak valid.';
    default:
      return 'Gagal mendaftar. Periksa koneksi internet lalu coba lagi.';
  }
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    setBusy(true);
    setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Profile doc without `access`: unlock happens via activation Cloud Function.
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: cred.user.email,
        createdAt: serverTimestamp(),
      });
      navigate('/orang-tua');
    } catch (err: unknown) {
      const code = err instanceof Error && 'code' in err ? String((err as { code: string }).code) : '';
      setError(describeAuthError(code));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout backTo="/orang-tua" title="Daftar">
      {!firebaseReady && (
        <p className="notice">⚙️ Firebase belum dikonfigurasi — pendaftaran belum bisa dipakai.</p>
      )}
      <form className="card" onSubmit={submit}>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="field">
          <span>Kata Sandi (minimal 6 karakter)</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit" disabled={busy || !firebaseReady}>
          {busy ? 'Memproses…' : 'Daftar'}
        </button>
        <p style={{ textAlign: 'center' }}>
          Sudah punya akun? <Link to="/masuk">Masuk di sini</Link>
        </p>
      </form>
    </Layout>
  );
}
