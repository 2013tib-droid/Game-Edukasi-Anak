import { Link } from 'react-router-dom';
import { HomeIcon, UserIcon } from '@/app/icons';
import { useAuth } from '@/auth/AuthContext';
import NotificationBell from '@/portal/NotificationBell';
import LockToggle from '@/portal/LockToggle';

/**
 * App header — one cohesive frosted bar shared by the landing and portal, so
 * the parent-facing controls (back to home, announcements, account) read as a
 * single, calm, professional unit instead of floating candy pills.
 *
 * TOMBOL AKUN DIPUTUSKAN DI SINI, BUKAN DI HALAMAN PEMANGGILNYA. Dulu landing
 * & portal masing-masing mengoper label dan tujuannya sendiri — dan landing
 * SELALU menulis "Orang Tua" → /masuk, walaupun orang tuanya sudah masuk.
 * Jadi begitu pembeli menekan "Beranda" sesudah aktivasi, satu-satunya
 * petunjuk akun di layar berubah jadi ajakan masuk lagi: terbaca persis
 * seperti keluar sendiri (laporan pemilik 2026-09-22). Satu sumber keputusan
 * = dua layar itu tidak bisa menyimpang lagi.
 */
export default function TopBar({
  back = false,
  account = false,
  bell = true,
}: {
  back?: boolean;
  /** Tampilkan tombol akun (landing & portal). */
  account?: boolean;
  /** Announcement bell — on by default; hide it on kid-only screens. */
  bell?: boolean;
}) {
  const { user, loading } = useAuth();

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
        {/* Selagi status akun belum diketahui, tombolnya belum digambar sama
            sekali. Menggambar "Orang Tua" dulu lalu menukarnya jadi "Akun"
            berarti setiap pemuatan halaman berkedip memperlihatkan keadaan
            keluar — keluhan yang sama dalam bentuk yang lebih kecil. */}
        {account && !loading && (
          <Link
            className="topbar__btn topbar__btn--account"
            to={user ? '/aktivasi' : '/masuk'}
          >
            <UserIcon />
            {user ? 'Akun' : 'Orang Tua'}
          </Link>
        )}
      </div>
    </header>
  );
}
