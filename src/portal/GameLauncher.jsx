import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import gamesData from '../data/games.json';
import { useAuth } from '../auth/AuthContext.jsx';
import GameShell from '../engine/core/GameShell.jsx';

// Game configs are dynamically imported per game (anti-piracy + performance):
// premium content never ships inside the public main bundle.
const configLoaders = import.meta.glob('../games/*/*/config.js');

export default function GameLauncher() {
  const { groupId, gameId } = useParams();
  const { user, hasAccess, loading } = useAuth();
  const [config, setConfig] = useState(null);
  const [loadError, setLoadError] = useState(false);

  const game = gamesData.games.find((g) => g.id === gameId && g.group === groupId);
  const loader = configLoaders[`../games/${groupId}/${gameId}/config.js`];
  const playable = game && (game.freeDemo || (user && hasAccess(groupId)));
  const ready = game?.status === 'ready' && Boolean(loader);

  useEffect(() => {
    if (!playable || !ready) return undefined;
    let cancelled = false;
    setConfig(null);
    setLoadError(false);
    loader()
      .then((mod) => {
        if (!cancelled) setConfig(mod.default);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [playable, ready, loader]);

  if (!game) {
    return (
      <section className="page">
        <h1 className="page-title">Game tidak ditemukan 😢</h1>
        <Link to="/" className="btn btn-primary">Kembali ke Beranda</Link>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="page">
        <p className="page-title">Memuat… ⏳</p>
      </section>
    );
  }

  if (!playable) {
    return (
      <section className="page">
        <h1 className="page-title">🔒 Game ini terkunci</h1>
        <p className="page-text">
          Minta bantuan Ayah/Bunda untuk membuka semua game, ya!
        </p>
        <Link to="/orangtua" className="btn btn-primary">Ke Area Orang Tua</Link>
        <Link to={`/kelompok/${groupId}`} className="btn btn-ghost">Kembali</Link>
      </section>
    );
  }

  if (!ready) {
    return (
      <section className="page">
        <h1 className="page-title">
          <span aria-hidden="true">{game.emoji}</span> {game.title}
        </h1>
        <p className="page-text">{game.description}</p>
        <p className="page-text placeholder-note">
          🚧 Game ini sedang disiapkan. Nantikan ya!
        </p>
        <Link to={`/kelompok/${groupId}`} className="btn btn-primary">Kembali</Link>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="page">
        <h1 className="page-title">Gagal memuat game 😢</h1>
        <p className="page-text">Periksa koneksi internet lalu coba lagi.</p>
        <Link to={`/kelompok/${groupId}`} className="btn btn-primary">Kembali</Link>
      </section>
    );
  }

  if (!config) {
    return (
      <section className="page">
        <p className="page-title">Memuat game… ⏳</p>
      </section>
    );
  }

  return <GameShell game={game} config={config} backTo={`/kelompok/${groupId}`} />;
}
