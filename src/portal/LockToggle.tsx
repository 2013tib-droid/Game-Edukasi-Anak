import { getLockMode, setLockMode } from '@/data/access';
import { useLockMode, useTestMode } from '@/portal/useAccess';
import './lock-toggle.css';

/**
 * Saklar buka/tutup kunci game — ALAT PENGUJI, bukan fitur untuk orang tua.
 *
 * Hanya tampil saat mode penguji aktif (dev server, atau setelah membuka URL
 * `?test=1`; matikan lagi dengan `?test=0`). Perubahannya langsung terasa di
 * daftar game & layar game, tanpa reload dan tanpa build ulang.
 */
export default function LockToggle() {
  const testMode = useTestMode();
  const mode = useLockMode();

  if (!testMode) return null;

  const locked = mode === 'kunci';

  return (
    <button
      type="button"
      className={`lock-toggle${locked ? ' lock-toggle--locked' : ''}`}
      onClick={() => {
        setLockMode(getLockMode() === 'buka' ? 'kunci' : 'buka');
      }}
      aria-pressed={locked}
      title={
        locked
          ? 'Mode rilis: hanya Hutan Hewan gratis. Ketuk untuk membuka semua game.'
          : 'Semua game terbuka. Ketuk untuk mengunci seperti saat rilis.'
      }
    >
      <span className="lock-toggle__icon" aria-hidden>
        {locked ? '🔒' : '🔓'}
      </span>
      <span className="lock-toggle__text">{locked ? 'Terkunci' : 'Terbuka'}</span>
    </button>
  );
}
