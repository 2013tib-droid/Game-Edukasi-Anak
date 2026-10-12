import groupsData from '@/data/groups.json';
import { getTotalStars } from '@/engine/core/progress';
import MascotCard from '@/engine/ui/Mascot';
import TopBar from '@/portal/TopBar';
import GroupPic from '@/portal/GroupPic';
import Notebook, { type NotebookLook } from '@/portal/Notebook';
import { gamesForGroup, playCount } from '@/games/registry';
import type { GroupId } from '@/engine/core/types';
import { isGroupVisible } from '@/data/access';
import Scene from '@/engine/ui/Scene';
import '@/engine/ui/scene.css';
import './home.css';

// Sampul buku tulis per kelompok (Notebook.tsx, dirombak 2026-10-11 — versi
// gradien sebelumnya ikut bergaya kartu yang disalin dari situs lain).
// Kelompok tanpa entri jatuh ke tosca (bukan ungu — pemilik tak suka ungu).
const GROUP_LOOK: Record<string, NotebookLook> = {
  tk: { cover: '#e0688a', ink: '#b2405f', pattern: 'konfeti', doodles: ['★', '♥', '✿'] },
  sd1: { cover: '#ee8a2f', ink: '#b45f12', pattern: 'garis', doodles: ['A', '1', '+', 'b'] },
  sd2: { cover: '#3d86c6', ink: '#255f95', pattern: 'kotak', doodles: ['×', '÷', '3'] },
  sd3: { cover: '#4b9a68', ink: '#2f6f47', pattern: 'titik', doodles: ['½', '%', '△'] },
};
const FALLBACK_LOOK: NotebookLook = { cover: '#2a9d8f', ink: '#1d7268', pattern: 'bintang' };

// Portal home: pick a group. Kid-facing, so only big friendly buttons —
// account actions stay small and lead to the parent area.
export default function HomePage() {
  return (
    <>
      {/* Latar pemilih kelompok (2026-10-12): pegunungan — gerbang petualangan,
          sengaja beda dari hutan (tk), kota (sd1) & padang (sd2). */}
      <Scene id="gunung" />
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

      <div className="nb-shelf home-shelf">
        {groupsData.groups.filter(isGroupVisible).map((group) => {
          // Umur selalu bagian PERTAMA deskripsi (lihat "Penamaan Kelompok").
          const [age] = group.description.split(' · ');
          const count = playCount(gamesForGroup(group.id as GroupId));
          return (
            <Notebook
              key={group.id}
              look={GROUP_LOOK[group.id] ?? FALLBACK_LOOK}
              sticker={<GroupPic pic={group.pic} emoji={group.emoji} height={84} emojiSize={58} />}
              kicker={age}
              // NBSP: tak ada kata yatim ("TK", "2") di baris kedua — sama dengan GroupPage.
              name={group.title.replace(/ & /g, '\u00a0&\u00a0').replace(/ (\S+)$/, '\u00a0$1')}
              count={count}
              to={`/kelompok/${group.id}`}
              ariaLabel={group.title}
            />
          );
        })}
      </div>
      </div>
    </>
  );
}
