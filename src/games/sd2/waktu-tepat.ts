import type { ClockSetData, DayTime, GameConfig, GameLevel, SceneId } from '@/engine/core/types';
import { capitalize, terbilang } from '@/games/numbers';
import { digits, halfToward, quarterPast, quarterTo } from '@/games/time';

/**
 * "Waktu Tepat" (SD Kelas 3 & 4, `sd2`) — versi PREMIUM "Sehari Bersama
 * Kancil" (docs/rencana-game-sd-kelas-3-4.md bagian 2b.3 no. 4).
 *
 * Anak MEMUTAR jarum panjang dengan jari (template `clock-set`), jarum pendek
 * ikut bergerak sendiri. Bukan memilih satu dari tiga kartu jam.
 *
 * - **Satu sesi = satu hari Kancil**, urutannya TETAP (bangun → sarapan →
 *   sekolah → belajar → istirahat → makan siang → sore → membaca → misi
 *   malam), dan latar `Scene` ikut berganti: rumah, kota, padang, kebun,
 *   sungai, malam. Karena itu TANPA `sessionLevels` — kesulitannya juga naik
 *   berurutan (kelas 3 dulu, kelas 4 dari slot 7). Variasi dari kolam varian
 *   per slot.
 * - **Proyek sesi** (`project`): tiap kegiatan yang benar mengisi satu halaman
 *   "Buku Harian Kancil" di baris atas; layar "Selamat!" memperlihatkan
 *   bukunya utuh.
 * - **Misi besar** = slot terakhir: tiga langkah bersambung (mandi → makan
 *   malam selama sekian menit → tidur) dengan cincin jam 24.
 *
 * Aturan yang dipatuhi:
 * - Narasi TANPA digit: waktu disebut dengan kata ("pukul enam lewat
 *   seperempat"); waktu berdigit cuma tampil di layar (`show`, pilihan
 *   jawaban, halaman buku harian).
 * - Soal tidak memuat jawabannya: soal "jam yang tertulis" menulis waktunya
 *   di layar dan anak harus MEMBUATNYA di jam — narasinya tidak menyebutnya.
 *   Soal "berapa lama"/"pukul berapa" ditanyakan sesudah busur waktunya
 *   terlihat, dan pilihannya tidak tertulis di kalimat.
 * - Pengecoh dari kesalahan khas (bagian Waktu Tepat di dokumen rencana):
 *   **jarum tertukar**, **angka di bawah jarum panjang dibaca sebagai menit**
 *   (jarum di angka 2 dibaca "2 menit", bukan 10), dan **jam dikurangi atau
 *   ditambah seperti bilangan biasa** (09.15 − 08.45 = "70 menit";
 *   11.50 + 25 menit = "11.75").
 * - Kancil TIDAK digambar: belum ada seni kancil berdiri sendiri (yang ada
 *   cuma ilustrasi adegan cerita), dan aturan proyek melarang hewan digambar
 *   emoji di soal. Kancil hidup di kalimatnya; yang digambar jamnya.
 * - Kalender & konversi hari–minggu (akhir kelas 4) BELUM ada — menyusul
 *   dengan `Calendar.tsx` sendiri.
 */

const t = (h: number, m = 0): DayTime => ({ h, m });
const show = (x: DayTime) => digits(x.h, x.m);
const add = (x: DayTime, min: number): DayTime => {
  const total = x.h * 60 + x.m + min;
  return t(Math.floor(total / 60) % 24, total % 60);
};

type Level = GameLevel<'clock-set'>;

function level(
  narration: string,
  stamp: { emoji: string; label: string },
  data: ClockSetData,
): Level {
  return { id: '', narration, stamp, data };
}

/** Semua varian dalam satu slot berbagi id — bintangnya per slot. */
function slot(id: string, ...variants: Level[]): Level[] {
  return variants.map((v) => ({ ...v, id }));
}

/* ---------- Kelas 3 ---------- */

/** 1. Bangun pagi — seperempat & setengah dengan kata (bukan digit). */
function wakeUp(phrase: string, to: DayTime): Level {
  return level(
    `Kancil bangun pukul ${phrase}. Putar jarum panjangnya!`,
    { emoji: '🌅', label: show(to) },
    { from: t(to.h), steps: [{ to }], scene: 'rumah' },
  );
}

/** 2. Jam digital → jam jarum, kelipatan lima menit. */
function written(activity: string, emoji: string, from: DayTime, to: DayTime, scene: SceneId): Level {
  return level(
    `Kancil ${activity} pada jam yang tertulis. Atur jamnya!`,
    { emoji, label: show(to) },
    { from, steps: [{ to, show: show(to) }], scene },
  );
}

/**
 * Pembacaan yang tertukar: jarum panjang dibaca sebagai jam, jarum pendek
 * sebagai menit (dibulatkan ke lima menit terdekat, seperti mata anak membaca).
 */
