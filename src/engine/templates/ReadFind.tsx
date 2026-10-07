import { useEffect, useMemo, useRef, useState } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import type { ReadStep } from '@/engine/core/types';
import { sfx, speak } from '@/engine/audio/sound';
import ItemPic from '@/engine/ui/ItemPic';
import Scene from '@/engine/ui/Scene';
import { sparkleAt } from '@/engine/ui/juice';
import '@/engine/ui/read-find.css';

/**
 * Template `read-find` (Detektif Bacaan, versi premium "Kasus Detektif
 * Kucing" — docs/rencana-game-sd-kelas-3-4.md 2b.3 no. 5): anak membaca teks
 * pendek lalu MENYENTUH bukti di dalam teks itu, bukan memilih kartu A/B/C.
 *
 * - `sentence`: sentuh kalimat → kalimatnya DIBACAKAN dan terpilih; tombol
 *   "Ini buktinya!" yang menilai. Menyentuh tidak pernah dihitung salah, jadi
 *   anak boleh mendengarkan kalimat demi kalimat dulu.
 * - `word`: satu kalimat terbuka jadi kata-kata yang bisa disentuh (makna
 *   kata dari konteks).
 * - `choose`: misi besar — bacaannya diganti PAPAN BUKTI yang sudah terkumpul,
 *   lalu anak menunjuk jawabannya dari kartu.
 *
 * Bukti yang ditemukan di langkah ber-`clue` terbang ke papan bukti. Petunjuk
 * bertingkat (P2): tingkat 1 memudarkan separuh pilihan yang salah, tingkat 2
 * menyisakan jawaban + satu pengecoh saja.
 */

/** Kata dalam kalimat (spasi), tanda baca di ujung kata ikut tampil. */
function wordsOf(sentence: string): string[] {
  return sentence.split(/\s+/).filter(Boolean);
}

