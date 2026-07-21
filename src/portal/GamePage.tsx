import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { GameConfig } from '@/engine/core/types';
import GameShell from '@/engine/core/GameShell';
import SplashScreen from '@/app/SplashScreen';
import { findGame } from '@/games/registry';
import { useAuth } from '@/auth/AuthContext';

/**
 * Access gate + config loader. Premium games require group access on the
 * account (validated online — full check wired to Firestore in Fase 5).
 * Free demos are always playable, no login needed.
 */
export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const meta = gameId ? findGame(gameId) : undefined;
  const [config, setConfig] = useState<GameConfig | null>(null);

  // TODO(fase-5): read users/{uid}.groups from Firestore at launch time.
  const hasAccess = Boolean(meta?.freeDemo);

  useEffect(() => {
    if (!meta || !hasAccess) return;
    let cancelled = false;
    void meta.load().then((mod) => {
      if (!cancelled) setConfig(mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [meta, hasAccess]);

  if (!meta) {
    return (
      <div className="game-center">
        <p style={{ fontSize: 22 }}>Game tidak ditemukan.</p>
        <Link to="/" className="btn">
          ⬅️ Kembali
        </Link>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="game-center">
        <div className="game-big-emoji" aria-hidden>
          🔒
        </div>
        <h1>{meta.title}</h1>
        <p style={{ fontSize: 20, maxWidth: 420 }}>
          Game ini bagian dari versi lengkap. Minta bantuan Ayah/Bunda untuk membukanya ya!
        </p>
        {user ? (
          <Link to="/aktivasi" className="btn btn--primary">
            🔑 Masukkan Kode Aktivasi
          </Link>
        ) : (
          <Link to="/masuk" className="btn btn--primary">
            👨‍👩‍👧 Masuk Akun Orang Tua
          </Link>
        )}
        <Link to={`/kelompok/${meta.group}`} className="btn">
          ⬅️ Kembali
        </Link>
      </div>
    );
  }

  if (!config) return <SplashScreen />;

  return <GameShell config={config} onExit={() => navigate(`/kelompok/${meta.group}`)} />;
}
