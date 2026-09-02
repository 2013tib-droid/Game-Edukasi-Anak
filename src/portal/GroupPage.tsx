import { Link, useParams } from 'react-router-dom';
import groupsData from '@/data/groups.json';
import { gamesForGroup } from '@/games/registry';
import { getGameStars } from '@/engine/core/progress';
import type { GroupId } from '@/engine/core/types';
import { canPlayGame, isFreeGame } from '@/data/access';
import { useLockMode, useOwnedGroups } from '@/portal/useAccess';
import LockToggle from '@/portal/LockToggle';
import Clock from '@/engine/ui/Clock';
import GameIcon from '@/engine/ui/GameIcon';

// Game list per group. Unlocked games open directly; locked ones show a
// padlock until the account has group access (gate enforced again in
// GamePage). Lock status comes from `src/data/access.ts`.
export default function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const group = groupsData.groups.find((g) => g.id === groupId);
  // Re-render when the tester flips the lock switch.
  useLockMode();
  // Kelompok yang sudah dibeli — menentukan gembok mana yang hilang.
  const ownedGroups = useOwnedGroups();

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
          const unlocked = canPlayGame(game.id, group.id, ownedGroups);
          return (
            <Link
              key={game.id}
              to={`/game/${game.id}`}
              className="btn"
              style={{ flexDirection: 'column', padding: 20, position: 'relative' }}
            >
              {!unlocked && (
                <span style={{ position: 'absolute', top: 10, right: 12, fontSize: 22 }}>
                  🔒
                </span>
              )}
              {game.iconClock ? (
                <Clock time={game.iconClock} size={58} />
              ) : (
                <span aria-hidden>
                  <GameIcon pic={game.pic} emoji={game.emoji} height={72} emojiSize={52} />
                </span>
              )}
              <span style={{ fontSize: 20 }}>{game.title}</span>
              <span style={{ fontSize: 16 }} aria-label={`${stars} bintang`}>
                {/* "GRATIS" hanya untuk game yang memang gratis selamanya —
                    game yang sudah DIBELI tidak boleh berlabel gratis. */}
                {stars > 0 ? `⭐ ${stars}` : isFreeGame(game.id) ? 'GRATIS' : ''}
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
      {/* Alat penguji: hanya tampil di mode penguji (?test=1). */}
      <div style={{ marginTop: 18 }}>
        <LockToggle />
      </div>
    </div>
  );
}
