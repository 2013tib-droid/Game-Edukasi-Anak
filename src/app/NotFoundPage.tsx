import { Link } from 'react-router-dom';

/**
 * Catch-all for URLs that match no route: a mistyped address, an old bookmark,
 * or a game id that no longer exists. Without it the router renders nothing and
 * the visitor gets an empty page with no way out.
 *
 * Imported eagerly (every other page is lazy) because this screen has to work
 * precisely when something is already off — a lazy chunk could fail to load too,
 * and it only costs a few hundred bytes.
 *
 * Styling is inline on purpose, like `SplashScreen` and `ErrorBoundary`: the
 * `.game-center` classes live in `engine.css`, which only ships with the game
 * chunk, so a visitor landing straight on a bad URL would see them unstyled.
 * `.btn` is safe — that one is in `global.css`.
 */
export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 72, lineHeight: 1 }} aria-hidden>
        🗺️
      </div>
      <h1 style={{ fontSize: 26, margin: 0 }}>Halaman tidak ditemukan</h1>
      <p style={{ fontSize: 19, margin: 0, maxWidth: 360 }}>
        Sepertinya kita tersesat. Ayo kembali ke jalan yang benar!
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
        <Link to="/portal" className="btn btn--primary">
          🎮 Pilih Game
        </Link>
        <Link to="/" className="btn">
          🏠 Beranda
        </Link>
      </div>
    </div>
  );
}
