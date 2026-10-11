import { Link } from 'react-router-dom';
import type { GroupId } from '@/engine/core/types';
import { SUBJECT_STYLE, type GroupSubject } from '@/data/subjects';
import { gamesForGroup } from '@/games/registry';
import { getTotalStars } from '@/engine/core/progress';
import { mascotFor } from '@/engine/core/mascot';
import { MascotPic } from '@/engine/ui/Mascot';
import GroupPic from '@/portal/GroupPic';
import Notebook from '@/portal/Notebook';
import BackIcon from '@/engine/ui/BackIcon';
import LockToggle from '@/portal/LockToggle';
import { greeting } from '@/portal/childName';
import './subjects.css';

interface Props {
  group: { id: string; title: string; emoji: string; pic?: string };
  subjects: readonly GroupSubject[];
}

/**
 * Layar pertama kelompok SD kelas 3 ke atas: "rak buku pelajaran"
 * (dirombak 2026-10-11). Maskot anak SAAT INI menyapa lewat balon kata, lalu
 * tiap mapel tampil sebagai buku tulis (Notebook.tsx). Mapel tanpa game
 * = buku berselotip "Segera hadir" yang tak bisa diketuk.
 *
 * Tombol "Keluar" SENGAJA tidak ada — ini area anak, dan satu ketukan tak
 * sengaja akan mengunci lagi game yang sudah dibayar. Keluar tetap di menu
 * Akun orang tua.
 */
export default function SubjectPage({ group, subjects }: Props) {
  const mascot = mascotFor(getTotalStars()).stage;
  return (
    <div className="page subj-page">
      <p className="subj-group">
        <GroupPic pic={group.pic} emoji={group.emoji} height={30} emojiSize={22} />
        {group.title}
      </p>

      <div className="subj-hello">
        <span className="subj-hello__buddy" aria-hidden>
          <MascotPic stage={mascot} className="subj-hello__img" />
        </span>
        <div className="subj-hello__bubble">
          <span className="subj-hello__name">{greeting()}</span>
          <h1 className="subj-hello__ask">Mau buka buku apa hari ini?</h1>
        </div>
      </div>

      <div className="nb-shelf nb-shelf--3">
        {subjects.map((s) => {
          const style = SUBJECT_STYLE[s.id];
          const count = gamesForGroup(group.id as GroupId, s.id).length;
          return (
            <Notebook
              key={s.id}
              look={style.look}
              sticker={<GroupPic dir="subjects" pic={style.pic} emoji={style.deco} height={84} emojiSize={58} />}
              kicker={style.tag}
              name={style.title}
              desc={s.description}
              count={count}
              to={count === 0 ? null : `/kelompok/${group.id}/${s.id}`}
              ariaLabel={count === 0 ? undefined : `${style.title}, ${count} game`}
            />
          );
        })}
      </div>

      <p style={{ marginTop: 28, textAlign: 'center' }}>
        <Link to="/portal" className="btn">
          <BackIcon /> Kembali
        </Link>
      </p>
      <div style={{ marginTop: 18, textAlign: 'center' }}>
        <LockToggle />
      </div>
    </div>
  );
}
