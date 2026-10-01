/**
 * Announcements shown in the notification bell (landing page + portal).
 *
 * Pure typed data — adding news = adding an entry here, newest first.
 * `id` must be unique and STABLE: read/unread state is stored per id, so
 * changing an id makes an old item pop up as unread again.
 */
import type { GroupId } from '@/engine/core/types';

export type AnnouncementTag = 'baru' | 'update' | 'info' | 'promo';

/**
 * Who sees an entry:
 *   'semua'   — everyone, including visitors who never signed in (default).
 *   'pembeli' — buyers of ANY group; hidden from everyone else, badge included.
 *   a GroupId — buyers of THAT group only ('tk' = activated Playgroup dan TK).
 *               For news that only makes sense for one group, e.g. a welcome
 *               that names the group the parent just bought.
 *
 * News that should pull people back to the site (new games, promos) belongs to
 * 'semua': the people who most need to hear it are the ones who have not bought
 * yet. Reserve 'pembeli' for things a visitor cannot act on.
 */
export type Audience = 'semua' | 'pembeli' | GroupId;

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
 * `owned` = the groups this account has activated, read from
 * `users/{uid}.groups` by `NotificationBell` (empty for visitors and for
 * accounts that only signed in).
 */
export function announcementsFor(owned: readonly string[]): Announcement[] {
  return announcements.filter((a) => {
    const audience = a.audience ?? 'semua';
    if (audience === 'semua') return true;
    if (audience === 'pembeli') return owned.length > 0;
    return owned.includes(audience);
  });
}

/**
 * Newest first — the panel renders them in this order.
 *
 * Leave `audience` off for ordinary news; use `'pembeli'` (or one group id)
 * only for entries that would frustrate someone who has not bought it.
 */
export const announcements: Announcement[] = [
  // One welcome per group, each naming what the parent just bought. The
  // earlier single welcome ('a-2026-10-01-terima-kasih-pembeli') was replaced
  // by these two — do not reuse that id.
  {
    id: 'a-2026-10-01-selamat-datang-sd1',
    date: '2026-10-01',
    tag: 'info',
    audience: 'sd1',
    title: 'Terima kasih sudah bergabung di SD Kelas 1 & 2!',
    body:
      'Senang sekali si kecil ikut berpetualang bersama kami: membaca, ' +
      'berhitung, membaca jam, sampai mendengarkan cerita. Satu tips kecil: ' +
      'simpan situs ini di layar utama HP (buka menu browser, lalu pilih ' +
      '"Tambahkan ke layar utama"), supaya si kecil bisa langsung membukanya ' +
      'seperti aplikasi kesayangannya.',
  },
  {
    id: 'a-2026-10-01-selamat-datang-tk',
    date: '2026-10-01',
    tag: 'info',
    audience: 'tk',
    title: 'Terima kasih sudah bergabung di Playgroup dan TK!',
    body:
      'Senang sekali si kecil ikut berpetualang bersama kami: berhitung ' +
      'bersama hewan, mengenal huruf, warna, dan bentuk. Satu tips kecil: ' +
      'simpan situs ini di layar utama HP (buka menu browser, lalu pilih ' +
      '"Tambahkan ke layar utama"), supaya si kecil bisa langsung membukanya ' +
      'seperti aplikasi kesayangannya.',
  },
  // Daftar ini SENGAJA DIKOSONGKAN 2026-09-22 (keputusan pemilik, menjelang launching).
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
