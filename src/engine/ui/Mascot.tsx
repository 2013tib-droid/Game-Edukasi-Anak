import { useState } from 'react';
import { mascotFor, mascotImageUrl, type MascotStage } from '@/engine/core/mascot';
import '@/engine/ui/mascot.css';

/**
 * One mascot stage as a picture, falling back to its emoji if the asset is
 * missing — same graceful-degradation contract as `ItemPic` for board items.
 */
function MascotPic({ stage, className }: { stage: MascotStage; className: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{stage.emoji}</>;
  return (
    <img
      className={className}
      src={mascotImageUrl(stage)}
      alt={stage.name}
      onError={() => setFailed(true)}
    />
  );
}

/**
 * Mascot companion panel — shows the current creature, its level, and a bar
 * toward the next evolution. Used on the portal home and game finish screens.
 *
 * It is a STATUS display, not a control: styled as a soft dashed info card
 * (see mascot.css) so it can't be mistaken for the big tappable buttons that
 * sit next to it.
 */
export default function MascotCard({ totalStars }: { totalStars: number }) {
  const m = mascotFor(totalStars);
  return (
    <section className="mascot-panel" aria-label="Perkembangan maskot">
      <div className="mascot-panel__avatar" aria-hidden>
        <MascotPic stage={m.stage} className="mascot-panel__img" />
      </div>
      <div className="mascot-panel__info">
        <div className="mascot-panel__eyebrow">
          <span>Teman belajarmu</span>
          <span className="mascot-panel__stars">⭐ {totalStars}</span>
        </div>
        <div className="mascot-panel__name">
          {m.stage.name}
          <span className="mascot-panel__level">Level {m.level}</span>
        </div>
        {m.next ? (
          <>
            <div className="mascot-panel__bar">
              <span className="mascot-panel__fill" style={{ width: `${m.progressPct}%` }} />
            </div>
            <div className="mascot-panel__hint">
              <strong>{m.toNext} ⭐</strong> lagi jadi{' '}
              <MascotPic stage={m.next} className="mascot-panel__next-img" /> {m.next.name}
            </div>
          </>
        ) : (
          <div className="mascot-panel__hint">🏆 Sudah level tertinggi!</div>
        )}
      </div>
    </section>
  );
}
