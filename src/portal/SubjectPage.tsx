import { Link } from 'react-router-dom';
import type { GroupId } from '@/engine/core/types';
import { SUBJECT_STYLE, type GroupSubject } from '@/data/subjects';
import { gamesForGroup } from '@/games/registry';
import GroupPic from '@/portal/GroupPic';
import BackIcon from '@/engine/ui/BackIcon';
import LockToggle from '@/portal/LockToggle';
import { greeting } from '@/portal/childName';
import './subjects.css';

interface Props {
  group: { id: string; title: string; emoji: string; pic?: string };
  subjects: readonly GroupSubject[];
}

/**
 * "Pilih Mata Pelajaran" — layar pertama kelompok SD kelas 3 ke atas
 * (mockup pemilik 2026-10-05). Kartu berwarna per mapel; yang belum punya
 * game tampil "Segera hadir" dan tidak bisa diketuk.
 *
 * Yang SENGAJA tidak diambil dari mockup: tombol "Keluar" — ini area anak, dan
 * satu ketukan tak sengaja akan mengunci lagi game yang sudah dibayar. Keluar
 * tetap di menu Akun orang tua.
 */
export default function SubjectPage({ group, subjects }: Props) {
  return (
    <div className="page subj-page">
      <div className="subj-head">
        <span className="subj-group">
          <GroupPic pic={group.pic} emoji={group.emoji} height={34} emojiSize={24} />
          {group.title}
        </span>
        <span className="subj-hello">{greeting()} 👋</span>
      </div>
      <h1 className="subj-title">Pilih Mata Pelajaran</h1>
      <p className="subj-sub">Pilih petualangan belajar yang ingin kamu mulai hari ini!</p>

      <div className="subj-grid">
        {subjects.map((s) => {
          const style = SUBJECT_STYLE[s.id];
          const count = gamesForGroup(group.id as GroupId, s.id).length;
          const soon = count === 0;
          const body = (
            <>
              <span className="subj-tag">{style.tag}</span>
              <span className="subj-name">{style.title}</span>
              <span className="subj-desc">{s.description}</span>
              <span className={soon ? 'subj-cta subj-cta--soon' : 'subj-cta'}>
                {soon ? 'Segera hadir' : `${count} game · Mulai Belajar →`}
              </span>
              <span className="subj-deco" aria-hidden>
                {style.deco}
              </span>
            </>
          );
          const cardStyle = {
            background: `linear-gradient(135deg, ${style.from}, ${style.to})`,
            ['--subj-ink' as string]: style.from,
          };
          return soon ? (
            <div
              key={s.id}
              className="subj-card subj-card--soon"
              style={cardStyle}
              aria-label={`${style.title} — segera hadir`}
            >
              {body}
            </div>
          ) : (
            <Link
              key={s.id}
              to={`/kelompok/${group.id}/${s.id}`}
              className="subj-card"
              style={cardStyle}
            >
              {body}
            </Link>
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
