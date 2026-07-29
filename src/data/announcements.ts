/**
 * Announcements shown in the notification bell (landing page + portal).
 *
 * Pure typed data — adding news = adding an entry here, newest first.
 * `id` must be unique and STABLE: read/unread state is stored per id, so
 * changing an id makes an old item pop up as unread again.
 */
export type AnnouncementTag = 'baru' | 'update' | 'info' | 'promo';

/**
 * Who sees an entry:
 *   'semua'   — everyone, including visitors who never signed in (default).
 *   'pembeli' — buyers only; hidden from visitors and never counted in the badge.
 *
 * News that should pull people back to the site (new games, promos) belongs to
 * 'semua': the people who most need to hear it are the ones who have not bought
 * yet. Reserve 'pembeli' for things a visitor cannot act on.
 */
export type Audience = 'semua' | 'pembeli';

export interface Announcement {
  id: string;
  /** ISO date (YYYY-MM-DD) — shown as "28 Jul 2026". */
  date: string;
  tag: AnnouncementTag;
  title: string;
  body: string;
  /** Defaults to 'semua' when omitted. */
  audience?: Audience;
}

/** Label + colour class per tag (colours live in notifications.css). */
export const TAG_LABEL: Record<AnnouncementTag, string> = {
  baru: 'Game Baru',
  update: 'Update',
  info: 'Info',
  promo: 'Promo',
};

/**
 * The entries a given reader may see, newest first.
 *
 * `isBuyer` is currently "signed in", because purchases do not exist yet
 * (Fase 5). When activation codes land, pass real group ownership instead —
 * this function does not need to change.
 */
export function announcementsFor(isBuyer: boolean): Announcement[] {
  return announcements.filter((a) => (a.audience ?? 'semua') === 'semua' || isBuyer);
}

/**
 * Newest first — the panel renders them in this order.
 *
 * Leave `audience` off for ordinary news; add `audience: 'pembeli'` only for
 * entries that would frustrate someone who has not bought yet.
 */
export const announcements: Announcement[] = [
  {
    id: 'a-2026-07-28-jalan-kendaraan',
    date: '2026-07-28',
    tag: 'baru',
    title: 'Game baru: Jalan Kendaraan 🚗',
    body: 'Antar mobil, ambulans, dan traktor ke tujuannya dengan menyusuri jalan pakai satu jari. Melatih motorik halus untuk persiapan menulis.',
  },
  {
    id: 'a-2026-07-28-lanjut-main',
    date: '2026-07-28',
    tag: 'update',
    title: 'Permainan bisa dilanjutkan',
    body: 'Kalau keluar di tengah permainan, sekarang bisa lanjut dari level terakhir dengan soal yang sama. Bintang yang sudah didapat tetap aman.',
  },
  {
    id: 'a-2026-07-27-soal-baru',
    date: '2026-07-27',
    tag: 'update',
    title: 'Soal baru di Labirin Warna & Taman Huruf',
    body: 'Tambah 7 bangun datar baru (trapesium, segienam, bulan sabit, dan lainnya) serta puluhan soal huruf baru supaya anak tidak cepat bosan.',
  },
  {
    id: 'a-2026-07-26-harga-perkenalan',
    date: '2026-07-26',
    tag: 'promo',
    title: 'Harga perkenalan kelompok TK',
    body: 'Kelompok Playgroup & TK sedang Rp19.000 dari Rp39.000. Sekali bayar, main selamanya, tanpa langganan bulanan.',
  },
  {
    id: 'a-2026-07-26-pasar-buah',
    date: '2026-07-26',
    tag: 'info',
    title: 'Pasar Buah jadi lebih lengkap',
    body: 'Game Hitung Buah dilebur ke Pasar Buah: sekarang satu dunia buah berisi 14 jenis buah dengan soal hitung, tebak bayangan, dan kartu kembar.',
  },
];
