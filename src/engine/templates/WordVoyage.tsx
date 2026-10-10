import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import type { VoyPhrase, VoyWord, WordVoyageData } from '@/engine/core/types';
import { sfx, speak, speakEnglish } from '@/engine/audio/sound';
import { sparkleAt } from '@/engine/ui/juice';
import ItemPic from '@/engine/ui/ItemPic';
import {
  VOY_LINES,
  bare,
  distractors,
  drawWords,
  optionCount,
  phraseText,
  remember,
  shuffle,
  spellable,
} from '@/engine/core/wordVoyage';
import '@/engine/ui/word-voyage.css';

/**
 * Kapten Kata (`sd2`, Bahasa Inggris) — kontrak datanya di `WordVoyageData`
 * (types.ts), otak pemilih kata & pengecohnya di `core/wordVoyage.ts`.
 *
 * Satu level = satu misi di satu pulau, dalam salah satu dari tujuh mode.
 * Satu misi berisi beberapa soal yang dikerjakan berurutan; shell baru
 * dipanggil (`onCorrect`) sesudah soal terakhir, jadi bintang misi dihitung
 * dari semua salah di misi itu.
 *
 * Yang membuatnya tidak membosankan:
 * - kata DIPILIH ENGINE tiap main (yang lemah di ingatan lebih sering), dan
 *   kata yang tadi salah MUNCUL LAGI di akhir misi (sekali) — anak menebus
 *   kesalahannya sendiri;
 * - pengecoh makin mirip ejaannya begitu katanya mulai dikuasai;
 * - COMBO untuk jawaban benar berturut-turut, dan gelembung makin cepat
 *   saat combo naik;
 * - tiap jawaban benar diakhiri SUARA INGGRIS kata/kalimatnya — telinga dan
 *   mata belajar bersama.
 *
 * Salah = SENYAP (`onWrong(true)`): kartu memerah & bergoyang, tanpa overlay
 * yang memotong permainan cepat. Petunjuk dihitung PER SOAL (bukan per misi):
 * salah ke-2 → tingkat 1 (huruf awal / huruf berikutnya samar), salah ke-3 →
 * tingkat 2 (jawaban menyala / satu pengecoh dipudarkan).
 */

type Hint = 0 | 1 | 2;
const hintFor = (misses: number): Hint => (misses >= 3 ? 2 : misses >= 2 ? 1 : 0);

/** Batas tunggu suara Inggris yang tak pernah melapor selesai. */
const SAY_MAX_MS = 2600;
/** Dianggap "cepat" untuk ingatan kata. */
const FAST_MS = 3500;

interface ModeProps {
  data: WordVoyageData;
  finish: () => void;
  wrong: () => void;
  setRepeat: TemplateProps['setRepeat'];
  narrate: (text: string) => void;
  narration: string;
  setCombo: (fn: (c: number) => number) => void;
  setProgress: (done: number, total: number) => void;
}

/** Ucapkan kata Inggris lalu lanjut — sekali, walau klipnya tak melapor. */
function sayThen(text: string, then: () => void) {
  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    then();
  };
  speakEnglish(text, go);
  window.setTimeout(go, SAY_MAX_MS);
}

function sparkleOn(el: Element | null | undefined, n = 8) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  if (!r.width) return;
  sparkleAt(r.left + r.width / 2, r.top + r.height / 2, n);
}

/** Gambar satu kata: seni item, contoh warna, angka besar, atau emoji. */
export function WordPic({ w, size = 'md' }: { w: VoyWord; size?: 'sm' | 'md' | 'lg' }) {
  const cls = `wv-pic wv-pic--${size}`;
  if (w.color) return <span className={`${cls} wv-pic--swatch`} style={{ background: w.color }} aria-hidden />;
  if (w.num !== undefined)
    return (
      <span className={`${cls} wv-pic--num`} aria-hidden>
        {w.num}
      </span>
    );
  if (w.item) return <ItemPic id={w.item} className={`${cls} wv-pic--img`} fallbackClassName={`${cls} wv-pic--emoji`} />;
  return (
    <span className={`${cls} wv-pic--emoji`} aria-hidden>
      {w.emoji ?? '❓'}
    </span>
  );
}

/** Ukuran dasar tulisan kata Inggris di kartu, menurut panjangnya. */
function wordSize(text: string): string {
  const n = text.length;
  return n <= 5 ? 'wv-w--l' : n <= 8 ? 'wv-w--m' : 'wv-w--s';
}

/**
 * Kata TIDAK BOLEH patah di tengah ("elephan / t" terbaca dua kata). Jadi
 * tulisannya diperkecil sampai kata terpanjangnya muat selebar kartu: ±0,62em
 * per huruf, diukur dari lebar kartunya sendiri (`cqw`, kartunya container).
 */
function fitStyle(text: string): { fontSize: string } | undefined {
  const longest = Math.max(...text.split(' ').map((w) => w.length));
  if (longest <= 3) return undefined;
  return { fontSize: `min(var(--wv-fs), ${(140 / longest).toFixed(1)}cqw)` };
}