function swapped(x: DayTime): string {
  const hourFromMinuteHand = x.m === 0 ? 12 : x.m / 5;
  // Angka terdekat dari jarum pendek, dibaca sebagai menit (angka 7 → 35).
  const hourHandMinutes = (Math.round((x.h % 12) + x.m / 60) % 12) * 5;
  return digits(hourFromMinuteHand, hourHandMinutes);
}

/** 3. Jam jarum → tulisan digital. Jamnya diam; anak cuma membaca. */
function readIt(at: DayTime): Level {
  const narration = 'Kancil berangkat ke sekolah. Pukul berapa sekarang?';
  return level(
    narration,
    { emoji: '🎒', label: show(at) },
    {
      from: at,
      steps: [],
      ask: {
        prompt: narration,
        choices: [
          { text: show(at), correct: true },
          // Angka di bawah jarum panjang dibaca sebagai menit.
          { text: digits(at.h, at.m / 5) },
          { text: swapped(at) },
        ],
      },
      scene: 'kota',
    },
  );
}

/** 4. Lama kegiatan dalam menit — busur waktu mengisi muka jam. */
function lasts(activity: string, emoji: string, from: DayTime, minutes: number): Level {
  const to = add(from, minutes);
  return level(
    `Kancil ${activity} selama ${terbilang(minutes)} menit. Putar jarumnya sampai selesai!`,
    { emoji, label: show(to) },
    { from, steps: [{ to, arc: true }], scene: 'kota' },
  );
}

/** Pengurangan jam seperti bilangan biasa: 09.15 − 08.45 → 70. */
const naiveMinus = (a: DayTime, b: DayTime) => b.h * 100 + b.m - (a.h * 100 + a.m);

/** 5. Lama istirahat yang melewati pergantian jam (08.45 → 09.15). */
function recess(from: DayTime, to: DayTime): Level {
  const real = to.h * 60 + to.m - (from.h * 60 + from.m);
  return level(
    'Kancil istirahat sampai jam yang tertulis. Putar jarumnya!',
    { emoji: '⚽', label: `${real} mnt` },
    {
      from,
      steps: [{ to, arc: true, show: show(to) }],
      ask: {
        prompt: 'Berapa menit Kancil istirahat?',
        choices: [
          { text: `${real} menit`, correct: true },
          { text: `${naiveMinus(from, to)} menit` },
          // Hanya membaca menit di jam akhir.
          { text: `${to.m} menit` },
        ],
      },
      scene: 'padang',
    },
  );
}

/** 6. "Sekian menit lagi pukul berapa?" — melewati pukul dua belas. */
function lunch(from: DayTime, minutes: number): Level {
  const to = add(from, minutes);
  return level(
    `${capitalize(terbilang(minutes))} menit lagi Kancil makan siang. Putar jarumnya!`,
    { emoji: '🍚', label: show(to) },
    {
      from,
      steps: [{ to, arc: true }],
      ask: {
        prompt: 'Pukul berapa Kancil makan siang?',
        choices: [
          { text: show(to), correct: true },
          // Menit dijumlah seperti bilangan biasa: 50 + 25 = 75.
          { text: digits(from.h, from.m + minutes) },
          // Menitnya benar, jamnya lupa maju.
          { text: digits(from.h, to.m) },
        ],
      },
      scene: 'rumah',
    },
  );
}

/* ---------- Kelas 4 ---------- */

/** 7. Jam 24: tulisan 13.00–17.59 dibuat di jam ber-cincin 13–24. */
function afternoon(activity: string, emoji: string, from: DayTime, to: DayTime, scene: SceneId): Level {
  return level(
    `Sore hari, Kancil ${activity} pada jam yang tertulis. Atur jamnya!`,
    { emoji, label: show(to) },
    { from, steps: [{ to, show: show(to) }], ring24: true, scene },
  );
}

/** 8. Konversi jam → menit: "satu jam seperempat" = 75 menit. */
function hoursToMinutes(phrase: string, from: DayTime, minutes: number): Level {
  const to = add(from, minutes);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return level(
    `Kancil membaca selama ${phrase}. Putar jarumnya!`,
    { emoji: '📚', label: `${minutes} mnt` },
    {
      from,
      steps: [{ to, arc: true }],
      ask: {
        prompt: 'Jadi, berapa menit Kancil membaca?',
        choices: [
          { text: `${minutes} menit`, correct: true },
          // "1 jam 15" ditulis berdampingan (= satu jam dianggap seratus
          // menit): 115.
          { text: `${h * 100 + m} menit` },
          // Lebihnya terlupa — cuma jam penuhnya yang dihitung.
          { text: `${h * 60} menit` },
        ],
      },
      ring24: true,
      scene: 'kebun',
    },
  );
}

/** 9. MISI BESAR malam hari: mandi → makan malam sekian menit → tidur. */
function nightMission(bath: DayTime, dinner: number, sleep: DayTime): Level {
  const afterDinner = add(bath, dinner);
  return level(
    'Misi malam! Kancil mandi pada jam yang tertulis. Atur jamnya!',
    { emoji: '🌙', label: show(sleep) },
    {
      from: t(bath.h),
      steps: [
        { to: bath, show: show(bath) },
        {
          to: afterDinner,
          arc: true,
          say: `Lalu Kancil makan malam selama ${terbilang(dinner)} menit. Putar jarumnya!`,
        },
        {
          to: sleep,
          show: show(sleep),
          say: 'Terakhir, Kancil tidur pada jam yang tertulis. Atur jamnya!',
        },
      ],
      ring24: true,
      scene: 'malam',
    },
  );
}

