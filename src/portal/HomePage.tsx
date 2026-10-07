import { Link } from 'react-router-dom';
import groupsData from '@/data/groups.json';
import { getTotalStars } from '@/engine/core/progress';
import MascotCard from '@/engine/ui/Mascot';
import TopBar from '@/portal/TopBar';
import GroupPic from '@/portal/GroupPic';
import { isGroupVisible } from '@/data/access';
import './home.css';

// Warna & hiasan kartu per kelompok — bahasa rupa yang sama dengan kartu mapel
// SD 3-4 (SUBJECT_STYLE). Kelompok tanpa entri jatuh ke ungu.
const GROUP_STYLE: Record<string, { from: string; to: string; deco: [string, string] }> = {
  tk: { from: '#c43c7b', to: '#e2668f', deco: ['🎈', '⭐'] },
  sd1: { from: '#c45a12', to: '#e5861f', deco: ['✏️', '📖'] },
  sd2: { from: '#4f56d6', to: '#7a6cf0', deco: ['🔢', '🌿'] },
  sd3: { from: '#2b8a47', to: '#47a95a', deco: ['🔬', '🌏'] },
};
const FALLBACK_STYLE = { from: '#8445d0', to: '#a45fe4', deco: ['⭐', '✨'] as [string, string] };

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

      <div className="home-grid">
        {groupsData.groups.filter(isGroupVisible).map((group) => {
          const style = GROUP_STYLE[group.id] ?? FALLBACK_STYLE;
          // Umur selalu bagian PERTAMA deskripsi (lihat "Penamaan Kelompok").
          const [age, ...rest] = group.description.split(' · ');
          return (
            <Link
              key={group.id}
              to={`/kelompok/${group.id}`}
              className="home-card"
              style={{
                background: `linear-gradient(135deg, ${style.from}, ${style.to})`,
                ['--home-ink' as string]: style.from,
              }}
            >
              <span className="home-card__deco home-card__deco--a" aria-hidden>
                {style.deco[0]}
              </span>
              <span className="home-card__deco home-card__deco--b" aria-hidden>
                {style.deco[1]}
              </span>
              <span className="home-card__text">
                <span className="home-card__tag">{age}</span>
                <span className="home-card__title">
                  {/* NBSP: tak ada kata yatim ("TK", "2") di baris kedua — sama dengan GroupPage. */}
                  {group.title.replace(/ & /g, '\u00a0&\u00a0').replace(/ (\S+)$/, '\u00a0$1')}
                </span>
                {rest.length > 0 && <span className="home-card__desc">{rest.join(' · ')}</span>}
                <span className="home-card__cta">Mulai Belajar →</span>
              </span>
              <span className="home-card__art" aria-hidden>
                <GroupPic pic={group.pic} emoji={group.emoji} height={88} emojiSize={52} />
              </span>
            </Link>
          );
        })}
      </div>
      </div>
    </>
  );
}
