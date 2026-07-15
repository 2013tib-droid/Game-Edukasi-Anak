import { Link, useParams } from 'react-router-dom';
import Layout from '../app/Layout';
import groups from '../data/groups.json';
import games from '../data/games.json';

// Phase 1 scope: access flags come from static config only. Real per-account
// unlock (users/{uid}.access + online check at launch) lands in Phase 5.
export default function GroupPage() {
  const { groupId } = useParams();
  const group = groups.find((g) => g.id === groupId);
  const groupGames = games.filter((g) => g.group === groupId);

  if (!group) {
    return (
      <Layout backTo="/">
        <p className="error">Kelompok tidak ditemukan.</p>
      </Layout>
    );
  }

  return (
    <Layout backTo="/" title={`${group.emoji} ${group.title}`}>
      {groupGames.map((game) => {
        const isDemo = game.demo > 0;
        const isLive = game.status === 'live';
        return (
          <div key={game.id} className={`card${isDemo ? '' : ' locked'}`}>
            <div className="group-emoji">{game.emoji}</div>
            <h2>{game.title}</h2>
            {isDemo ? (
              <>
                <span className="badge free">Level 1 GRATIS</span>{' '}
                {!isLive && <span className="badge soon">Segera hadir</span>}
                {isLive && game.url && (
                  <a className="btn" style={{ marginTop: 12 }} href={game.url}>
                    ▶️ Main Sekarang
                  </a>
                )}
              </>
            ) : (
              <>
                <span className="badge locked">🔒 Terkunci</span>{' '}
                {game.status === 'soon' && <span className="badge soon">Segera hadir</span>}
                <p>Minta bantuan Ayah/Bunda untuk membuka semua game, ya!</p>
                <Link className="btn secondary" to="/orang-tua">
                  👨‍👩‍👧 Buka lewat Area Orang Tua
                </Link>
              </>
            )}
          </div>
        );
      })}
    </Layout>
  );
}
