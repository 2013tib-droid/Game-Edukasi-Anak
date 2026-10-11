/**
 * Mata pelajaran — lapisan antara kelompok dan daftar game, KHUSUS kelompok
 * SD kelas 3 ke atas (keputusan pemilik 2026-10-05). TK dan SD Kelas 1 & 2
 * sengaja TIDAK memakainya: TK memang belum belajar per mapel, dan Kelas 1 & 2
 * sudah dijual dengan daftar game biasa.
 *
 * Satu-satunya tempat yang memutuskan kelompok mana yang punya layar mapel
 * adalah `SUBJECTS_BY_GROUP` di bawah. Game dari kelompok itu WAJIB
 * menyebut `subject` di `src/games/registry.ts` — dipaksa tipe `GameMeta`,
 * jadi lupa menulisnya gagal saat build, bukan game yang hilang diam-diam.
 *
 * Mapel tanpa satu game pun tetap tampil sebagai "Segera hadir" supaya orang
 * tua melihat apa yang akan datang. Menghapus mapel dari daftar = hapus satu
 * baris di kelompoknya.
 */
import type { GroupId } from '@/engine/core/types';
import type { NotebookLook } from '@/portal/Notebook';

export type SubjectId =
  | 'matematika'
  | 'bahasa-indonesia'
  | 'ipas'
  | 'pancasila'
  | 'seni-rupa'
  | 'bahasa-inggris';

export interface SubjectStyle {
  title: string;
  /** Kata kecil di label buku, di atas namanya. */
  tag: string;
  /** Emoji cadangan stiker sampul (dipakai kalau `pic` kosong/gagal). */
  deco: string;
  /**
   * Seni ikon di public/assets/subjects/<pic>.webp — stiker di sampul buku
   * DAN judul halaman mapel. Kosong = emoji `deco`. Prompt:
   * docs/prompt-ikon-mapel.md.
   */
  pic?: string;
  /** Sampul buku tulis di layar pilih mapel (Notebook.tsx). */
  look: NotebookLook;
}

/**
 * Tampilan tiap mapel — sama di semua kelompok.
 *
 * 2026-10-11: tag, warna & bentuk kartunya DIROMBAK total. Versi 2026-10-05
 * menyalin situs orang lain (tag kata per kata, urutan & warna kartu, kalimat
 * judul) — jangan dihidupkan lagi, dan jangan mengambil tampilan/teks dari
 * situs lain tanpa izin pemiliknya.
 */
export const SUBJECT_STYLE: Record<SubjectId, SubjectStyle> = {
  // 🧮, bukan 🔢: keycap 🔢 tampil sebagai kotak abu-abu "1234" di iPhone.
  matematika: {
    title: 'Matematika',
    tag: 'Hitung & ukur',
    deco: '🧮',
    pic: 'matematika',
    look: { cover: '#2a9d8f', ink: '#1d7268', pattern: 'kotak' },
  },
  'bahasa-indonesia': {
    title: 'Bahasa Indonesia',
    tag: 'Baca & tulis',
    deco: '📚',
    pic: 'bahasa-indonesia',
    look: { cover: '#e3a127', ink: '#9a6508', pattern: 'garis' },
  },
  // Kurikulum Merdeka menggabungkan IPA & IPS jadi IPAS mulai kelas 3.
  ipas: {
    title: 'IPAS',
    tag: 'Amati & coba',
    deco: '🌿',
    pic: 'ipas',
    look: { cover: '#6a9f3a', ink: '#4a7424', pattern: 'titik' },
  },
  // 🦅, bukan 🇮🇩: bendera emoji tampil sebagai huruf "ID" di sebagian perangkat.
  pancasila: {
    title: 'Pancasila',
    tag: 'Rukun & adil',
    deco: '🦅',
    pic: 'pancasila',
    look: { cover: '#cf4b45', ink: '#a5302b', pattern: 'serong' },
  },
  'seni-rupa': {
    title: 'Seni Rupa',
    tag: 'Warna & karya',
    deco: '🎨',
    pic: 'seni-rupa',
    look: { cover: '#8a6cc9', ink: '#6448a3', pattern: 'konfeti' },
  },
  'bahasa-inggris': {
    title: 'Bahasa Inggris',
    tag: 'Kata & kalimat',
    deco: '🔤',
    pic: 'bahasa-inggris',
    look: { cover: '#33598f', ink: '#27467a', pattern: 'bintang' },
  },
};

export interface GroupSubject {
  id: SubjectId;
  /** Materi di jenjang ini — beda per kelompok. */
  description: string;
}

export const SUBJECTS_BY_GROUP: Partial<Record<GroupId, readonly GroupSubject[]>> = {
  sd2: [
    { id: 'matematika', description: 'Perkalian, pembagian, uang, waktu, ukuran & data.' },
    { id: 'bahasa-indonesia', description: 'Membaca cerita, mencari informasi & menyusun kalimat.' },
    { id: 'ipas', description: 'Tumbuhan, hewan, lingkungan, cahaya & bunyi.' },
    { id: 'pancasila', description: 'Lima sila, tata tertib, hak & kewajiban, keberagaman.' },
    { id: 'seni-rupa', description: 'Warna, pola, motif batik, kolase & mozaik.' },
    { id: 'bahasa-inggris', description: 'Hewan, makanan, warna, angka & kota dalam bahasa Inggris.' },
  ],
  sd3: [
    { id: 'matematika', description: 'Pecahan, desimal, bangun ruang, volume & soal cerita.' },
    { id: 'bahasa-indonesia', description: 'Ide pokok, teks cerita, puisi & surat.' },
    { id: 'ipas', description: 'Tubuh manusia, ekosistem, energi & peta Indonesia.' },
    { id: 'pancasila', description: 'Makna sila, hak & kewajiban, budaya daerah.' },
    { id: 'seni-rupa', description: 'Gambar ruang, motif nusantara, warna & kolase.' },
    { id: 'bahasa-inggris', description: 'Daily activities, time, places, jobs & sentences.' },
  ],
};

export function subjectsFor(group: GroupId): readonly GroupSubject[] | null {
  return SUBJECTS_BY_GROUP[group] ?? null;
}

export function isSubjectId(v: string | undefined): v is SubjectId {
  return !!v && v in SUBJECT_STYLE;
}
