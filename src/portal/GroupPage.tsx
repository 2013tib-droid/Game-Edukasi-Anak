import { Link, useParams } from 'react-router-dom';
import groupsData from '@/data/groups.json';

// Game list per group. Phase 2+ fills this from each group's game registry;
// premium games are gated at launch time (online access check), free demos open.
export default function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const group = groupsData.groups.find((g) => g.id === groupId);

  if (!group) {
    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 22 }}>Kelompok tidak ditemukan.</p>
        <Link to="/" className="btn">
          ⬅️ Kembali
        </Link>
      </div>
    );
  }

  return (
    <div className="page" style={{ textAlign: 'center' }}>
      <h1>
        {group.emoji} {group.title}
      </h1>
      <p style={{ fontSize: 20 }}>Daftar game akan muncul di sini (Fase 2–4).</p>
      <Link to="/" className="btn">
        ⬅️ Kembali
      </Link>
    </div>
  );
}
