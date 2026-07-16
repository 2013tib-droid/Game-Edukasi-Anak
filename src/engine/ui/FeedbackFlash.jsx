// Fullscreen, short-lived feedback. Wrong answers are always encouraging —
// never punishing (see CLAUDE.md kids UX rules).
export default function FeedbackFlash({ kind }) {
  if (!kind) return null;
  return (
    <div className={`feedback-flash feedback-${kind}`} aria-hidden="true">
      {kind === 'correct' ? '⭐ Hebat!' : '💪 Coba lagi, kamu pasti bisa!'}
    </div>
  );
}
