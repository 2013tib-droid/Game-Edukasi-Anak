import { useState } from 'react';
import { Link } from 'react-router-dom';
import gamesData from '../data/games.json';
import { totalStars } from '../engine/core/progress.js';
import { mascotFor } from '../engine/core/mascot.js';

export default function HomePage() {
  // Read once per visit; star totals only change while inside a game.
  const [stars] = useState(totalStars);
  const mascot = mascotFor(stars);
  const nextProgress = mascot.next
    ? Math.min(100, Math.round(((stars - mascot.min) / (mascot.next.min - mascot.min)) * 100))
    : 100;

  return (
    <section className="page">
      <div className="mascot-card">
        <span className="mascot-emoji" aria-hidden="true">{mascot.emoji}</span>
        <div className="mascot-info">
          <span className="mascot-name">{mascot.name}</span>
          <span className="mascot-level">Level {mascot.level} · ⭐ {stars}</span>
          <div className="progress-track mascot-progress">
            <div className="progress-fill" style={{ width: `${nextProgress}%` }} />
          </div>
          <span className="mascot-next">
            {mascot.next
              ? `${mascot.next.min - stars} ⭐ lagi jadi ${mascot.next.emoji}`
              : '🏆 Level tertinggi!'}
          </span>
        </div>
      </div>

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
