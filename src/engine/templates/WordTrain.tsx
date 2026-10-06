import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import type { TrainRound } from '@/engine/core/types';
import { isPunct, plainWord, sentenceText } from '@/engine/core/wordTrain';
import { sfx, speak } from '@/engine/audio/sound';
import Scene from '@/engine/ui/Scene';
import { sparkleAt } from '@/engine/ui/juice';
import '@/engine/ui/word-train.css';

/**
 * Template `word-train` (Susun Kalimat, versi premium "Kereta Kata" —
 * docs/rencana-game-sd-kelas-3-4.md 2b.3 no. 6): tiap kata = satu GERBONG.
 *
 * - `order`: anak menyeret (atau mengetuk) gerbong dari baki ke rel. Gerbong di
 *   rel disentuh = kembali ke baki. Begitu rel penuh, kereta dinilai.
 * - `pick`: kereta sudah tersusun; sentuh gerbong yang ditanyakan.
 * - `fill`: satu gerbong kosong, isi dengan gerbong yang tepat dari baki.
 *
 * Salah = SENYAP (tetap dihitung untuk bintang, tanpa overlay "coba lagi"):
 * gerbong yang salah menyala merah lalu pulang ke baki, gerbong yang sudah
 * benar di depan tetap tersambung. Itu petunjuknya (P2), bukan hukuman.
 *
 * Benar = KERETA BERANGKAT: gerbong bergoyang satu per satu sambil kalimatnya
 * dibacakan, lalu kereta melaju keluar ke kiri (lokomotif di depan = kata
 * pertama). Kalimat hanya dibacakan SESUDAH benar — sebelum itu narasi tak
 * pernah menyebutnya, supaya yang dilatih membaca, bukan mendengar.
 */

interface Car {
  id: number;
  word: string;
}

interface Hold {
  car: Car;
  from: 'tray' | number;
  pointerId: number;
  x0: number;
  y0: number;
  x: number;
  y: number;
  moved: boolean;
}

/** Warna gerbong bergiliran supaya kata yang bersebelahan tidak menyatu. */
const COLORS = ['#ffd166', '#8fd3ff', '#b8e986', '#ffb3c7', '#c9b6ff', '#ffc98b'];

function shuffled<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Kartu acakan yang TIDAK kebetulan sudah urut benar (kalimat pendek). */
function scrambled(words: string[]): string[] {
  for (let t = 0; t < 12; t += 1) {
    const s = shuffled(words);
    if (s.join('\u0000') !== words.join('\u0000')) return s;
  }
  return [...words].reverse();
}

function trayFor(round: TrainRound): Car[] {
  const words =
    round.kind === 'order'
      ? [...scrambled(round.words), ...(round.decoys ?? [])]
      : round.kind === 'fill'
        ? round.options
        : [];
  return shuffled(words.map((word, id) => ({ id, word })));
}

function CarFace({ word }: { word: string }) {
  const bar = word.indexOf('|');
  if (bar < 0) return <span className="wt-word">{word}</span>;
  return (
    <>
      <span className="wt-affix">{word.slice(0, bar)}</span>
      <span className="wt-word">{word.slice(bar + 1)}</span>
    </>
  );
}

function Locomotive() {
  return (
    <svg className="wt-loco" viewBox="0 0 64 52" aria-hidden>
      <rect x="10" y="6" width="9" height="13" rx="2" fill="#5b4a3a" />
      <rect x="4" y="18" width="34" height="22" rx="7" fill="#e85d5d" />
      <rect x="34" y="8" width="26" height="32" rx="5" fill="#c94444" />
      <rect x="40" y="13" width="14" height="11" rx="3" fill="#cfefff" />
      <rect x="0" y="34" width="8" height="5" rx="2" fill="#5b4a3a" />
      {[14, 30, 48].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="44" r="7" fill="#3a2e20" />
          <circle cx={cx} cy="44" r="2.5" fill="#ffd166" />
        </g>
      ))}
    </svg>
  );
}

