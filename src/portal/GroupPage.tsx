import { Link, useParams } from 'react-router-dom';
import groupsData from '@/data/groups.json';
import { gamesForGroup } from '@/games/registry';
import { getGameStars } from '@/engine/core/progress';
import type { GroupId } from '@/engine/core/types';

// Game list per group. Free demos open directly; premium games show a lock
// until the account has group access (gate enforced again in GamePage).
export default function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const group = groupsData.groups.find((g) => g.id === groupId);

  if (!group) {
    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 22 }}>Kelompok tidak ditemukan.</p>
        <Link to="/portal" className="btn">
          ⬅️ Kembali
        </Link>
      </div>
    );
  }

  const games = gamesForGroup(group.id as GroupId);

  return (
    <div className="page" style={{ textAlign: 'center' }}>
      <h1>
        {group.emoji} {group.title}
      </h1>
      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          marginTop: 16,
        }}
      >
        {games.map((game) => {
          const stars = getGameStars(game.id);
          return (
            <Link
              key={game.id}
              to={`/game/${game.id}`}
              className="btn"
              style={{ flexDirection: 'column', padding: 20, position: 'relative' }}
            >
              {!game.freeDemo && (
                <span style={{ position: 'absolute', top: 10, right: 12, fontSize: 22 }}>
                  🔒
                </span>
              )}
              <span style={{ fontSize: 52 }} aria-hidden>
                {game.emoji}
              </span>
              <span style={{ fontSize: 20 }}>{game.title}</span>
              <span style={{ fontSize: 16 }} aria-label={`${stars} bintang`}>
                {stars > 0 ? `⭐ ${stars}` : game.freeDemo ? 'GRATIS' : ''}
              </span>
            </Link>
          );
        })}
      </div>
      <p style={{ marginTop: 28 }}>
        <Link to="/portal" className="btn">
          ⬅️ Kembali
        </Link>
      </p>
    </div>
  );
}
