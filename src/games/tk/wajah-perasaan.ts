import type { GameConfig, GameLevel, LevelStamp, SceneId } from '@/engine/core/types';
import {
  FEEL_ACTIONS,
  FEEL_EVENTS,
  FORBIDDEN_PAIRS,
  HERO_NAME,
  type FaceControls,
  type FaceStep,
  type FaceTask,
  type FeelAction,
  type FeelEvent,
  type FeelHero,
  type Feeling,
  type MakeFeeling,
} from '@/engine/core/feelings';

/**
 * "Wajah Perasaan" (Playgroup & TK, 2026-11-13) — game sosial-emosional
 * pertama. Anak mengenali EMPAT perasaan dasar (senang, sedih, marah, takut;
 * "kaget" hanya di misi besar) dari wajah, dari kejadian penyebabnya, dan tahu
 * hal baik yang bisa dilakukan. Wajahnya anak ayam yang digambar ENGINE
 * (`ui/Face.tsx`), bagian wajahnya bisa digeser anak.
 *
 * Keputusan pemilik 2026-11-13: tokoh wajah anak ayam SVG, "marah" ikut (yang
 * diajarkan cara menenangkannya, BUKAN bahwa marah itu salah), judul tetap.
 *
 * SLOT (urutan tetap, 6 varian per slot):
 *   l1 pilih wajah: senang vs sedih     l5 bentuk wajah: mulut + alis (4 perasaan)
 *   l2 pilih wajah: tiga perasaan       l6 tolong teman yang sedih / takut
 *   l3 bentuk wajah: mulut saja         l7 aku marah — apa yang baik dilakukan?
 *   l4 wajah → apa penyebabnya?         l8 MISI BESAR "Ulang Tahun Panda"
 *
 * Aturan isi (dijaga builder di bawah DAN `scripts/check-face-levels.mjs`):
 * - Kejadian yang bisa dirasakan dua cara tak pernah diadu dengan perasaan
 *   keduanya (`FEEL_EVENTS[e].notWith`); takut↔kaget & senang↔kaget tak
 *   pernah jawaban-vs-pengecoh.
 * - Tokoh = hewan berseni registry (JANGAN anjing, JANGAN emoji hewan).
 * - Nol kekerasan, nol hukuman orang dewasa sebagai penyebab perasaan.
 * - Narasi ≤ 70 karakter, tanpa angka.
 */

const MAX_LINE = 70;

function checkLine(text: string, where: string): string {
  if (/\d/.test(text)) throw new Error(`wajah-perasaan ${where}: narasi memuat angka — "${text}"`);
  if (text.length > MAX_LINE) throw new Error(`wajah-perasaan ${where}: narasi ${text.length} karakter (> ${MAX_LINE}) — "${text}"`);
  return text;
}

function storyOf(hero: FeelHero, event: FeelEvent): string {
  return FEEL_EVENTS[event].story.replace('{n}', HERO_NAME[hero]);
}

function uniq<T>(xs: T[], where: string): T[] {
  if (new Set(xs).size !== xs.length) throw new Error(`wajah-perasaan ${where}: pilihan kembar ${xs.join(', ')}`);
  return xs;
}

/** Perasaan jawaban + pengecohnya tak boleh membuat soal ambigu. */
function checkFeelingChoices(answer: Feeling, choices: Feeling[], event: FeelEvent | null, where: string) {
  uniq(choices, where);
  if (choices.filter((c) => c === answer).length !== 1) throw new Error(`wajah-perasaan ${where}: jawaban ${answer} tak ada tepat sekali`);
  for (const c of choices) {
    if (c === answer) continue;
    for (const [a, b] of FORBIDDEN_PAIRS) {
      if ((a === answer && b === c) || (b === answer && a === c)) throw new Error(`wajah-perasaan ${where}: ${answer} diadu dengan ${c}`);
    }
    if (event && FEEL_EVENTS[event].notWith.includes(c)) throw new Error(`wajah-perasaan ${where}: ${event} juga bisa membuat ${c}`);
  }
}