/** Satu kata Inggris di kartu/gelembung — ukuran dasar + dijaga muat. */
function EnWord({ text }: { text: string }) {
  return (
    <span className={`wv-w ${wordSize(text)}`} style={fitStyle(text)}>
      {text}
    </span>
  );
}

function SpeakerButton({ text, big = false }: { text: string; big?: boolean }) {
  return (
    <button
      type="button"
      className={'wv-ear' + (big ? ' wv-ear--big' : '')}
      aria-label="Dengarkan lagi"
      onClick={() => speakEnglish(text)}
    >
      🔊
    </button>
  );
}

/* ================================================================== */
/*  Template                                                          */
/* ================================================================== */

const MODE_LABEL: Record<WordVoyageData['mode'], string> = {
  pick: '🖼️ Tebak Gambar',
  listen: '🎧 Kuping Tajam',
  spell: '🔤 Susun Huruf',
  bubbles: '🐠 Gelembung Kata',
  pairs: '🃏 Kartu Kembar',
  build: '🧩 Rangkai Kalimat',
  boss: '🐙 Lawan Gurita',
};

export default function WordVoyage({ level, onCorrect, onWrong, narrate, setRepeat }: TemplateProps<'word-voyage'>) {
  const data = level.data;
  const [combo, setCombo] = useState(0);
  const [prog, setProg] = useState({ done: 0, total: 1 });
  const finished = useRef(false);

  // Stabil: mode-mode memanggilnya dari efek.
  const setProgress = useCallback((done: number, total: number) => {
    setProg((p) => (p.done === done && p.total === total ? p : { done, total }));
  }, []);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onCorrect();
  };

  const props: ModeProps = {
    data,
    finish,
    wrong: () => onWrong(true),
    setRepeat,
    narrate,
    narration: level.narration,
    setCombo,
    setProgress,
  };

  const pct = Math.min(100, (prog.done / Math.max(1, prog.total)) * 100);

  return (
    <div className={`wv-wrap wv-wrap--${data.mode}`} data-level={level.id}>
      <div className="wv-head">
        <span className="wv-mode" title={data.island}>{MODE_LABEL[data.mode]}</span>
        <span className="wv-voyage" aria-label={`Soal ${prog.done} dari ${prog.total}`}>
          <i style={{ width: `${pct}%` }} />
          <b className="wv-boat" style={{ left: `${pct}%` }} aria-hidden>
            ⛵
          </b>
          <b className="wv-flag" aria-hidden>
            🏝️
          </b>
        </span>
        {combo >= 2 && (
          <span className="wv-combo" key={combo}>
            🔥×{combo}
          </span>
        )}
      </div>
      <div className="game-prompt wv-prompt">{level.narration}</div>
      <div className="game-area wv-area">
        <ModeView {...props} />
      </div>
    </div>
  );
}

function ModeView(p: ModeProps) {
  switch (p.data.mode) {
    case 'pick':
    case 'listen':
      return <ChoiceMode {...p} />;
    case 'spell':
      return <SpellMode {...p} />;
    case 'bubbles':
      return <BubbleMode {...p} />;
    case 'pairs':
      return <PairsMode {...p} />;
    case 'build':
      return <BuildMode {...p} />;
    case 'boss':
      return <BossMode {...p} />;
  }
}

/* ---------- Antrean soal: kata yang salah muncul lagi sekali ---------- */

function useQueue(initial: () => VoyWord[]) {
  const [queue, setQueue] = useState<VoyWord[]>(initial);
  const requeued = useRef(new Set<string>());
  const [ix, setIx] = useState(0);
  /** Tandai kata ini salah: tambahkan sekali lagi di akhir antrean. */
  const again = (w: VoyWord) => {
    if (requeued.current.has(w.en)) return;
    requeued.current.add(w.en);
    setQueue((q) => [...q, w]);
  };
  return { queue, ix, setIx, again, current: queue[ix] };
}

/* ---------- pick & listen ---------- */

