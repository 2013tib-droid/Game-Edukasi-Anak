import { Link, useParams } from 'react-router-dom';
import gamesData from '../data/games.json';
import { useAuth } from '../auth/AuthContext.jsx';

export default function GroupPage() {
  const { groupId } = useParams();
  const { hasAccess } = useAuth();

  const group = gamesData.groups.find((g) => g.id === groupId);
  if (!group) {
    return (
      <section className="page">
        <h1 className="page-title">Kelompok tidak ditemukan 😢</h1>
        <Link to="/" className="btn btn-primary">Kembali ke Beranda</Link>
      </section>
    );
  }

  const games = gamesData.games.filter((g) => g.group === groupId);
  const unlocked = hasAccess(groupId);

  return (
    <section className="page">
      <h1 className="page-title">
        <span aria-hidden="true">{group.emoji}</span> {group.title}
      </h1>

      <div className="game-grid">
        {games.map((game) => {
          const playable = game.freeDemo || unlocked;
          return (
            <Link
              key={game.id}
              to={`/main/${groupId}/${game.id}`}
              className={`game-card ${playable ? '' : 'game-card-locked'}`}
            >
              <span className="game-emoji" aria-hidden="true">{game.emoji}</span>
              <span className="game-title">{game.title}</span>
              {game.freeDemo && <span className="badge badge-free">GRATIS</span>}
              {!playable && <span className="badge badge-lock">🔒</span>}
            </Link>
          );
        })}
      </div>

      {!unlocked && (
        <div className="buy-hint">
          <p>
            Buka semua game {group.title} —{' '}
            <strong>Rp{group.price.toLocaleString('id-ID')}</strong> sekali bayar.
          </p>
          <Link to="/orangtua" className="btn btn-primary">
            Beli di Area Orang Tua
          </Link>
        </div>
      )}
    </section>
  );
}
