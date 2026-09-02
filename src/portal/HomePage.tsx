import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import groupsData from '@/data/groups.json';
import { getTotalStars } from '@/engine/core/progress';
import MascotCard from '@/engine/ui/Mascot';
import TopBar from '@/portal/TopBar';

/**
 * Group icon: the owner's art (public/assets/groups/<pic>.webp), falling back
 * to the emoji if the file is missing — same contract as `MascotPic`. Groups
 * whose art is not drawn yet carry no `pic`, so they render the emoji without
 * ever requesting a file that would 404.
 *
 * The picture is sized by HEIGHT with `width: auto`: the art is cropped tight
 * to the drawing, so each file has its own aspect ratio and a fixed box would
 * squash one of them.
 */
function GroupPic({ pic, emoji }: { pic?: string; emoji: string }) {
  const [failed, setFailed] = useState(false);
  if (!pic || failed) return <span style={{ fontSize: 48 }}>{emoji}</span>;
  return (
    <img
      src={`${import.meta.env.BASE_URL}assets/groups/${pic}.webp`}
      alt=""
      style={{ height: 88, width: 'auto' }}
      onError={() => setFailed(true)}
    />
  );
}

// Portal home: pick a group. Kid-facing, so only big friendly buttons —
// account actions stay small and lead to the parent area.
export default function HomePage() {
  const { user } = useAuth();

  return (
    <>
      <TopBar
        back
        accountTo={user ? '/aktivasi' : '/masuk'}
        accountLabel={user ? 'Aktivasi' : 'Orang Tua'}
      />
      <div className="page" style={{ textAlign: 'center' }}>
      {/* Same logo badge as the landing page (public/assets/logo.svg). */}
      <img
        src={`${import.meta.env.BASE_URL}assets/logo.svg`}
        alt=""
        width={104}
        height={104}
        style={{ display: 'block', margin: '0 auto 4px' }}
      />
      <h1 style={{ fontSize: 32, margin: 0 }}>Petualangan Pintar</h1>
      <p style={{ fontSize: 20 }}>Pilih kelompok belajarmu!</p>

      <div style={{ marginTop: 16 }}>
        <MascotCard totalStars={getTotalStars()} />
      </div>

      <div style={{ display: 'grid', gap: 20, marginTop: 24 }}>
        {groupsData.groups.map((group) => (
          <Link
            key={group.id}
            to={`/kelompok/${group.id}`}
            className="btn"
            style={{ flexDirection: 'column', padding: 24 }}
          >
            <span aria-hidden>
              <GroupPic pic={group.pic} emoji={group.emoji} />
            </span>
            <span style={{ fontSize: 24 }}>{group.title}</span>
            <span style={{ fontSize: 16, fontWeight: 400 }}>{group.description}</span>
          </Link>
        ))}
      </div>
      </div>
    </>
  );
}
