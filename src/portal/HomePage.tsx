import { Link } from 'react-router-dom';
import groupsData from '@/data/groups.json';
import { getTotalStars } from '@/engine/core/progress';
import MascotCard from '@/engine/ui/Mascot';
import TopBar from '@/portal/TopBar';
import GroupPic from '@/portal/GroupPic';
import { isGroupVisible } from '@/data/access';

// Portal home: pick a group. Kid-facing, so only big friendly buttons —
// account actions stay small and lead to the parent area.
export default function HomePage() {
  return (
    <>
      <TopBar back account />
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
        {groupsData.groups.filter(isGroupVisible).map((group) => (
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
