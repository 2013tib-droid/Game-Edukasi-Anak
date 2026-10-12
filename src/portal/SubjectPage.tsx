import { Link } from 'react-router-dom';
import type { GroupId } from '@/engine/core/types';
import { SUBJECT_STYLE, type GroupSubject } from '@/data/subjects';
import { gamesForGroup, subjectPath } from '@/games/registry';
import { getTotalStars } from '@/engine/core/progress';
import { mascotFor } from '@/engine/core/mascot';
import { MascotPic } from '@/engine/ui/Mascot';
import GroupPic from '@/portal/GroupPic';
import Notebook from '@/portal/Notebook';
import BackIcon from '@/engine/ui/BackIcon';
import LockToggle from '@/portal/LockToggle';
import { greeting } from '@/portal/childName';
import Scene from '@/engine/ui/Scene';
import '@/engine/ui/scene.css';
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
      <Scene id="padang" />
      <SignTitle group={group} />

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
              count={count}
              to={count === 0 ? null : subjectPath(group.id as GroupId, s.id)}
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

/**
 * Papan kayu bertuliskan nama kelompok. "SD Kelas 3 & 4" dipecah: kata di
 * baris atas, nomor kelasnya besar & jingga di bawah — anak SD mengenali
 * "3 & 4"-nya, bukan kalimatnya. Judul tanpa angka tampil satu baris.
 */
function SignTitle({ group }: { group: Props['group'] }) {
  const m = /^(.*?)\s*(\d.*)$/.exec(group.title);
  return (
    <div className="subj-sign" role="img" aria-label={group.title}>
      <span className="subj-sign__pic" aria-hidden>
        <GroupPic pic={group.pic} emoji={group.emoji} height={58} emojiSize={40} />
      </span>
      <span className="subj-sign__text" aria-hidden>
        {m ? (
          <>
            <span className="subj-sign__top">{m[1]}</span>
            <span className="subj-sign__big">
              <span className="subj-sign__spark">✦</span>
              {m[2].replace(/ & /g, '\u00a0&\u00a0')}
              <span className="subj-sign__spark subj-sign__spark--b">✦</span>
            </span>
          </>
        ) : (
          <span className="subj-sign__top">{group.title}</span>
        )}
      </span>
    </div>
  );
}