function step(task: FaceTask, where: string, say?: string): FaceStep {
  switch (task.kind) {
    case 'pick': {
      if (FEEL_EVENTS[task.cue.event].feeling !== task.answer) throw new Error(`wajah-perasaan ${where}: ${task.cue.event} bukan ${task.answer}`);
      checkFeelingChoices(task.answer, task.choices, task.cue.event, where);
      break;
    }
    case 'cause': {
      uniq(task.choices, where);
      if (!task.choices.includes(task.answer)) throw new Error(`wajah-perasaan ${where}: jawaban tak ada di pilihan`);
      for (const e of task.choices) {
        const def = FEEL_EVENTS[e];
        if (e === task.answer) {
          if (def.feeling !== task.feeling) throw new Error(`wajah-perasaan ${where}: ${e} bukan ${task.feeling}`);
        } else if (def.feeling === task.feeling || def.notWith.includes(task.feeling)) {
          throw new Error(`wajah-perasaan ${where}: pengecoh ${e} juga bisa membuat ${task.feeling}`);
        }
      }
      break;
    }
    case 'help': {
      uniq(task.choices, where);
      if (!task.choices.includes(task.answer)) throw new Error(`wajah-perasaan ${where}: jawaban tak ada di pilihan`);
      for (const a of task.choices) {
        if (FEEL_ACTIONS[a].good !== (a === task.answer)) throw new Error(`wajah-perasaan ${where}: tindakan ${a} salah golongan`);
        if (FEEL_ACTIONS[a].label.split(' ').length > 3) throw new Error(`wajah-perasaan ${where}: label ${a} > 3 kata`);
      }
      if (FEEL_EVENTS[task.event].feeling !== task.feeling) throw new Error(`wajah-perasaan ${where}: ${task.event} bukan ${task.feeling}`);
      break;
    }
    case 'make':
    case 'mirror':
      // Wajah awal = biasa; sasarannya selalu perasaan (bukan biasa).
      if (task.kind === 'make' && task.cue && FEEL_EVENTS[task.cue.event].feeling !== task.target) {
        throw new Error(`wajah-perasaan ${where}: ${task.cue.event} bukan ${task.target}`);
      }
      if (task.kind === 'mirror' && FEEL_EVENTS[task.event].feeling !== task.target) throw new Error(`wajah-perasaan ${where}: ${task.event} bukan ${task.target}`);
      if (task.controls === 'mulut' && task.target !== 'senang' && task.target !== 'sedih') {
        throw new Error(`wajah-perasaan ${where}: ${task.target} butuh pegangan alis`);
      }
      break;
  }
  return say === undefined ? { task } : { say: checkLine(say, where), task };
}

function level(id: string, stamp: LevelStamp, narration: string, steps: FaceStep[], scene?: SceneId): GameLevel<'face-feel'> {
  return { id, stamp, narration: checkLine(narration, id), data: { steps, ...(scene ? { scene } : {}) } };
}

const STAMP: Record<string, LevelStamp> = {
  l1: { emoji: '🌼', label: 'Bunga' },
  l2: { emoji: '🎈', label: 'Balon' },
  l3: { emoji: '🍭', label: 'Permen' },
  l4: { emoji: '🌈', label: 'Pelangi' },
  l5: { emoji: '🧸', label: 'Boneka' },
  l6: { emoji: '💌', label: 'Surat' },
  l7: { emoji: '🫧', label: 'Gelembung' },
  l8: { emoji: '🎂', label: 'Kue' },
};

/* ---------- Pembuat soal ---------- */

const ASK = 'Bagaimana perasaannya?';

function pick(id: string, hero: FeelHero, event: FeelEvent, others: Feeling[], scene?: SceneId) {
  const answer = FEEL_EVENTS[event].feeling;
  const narration = `${storyOf(hero, event)} ${ASK}`;
  return level(id, STAMP[id]!, narration, [step({ kind: 'pick', cue: { hero, event }, choices: [answer, ...others], answer }, id)], scene);
}