export default function WordTrain({
  level,
  onCorrect,
  onWrong,
  narrate,
  setRepeat,
}: TemplateProps<'word-train'>) {
  const rounds = level.data.rounds;
  const [ri, setRi] = useState(0);
  const round = rounds[ri]!;
  const words = round.words;

  const [tray, setTray] = useState<Car[]>(() => trayFor(rounds[0]!));
  /** Isi rel per posisi (order) atau satu gerbong di celah (fill). */
  const [slots, setSlots] = useState<(Car | null)[]>(() => words.map(() => null));
  const [bad, setBad] = useState<number[]>([]);
  const [wiggle, setWiggle] = useState<number | null>(null);
  const [dance, setDance] = useState<number | null>(null);
  const [phase, setPhase] = useState<'play' | 'sing' | 'go'>('play');
  const [hold, setHold] = useState<Hold | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      timers.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  function later(fn: () => void, ms: number) {
    timers.current.push(
      window.setTimeout(() => {
        if (alive.current) fn();
      }, ms),
    );
  }

  const prompt = ri === 0 ? level.narration : (round.say ?? level.narration);
  useEffect(() => {
    setRepeat(() => narrate(prompt));
    return () => setRepeat(null);
  }, [prompt, narrate, setRepeat]);

  /** Gerbong yang tampil di rel, posisi demi posisi. */
  const rail: (Car | null)[] = useMemo(() => {
    if (round.kind === 'order') return slots;
    return words.map((w, i) =>
      round.kind === 'fill' && i === round.gap ? (slots[i] ?? null) : { id: -1 - i, word: w },
    );
  }, [round, slots, words]);

  const busy = phase !== 'play' || bad.length > 0;

  /* ---------- Menang: kereta berangkat ---------- */

  /** `said` = urutan yang benar-benar disusun anak (bisa salah satu `alt`). */
  function depart(said: string[] = words) {
    setPhase('sing');
    sfx('correct');
    const r = railRef.current?.getBoundingClientRect();
    if (r) sparkleAt(r.left + r.width / 2, r.top + r.height / 2, 10);
    let left = false;
    const leave = () => {
      if (left) return;
      left = true;
      setPhase('go');
      later(() => {
        if (ri + 1 < rounds.length) {
          const next = rounds[ri + 1]!;
          setRi(ri + 1);
          setTray(trayFor(next));
          setSlots(next.words.map(() => null));
          setDance(null);
          setPhase('play');
          narrate(next.say ?? level.narration);
        } else {
          onCorrect();
        }
      }, 850);
    };
    const started = Date.now();
    speak(sentenceText(said), () => {
      // Goyang gerbongnya minimal sekali lewat walau suaranya pendek.
      later(leave, Math.max(0, 1200 - (Date.now() - started)));
    });
    // Klip yang tak pernah melapor (unduhan tersendat) tak boleh menahan anak.
    later(leave, 7000);
  }

  /* ---------- Menilai ---------- */

  function judge(filled: (Car | null)[]) {
    if (round.kind === 'order') {
      const got = filled.map((c) => c!.word);
      const valid = [round.words, ...(round.alt ?? [])];
      if (valid.some((v) => v.join('\u0000') === got.join('\u0000'))) {
        depart(got);
        return;
      }
      // Gerbong depan yang sudah benar tetap tersambung (awalan terpanjang).
      const keep = Math.max(
        ...valid.map((v) => {
          let k = 0;
          while (k < v.length && v[k] === got[k]) k += 1;
          return k;
        }),
      );
      fail(filled.map((_, i) => i).filter((i) => i >= keep), filled);
    } else if (round.kind === 'fill') {
      const car = filled[round.gap]!;
      if (car.word === round.words[round.gap]) depart();
      else fail([round.gap], filled);
    }
  }

  function fail(wrong: number[], filled: (Car | null)[]) {
    sfx('wrong');
    onWrong(true);
    setBad(wrong);
    later(() => {
      const back = wrong.map((i) => filled[i]).filter((c): c is Car => !!c);
      setSlots(filled.map((c, i) => (wrong.includes(i) ? null : c)));
      setTray((t) => [...t, ...back]);
      setBad([]);
    }, 900);
  }

  /* ---------- Memindah gerbong ---------- */

  function place(car: Car, at?: number) {
    if (busy) return;
    let index = at;
    if (round.kind === 'fill') index = round.gap;
    else if (index === undefined || slots[index]) index = slots.findIndex((s) => !s);
    if (index === undefined || index < 0) return;
    sfx('tap');
    const bumped = slots[index];
    const next = [...slots];
    next[index] = car;
    setSlots(next);
    setTray((t) => [...t.filter((c) => c.id !== car.id), ...(bumped ? [bumped] : [])]);
    const full = round.kind === 'fill' ? true : next.every((s) => s);
    if (full) later(() => judge(next), 280);
  }

  function unplace(index: number) {
    if (busy || round.kind === 'pick') return;
    const car = slots[index];
    if (!car) return;
    sfx('tap');
    setSlots(slots.map((s, i) => (i === index ? null : s)));
    setTray((t) => [...t, car]);
  }

  function pick(index: number) {
    if (busy || round.kind !== 'pick') return;
    if (round.answer.includes(index)) {
      setDance(index);
      depart();
    } else {
      sfx('wrong');
      onWrong(true);
      setWiggle(index);
      later(() => setWiggle(null), 500);
    }
  }

  /* ---------- Seret dengan jari ---------- */

  function down(e: ReactPointerEvent, car: Car) {
    if (busy) return;
    e.preventDefault();
    setHold({
      car,
      from: 'tray',
      pointerId: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      x: e.clientX,
      y: e.clientY,
      moved: false,
    });
  }

  useEffect(() => {
    if (!hold) return;
    const move = (e: PointerEvent) => {
      if (e.pointerId !== hold.pointerId) return;
      const moved = hold.moved || Math.hypot(e.clientX - hold.x0, e.clientY - hold.y0) > 8;
      setHold({ ...hold, x: e.clientX, y: e.clientY, moved });
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== hold.pointerId) return;
      const h = hold;
      setHold(null);
      if (!h.moved) {
        place(h.car);
        return;
      }
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const slot = el?.closest<HTMLElement>('[data-slot]');
      if (slot) place(h.car, Number(slot.dataset.slot));
      else if (railRef.current?.contains(el)) place(h.car);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  });

  const color = (car: Car | null, i: number) =>
    COLORS[(car && car.id >= 0 ? car.id : i) % COLORS.length];

  return (
    <div className="wt-wrap">
      {level.data.scene && <Scene id={level.data.scene} />}
      <div className="game-prompt wt-prompt">{prompt}</div>
      <div className="game-area wt-area">
        <div
          ref={railRef}
          className={
            'wt-rail' + (phase === 'sing' ? ' wt-rail--sing' : '') + (phase === 'go' ? ' wt-rail--go' : '')
          }
          aria-label="Rel kereta"
        >
          <Locomotive />
          {rail.map((car, i) => {
            const last = i === rail.length - 1;
            const punct = car ? isPunct(car.word) : last && round.kind === 'order';
            const cls =
              'wt-car' +
              (i === 0 ? ' wt-car--first' : '') +
              (punct ? ' wt-car--punct' : '') +
              (bad.includes(i) ? ' wt-car--bad' : '') +
              (wiggle === i ? ' wt-car--wiggle' : '') +
              (dance === i ? ' wt-car--dance' : '');
            if (!car) {
              return (
                <span
                  key={`s${i}`}
                  data-slot={i}
                  className={cls + ' wt-car--empty'}
                  style={{ ['--i' as string]: i }}
                  aria-label={`Tempat gerbong ke-${i + 1}`}
                />
              );
            }
            const fixed = car.id < 0;
            return (
              <button
                key={`s${i}`}
                type="button"
                data-slot={i}
                className={cls + (fixed ? ' wt-car--fixed' : '')}
                style={{ background: color(car, i), ['--i' as string]: i }}
                onClick={() => (round.kind === 'pick' ? pick(i) : fixed ? undefined : unplace(i))}
                aria-label={plainWord(car.word)}
              >
                <CarFace word={car.word} />
              </button>
            );
          })}
        </div>
        {round.kind !== 'pick' && (
          <div className="wt-tray" aria-label="Gerbong yang belum dipasang">
            {tray.map((car) => (
              <button
                key={car.id}
                type="button"
                className={
                  'wt-car wt-car--tray' +
                  (isPunct(car.word) ? ' wt-car--punct' : '') +
                  (hold?.moved && hold.car.id === car.id ? ' wt-car--lifted' : '')
                }
                style={{ background: color(car, 0) }}
                onPointerDown={(e) => down(e, car)}
                aria-label={plainWord(car.word)}
              >
                <CarFace word={car.word} />
              </button>
            ))}
          </div>
        )}
      </div>
      {hold?.moved && (
        <span
          className="wt-car wt-car--ghost"
          style={{ left: hold.x, top: hold.y, background: color(hold.car, 0) }}
          aria-hidden
        >
          <CarFace word={hold.car.word} />
        </span>
      )}
    </div>
  );
}
