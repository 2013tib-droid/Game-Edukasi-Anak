import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { AnyGameConfig } from '@/engine/core/types';
import GameShell from '@/engine/core/GameShell';
import SplashScreen from '@/app/SplashScreen';
import { findGame } from '@/games/registry';
import { useAuth } from '@/auth/AuthContext';
import { removeDevice, type DeviceInfo } from '@/auth/entitlements';
import { useGameAccess } from '@/portal/useGameAccess';

/**
 * Gerbang akses + pemuat config.
 *
 * Pemeriksaannya dilakukan SETIAP KALI game diluncurkan (lihat
 * `useGameAccess`), bukan sekali saat login: kepemilikan kelompok dibaca dari
 * Firestore, dan `users/{uid}.groups` hanya bisa ditulis Cloud Function.
 *
 * Config game baru diunduh SESUDAH akses terbukti — jangan pindahkan
 * `meta.load()` ke atas gerbang ini.
 */
export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const meta = gameId ? findGame(gameId) : undefined;
  const [config, setConfig] = useState<AnyGameConfig | null>(null);

  const { access, recheck } = useGameAccess(meta?.id, meta?.group);
  const allowed = access.status === 'boleh';

  useEffect(() => {
    if (!meta || !allowed) return;
    let cancelled = false;
    void meta.load().then((mod) => {
      if (!cancelled) setConfig(mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [meta, allowed]);

  if (!meta) {
    return (
      <div className="game-center">
        <p style={{ fontSize: 22 }}>Game tidak ditemukan.</p>
        <Link to="/portal" className="btn">
          ⬅️ Kembali
        </Link>
      </div>
    );
  }

  const backToGroup = (
    <Link to={`/kelompok/${meta.group}`} className="btn">
      ⬅️ Kembali
    </Link>
  );

  if (access.status === 'memeriksa') return <SplashScreen />;

  if (access.status === 'perlu-masuk' || access.status === 'perlu-aktivasi') {
    return (
      <div className="game-center">
        <div className="game-big-emoji" aria-hidden>
          🔒
        </div>
        <h1>{meta.title}</h1>
        <p style={{ fontSize: 20, maxWidth: 420 }}>
          Game ini bagian dari versi lengkap. Minta bantuan Ayah/Bunda untuk membukanya ya!
        </p>
        {access.status === 'perlu-aktivasi' || user ? (
          <Link to="/aktivasi" className="btn btn--primary">
            🔑 Masukkan Kode Aktivasi
          </Link>
        ) : (
          <Link to="/masuk" className="btn btn--primary">
            👨‍👩‍👧 Masuk Akun Orang Tua
          </Link>
        )}
        {backToGroup}
      </div>
    );
  }

  if (access.status === 'perangkat-penuh') {
    return <DeviceFullScreen access={access} onDone={recheck} back={backToGroup} />;
  }

  if (access.status === 'gagal') {
    return (
      <div className="game-center">
        <div className="game-big-emoji" aria-hidden>
          📡
        </div>
        <h1>Belum bisa dibuka</h1>
        <p style={{ fontSize: 20, maxWidth: 420 }}>{access.message}</p>
        <button type="button" className="btn btn--primary" onClick={recheck}>
          🔄 Coba Lagi
        </button>
        {backToGroup}
      </div>
    );
  }

  if (!config) return <SplashScreen />;

  return (
    <GameShell
      config={config}
      iconClock={meta.iconClock}
      onExit={() => navigate(`/kelompok/${meta.group}`)}
    />
  );
}

/**
 * Layar "perangkat penuh" — HARUS bisa diselesaikan sendiri oleh orang tua.
 *
 * Tanpa tombol lepas di sini, ganti HP berarti kehilangan kelompok yang sudah
 * dibayar, dan satu-satunya pemulihan adalah japri WhatsApp pemilik — persis
 * masalah yang dihindari fitur "lupa kata sandi".
 */
function DeviceFullScreen({
  access,
  onDone,
  back,
}: {
  access: { devices: DeviceInfo[]; max: number };
  onDone: () => void;
  back: React.ReactNode;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove(id: string) {
    setBusy(id);
    setError(null);
    try {
      await removeDevice(id);
      onDone();
    } catch {
      setError('Gagal melepas perangkat. Coba lagi ya.');
      setBusy(null);
    }
  }

  return (
    <div className="game-center">
      <div className="game-big-emoji" aria-hidden>
        📱
      </div>
      <h1>Perangkatnya sudah penuh</h1>
      <p style={{ fontSize: 19, maxWidth: 420 }}>
        Satu akun bisa dipakai di {access.max} perangkat. Lepas salah satu di bawah ini supaya
        HP ini bisa dipakai.
      </p>
      <div style={{ display: 'grid', gap: 10, width: '100%', maxWidth: 420 }}>
        {access.devices.map((d) => (
          <div
            key={d.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              background: '#fff',
              borderRadius: 16,
              padding: '12px 14px',
            }}
          >
            <span style={{ fontSize: 17, fontWeight: 700 }}>
              {d.label}
              {d.lastSeenAt && (
                <span style={{ display: 'block', fontSize: 14, fontWeight: 600, opacity: 0.6 }}>
                  Terakhir dipakai {new Date(d.lastSeenAt).toLocaleDateString('id-ID')}
                </span>
              )}
            </span>
            <button
              type="button"
              className="btn"
              style={{ minHeight: 48, padding: '8px 16px', fontSize: 17 }}
              disabled={busy !== null}
              onClick={() => void handleRemove(d.id)}
            >
              {busy === d.id ? '…' : 'Lepas'}
            </button>
          </div>
        ))}
      </div>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}
      {back}
    </div>
  );
}
