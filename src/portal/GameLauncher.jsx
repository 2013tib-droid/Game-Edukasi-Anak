import { Link, useParams } from 'react-router-dom';
import gamesData from '../data/games.json';
import { useAuth } from '../auth/AuthContext.jsx';

// Phase 1 placeholder: validates access, but the actual game engine
// arrives in Phase 2 and game content in Phases 3-4.
// IMPORTANT (anti-piracy): premium game configs/assets must be lazy-loaded
// per game here, never bundled in the public JS.
export default function GameLauncher() {
  const { groupId, gameId } = useParams();
  const { user, hasAccess, loading } = useAuth();

  const game = gamesData.games.find((g) => g.id === gameId && g.group === groupId);
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

  const playable = game.freeDemo || (user && hasAccess(groupId));

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

  return (
    <section className="page">
      <h1 className="page-title">
        <span aria-hidden="true">{game.emoji}</span> {game.title}
      </h1>
      <p className="page-text">{game.description}</p>
      <p className="page-text placeholder-note">
        🚧 Game ini akan dimuat oleh engine (Fase 2–3). Halaman ini sudah
        memeriksa hak akses dengan benar.
      </p>
      <Link to={`/kelompok/${groupId}`} className="btn btn-primary">Kembali</Link>
    </section>
  );
}
