import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * Last line of defence against a white screen.
 *
 * Without this, one runtime error unmounts the whole React tree and the child
 * is left staring at a blank page with no way back — and no way to tell anyone
 * what happened. React only lets a CLASS component catch render errors, so this
 * stays a class even though everything else in the app is a function component.
 *
 * It sits OUTSIDE the router (see `main.tsx`) so it also catches errors thrown
 * by the router itself. That means no `<Link>` here: both buttons do a real
 * page load, which is also what actually fixes the most common cause — a lazy
 * chunk that failed to download on a flaky phone connection, or one whose file
 * disappeared because a new build was deployed while the app was open (every
 * deploy re-hashes every chunk, so the old file names 404).
 */
interface Props {
  children: ReactNode;
}

interface State {
  failed: boolean;
  /** The picture itself failed to load — fall back to the emoji. */
  artFailed: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false, artFailed: false };

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // No error-reporting service yet; this at least surfaces the stack when
    // the owner inspects a phone over USB debugging.
    console.error('[Petualangan Pintar] error tak tertangani:', error, info.componentStack);
  }

  render(): ReactNode {
    if (!this.state.failed) return this.props.children;

    const home = import.meta.env.BASE_URL;

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
        {/*
          Same graceful-degradation contract as `MascotPic`/`FeedbackPic`: this
          screen is shown precisely when something is already broken, so the art
          must never be the thing that keeps it from rendering. If the file is
          missing (deploy setengah jadi) or the phone is offline, the old emoji
          takes its place.
        */}
        {this.state.artFailed ? (
          <div style={{ fontSize: 72, lineHeight: 1 }} aria-hidden>
            🐣
          </div>
        ) : (
          <img
            src={`${home}assets/ui/tersendat.webp`}
            alt=""
            aria-hidden
            draggable={false}
            style={{ width: 180, maxWidth: '48vw', maxHeight: '40vh', height: 'auto' }}
            onError={() => {
              this.setState({ artFailed: true });
            }}
          />
        )}
        <h1 style={{ fontSize: 26, margin: 0 }}>Aduh, permainannya tersendat</h1>
        <p style={{ fontSize: 19, margin: 0, maxWidth: 360 }}>
          Bukan salahmu kok! Ayo coba buka lagi ya.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          <button
            className="btn btn--primary"
            type="button"
            onClick={() => {
              window.location.reload();
            }}
          >
            🔄 Coba Lagi
          </button>
          <a className="btn" href={home}>
            🏠 Beranda
          </a>
        </div>
      </div>
    );
  }
}
