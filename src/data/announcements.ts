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
  // SENGAJA KOSONG sejak 2026-09-22 (keputusan pemilik, menjelang launching).
  //
  // Tiga belas pengumuman lama dibuang seluruhnya: isinya catatan pengerjaan
  // pra-rilis ("game baru ditambahkan", "soal diperbanyak") yang ditulis saat
  // belum ada pembeli sama sekali. Orang tua yang baru membuka situsnya di hari
  // pertama akan membaca riwayat pembangunan, bukan kabar — dan lonceng
  // berbadge 13 di layar jualan terbaca seperti app yang sudah lama jalan
  // tanpa mereka.
  //
  // Lonceng & panelnya TIDAK dimatikan: daftar kosong menampilkan "Belum ada
  // pengumuman baru." (`notif__empty` di NotificationBell), jadi tempatnya
  // sudah siap begitu ada kabar sungguhan.
  //
  // Menambah kabar sesudah launching = menambah satu entri di sini, terbaru di
  // atas. Aturan lamanya tetap berlaku:
  //   - `id` unik & TIDAK boleh diubah (status sudah-dibaca disimpan per id).
  //     JANGAN memakai ulang id pengumuman lama yang dibuang — pembaca yang
  //     sudah pernah membukanya tidak akan melihat yang baru.
  //   - `audience` dikosongkan untuk kabar biasa; `'pembeli'` hanya untuk hal
  //     yang tak bisa ditindaklanjuti pengunjung.
];
