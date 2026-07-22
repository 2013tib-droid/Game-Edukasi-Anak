import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import groupsData from '@/data/groups.json';
import { getTotalStars } from '@/engine/core/progress';
import MascotCard from '@/engine/ui/Mascot';

// Portal home: pick a group. Kid-facing, so only big friendly buttons —
// account actions stay small and lead to the parent area.
export default function HomePage() {
  const { user } = useAuth();

  return (
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
            <span style={{ fontSize: 48 }} aria-hidden>
              {group.emoji}
            </span>
            <span style={{ fontSize: 24 }}>{group.title}</span>
            <span style={{ fontSize: 16, fontWeight: 400 }}>{group.description}</span>
          </Link>
        ))}
      </div>

      <p style={{ marginTop: 32 }}>
        {user ? (
          <Link to="/aktivasi">Punya kode aktivasi?</Link>
        ) : (
          <Link to="/masuk">Masuk akun orang tua</Link>
        )}
      </p>
    </div>
  );
}