function make(id: string, hero: FeelHero, event: FeelEvent, controls: FaceControls, scene?: SceneId) {
  const target = FEEL_EVENTS[event].feeling as MakeFeeling;
  const how = controls === 'mulut' ? 'Geser mulutnya' : 'Geser alisnya';
  const narration = `${storyOf(hero, event)} ${how}, buat wajah ${target}!`;
  return level(id, STAMP[id]!, narration, [step({ kind: 'make', cue: { hero, event }, target, controls }, id)], scene);
}

function cause(id: string, feeling: Feeling, answer: FeelEvent, others: FeelEvent[], scene?: SceneId) {
  const narration = `Wajahnya ${feeling}. Apa yang membuatnya ${feeling}?`;
  return level(id, STAMP[id]!, narration, [step({ kind: 'cause', feeling, choices: [answer, ...others], answer }, id)], scene);
}

/** Alasan pendek untuk kalimat "… karena …". */
const BECAUSE: Partial<Record<FeelEvent, string>> = {
  'es-jatuh': 'es krimnya jatuh',
  'balon-lepas': 'balonnya lepas',
  'mainan-rusak': 'mainannya rusak',
  petir: 'ada petir',
  'lampu-mati': 'lampunya mati',
};

const RUDE: FeelAction[] = ['tertawa', 'pergi'];

function helpLine(who: FeelHero, event: FeelEvent): string {
  const feeling = FEEL_EVENTS[event].feeling;
  return `${HERO_NAME[who]} ${feeling} karena ${BECAUSE[event]!}. Apa yang kamu lakukan?`;
}

function helpFriend(id: string, who: FeelHero, event: FeelEvent, good: FeelAction, scene?: SceneId) {
  const feeling = FEEL_EVENTS[event].feeling;
  return level(id, STAMP[id]!, helpLine(who, event), [step({ kind: 'help', who, feeling, event, choices: [good, ...RUDE], answer: good }, id)], scene);
}

/** "Aku marah": kalimat orang kedua — kejadiannya menimpa si anak. */
const MINE: Partial<Record<FeelEvent, string>> = {
  'menara-roboh': 'Menara balokmu ditendang teman.',
  'gambar-dicoret': 'Gambarmu dicoret-coret teman.',
  'mainan-direbut': 'Mainanmu direbut teman.',
};

function helpMe(id: string, event: FeelEvent, good: FeelAction) {
  const narration = `${MINE[event]!} Kamu marah. Apa yang baik dilakukan?`;
  return level(id, STAMP[id]!, narration, [step({ kind: 'help', feeling: 'marah', event, choices: [good, 'berteriak', 'cemberut'], answer: good }, id)], 'rumah');
}

/** MISI BESAR: pesta ulang tahun Panda — kaget → ikut senang → tolong tamu. */
function party(guest: FeelHero, event: FeelEvent, good: FeelAction) {
  const id = 'l8';
  return level(
    id,
    STAMP[id]!,
    'Pesta Panda! Boneka melompat dari kado, boing! Panda merasa apa?',
    [
      step({ kind: 'pick', cue: { hero: 'panda', event: 'kotak-kejutan' }, choices: ['kaget', 'sedih', 'marah'], answer: 'kaget' }, id),
      step({ kind: 'mirror', who: 'panda', event: 'kue', target: 'senang', controls: 'mulut-alis' }, id, 'Panda tiup lilin, senang sekali! Buat wajahmu ikut senang!'),
      step(
        { kind: 'help', who: guest, feeling: FEEL_EVENTS[event].feeling, event, choices: [good, ...RUDE], answer: good },
        id,
        helpLine(guest, event),
      ),
    ],
    'rumah',
  );
}