const config: GameConfig<'clock-set'> = {
  id: 'waktu-tepat',
  group: 'sd2',
  title: 'Waktu Tepat',
  emoji: '⏱️',
  template: 'clock-set',
  project: { title: 'Buku Harian Kancil' },
  levels: [
    // --- 1. Bangun pagi: seperempat & setengah ---
    slot(
      'l1',
      wakeUp(quarterPast(6), t(6, 15)),
      wakeUp(quarterTo(6), t(6, 45)),
      wakeUp(quarterPast(5), t(5, 15)),
      wakeUp(quarterTo(5), t(5, 45)),
      wakeUp(halfToward(5), t(5, 30)),
      wakeUp(halfToward(6), t(6, 30)),
    ),
    // --- 2. Mandi & sarapan: jam digital → jam jarum, kelipatan lima ---
    slot(
      'l2',
      written('sarapan', '🍳', t(6), t(6, 40), 'rumah'),
      written('sarapan', '🍳', t(6), t(6, 25), 'rumah'),
      written('sarapan', '🍳', t(6), t(6, 50), 'rumah'),
      written('mandi', '🛁', t(6), t(6, 35), 'rumah'),
      written('mandi', '🛁', t(6), t(6, 10), 'rumah'),
      written('mandi', '🛁', t(6), t(6, 55), 'rumah'),
    ),
    // --- 3. Berangkat sekolah: jam jarum → tulisan digital ---
    slot(
      'l3',
      readIt(t(7, 10)),
      readIt(t(6, 50)),
      readIt(t(7, 20)),
      readIt(t(7, 5)),
      readIt(t(6, 55)),
      readIt(t(7, 25)),
    ),
    // --- 4. Belajar di kelas: lama kegiatan dalam menit ---
    slot(
      'l4',
      lasts('membaca', '📖', t(7, 30), 20),
      lasts('menggambar', '🖍️', t(8), 15),
      lasts('berhitung', '🔢', t(8, 15), 25),
      lasts('menyanyi', '🎵', t(9), 30),
      lasts('menulis', '✏️', t(8, 20), 35),
      lasts('berolahraga', '🏃', t(9, 10), 40),
    ),
    // --- 5. Istirahat: lama kegiatan yang melewati pergantian jam ---
    slot(
      'l5',
      recess(t(8, 45), t(9, 15)),
      recess(t(9, 50), t(10, 10)),
      recess(t(9, 40), t(10, 5)),
      recess(t(10, 35), t(11, 10)),
      recess(t(10, 55), t(11, 15)),
      recess(t(11, 40), t(12, 20)),
    ),
    // --- 6. Makan siang: sekian menit lagi pukul berapa? ---
    slot(
      'l6',
      lunch(t(11, 50), 25),
      lunch(t(11, 40), 30),
      lunch(t(11, 45), 20),
      lunch(t(11, 35), 40),
      lunch(t(11, 55), 15),
      lunch(t(11, 20), 50),
    ),
    // --- 7. (kls 4) Jam 24: sore hari ---
    slot(
      'l7',
      afternoon('bermain di sungai', '🛶', t(12), t(13, 30), 'sungai'),
      afternoon('bermain di sungai', '🛶', t(13), t(14, 15), 'sungai'),
      afternoon('menyiram kebun', '🌻', t(15), t(15, 45), 'kebun'),
      afternoon('menyiram kebun', '🌻', t(15), t(16, 20), 'kebun'),
      afternoon('bersepeda', '🚲', t(16), t(17, 10), 'kota'),
      afternoon('bersepeda', '🚲', t(13), t(13, 50), 'kota'),
    ),
    // --- 8. (kls 4) Konversi jam → menit ---
    slot(
      'l8',
      hoursToMinutes('satu jam seperempat', t(16), 75),
      hoursToMinutes('satu jam lebih sepuluh menit', t(15, 30), 70),
      hoursToMinutes('satu setengah jam', t(15), 90),
      hoursToMinutes('satu jam lebih lima menit', t(16, 10), 65),
      hoursToMinutes('satu jam lebih dua puluh menit', t(15, 20), 80),
      hoursToMinutes('satu jam tiga perempat', t(15), 105),
    ),
    // --- 9. MISI BESAR: malam hari, tiga langkah bersambung ---
    slot(
      'l9',
      nightMission(t(18, 30), 30, t(20)),
      nightMission(t(17, 45), 30, t(19, 30)),
      nightMission(t(18, 15), 25, t(20, 30)),
      nightMission(t(17, 30), 45, t(19, 45)),
      nightMission(t(18, 10), 20, t(20, 15)),
      nightMission(t(18, 40), 35, t(21)),
    ),
  ],
};

export default config;
