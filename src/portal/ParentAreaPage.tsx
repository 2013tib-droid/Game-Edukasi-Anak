import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import Layout from '../app/Layout';
import ParentGate from './ParentGate';
import { useAuth } from '../auth/AuthContext';
import { auth, firebaseReady } from '../firebase';
import groups from '../data/groups.json';

export default function ParentAreaPage() {
  const { user, loading } = useAuth();

  return (
    <Layout backTo="/" title="Area Orang Tua">
      <ParentGate>
        {!firebaseReady && (
          <p className="notice">
            ⚙️ Firebase belum dikonfigurasi. Salin <code>.env.example</code> menjadi{' '}
            <code>.env</code> dan isi kredensial project untuk mengaktifkan login.
          </p>
        )}

        {loading ? (
          <p>Memuat akun…</p>
        ) : user ? (
          <div className="card">
            <h2>👤 Akun</h2>
            <p>
              Masuk sebagai <strong>{user.email}</strong>
            </p>
            <Link className="btn" to="/aktivasi">
              🔑 Masukkan Kode Aktivasi
            </Link>
            <button
              className="btn secondary"
              style={{ marginTop: 12 }}
              onClick={() => auth && signOut(auth)}
            >
              Keluar
            </button>
          </div>
        ) : (
          <div className="card">
            <h2>👤 Akun</h2>
            <p>Masuk untuk membuka game yang sudah dibeli, atau daftar akun baru.</p>
            <Link className="btn" to="/masuk">
              Masuk
            </Link>
            <Link className="btn secondary" style={{ marginTop: 12 }} to="/daftar">
              Daftar Akun Baru
            </Link>
          </div>
        )}

        <div className="card">
          <h2>🛒 Beli Paket Game</h2>
          {groups.map((group) => (
            <p key={group.id}>
              {group.emoji} <strong>{group.title}</strong> — {group.price} (beli sekali,
              bugfix gratis selamanya)
            </p>
          ))}
          <p>
            Pembelian melalui Lynk.id / Mayar.id (QRIS &amp; e-wallet). Setelah membayar,
            Anda menerima kode aktivasi untuk dimasukkan di halaman aktivasi.
          </p>
        </div>
      </ParentGate>
    </Layout>
  );
}
