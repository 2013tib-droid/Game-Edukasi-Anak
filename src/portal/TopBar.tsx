import { Link } from 'react-router-dom';
import { HomeIcon, UserIcon } from '@/app/icons';
import NotificationBell from '@/portal/NotificationBell';
import LockToggle from '@/portal/LockToggle';

/**
 * App header — one cohesive frosted bar shared by the landing and portal, so
 * the parent-facing controls (back to home, announcements, account) read as a
 * single, calm, professional unit instead of floating candy pills.
 */
export default function TopBar({
  back = false,
  accountTo,
  accountLabel,
  bell = true,
}: {
  back?: boolean;
  accountTo?: string;
  accountLabel?: string;
  /** Announcement bell — on by default; hide it on kid-only screens. */
  bell?: boolean;
}) {
  return (
    <header className="topbar">
      <div className="topbar__side">
        {back && (
          <Link className="topbar__btn" to="/">
            <HomeIcon />
            Beranda
          </Link>
        )}
      </div>
      <div className="topbar__side topbar__side--right">
        <LockToggle />
        {bell && <NotificationBell />}
        {accountTo && accountLabel && (
          <Link className="topbar__btn topbar__btn--account" to={accountTo}>
            <UserIcon />
            {accountLabel}
          </Link>
        )}
      </div>
    </header>
  );
}
