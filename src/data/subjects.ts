/**
 * Mata pelajaran — lapisan antara kelompok dan daftar game, KHUSUS kelompok
 * SD kelas 3 ke atas (keputusan pemilik 2026-10-05, dari mockup "Pilih Mata
 * Pelajaran"). TK dan SD Kelas 1 & 2 sengaja TIDAK memakainya: TK memang belum
 * belajar per mapel, dan Kelas 1 & 2 sudah dijual dengan daftar game biasa.
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

export type SubjectId =
  | 'matematika'
  | 'bahasa-indonesia'
  | 'ipas'
  | 'pancasila'
  | 'seni-rupa'
  | 'bahasa-inggris';

export interface SubjectStyle {
  title: string;
  /** Label kecil di atas judul kartu. */
  tag: string;
  /** Hiasan di pojok kanan bawah kartu (dekorasi, bukan ikon tombol). */
  deco: string;
  /** Dua warna gradien kartu — cukup gelap supaya teks putih tetap terbaca. */
  from: string;
  to: string;
}

/** Tampilan tiap mapel — sama di semua kelompok. */
export const SUBJECT_STYLE: Record<SubjectId, SubjectStyle> = {
  matematika: { title: 'Matematika', tag: 'Angka & Logika', deco: '🔢', from: '#4f56d6', to: '#7a6cf0' },
  'bahasa-indonesia': { title: 'Bahasa Indonesia', tag: 'Literasi & Kata', deco: '📚', from: '#8445d0', to: '#a45fe4' },
  // Kurikulum Merdeka menggabungkan IPA & IPS jadi IPAS mulai kelas 3.
  ipas: { title: 'IPAS', tag: 'Alam & Sosial', deco: '🌿', from: '#2b8a47', to: '#47a95a' },
  // 🦅, bukan 🇮🇩: bendera emoji tampil sebagai huruf "ID" di sebagian perangkat.
  pancasila: { title: 'Pancasila', tag: 'Nilai & Karakter', deco: '🦅', from: '#c7621a', to: '#e2862c' },
  'seni-rupa': { title: 'Seni Rupa', tag: 'Kreativitas', deco: '🎨', from: '#c8437e', to: '#e0659b' },
  'bahasa-inggris': { title: 'Bahasa Inggris', tag: 'English Fun', deco: '🔤', from: '#2475c4', to: '#4793e0' },
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
    { id: 'ipas', description: 'Tumbuhan, hewan, cuaca, wujud benda, gaya & lingkungan.' },
    { id: 'pancasila', description: 'Lambang sila, aturan di rumah & sekolah, keberagaman.' },
    { id: 'seni-rupa', description: 'Warna, pola, motif batik, kolase & mozaik.' },
    { id: 'bahasa-inggris', description: 'Alphabet, colors, family, numbers & animals.' },
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