/** "makan," → "makan" — yang dibandingkan dengan `answer`. */
function bare(word: string): string {
  return word.replace(/[.,!?;:"“”']/g, '');
}

function shuffled<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * Pilihan yang dipudarkan petunjuk: tingkat 1 = separuh yang salah (dibulatkan
 * ke bawah, minimal satu kalau ada dua atau lebih), tingkat 2 = semua yang
 * salah kecuali satu. Urutannya diacak sekali per langkah (`order`) supaya
 * yang tersisa tidak selalu yang paling atas.
 */
function faded(order: number[], isRight: (i: number) => boolean, hint: 0 | 1 | 2): Set<number> {
  const wrong = order.filter((i) => !isRight(i));
  if (hint === 0 || wrong.length < 2) return new Set();
  const n = hint === 1 ? Math.max(1, Math.floor(wrong.length / 2)) : wrong.length - 1;
  return new Set(wrong.slice(0, n));
}

/** Kaca pembesar kecil di tombol — SVG supaya sama di semua HP. */
function Lens() {
  return (
    <svg className="rf-lens" viewBox="0 0 24 24" aria-hidden>
      <circle cx="10" cy="10" r="6.5" fill="#d8f0ff" stroke="#3a2e20" strokeWidth="2.6" />
      <path d="M15 15l6 6" stroke="#8a5a2b" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

function Guide({ pic }: { pic?: string }) {
  const [failed, setFailed] = useState(false);
  if (!pic || failed) {
    return (
      <span className="rf-guide rf-guide--emoji" aria-hidden>
        🔍
      </span>
    );
  }
  return (
    <img
      className="rf-guide"
      src={`${import.meta.env.BASE_URL}assets/ui/${pic}.webp`}
      alt=""
      aria-hidden
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}

interface Clue {
  emoji?: string;
  item?: string;
  label: string;
}

function ClueFace({ clue }: { clue: Clue }) {
  return (
    <>
      {clue.item ? (
        <ItemPic id={clue.item} className="rf-clue__img" fallbackClassName="rf-clue__emoji" />
      ) : (
        <span className="rf-clue__emoji" aria-hidden>
          {clue.emoji ?? '📌'}
        </span>
      )}
      <span className="rf-clue__label">{clue.label}</span>
    </>
  );
}

export default function ReadFind({
  level,
  onCorrect,
  onWrong,
  narrate,
  setRepeat,
  hint,
}: TemplateProps<'read-find'>) {
  const data = level.data;
  const steps = data.steps;
  const [si, setSi] = useState(0);
  const step: ReadStep = steps[si]!;
  /** Kalimat (langkah `sentence`) atau kata (langkah `word`) yang terpilih. */
  const [sel, setSel] = useState<number | null>(null);
  const [found, setFound] = useState<number[]>([]);
  const [clues, setClues] = useState<Clue[]>([]);
  const [shake, setShake] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [solved, setSolved] = useState(false);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
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

  const prompt = si === 0 ? level.narration : (step.say ?? level.narration);
  useEffect(() => {
    setRepeat(() => narrate(prompt));
    return () => setRepeat(null);
  }, [prompt, narrate, setRepeat]);

  /** Papan bukti hanya untuk level yang punya kartu bukti (misi besar). */
  const boardSize = steps.filter((s) => s.kind === 'sentence' && s.clue).length;

  const wordList = useMemo(
    () => (step.kind === 'word' ? wordsOf(data.sentences[step.sentence]!) : []),
    [step, data.sentences],
  );
  const choices = useMemo(() => (step.kind === 'choose' ? shuffled(step.choices) : []), [step]);

  /** Urutan acak per langkah untuk petunjuk — tetap selama langkah ini. */
  const hintOrder = useMemo(() => {
    const n =
      step.kind === 'sentence' ? data.sentences.length : step.kind === 'word' ? wordList.length : choices.length;
    return shuffled(Array.from({ length: n }, (_, i) => i));
  }, [step, data.sentences.length, wordList.length, choices.length]);

  const out = useMemo(() => {
    if (step.kind === 'sentence') {
      return faded(hintOrder, (i) => step.answer.includes(i) || found.includes(i), hint);
    }
    if (step.kind === 'word') return faded(hintOrder, (i) => bare(wordList[i]!) === step.answer, hint);
    // Kartu: hanya tingkat 2 yang memudarkan satu kartu salah (pola tap-answer).
    return hint === 2 ? faded(hintOrder, (i) => !!choices[i]!.correct, 1) : new Set<number>();
  }, [step, hint, hintOrder, found, wordList, choices]);

  // Pilihan yang dipudarkan petunjuk tak boleh tetap terpilih.
  useEffect(() => {
    if (sel !== null && out.has(sel)) setSel(null);
  }, [out, sel]);

  function goNext() {
    if (si + 1 < steps.length) {
      const next = steps[si + 1]!;
      setSi(si + 1);
      setSel(null);
      setBusy(false);
      narrate(next.say ?? level.narration);
      return;
    }
    if (boardSize > 0) {
      // Misi besar: "Kasus terpecahkan!" sebentar sebelum layar Hebat.
      setSolved(true);
      later(onCorrect, 1100);
    } else {
      onCorrect();
    }
  }

  /** Kartu bukti terbang dari kalimatnya ke tempatnya di papan. */
  function flyClue(from: Element | null, clue: Clue, slot: number, done: () => void) {
    const to = slotRefs.current[slot];
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!from || !to || reduce) {
      done();
      return;
    }
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'rf-fly';
    el.textContent = clue.emoji ?? '📌';
    el.style.left = `${a.left + a.width / 2 - 24}px`;
    el.style.top = `${a.top + a.height / 2 - 24}px`;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${
        b.top + b.height / 2 - (a.top + a.height / 2)
      }px) scale(0.8)`;
    });
    window.setTimeout(() => {
      el.remove();
      done();
    }, 650);
  }

  function right(at: Element | null) {
    setBusy(true);
    sfx('correct');
    const r = at?.getBoundingClientRect();
    if (r) sparkleAt(r.left + r.width / 2, r.top + r.height / 2, 8);
  }

  function wrong(index: number) {
    setShake(index);
    later(() => setShake(null), 450);
    setSel(null);
    onWrong();
  }

  function check() {
    if (busy || solved || sel === null) return;
    if (step.kind === 'sentence') {
      if (!step.answer.includes(sel)) {
        wrong(sel);
        return;
      }
      const row = rowRefs.current[sel] ?? null;
      right(row);
      setFound((f) => [...f, sel]);
      setSel(null);
      const clue = step.clue;
      if (clue) {
        const slot = clues.length;
        flyClue(row, clue, slot, () => {
          if (!alive.current) return;
          setClues((c) => [...c, clue]);
          later(goNext, 350);
        });
      } else {
        later(goNext, 650);
      }
    } else if (step.kind === 'word') {
      if (bare(wordList[sel]!) !== step.answer) {
        wrong(sel);
        return;
      }
      right(document.querySelector(`[data-word="${sel}"]`));
      later(goNext, 650);
    }
  }

  function choose(i: number, e: React.MouseEvent) {
    if (busy || solved || step.kind !== 'choose') return;
    if (choices[i]!.correct) {
      right(e.currentTarget);
      setSel(i);
      later(goNext, 500);
    } else {
      sfx('tap');
      wrong(i);
    }
  }

  function tapSentence(i: number) {
    if (busy || solved) return;
    speak(data.sentences[i]!);
    if (step.kind === 'sentence' && !found.includes(i) && !out.has(i)) setSel(i);
  }

  const board = boardSize > 0 && (
    <div className={'rf-board' + (step.kind === 'choose' ? ' rf-board--big' : '')} aria-label={`Papan bukti: ${data.title}`}>
      {Array.from({ length: boardSize }, (_, i) => (
        <div
          key={i}
          ref={(el) => {
            slotRefs.current[i] = el;
          }}
          className={'rf-clue' + (clues[i] ? '' : ' rf-clue--empty')}
        >
          {clues[i] ? <ClueFace clue={clues[i]!} /> : <span className="rf-clue__emoji">?</span>}
        </div>
      ))}
    </div>
  );

  return (
    <div className="rf-wrap">
      {data.scene && <Scene id={data.scene} />}
      <div className="rf-head">
        <Guide pic={data.guide} />
        <div className="game-prompt rf-prompt">{prompt}</div>
      </div>
      <div className="game-area rf-area">
        {board}
        {step.kind !== 'choose' ? (
          <div className="rf-paper">
            {/* Misi besar: tinggi judul dipakai papan bukti (judulnya ada di aria-label papan). */}
            {boardSize === 0 && <div className="rf-title">📁 {data.title}</div>}
            {data.sentences.map((text, i) => {
              if (step.kind === 'word' && i === step.sentence) {
                return (
                  <div key={i} className="rf-row rf-row--words">
                    {wordList.map((wd, k) => (
                      <button
                        key={k}
                        type="button"
                        data-word={k}
                        className={
                          'rf-word' +
                          (sel === k ? ' rf-word--sel' : '') +
                          (out.has(k) ? ' rf-word--out' : '') +
                          (shake === k ? ' rf-shake' : '')
                        }
                        disabled={out.has(k)}
                        onClick={() => !busy && setSel(k)}
                      >
                        {wd}
                      </button>
                    ))}
                  </div>
                );
              }
              const done = found.includes(i);
              return (
                <button
                  key={i}
                  type="button"
                  ref={(el) => {
                    rowRefs.current[i] = el;
                  }}
                  data-sentence={i}
                  className={
                    'rf-row' +
                    (sel === i && step.kind === 'sentence' ? ' rf-row--sel' : '') +
                    (done ? ' rf-row--found' : '') +
                    (step.kind === 'sentence' && out.has(i) ? ' rf-row--out' : '') +
                    (step.kind === 'word' ? ' rf-row--dim' : '') +
                    (shake === i && step.kind === 'sentence' ? ' rf-shake' : '')
                  }
                  onClick={() => tapSentence(i)}
                >
                  {done && <span className="rf-pin" aria-hidden>📌</span>}
                  {text}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rf-choices">
            {choices.map((c, i) => (
              <button
                key={c.text}
                type="button"
                className={
                  'choice-card rf-suspect' +
                  (out.has(i) ? ' choice-card--out' : '') +
                  (sel === i ? ' rf-suspect--right' : '') +
                  (shake === i ? ' rf-shake' : '')
                }
                disabled={out.has(i)}
                onClick={(e) => choose(i, e)}
              >
                {c.item ? (
                  <ItemPic id={c.item} className="rf-suspect__img" fallbackClassName="rf-suspect__emoji" />
                ) : (
                  <span className="rf-suspect__emoji">{c.emoji}</span>
                )}
                <span className="rf-suspect__name">{c.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Di luar `.game-area` supaya HP dimiringkan bisa menaruhnya di kolom kiri. */}
      {step.kind !== 'choose' && (
        <button type="button" className="btn btn--primary rf-check" disabled={sel === null || busy} onClick={check}>
          <Lens /> {step.kind === 'word' ? 'Ini katanya!' : 'Ini buktinya!'}
        </button>
      )}
      {solved && (
        <div className="rf-solved" aria-live="polite">
          <span>Kasus terpecahkan!</span>
        </div>
      )}
    </div>
  );
}
