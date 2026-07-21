import { mascotFor } from '@/engine/core/mascot';

/**
 * Mascot companion card — shows the current creature, its level, and a bar
 * toward the next evolution. Used on the portal home and game finish screens.
 * Self-contained inline styles so it drops into any page without CSS wiring.
 */
export default function MascotCard({ totalStars }: { totalStars: number }) {
  const m = mascotFor(totalStars);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: 'rgba(255,255,255,0.9)',
        borderRadius: 24,
        padding: 16,
        boxShadow: '0 5px 0 rgba(0,0,0,0.12)',
        maxWidth: 420,
        width: '100%',
        margin: '0 auto',
        textAlign: 'left',
      }}
    >
      <div style={{ fontSize: 56, lineHeight: 1 }} aria-hidden>
        {m.stage.emoji}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 20 }}>{m.stage.name}</div>
        <div style={{ fontSize: 15, opacity: 0.7 }}>
          Level {m.level} · ⭐ {totalStars}
        </div>
        {m.next ? (
          <>
            <div
              style={{
                background: '#eee',
                borderRadius: 999,
                height: 12,
                marginTop: 6,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${m.progressPct}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg,#ffc93c,#ff8a5c)',
                  transition: 'width .4s',
                }}
              />
            </div>
            <div style={{ fontSize: 13, marginTop: 4, opacity: 0.7 }}>
              {m.toNext} ⭐ lagi jadi {m.next.emoji} {m.next.name}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 14, marginTop: 4 }}>🏆 Level tertinggi!</div>
        )}
      </div>
    </div>
  );
}