function ChoiceMode({ data, finish, wrong, setRepeat, setCombo, setProgress }: ModeProps) {
  const listen = data.mode === 'listen';
  const { queue, ix, setIx, again, current } = useQueue(() => drawWords(data.words, data.count ?? 4));
  const [misses, setMisses] = useState(0);
  const [bad, setBad] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const shownAt = useRef(Date.now());
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const w = current!;

  const options = useMemo(
    () => shuffle([w, ...distractors(w, data.words, optionCount(w) - 1)]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ix, queue.length === 0],
  );

  useEffect(() => setProgress(ix, queue.length), [ix, queue.length, setProgress]);

  // Mode dengar: kata Inggrisnya diucapkan tiap soal muncul. Soal pertama
  // menunggu narasi misi selesai (shell membacakannya SESUDAH efek ini).
  useEffect(() => {
    shownAt.current = Date.now();
    if (!listen) return;
    const first = ix === 0;
    const t = window.setTimeout(() => speakEnglish(w.en, undefined, first), first ? 0 : 150);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ix]);

  useEffect(() => {
    if (!listen) return;
    setRepeat(() => speakEnglish(w.en));
    return () => setRepeat(null);
  }, [listen, w, setRepeat]);

  const hint = hintFor(misses);
  // Tingkat 2: satu pengecoh yang belum dicoba dipudarkan.
  const faded = hint >= 2 ? options.find((o) => o.en !== w.en && !bad.includes(o.en))?.en : undefined;

  function tap(o: VoyWord) {
    if (solved || bad.includes(o.en) || o.en === faded) return;
    if (o.en !== w.en) {
      sfx('wrong');
      setBad((b) => [...b, o.en]);
      if (misses === 0) {
        remember(w.en, 'wrong');
        again(w);
      }
      setMisses((m) => m + 1);
      setCombo(() => 0);
      wrong();
      return;
    }
    setSolved(true);
    sparkleOn(cardRefs.current[o.en]);
    if (misses === 0) {
      remember(w.en, 'right', Date.now() - shownAt.current < FAST_MS);
      setCombo((c) => c + 1);
    }
    sfx('tap');
    sayThen(w.en, () => {
      if (ix + 1 >= queue.length) {
        setProgress(queue.length, queue.length);
        finish();
        return;
      }
      setIx(ix + 1);
      setMisses(0);
      setBad([]);
      setSolved(false);
    });
  }

  return (
    <div className="wv-choice">
      <div className="wv-cue" key={ix} data-round={ix}>
        {listen ? (
          <>
            <SpeakerButton text={w.en} big />
            <span className="wv-cue__hint">
              {solved ? <b className={`wv-w ${wordSize(w.en)}`}>{w.en}</b> : hint >= 1 ? <b className="wv-first">{w.en[0]}…</b> : '?'}
            </span>
          </>
        ) : (
          <>
            <WordPic w={w} size="lg" />
            <span className="wv-cue__id">
              {w.id}
              {hint >= 1 && !solved && <b className="wv-first"> · {w.en[0]}…</b>}
            </span>
          </>
        )}
      </div>
      <div className={'wv-opts' + (listen ? ' wv-opts--pics' : '') + (options.length === 4 ? ' wv-opts--4' : '')}>
        {options.map((o) => {
          const right = solved && o.en === w.en;
          const cls =
            'wv-opt' +
            (right ? ' wv-opt--right' : '') +
            (bad.includes(o.en) ? ' wv-opt--bad' : '') +
            (o.en === faded ? ' wv-opt--out' : '');
          return (
            <button
              key={o.en}
              ref={(el) => {
                cardRefs.current[o.en] = el;
              }}
              type="button"
              className={cls}
              aria-label={listen ? o.id : o.en}
              onClick={() => tap(o)}
            >
              {listen ? (
                <>
                  <WordPic w={o} size="md" />
                  {right && <span className="wv-opt__en">{o.en}</span>}
                </>
              ) : (
                <EnWord text={o.en} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- spell ---------- */

/** Huruf pengecoh yang khas tertukar; sisanya acak dari abjad. */
const LOOKALIKE: Record<string, string> = { b: 'd', d: 'b', p: 'q', m: 'n', n: 'm', u: 'v', v: 'w', e: 'a', a: 'e', i: 'e', o: 'u' };
const ABC = 'abcdefghijklmnopqrstuvwxyz';

interface Tile {
  key: string;
  ch: string;
}

function trayFor(word: string): Tile[] {
  const letters = word.toLowerCase().split('');
  const extra: string[] = [];
  const near = letters.map((c) => LOOKALIKE[c]).find((c) => c && !letters.includes(c));
  if (near) extra.push(near);
  while (extra.length < 2) {
    const c = ABC[Math.floor(Math.random() * ABC.length)]!;
    if (!letters.includes(c) && !extra.includes(c)) extra.push(c);
  }
  return shuffle([...letters, ...extra]).map((ch, i) => ({ key: `${i}-${ch}`, ch }));
}

function SpellMode({ data, finish, wrong, setRepeat, setCombo, setProgress }: ModeProps) {
  const pool = data.words.filter(spellable);
  const { queue, ix, setIx, current } = useQueue(() => drawWords(pool, data.count ?? 3));
  const w = current!;
  const target = w.en.toLowerCase();
  const tray = useMemo(() => trayFor(target), [target, ix]);
  const [placed, setPlaced] = useState<string[]>([]); // kunci tile yang terpasang, urut
  const [misses, setMisses] = useState(0);
  const [shake, setShake] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const roundMisses = useRef(0);
  const shownAt = useRef(Date.now());
  const wordRef = useRef<HTMLDivElement>(null);

  useEffect(() => setProgress(ix, queue.length), [ix, queue.length, setProgress]);

  useEffect(() => {
    shownAt.current = Date.now();
    const first = ix === 0;
    const t = window.setTimeout(() => speakEnglish(w.en, undefined, first), first ? 0 : 150);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ix]);

  useEffect(() => {
    setRepeat(() => speakEnglish(w.en));
    return () => setRepeat(null);
  }, [w, setRepeat]);

  const k = placed.length;
  const next = target[k];
  const hint = hintFor(misses);
  const glow = hint >= 2 ? tray.find((t) => t.ch === next && !placed.includes(t.key))?.key : undefined;

  function tap(t: Tile) {
    if (done || placed.includes(t.key)) return;
    if (t.ch !== next) {
      sfx('wrong');
      setShake(t.key);
      window.setTimeout(() => setShake(null), 380);
      if (roundMisses.current === 0) remember(w.en, 'wrong');
      roundMisses.current += 1;
      setMisses((m) => m + 1);
      setCombo(() => 0);
      wrong();
      return;
    }
    sfx('tap');
    const now = [...placed, t.key];
    setPlaced(now);
    setMisses(0);
    if (now.length < target.length) return;
    setDone(true);
    sparkleOn(wordRef.current, 12);
    if (roundMisses.current === 0) {
      remember(w.en, 'right', Date.now() - shownAt.current < FAST_MS * 2);
      setCombo((c) => c + 1);
    }
    sayThen(w.en, () => {
      if (ix + 1 >= queue.length) {
        setProgress(queue.length, queue.length);
        finish();
        return;
      }
      roundMisses.current = 0;
      setIx(ix + 1);
      setPlaced([]);
      setDone(false);
    });
  }

  return (
    <div className="wv-spell">
      <div className="wv-cue wv-cue--row" key={ix} data-round={ix}>
        <WordPic w={w} size="md" />
        <span className="wv-cue__id">{w.id}</span>
        <SpeakerButton text={w.en} />
      </div>
      <div ref={wordRef} className={'wv-slots' + (done ? ' wv-slots--done' : '')} style={{ ['--n' as string]: target.length }}>
        {target.split('').map((ch, i) => (
          <span key={i} className={'wv-slot' + (i < k ? ' wv-slot--full' : i === k && !done ? ' wv-slot--next' : '')}>
            {i < k ? ch : i === k && hint >= 1 ? <i className="wv-slot__ghost">{ch}</i> : ''}
          </span>
        ))}
      </div>
      <div className="wv-tray">
        {tray.map((t) => (
          <button
            key={t.key}
            type="button"
            className={
              'wv-tile' +
              (placed.includes(t.key) ? ' wv-tile--used' : '') +
              (shake === t.key ? ' wv-tile--bad' : '') +
              (glow === t.key ? ' wv-tile--glow' : '')
            }
            onClick={() => tap(t)}
            disabled={placed.includes(t.key)}
          >
            {t.ch}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- bubbles ---------- */

interface Bubble {
  id: number;
  word: VoyWord;
  lane: number;
}

const BUBBLE_H = 66;

function BubbleMode({ data, finish, wrong, setCombo, setProgress }: ModeProps) {
  const targets = useMemo(() => drawWords(data.words, data.count ?? 5), [data.words, data.count]);
  const [ti, setTi] = useState(0);
  const target = targets[ti]!;
  const paneRef = useRef<HTMLDivElement>(null);
  const [lanes, setLanes] = useState(3);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [misses, setMisses] = useState(0);
  const [popped, setPopped] = useState<number | null>(null);
  const [badId, setBadId] = useState<number | null>(null);
  const nextId = useRef(1);
  const ys = useRef(new Map<number, number>()); // jarak dari dasar kolam (px)
  const els = useRef(new Map<number, HTMLButtonElement>());
  const comboRef = useRef(0);
  const busy = useRef(false);
  const targetRef = useRef(target);
  targetRef.current = target;
  const shownAt = useRef(Date.now());
  const roundMissed = useRef(false);

  useEffect(() => setProgress(ti, targets.length), [ti, targets.length, setProgress]);

  /** Kata untuk gelembung baru: kadang target, selebihnya pengecoh. */
  const pickWord = (current: Bubble[], mustTarget: boolean): VoyWord => {
    const t = targetRef.current;
    const hasTarget = current.some((b) => b.word.en === t.en);
    if (mustTarget || (!hasTarget && Math.random() < 0.6)) return t;
    const others = data.words.filter((w) => w.en !== t.en && !current.some((b) => b.word.en === w.en));
    return others[Math.floor(Math.random() * others.length)] ?? t;
  };

  // Susun gelembung awal sesuai lebar kolam: 3 jalur di HP, 4 di layar lebar.
  useEffect(() => {
    const width = paneRef.current?.clientWidth ?? 320;
    const n = width >= 460 ? 4 : 3;
    setLanes(n);
    const height = paneRef.current?.clientHeight ?? 300;
    const start: Bubble[] = [];
    for (let i = 0; i < n; i += 1) {
      const must = i === n - 1 && !start.some((x) => x.word.en === targetRef.current.en);
      const b: Bubble = { id: nextId.current++, lane: i, word: pickWord(start, must) };
      ys.current.set(b.id, (height * (i + 0.6)) / (n + 0.6) - BUBBLE_H);
      start.push(b);
    }
    setBubbles(start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Target baru → pastikan ada di kolam: ganti gelembung terbawah yang bukan target.
  useEffect(() => {
    shownAt.current = Date.now();
    roundMissed.current = false;
    setBubbles((bs) => {
      if (!bs.length || bs.some((b) => b.word.en === target.en)) return bs;
      let low = bs[0]!;
      for (const b of bs) if ((ys.current.get(b.id) ?? 0) < (ys.current.get(low.id) ?? 0)) low = b;
      return bs.map((b) => (b.id === low.id ? { ...b, word: target } : b));
    });
  }, [target]);

  // Gerak: rAF menulis transform langsung ke DOM; React hanya saat gelembung lahir ulang.
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const pane = paneRef.current;
      const h = pane?.clientHeight ?? 300;
      const speed = (reduce ? 10 : 30) * (1 + 0.15 * Math.min(4, comboRef.current));
      const reborn: number[] = [];
      for (const [id, el] of els.current) {
        if (popped === id) continue;
        const y = (ys.current.get(id) ?? 0) + speed * dt;
        if (y > h + 10) {
          reborn.push(id);
          ys.current.set(id, -BUBBLE_H - Math.random() * 40);
        } else ys.current.set(id, y);
        const wob = Math.sin(t / 700 + id) * 6;
        el.style.transform = `translate(${wob}px, ${-(ys.current.get(id) ?? 0)}px)`;
      }
      if (reborn.length) {
        setBubbles((bs) => {
          const out = [...bs];
          for (const id of reborn) {
            const i = out.findIndex((b) => b.id === id);
            if (i < 0) continue;
            const rest = out.filter((_, j) => j !== i);
            const mustTarget = !rest.some((b) => b.word.en === targetRef.current.en);
            out[i] = { ...out[i]!, word: pickWord(rest, mustTarget) };
          }
          return out;
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popped]);

  const hint = hintFor(misses);

  function tap(b: Bubble) {
    if (busy.current || popped === b.id) return;
    if (b.word.en !== target.en) {
      sfx('wrong');
      setBadId(b.id);
      window.setTimeout(() => setBadId(null), 420);
      if (!roundMissed.current) remember(target.en, 'wrong');
      roundMissed.current = true;
      comboRef.current = 0;
      setCombo(() => 0);
      setMisses((m) => m + 1);
      wrong();
      return;
    }
    busy.current = true;
    setPopped(b.id);
    sparkleOn(els.current.get(b.id), 12);
    sfx('tap');
    if (!roundMissed.current) {
      remember(target.en, 'right', Date.now() - shownAt.current < FAST_MS * 1.5);
      comboRef.current += 1;
      setCombo((c) => c + 1);
    }
    sayThen(target.en, () => {
      busy.current = false;
      if (ti + 1 >= targets.length) {
        setProgress(targets.length, targets.length);
        finish();
        return;
      }
      // Gelembung yang pecah lahir lagi dari dasar kolam dengan kata lain.
      ys.current.set(b.id, -BUBBLE_H);
      setPopped(null);
      setMisses(0);
      const nextTarget = targets[ti + 1]!;
      targetRef.current = nextTarget;
      setBubbles((bs) =>
        bs.map((x) => (x.id === b.id ? { ...x, word: pickWord(bs.filter((y) => y.id !== b.id), false) } : x)),
      );
      setTi(ti + 1);
    });
  }

  return (
    <div className="wv-bubbles">
      <div className="wv-cue wv-cue--row" key={ti} data-round={ti}>
        <span className="wv-cue__find">Cari:</span>
        <WordPic w={target} size="sm" />
        <span className="wv-cue__id">
          {target.id}
          {hint >= 1 && <b className="wv-first"> · {target.en[0]}…</b>}
        </span>
      </div>
      <div ref={paneRef} className="wv-pond" style={{ ['--lanes' as string]: lanes }}>
        <span className="wv-pond__weed wv-pond__weed--a" aria-hidden />
        <span className="wv-pond__weed wv-pond__weed--b" aria-hidden />
        {bubbles.map((b) => (
          <button
            key={b.id}
            ref={(el) => {
              if (el) els.current.set(b.id, el);
              else els.current.delete(b.id);
            }}
            type="button"
            className={
              'wv-bubble' +
              (popped === b.id ? ' wv-bubble--pop' : '') +
              (badId === b.id ? ' wv-bubble--bad' : '') +
              (hint >= 2 && b.word.en === target.en ? ' wv-bubble--glow' : '')
            }
            style={{ left: `calc(${(b.lane + 0.5) / lanes} * 100%)` }}
            onPointerDown={() => tap(b)}
          >
            <EnWord text={b.word.en} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- pairs ---------- */

interface Card {
  key: string;
  word: VoyWord;
  side: 'pic' | 'word';
}

function PairsMode({ data, finish, wrong, setCombo, setProgress }: ModeProps) {
  const cards = useMemo(() => {
    const ws = drawWords(data.words, data.count ?? 4);
    return shuffle(ws.flatMap((w) => [
      { key: `p-${w.en}`, word: w, side: 'pic' as const },
      { key: `w-${w.en}`, word: w, side: 'word' as const },
    ]));
  }, [data.words, data.count]);
  const pairs = cards.length / 2;
  const [open, setOpen] = useState<string[]>([]);
  const [done, setDone] = useState<string[]>([]); // kata yang sudah cocok
  const [misses, setMisses] = useState(0);
  const seen = useRef(new Set<string>());
  const lock = useRef(false);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => setProgress(done.length, pairs), [done.length, pairs, setProgress]);

  // Petunjuk: sesudah dua salah yang "seharusnya tahu", pasangan kartu yang
  // sedang terbuka berkedip samar.
  const hintKey =
    misses >= 2 && open.length === 1
      ? cards.find((c) => c.word.en === cards.find((x) => x.key === open[0])?.word.en && c.key !== open[0])?.key
      : undefined;

  function flip(c: Card) {
    if (lock.current || open.includes(c.key) || done.includes(c.word.en)) return;
    sfx('tap');
    if (c.side === 'word') speakEnglish(c.word.en);
    const now = [...open, c.key];
    setOpen(now);
    if (now.length < 2) return;
    const [a, b] = now.map((k) => cards.find((x) => x.key === k)!);
    lock.current = true;
    if (a!.word.en === b!.word.en) {
      const doneNow = [...done, a!.word.en];
      window.setTimeout(() => {
        setDone(doneNow);
        setOpen([]);
        sparkleOn(refs.current[b!.key], 10);
        remember(a!.word.en, 'right');
        setCombo((x) => x + 1);
        lock.current = false;
        if (doneNow.length >= pairs) {
          setProgress(pairs, pairs);
          window.setTimeout(finish, 700);
        }
      }, 500);
    } else {
      // Salah hanya dihitung kalau anak SEHARUSNYA tahu: pasangan kartu yang
      // dibukanya sudah pernah terlihat. Membuka kartu baru itu menjelajah.
      const partnerSeen = (x: Card) =>
        seen.current.has(`${x.side === 'pic' ? 'w' : 'p'}-${x.word.en}`);
      const informed = partnerSeen(a!) || partnerSeen(b!);
      seen.current.add(a!.key);
      seen.current.add(b!.key);
      if (informed) {
        sfx('wrong');
        setMisses((m) => m + 1);
        setCombo(() => 0);
        remember(a!.word.en, 'wrong');
        wrong();
      }
      window.setTimeout(() => {
        setOpen([]);
        lock.current = false;
      }, 1000);
    }
    seen.current.add(c.key);
  }

  return (
    <div className="wv-pairs">
      {cards.map((c) => {
        const isOpen = open.includes(c.key) || done.includes(c.word.en);
        return (
          <button
            key={c.key}
            ref={(el) => {
              refs.current[c.key] = el;
            }}
            type="button"
            className={
              'wv-card' +
              (isOpen ? ' wv-card--open' : '') +
              (done.includes(c.word.en) ? ' wv-card--done' : '') +
              (hintKey === c.key ? ' wv-card--hint' : '')
            }
            aria-label={isOpen ? (c.side === 'word' ? c.word.en : c.word.id) : 'Kartu tertutup'}
            onClick={() => flip(c)}
          >
            <span className="wv-card__in">
              <span className="wv-card__back" aria-hidden>
                ⚓
              </span>
              <span className="wv-card__face">
                {c.side === 'pic' ? <WordPic w={c.word} size="md" /> : <EnWord text={c.word.en} />}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- build ---------- */

interface WordTile {
  key: string;
  text: string;
}

function trayForPhrase(p: VoyPhrase): WordTile[] {
  const extra = p.wrong[0];
  const words = [...p.words, extra];
  return shuffle(words).map((text, i) => ({ key: `${i}-${text}`, text }));
}

const same = (a: string, b: string) => bare(a).toLowerCase() === bare(b).toLowerCase();

function PhrasePic({ p }: { p: VoyPhrase }) {
  if (p.item) return <ItemPic id={p.item} className="wv-pic wv-pic--sm wv-pic--img" fallbackClassName="wv-pic wv-pic--sm wv-pic--emoji" />;
  return (
    <span className="wv-pic wv-pic--sm wv-pic--emoji" aria-hidden>
      {p.emoji ?? '💬'}
    </span>
  );
}

function BuildMode({ data, finish, wrong, setCombo, setProgress }: ModeProps) {
  const phrases = useMemo(() => shuffle(data.phrases ?? []).slice(0, data.count ?? 2), [data.phrases, data.count]);
  const [pi, setPi] = useState(0);
  const p = phrases[pi]!;
  const tray = useMemo(() => trayForPhrase(p), [p]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [misses, setMisses] = useState(0);
  const [shake, setShake] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const roundMissed = useRef(false);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => setProgress(pi, phrases.length), [pi, phrases.length, setProgress]);

  const k = placed.length;
  const next = p.words[k] ?? '';
  const hint = hintFor(misses);
  const glow = hint >= 2 ? tray.find((t) => same(t.text, next) && !placed.includes(t.key))?.key : undefined;

  useEffect(() => {
    if (hint === 1) speakEnglish(phraseText(p));
  }, [hint, p]);

  function tap(t: WordTile) {
    if (done || placed.includes(t.key)) return;
    if (!same(t.text, next)) {
      sfx('wrong');
      setShake(t.key);
      window.setTimeout(() => setShake(null), 380);
      roundMissed.current = true;
      setMisses((m) => m + 1);
      setCombo(() => 0);
      wrong();
      return;
    }
    sfx('tap');
    const now = [...placed, t.key];
    setPlaced(now);
    setMisses(0);
    if (now.length < p.words.length) return;
    setDone(true);
    sparkleOn(lineRef.current, 14);
    if (!roundMissed.current) setCombo((c) => c + 1);
    sayThen(phraseText(p), () => {
      if (pi + 1 >= phrases.length) {
        setProgress(phrases.length, phrases.length);
        finish();
        return;
      }
      roundMissed.current = false;
      setPi(pi + 1);
      setPlaced([]);
      setDone(false);
    });
  }

  const placedText = placed.map((key) => tray.find((t) => t.key === key)!.text);

  return (
    <div className="wv-build">
      <div className="wv-cue wv-cue--row" key={pi} data-round={pi}>
        <PhrasePic p={p} />
        <span className="wv-cue__id wv-cue__id--sentence">{p.id}</span>
      </div>
      <div ref={lineRef} className={'wv-line' + (done ? ' wv-line--done' : '')}>
        {p.words.map((word, i) => (
          <span key={i} className={'wv-gap' + (i < k ? ' wv-gap--full' : i === k && !done ? ' wv-gap--next' : '')}>
            {i < k ? placedText[i] : i === k && hint >= 1 ? <i className="wv-slot__ghost">{bare(word)[0]}…</i> : ''}
          </span>
        ))}
      </div>
      <div className="wv-tray wv-tray--words">
        {tray.map((t) => (
          <button
            key={t.key}
            type="button"
            className={
              'wv-tile wv-tile--word' +
              (placed.includes(t.key) ? ' wv-tile--used' : '') +
              (shake === t.key ? ' wv-tile--bad' : '') +
              (glow === t.key ? ' wv-tile--glow' : '')
            }
            disabled={placed.includes(t.key)}
            onClick={() => tap(t)}
          >
            {t.text}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- boss ---------- */

type BossQ =
  | { kind: 'pick' | 'listen'; word: VoyWord; options: VoyWord[] }
  | { kind: 'gap'; phrase: VoyPhrase; options: string[] };

function bossQuestions(data: WordVoyageData, hp: number): BossQ[] {
  const words = drawWords(data.words, hp);
  const phrases = shuffle(data.phrases ?? []);
  const order: BossQ['kind'][] = ['pick', 'listen', 'gap', 'pick', 'gap', 'listen', 'gap', 'pick'];
  let wi = 0;
  let pi = 0;
  const out: BossQ[] = [];
  for (let i = 0; i < hp; i += 1) {
    const kind = order[i % order.length]!;
    if (kind === 'gap' && pi < phrases.length) {
      const phrase = phrases[pi++]!;
      out.push({ kind, phrase, options: shuffle([bare(phrase.words[phrase.gap]!), ...phrase.wrong]) });
    } else {
      const word = words[wi++ % words.length]!;
      const k: 'pick' | 'listen' = kind === 'listen' ? 'listen' : 'pick';
      out.push({ kind: k, word, options: shuffle([word, ...distractors(word, data.words, 2)]) });
    }
  }
  return out;
}

function Octopus({ mood }: { mood: 'idle' | 'hit' | 'laugh' | 'beaten' }) {
  return (
    <svg className={`wv-octo wv-octo--${mood}`} viewBox="0 0 120 110" aria-hidden>
      <g className="wv-octo__legs">
        {[18, 34, 50, 70, 86, 102].map((x, i) => (
          <path
            key={x}
            d={`M${x} 62 q${i % 2 ? 8 : -8} 18 0 30 q${i % 2 ? -6 : 6} 8 ${i % 2 ? 4 : -4} 14`}
            fill="none"
            stroke="#9b5de5"
            strokeWidth="11"
            strokeLinecap="round"
          />
        ))}
      </g>
      <ellipse cx="60" cy="44" rx="40" ry="36" fill="#a66cff" stroke="#5b2a91" strokeWidth="3" />
      <ellipse cx="46" cy="30" rx="9" ry="6" fill="#fff" opacity="0.35" />
      {mood === 'beaten' ? (
        <>
          <path d="M40 44 l10 8 M50 44 l-10 8 M70 44 l10 8 M80 44 l-10 8" stroke="#2b0f4a" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M50 64 q10 -6 20 0" fill="none" stroke="#2b0f4a" strokeWidth="3.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="45" cy="46" r="8" fill="#fff" />
          <circle cx="75" cy="46" r="8" fill="#fff" />
          <circle cx={mood === 'laugh' ? 46 : 47} cy="47" r="4" fill="#2b0f4a" />
          <circle cx={mood === 'laugh' ? 74 : 77} cy="47" r="4" fill="#2b0f4a" />
          {mood === 'laugh' ? (
            <path d="M47 60 q13 14 26 0 z" fill="#5b2a91" />
          ) : (
            <path d="M50 62 q10 8 20 0" fill="none" stroke="#2b0f4a" strokeWidth="3.5" strokeLinecap="round" />
          )}
          <circle cx="36" cy="58" r="5" fill="#ff8fc7" opacity="0.7" />
          <circle cx="84" cy="58" r="5" fill="#ff8fc7" opacity="0.7" />
        </>
      )}
    </svg>
  );
}

function BossMode({ data, finish, wrong, setRepeat, setCombo, setProgress }: ModeProps) {
  const hp = data.count ?? 6;
  const qs = useMemo(() => bossQuestions(data, hp), [data, hp]);
  const [qi, setQi] = useState(0);
  const [bad, setBad] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [mood, setMood] = useState<'idle' | 'hit' | 'laugh' | 'beaten'>('idle');
  const [misses, setMisses] = useState(0);
  const shownAt = useRef(Date.now());
  const q = qs[qi]!;
  const left = hp - qi - (solved ? 1 : 0);

  useEffect(() => setProgress(qi, hp), [qi, hp, setProgress]);

  useEffect(() => {
    shownAt.current = Date.now();
    if (q.kind !== 'listen') return;
    const first = qi === 0;
    const t = window.setTimeout(() => speakEnglish(q.word.en, undefined, first), first ? 0 : 200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qi]);

  useEffect(() => {
    if (q.kind === 'listen') setRepeat(() => speakEnglish(q.word.en));
    else setRepeat(null);
    return () => setRepeat(null);
  }, [q, setRepeat]);

  const answerKey = q.kind === 'gap' ? bare(q.phrase.words[q.phrase.gap]!) : q.word.en;
  const keys = q.kind === 'gap' ? q.options : q.options.map((o) => o.en);
  const faded = hintFor(misses) >= 2 ? keys.find((k) => k !== answerKey && !bad.includes(k)) : undefined;

  function tap(key: string) {
    if (solved || bad.includes(key) || key === faded) return;
    if (key !== answerKey) {
      sfx('wrong');
      setBad((b) => [...b, key]);
      setMood('laugh');
      window.setTimeout(() => setMood('idle'), 700);
      if (q.kind !== 'gap' && misses === 0) remember(q.word.en, 'wrong');
      setMisses((m) => m + 1);
      setCombo(() => 0);
      wrong();
      return;
    }
    setSolved(true);
    sfx('correct');
    setMood('hit');
    if (q.kind !== 'gap' && misses === 0) remember(q.word.en, 'right', Date.now() - shownAt.current < FAST_MS);
    if (misses === 0) setCombo((c) => c + 1);
    const spoken = q.kind === 'gap' ? phraseText(q.phrase) : q.word.en;
    sayThen(spoken, () => {
      if (qi + 1 >= hp) {
        setProgress(hp, hp);
        setMood('beaten');
        speak(VOY_LINES.bossWin, () => window.setTimeout(finish, 200));
        window.setTimeout(finish, 3200);
        return;
      }
      setMood('idle');
      setQi(qi + 1);
      setBad([]);
      setMisses(0);
      setSolved(false);
    });
  }

  return (
    <div className="wv-boss">
      <div className="wv-boss__top">
        <Octopus mood={mood} />
        <div className="wv-boss__hp" aria-label={`Tenaga gurita ${left} dari ${hp}`}>
          {Array.from({ length: hp }, (_, i) => (
            <span key={i} className={'wv-hp' + (i < left ? ' wv-hp--on' : '')} />
          ))}
        </div>
        {mood === 'beaten' && <span className="wv-boss__flag" aria-hidden>🏳️</span>}
      </div>
      <div className="wv-cue wv-cue--row wv-cue--boss" key={qi} data-round={qi}>
        {q.kind === 'pick' && (
          <>
            <WordPic w={q.word} size="sm" />
            <span className="wv-cue__id">{q.word.id}</span>
          </>
        )}
        {q.kind === 'listen' && <SpeakerButton text={q.word.en} />}
        {q.kind === 'gap' && (
          <span className="wv-gapline">
            {q.phrase.words.map((word, i) =>
              i === q.phrase.gap ? (
                <span key={i} className={'wv-blank' + (solved ? ' wv-blank--full' : '')}>
                  {solved ? word : ' '}
                </span>
              ) : (
                <span key={i}>{word} </span>
              ),
            )}
            <small className="wv-gapline__id">{q.phrase.id}</small>
          </span>
        )}
      </div>
      <div className={'wv-opts' + (q.kind === 'listen' ? ' wv-opts--pics' : '')}>
        {q.kind === 'gap'
          ? q.options.map((o) => (
              <button
                key={o}
                type="button"
                className={
                  'wv-opt' +
                  (solved && o === answerKey ? ' wv-opt--right' : '') +
                  (bad.includes(o) ? ' wv-opt--bad' : '') +
                  (o === faded ? ' wv-opt--out' : '')
                }
                onClick={() => tap(o)}
              >
                <EnWord text={o} />
              </button>
            ))
          : q.options.map((o) => (
              <button
                key={o.en}
                type="button"
                aria-label={q.kind === 'listen' ? o.id : o.en}
                className={
                  'wv-opt' +
                  (solved && o.en === answerKey ? ' wv-opt--right' : '') +
                  (bad.includes(o.en) ? ' wv-opt--bad' : '') +
                  (o.en === faded ? ' wv-opt--out' : '')
                }
                onClick={() => tap(o.en)}
              >
                {q.kind === 'listen' ? <WordPic w={o} size="md" /> : <EnWord text={o.en} />}
              </button>
            ))}
      </div>
    </div>
  );
}
