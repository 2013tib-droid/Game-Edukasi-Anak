import type { GameConfig } from '@/engine/core/types';
import { photoSlot } from '@/games/spotLevels';

/**
 * "Mata Jeli" (SD Kelas 3 & 4, IPAS) — saudara paling sulit "Cari Beda" (TK)
 * & "Teliti Gambar" (SD 1-2), template `spot-diff`. Masuk IPAS karena yang
 * dilatih MENGAMATI dengan teliti — keterampilan inti IPAS (keputusan
 * pemilik).
 *
 * SEMUA soalnya di atas LUKISAN utuh dari Gemini (`SPOT_PHOTOS`): satu
 * gambar ramai, perbedaannya tempelan yang dibuat dari gambar itu sendiri
 * (`scripts/spot-photo/`). Lima lukisan bergiliran: perkemahan, sekolah,
 * pasar, pantai, sawah — tiga varian per lukisan.
 *
 * SLOT (urutan tetap)
 *   l9    enam perbedaan
 *   l10   RAHASIA, tujuh perbedaan (anak menekan "Sudah semua!" sendiri)
 *
 * l1–l8 (gambar engine: latar + benda tempel) DIHAPUS 2026-11-02 —
 * keputusan pemilik: untuk kelas 3-4 gambar engine kurang menarik. Id l9 &
 * l10 sengaja tidak dinomori ulang supaya bintang yang sudah ada tetap
 * terpakai. Fitur engine `spot-diff` yang dulu dibuat untuk l1–l8 (pindah,
 * tukar-tempat, jumlah, kecil, layout `sd2`) tetap ada di engine.
 */

/** Kalimat soal lukisan rahasia — "perkemahan" tetap sama persis (rekamannya sudah ada). */
const SECRET_PHOTO = (place: string) => `Misi ${place}! Berapa perbedaannya? Rahasia! Tekan Sudah semua kalau selesai.`;

const config: GameConfig<'spot-diff'> = {
  id: 'mata-jeli',
  group: 'sd2',
  title: 'Mata Jeli',
  emoji: '🧐',
  template: 'spot-diff',
  levels: [
    photoSlot(
      'l9',
      [
        { photo: 'kemah', narration: 'Perkemahan pramuka! Temukan enam perbedaan.' },
        { photo: 'sekolah', narration: 'Halaman sekolah! Temukan enam perbedaan.' },
        { photo: 'pasar', narration: 'Pasar tradisional! Temukan enam perbedaan.' },
        { photo: 'pantai', narration: 'Liburan ke pantai! Temukan enam perbedaan.' },
        { photo: 'sawah', narration: 'Sawah di desa! Temukan enam perbedaan.' },
      ],
      { count: 6 },
      3,
    ),
    photoSlot(
      'l10',
      [
        { photo: 'kemah', narration: SECRET_PHOTO('perkemahan') },
        { photo: 'sekolah', narration: SECRET_PHOTO('sekolah') },
        { photo: 'pasar', narration: SECRET_PHOTO('pasar') },
        { photo: 'pantai', narration: SECRET_PHOTO('pantai') },
        { photo: 'sawah', narration: SECRET_PHOTO('sawah') },
      ],
      { count: 7, hidden: true },
      3,
    ),
  ],
};

export default config;
