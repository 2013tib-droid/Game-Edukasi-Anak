import { useEffect, useRef, useState } from 'react';
import { BellIcon } from '@/app/icons';
import { announcements, TAG_LABEL } from '@/data/announcements';
import { formatDate, getUnreadIds, markAllRead } from '@/portal/notifications';
import './notifications.css';

/**
 * Bell in the app header — announcements & updates for parents.
 *
 * Opening the panel marks everything read (badge clears), but the items that
 * were new stay highlighted while the panel is open so the parent can see
 * what changed instead of hunting for it.
 */
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState<string[]>([]);
  const [highlight, setHighlight] = useState<string[]>([]);
  const closeRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // localStorage is read after mount so the first render stays identical
  // for every visitor (and never touches storage during SSR/prerender).
  useEffect(() => setUnread(getUnreadIds()), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    // Tap anywhere outside closes. A fixed backdrop element cannot be used
    // here: the header's backdrop-filter makes it the containing block for
    // fixed children, so the overlay would only cover the header itself.
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setHighlight(unread);
    markAllRead();
    setUnread([]);
    setOpen(true);
    // Move focus into the panel for keyboard/screen-reader users.
    requestAnimationFrame(() => closeRef.current?.focus());
  }

  const count = unread.length;
  const isNew = (id: string) => highlight.includes(id);

  return (
    <div className="notif" ref={rootRef}>
      <button
        type="button"
        className={`notif__btn${count ? ' notif__btn--unread' : ''}${open ? ' notif__btn--open' : ''}`}
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={
          count ? `Pengumuman — ${count} kabar baru` : 'Pengumuman dan update terbaru'
        }
      >
        <BellIcon />
        {count > 0 && (
          <span className="notif__badge" aria-hidden="true">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="notif__panel" role="dialog" aria-label="Pengumuman dan update">
            <div className="notif__head">
              <div>
                <h2 className="notif__title">Pengumuman</h2>
                <p className="notif__sub">Kabar & update terbaru</p>
              </div>
              <button
                type="button"
                ref={closeRef}
                className="notif__close"
                onClick={() => setOpen(false)}
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            {announcements.length === 0 ? (
              <div className="notif__empty">
                <span aria-hidden="true">🔔</span>
                <p>Belum ada pengumuman baru.</p>
              </div>
            ) : (
              <ul className="notif__list">
                {announcements.map((a) => (
                  <li
                    key={a.id}
                    className={`notif__item${isNew(a.id) ? ' notif__item--new' : ''}`}
                  >
                    <div className="notif__meta">
                      <span className={`notif__tag notif__tag--${a.tag}`}>
                        {TAG_LABEL[a.tag]}
                      </span>
                      <span className="notif__date">{formatDate(a.date)}</span>
                      {isNew(a.id) && <span className="notif__dot" aria-label="Baru" />}
                    </div>
                    <h3>{a.title}</h3>
                    <p>{a.body}</p>
                  </li>
                ))}
              </ul>
            )}
        </div>
      )}
    </div>
  );
}
