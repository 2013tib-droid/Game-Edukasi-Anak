import { Link } from 'react-router-dom';
import gamesData from '../data/games.json';

export default function HomePage() {
  return (
    <section className="page">
      <h1 className="page-title">Mau main yang mana?</h1>
      <div className="group-grid">
        {gamesData.groups.map((group) => (
          <Link
            key={group.id}
            to={`/kelompok/${group.id}`}
            className="group-card"
            style={{ '--card-color': group.color }}
          >
            <span className="group-emoji" aria-hidden="true">{group.emoji}</span>
            <span className="group-title">{group.title}</span>
            <span className="group-subtitle">{group.subtitle}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