const config: GameConfig<'face-feel'> = {
  id: 'wajah-perasaan',
  group: 'tk',
  title: 'Wajah Perasaan',
  emoji: '🙂',
  template: 'face-feel',
  project: { title: 'Buku Perasaanku' },
  hints: true,
  levels: [
    [
      pick('l1', 'rabbit', 'es-jatuh', ['senang']),
      pick('l1', 'cat', 'kado', ['sedih']),
      pick('l1', 'duck', 'balon-lepas', ['senang']),
      pick('l1', 'panda', 'kue', ['sedih']),
      pick('l1', 'bear', 'mainan-rusak', ['senang']),
      pick('l1', 'monkey', 'pelangi', ['sedih']),
    ],
    [
      pick('l2', 'chicken', 'menara-roboh', ['senang', 'takut']),
      pick('l2', 'turtle', 'petir', ['senang', 'marah']),
      pick('l2', 'elephant', 'gambar-dicoret', ['senang', 'takut']),
      pick('l2', 'rabbit', 'lampu-mati', ['senang', 'marah']),
      pick('l2', 'cat', 'es-jatuh', ['senang', 'takut']),
      pick('l2', 'duck', 'kado', ['sedih', 'marah']),
    ],
    [
      make('l3', 'cat', 'kado', 'mulut'),
      make('l3', 'rabbit', 'es-jatuh', 'mulut'),
      make('l3', 'panda', 'kue', 'mulut'),
      make('l3', 'duck', 'balon-lepas', 'mulut'),
      make('l3', 'monkey', 'pelangi', 'mulut'),
      make('l3', 'bear', 'mainan-rusak', 'mulut'),
    ],
    [
      cause('l4', 'sedih', 'es-jatuh', ['kado', 'pelangi'], 'kebun'),
      cause('l4', 'senang', 'kado', ['balon-lepas', 'menara-roboh'], 'kebun'),
      cause('l4', 'marah', 'menara-roboh', ['kue', 'lampu-mati'], 'kebun'),
      cause('l4', 'takut', 'petir', ['kue', 'mainan-rusak'], 'kebun'),
      cause('l4', 'senang', 'pelangi', ['es-jatuh', 'petir'], 'kebun'),
      cause('l4', 'marah', 'mainan-direbut', ['pelangi', 'lampu-mati'], 'kebun'),
    ],
    [
      make('l5', 'chicken', 'menara-roboh', 'mulut-alis'),
      make('l5', 'turtle', 'petir', 'mulut-alis'),
      make('l5', 'cat', 'gambar-dicoret', 'mulut-alis'),
      make('l5', 'rabbit', 'lampu-mati', 'mulut-alis'),
      make('l5', 'panda', 'es-jatuh', 'mulut-alis'),
      make('l5', 'monkey', 'kado', 'mulut-alis'),
    ],
    [
      helpFriend('l6', 'cat', 'mainan-rusak', 'pinjamkan'),
      helpFriend('l6', 'rabbit', 'es-jatuh', 'peluk'),
      helpFriend('l6', 'duck', 'balon-lepas', 'temani'),
      helpFriend('l6', 'turtle', 'petir', 'peluk'),
      helpFriend('l6', 'elephant', 'lampu-mati', 'temani'),
      helpFriend('l6', 'bear', 'balon-lepas', 'ajak-main'),
    ],
    [
      helpMe('l7', 'menara-roboh', 'tarik-napas'),
      helpMe('l7', 'menara-roboh', 'bilang-pelan'),
      helpMe('l7', 'gambar-dicoret', 'minta-peluk'),
      helpMe('l7', 'gambar-dicoret', 'tarik-napas'),
      helpMe('l7', 'mainan-direbut', 'bilang-pelan'),
      helpMe('l7', 'mainan-direbut', 'minta-peluk'),
    ],
    [
      party('rabbit', 'balon-lepas', 'temani'),
      party('cat', 'es-jatuh', 'peluk'),
      party('duck', 'mainan-rusak', 'pinjamkan'),
      party('bear', 'balon-lepas', 'peluk'),
      party('turtle', 'es-jatuh', 'ajak-main'),
      party('monkey', 'mainan-rusak', 'temani'),
    ],
  ],
};

export default config;
