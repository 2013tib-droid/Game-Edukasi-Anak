import { Link } from 'react-router-dom';
import Layout from '../app/Layout';
import groups from '../data/groups.json';

export default function HomePage() {
  return (
    <Layout>
      <h1 style={{ textAlign: 'center' }}>🌈 Game Edukasi Anak</h1>
      <p style={{ textAlign: 'center' }}>Pilih kelompok belajarmu, yuk!</p>
      <div className="group-grid">
        {groups.map((group) => (
          <Link key={group.id} className="card group-card" to={`/kelompok/${group.id}`}>
            <div className="group-emoji">{group.emoji}</div>
            <h2>{group.title}</h2>
            <p>{group.description}</p>
          </Link>
        ))}
      </div>
    </Layout>
  );
}
