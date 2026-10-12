import { Link, useParams } from 'react-router-dom';
import groupsData from '@/data/groups.json';
import { gamesForGroup } from '@/games/registry';
import { getGameStars } from '@/engine/core/progress';
import type { GroupId } from '@/engine/core/types';
import { canPlayGame, isFreeGame, isGroupVisible } from '@/data/access';
import { useLockMode, useOwnedGroups } from '@/portal/useAccess';
import LockToggle from '@/portal/LockToggle';
import Clock from '@/engine/ui/Clock';
import GameIcon from '@/engine/ui/GameIcon';
import BackIcon from '@/engine/ui/BackIcon';
import GroupPic from '@/portal/GroupPic';
import SubjectPage from '@/portal/SubjectPage';
import { SUBJECT_STYLE, subjectsFor } from '@/data/subjects';
import Scene from '@/engine/ui/Scene';
import type { SceneId } from '@/engine/core/types';

// Game list per group. Unlocked games open directly; locked ones show a
// padlock until the account has group access (gate enforced again in
// GamePage). Lock status comes from `src/data/access.ts`.
/**
 * Pastel card backgrounds, assigned by POSITION in the list (keputusan pemilik
 * 2026-10-11: kartu game warna-warni, bukan putih). Seven colours, not six: the
 * grid is auto-fit, so a card's neighbour below is `i + columns` away — with 7
 * colours no two touching cards share a colour for 2–6 columns. Keep them pale:
 * the art is pastel and the dark title must stay readable.
 */
const CARD_TINTS = [
  '#ffe4d4', // peach
  '#d9f5e4', // mint
  '#ebe2fb', // lilac
  '#fff3c4', // butter
  '#dcedfc', // sky
  '#fde0ec', // pink
  '#d4f3ef', // aqua
];

/**
 * Latar halaman daftar game per kelompok (permintaan pemilik 2026-10-12:
 * TK dapat latar seperti SD Kelas 3 & 4, tapi tempatnya BEDA). SD Kelas 3 & 4
 * memakai `padang` di layar pilih mapel; TK memakai `hutan` — dunia Hutan
 * Hewan, langitnya hijau muda jadi langsung terbaca beda. SD Kelas 1 & 2
 * memakai `kota` (permintaan pemilik di sesi yang sama: tema lain lagi) —
 * jalan ke sekolah. Kelompok yang tak disebut tetap latar gradien bawaan.
 */
const GROUP_SCENE: Partial<Record<GroupId, SceneId>> = {
  tk: 'hutan',
  sd1: 'kota',
};

export default function GroupPage() {
  const { groupId, subjectId } = useParams<{ groupId: string; subjectId?: string }>();
  const group = groupsData.groups.find((g) => g.id === groupId && isGroupVisible(g));
  // Re-render when the tester flips the lock switch.
  useLockMode();
  // Kelompok yang sudah dibeli — menentukan gembok mana yang hilang.
  const ownedGroups = useOwnedGroups();

  if (!group) {
    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 22 }}>Kelompok tidak ditemukan.</p>
        <Link to="/portal" className="btn">
          <BackIcon /> Kembali
        </Link>
      </div>
    );
  }

  // Kelompok ber-mapel (SD kelas 3 ke atas): tanpa mapel di URL tampilkan
  // pemilih mapel; dengan mapel, daftar game mapel itu saja.
  const subjects = subjectsFor(group.id as GroupId);
  const subject = subjects?.find((s) => s.id === subjectId);
  if (subjects && !subjectId) return <SubjectPage group={group} subjects={subjects} />;
  if ((subjects && !subject) || (!subjects && subjectId)) {
    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 22 }}>Mata pelajaran tidak ditemukan.</p>
        <Link to={`/kelompok/${group.id}`} className="btn">
          <BackIcon /> Kembali
        </Link>
      </div>
    );
  }

  const games = gamesForGroup(group.id as GroupId, subject?.id);
  const heading = subject ? SUBJECT_STYLE[subject.id].title : group.title;
  const backTo = subject ? `/kelompok/${group.id}` : '/portal';

  // Label "GRATIS" hanya berarti kalau di layar ini MEMANG ada yang terkunci.
  // Di masa pra-rilis (mode 'buka') dan untuk orang tua yang sudah membeli
  // kelompok ini, semua game terbuka — menempelkan "GRATIS" di satu kartu di
  // situ cuma membingungkan, seolah yang lain berbayar padahal tidak.
  const anyLocked = games.some((g) => !canPlayGame(g.id, group.id, ownedGroups));

  const scene = subject ? undefined : GROUP_SCENE[group.id as GroupId];

  return (
    <div className="page" style={{ textAlign: 'center' }}>
      {scene && <Scene id={scene} />}
      <h1
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        {subject ? (
          <GroupPic
            dir="subjects"
            pic={SUBJECT_STYLE[subject.id].pic}
            emoji={SUBJECT_STYLE[subject.id].deco}
            height={56}
            emojiSize={40}
          />
        ) : (
          <GroupPic pic={group.pic} emoji={group.emoji} height={64} emojiSize={40} />
        )}
        {/* Non-breaking spaces so a wrapped title never strands "TK" or
            "& 2" alone on the second line (HP 320–380 px). */}
        <span>{heading.replace(/ & /g, '\u00a0&\u00a0').replace(/ (\S+)$/, '\u00a0$1')}</span>
      </h1>
      {games.length === 0 && (
        // Mapel yang belum punya game (kartunya pun tak bisa diketuk) — ini
        // cuma untuk yang datang lewat URL langsung.
        <p style={{ fontSize: 20, marginTop: 24 }}>Gamenya segera hadir! 🚧</p>
      )}
      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          marginTop: 16,
        }}
      >
        {games.map((game, i) => {
          const stars = getGameStars(game.id);
          const unlocked = canPlayGame(game.id, group.id, ownedGroups);
          return (
            <Link
              key={game.id}
              to={`/game/${game.id}`}
              className="btn"
              style={{
                flexDirection: 'column',
                padding: 20,
                position: 'relative',
                background: CARD_TINTS[i % CARD_TINTS.length],
              }}
            >
              {!unlocked && (
                <span style={{ position: 'absolute', top: 10, right: 12, fontSize: 22 }}>
                  🔒
                </span>
              )}
              {/* Pasangan dari gembok: memberi tahu orang tua mana yang boleh
                  dicoba tanpa membayar. Dijanjikan di CLAUDE.md ("Sistem Kunci
                  Game") dan di halaman Syarat & Ketentuan, jadi jangan
                  dihapus. */}
              {unlocked && anyLocked && isFreeGame(game.id) && (
                <span
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 12,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: '#2d7a2d',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: 0.3,
                  }}
                >
                  GRATIS
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
                {stars > 0 ? `⭐ ${stars}` : ''}
              </span>
            </Link>
          );
        })}
      </div>
      <p style={{ marginTop: 28 }}>
        <Link to={backTo} className="btn">
          <BackIcon /> Kembali
        </Link>
      </p>
      {/* Alat penguji: hanya tampil di mode penguji (?test=1). */}
      <div style={{ marginTop: 18 }}>
        <LockToggle />
      </div>
    </div>
  );
}
