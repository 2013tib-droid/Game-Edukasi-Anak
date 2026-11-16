import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import {
  BALANCE_LINES,
  MAX_PAN,
  equationCards,
  equationParts,
  isBalanced,
  solutions,
  solves,
  sums,
  tiltOf,
  type BalanceStep,
  type Block,
  type Side,
} from '@/engine/core/balance';
import { sfx, speak } from '@/engine/audio/sound';
import { buzz, sparkleAt } from '@/engine/ui/juice';
import ItemPic from '@/engine/ui/ItemPic';
import Scene from '@/engine/ui/Scene';
import '@/engine/ui/balance-scale.css';

/**
 * TIMBANGAN SEIMBANG (`balance-scale`). Kontrak datanya `BalanceScaleData`,
 * aturannya `core/balance.ts`.
 *
 * - Balok dari baki DISERET ke piring sasaran, atau cukup DIKETUK (cuma satu
 *   piring yang menerima, jadi ketukan tak ambigu). Balok di piring disentuh =
 *   kembali ke baki. Balok tetap (bergaris) tak bisa dipindah.
 * - Tanpa pasak: lengan miring LANGSUNG tiap balok ditaruh; seimbang = selesai.
 *   Miring biasa TIDAK dihitung salah — itu eksplorasi.
 * - Dengan pasak: lengan terkunci mendatar sampai "Lepas pasak!". Belum
 *   seimbang = salah SENYAP (`onWrong(true)`), lengan miring ke sisi berat,
 *   kalimat `heavy` (sekali per level), pasak terpasang lagi, balok TETAP.
 * - Miringnya pegas teredam rAF yang menulis `transform` langsung ke DOM —
 *   tidak ada render React per frame. `prefers-reduced-motion` = tanpa ayunan.
 * - P2: tingkat 1 = total tiap sisi muncul samar di bawah piring (misi gambar:
 *   timbangan kecil berdenyut); tingkat 2 = "kurang N" di sisi yang ringan +
 *   balok baki yang pas berdenyut.
 */

const BLOCK_COLORS = ['#ef5350', '#fb8c00', '#f9c22e', '#4caf50', '#26a69a', '#29b6f6', '#1e88e5', '#ec407a', '#8d6e63', '#9ccc65'];
const DARK_TEXT = new Set([2]); // kuning: angka gelap supaya terbaca

function colorOf(v: number): { bg: string; dark: boolean } {
  const i = (((v - 1) % 10) + 10) % 10;
  return { bg: BLOCK_COLORS[i]!, dark: DARK_TEXT.has(i) };
}

function reducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function BlockView({
  block,
  where,
  fixed,
  extra = '',
  style,
}: {
  block: Block;
  where: 'pan' | 'tray' | 'ref';
  fixed?: boolean;
  extra?: string;
  style?: CSSProperties;
}) {
  if (block.item) {
    return (
      <span className={`bs-block bs-block--${where} bs-block--pic${fixed ? ' bs-block--fixed' : ''} ${extra}`} style={style}>
        <ItemPic id={block.item} className="bs-block__img" fallbackClassName="bs-block__emoji" />
      </span>
    );
  }
  const c = colorOf(block.v);
  const lift = where === 'tray' ? Math.round(Math.min(block.v, 20) * 0.6) : 0;
  return (
    <span
      className={`bs-block bs-block--${where}${fixed ? ' bs-block--fixed' : ''}${c.dark ? ' bs-block--dark' : ''} ${extra}`}
      style={{ ...style, '--bs-c': c.bg, '--bs-lift': `${lift}px` } as CSSProperties}
      data-v={block.v}
    >
      <span className="bs-block__n">{block.v}</span>
    </span>
  );
}

export default function BalanceScale({ level, onCorrect, onWrong, setRepeat, hint }: TemplateProps<'balance-scale'>) {
  const { steps } = level.data;
  const [stepIx, setStepIx] = useState(0);
  const step = steps[stepIx]!;
  const say = stepIx === 0 ? level.narration : step.say ?? level.narration;
  const heavySaid = useRef(false);

  useEffect(() => {
    if (stepIx > 0) speak(say);
    setRepeat(() => speak(say));
  }, [stepIx, say, setRepeat]);
  useEffect(() => () => setRepeat(null), [setRepeat]);

  function advance() {
    if (stepIx + 1 >= steps.length) onCorrect();
    else setStepIx(stepIx + 1);
  }

  return (
    <div className="bs-wrap" data-step={stepIx} data-mode={step.mode}>
      <Scene id="kota" />
      <StepPlay
        key={`${level.id}-${stepIx}`}
        step={step}
        say={say}
        stepIx={stepIx}
        total={steps.length}
        hint={hint}
        heavySaid={heavySaid}
        onMiss={() => onWrong(true)}
        onDone={advance}
      />
    </div>
  );
}

interface StepProps {
  step: BalanceStep;
  say: string;
  stepIx: number;
  total: number;
  hint: 0 | 1 | 2;
  heavySaid: { current: boolean };
  onMiss: () => void;
  onDone: () => void;
}

type Phase = 'play' | 'checking' | 'done' | 'cards';

function StepPlay({ step, say, stepIx, total, hint, heavySaid, onMiss, onDone }: StepProps) {
  const [picked, setPicked] = useState<number[]>([]);
  const [pegIn, setPegIn] = useState(!!step.peg);
  const [phase, setPhase] = useState<Phase>('play');
  const [shake, setShake] = useState<string | null>(null);
  const [badCard, setBadCard] = useState<number | null>(null);
  const [dragIx, setDragIx] = useState<number | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const panRefs = { kiri: useRef<HTMLDivElement>(null), kanan: useRef<HTMLDivElement>(null) };
  const ghostRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const picture = step.tray.some((b) => b.item) || step.left.some((b) => b.item);
  const { left: sumL, right: sumR } = sums(step, picked);
  const balanced = isBalanced(sumL, sumR);
  const panBlocks = (side: Side) => side === 'kiri' ? step.left : step.right;
  const panCount = (side: Side) => panBlocks(side).length + (side === step.target ? picked.length : 0);

  // ---------- Lengan: pegas teredam rAF ----------
  const goal = phase === 'done' || phase === 'cards' ? 0 : pegIn ? 0 : tiltOf(sumL, sumR);
  const anim = useRef({ a: 0, v: 0, goal: 0, raf: 0 });
  function apply(a: number) {
    const beam = beamRef.current;
    if (!beam) return;
    beam.style.transform = `rotate(${a}deg)`;
    const half = beam.offsetWidth / 2;
    const rad = (a * Math.PI) / 180;
    const dy = Math.sin(rad) * half;
    const dx = (1 - Math.cos(rad)) * half;
    const l = panRefs.kiri.current;
    const r = panRefs.kanan.current;
    if (l) l.style.transform = `translate(${dx}px, ${-dy}px)`;
    if (r) r.style.transform = `translate(${-dx}px, ${dy}px)`;
  }
  useEffect(() => {
    const st = anim.current;
    st.goal = goal;
    if (reducedMotion()) {
      st.a = goal;
      st.v = 0;
      apply(goal);
      return;
    }
    if (st.raf) return;
    const tick = () => {
      st.v += (st.goal - st.a) * 0.09;
      st.v *= 0.8;
      st.a += st.v;
      if (Math.abs(st.goal - st.a) < 0.02 && Math.abs(st.v) < 0.02) {
        st.a = st.goal;
        st.v = 0;
        apply(st.a);
        st.raf = 0;
        return;
      }
      apply(st.a);
      st.raf = requestAnimationFrame(tick);
    };
    st.raf = requestAnimationFrame(tick);
  }, [goal]);
  // `raf` WAJIB dinolkan: StrictMode (dev) menjalankan cleanup lalu efek lagi,
  // dan `raf` basi yang tertinggal membuat efek sudut di atas mengira loop
  // masih jalan — lengannya lalu tak pernah miring.
  useEffect(
    () => () => {
      cancelAnimationFrame(anim.current.raf);
      anim.current.raf = 0;
    },
    [],
  );
  // Ukuran layar berubah (HP diputar): letak piring dihitung ulang.
  useEffect(() => {
    const on = () => apply(anim.current.a);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  // ---------- Selesai / salah ----------
  function wiggle(what: string) {
    setShake(what);
    later(() => setShake(null), 450);
  }

  function centerOfBeam(): { x: number; y: number } {
    const r = beamRef.current?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: innerWidth / 2, y: innerHeight / 2 };
  }

  function succeed() {
    setPhase('done');
    sfx('correct');
    buzz();
    const c = centerOfBeam();
    sparkleAt(c.x, c.y, 12);
    later(() => {
      if (step.mode === 'equation') {
        setPhase('cards');
        speak(BALANCE_LINES.pick);
      } else onDone();
    }, 900);
  }

  // Tanpa pasak: dinilai tiap susunan berubah.
  useEffect(() => {
    if (step.peg || phase !== 'play' || picked.length === 0) return;
    if (solves(step, picked)) succeed();
    else if (balanced && step.mode === 'fewest') {
      // Seimbang, tapi lebih banyak balok dari yang diminta.
      onMiss();
      sfx('wrong');
      speak(BALANCE_LINES.tooMany);
      wiggle('target');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked]);

  function releasePeg() {
    if (phase !== 'play' || !pegIn) return;
    if (picked.length === 0) {
      speak(BALANCE_LINES.empty);
      wiggle('peg');
      return;
    }
    setPegIn(false);
    setPhase('checking');
    sfx('tap');
    if (solves(step, picked)) {
      later(succeed, 450);
      return;
    }
    later(() => {
      onMiss();
      sfx('wrong');
      if (!heavySaid.current) {
        heavySaid.current = true;
        speak(BALANCE_LINES.heavy);
      }
    }, 900);
    later(() => {
      setPegIn(true);
      setPhase('play');
    }, 2300);
  }

  // ---------- Menaruh & mengambil balok ----------
  function place(i: number) {
    if (phase !== 'play' || picked.includes(i)) return;
    if (step.mode === 'missing') {
      sfx('tap');
      setPicked([i]);
      return;
    }
    if (panCount(step.target) >= MAX_PAN) {
      wiggle('target');
      return;
    }
    sfx('tap');
    setPicked([...picked, i]);
  }

  function takeBack(i: number) {
    if (phase !== 'play') return;
    sfx('tap');
    setPicked(picked.filter((x) => x !== i));
  }

  function panAt(x: number, y: number): Side | null {
    for (const side of ['kiri', 'kanan'] as const) {
      const r = panRefs[side].current?.getBoundingClientRect();
      if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return side;
    }
    return null;
  }

  const drag = useRef<{ i: number; x0: number; y0: number; moved: boolean } | null>(null);
  function onTrayDown(e: ReactPointerEvent, i: number) {
    if (phase !== 'play') return;
    e.preventDefault();
    drag.current = { i, x0: e.clientX, y0: e.clientY, moved: false };
    const move = (ev: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      if (!d.moved && Math.hypot(ev.clientX - d.x0, ev.clientY - d.y0) > 8) {
        d.moved = true;
        setDragIx(d.i);
      }
      const g = ghostRef.current;
      if (d.moved && g) g.style.transform = `translate(${ev.clientX}px, ${ev.clientY}px) translate(-50%, -60%)`;
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      const d = drag.current;
      drag.current = null;
      setDragIx(null);
      if (!d) return;
      if (!d.moved) {
        if (ev.type !== 'pointercancel') place(d.i);
        return;
      }
      const side = panAt(ev.clientX, ev.clientY);
      if (side === step.target) place(d.i);
      else if (side) wiggle(side); // piring tetap: kembali ke baki tanpa hukuman
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }
  // Posisikan bayangan seret begitu ia muncul.
  useEffect(() => {
    const d = drag.current;
    const g = ghostRef.current;
    if (dragIx !== null && d && g) g.style.transform = `translate(${d.x0}px, ${d.y0}px) translate(-50%, -60%)`;
  }, [dragIx]);

  // ---------- Petunjuk ----------
  const solution = useMemo(() => {
    const all = solutions(step);
    // Utamakan susunan yang memuat balok yang SUDAH ditaruh.
    return all.find((s) => picked.every((p) => s.includes(p))) ?? all[0] ?? [];
  }, [step, picked]);
  const pulse = hint >= 2 && phase === 'play' ? new Set(solution.filter((i) => !picked.includes(i))) : new Set<number>();
  const showSums = hint >= 1 && !picture;
  const lighter: Side | null = sumL === sumR ? null : sumL < sumR ? 'kiri' : 'kanan';
  const deficit = Math.abs(sumL - sumR);

  // ---------- Kartu kalimat (equation) ----------
  const cards = useMemo(
    () => (phase === 'cards' ? shuffle(equationCards(step, picked)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase === 'cards'],
  );
  const fadedCard = hint >= 1 ? cards.findIndex((c) => !c.correct) : -1;
  function pickCard(ix: number) {
    if (phase !== 'cards') return;
    const c = cards[ix]!;
    if (c.correct) {
      setPhase('done');
      sfx('correct');
      later(onDone, 350);
    } else {
      onMiss();
      sfx('wrong');
      setBadCard(ix);
      later(() => setBadCard(null), 450);
    }
  }

  // ---------- Gambar ----------
  const eq = step.mode === 'missing' ? equationParts(step) : null;
  const filled = step.mode === 'missing' && picked.length === 1 ? step.tray[picked[0]!]!.v : null;

  // Fungsi biasa, BUKAN komponen: komponen yang didefinisikan di dalam render
  // dipasang ulang tiap render dan `transform` tulisan rAF ikut hilang.
  function renderPan(side: Side) {
    const fixed = panBlocks(side);
    const mine = side === step.target ? picked : [];
    const showQ = side === step.target && step.mode === 'missing' && mine.length === 0;
    const n = Math.max(1, fixed.length + mine.length + (showQ ? 1 : 0));
    const k = n <= 1 ? 1 : n <= 4 ? 2 : 3;
    const rows = Math.ceil(n / k);
    const sum = side === 'kiri' ? sumL : sumR;
    return (
      <div
        ref={panRefs[side]}
        className={`bs-pan bs-pan--${side}${side === step.target ? ' bs-pan--target' : ''}${shake === side || (shake === 'target' && side === step.target) ? ' bs-shake' : ''}`}
        data-side={side}
        style={{ '--k': k, '--rows': rows } as CSSProperties}
      >
        <svg className="bs-strings" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <path d="M50 0 L4 100 M50 0 L96 100" />
        </svg>
        <span className="bs-hook" aria-hidden />
        <div className="bs-pan__load">
          {fixed.map((b, j) => (
            <BlockView key={`f${j}`} block={b} where="pan" fixed />
          ))}
          {mine.map((i) => (
            <button
              key={`m${i}`}
              type="button"
              className="bs-pan__pick"
              onClick={() => takeBack(i)}
              aria-label={step.tray[i]!.item ? 'Kembalikan ke baki' : `Kembalikan balok ${step.tray[i]!.v}`}
            >
              <BlockView block={step.tray[i]!} where="pan" extra={filled !== null ? 'bs-block--filled' : ''} />
            </button>
          ))}
          {showQ && <span className="bs-block bs-block--pan bs-block--q">?</span>}
        </div>
        <span className="bs-dish" aria-hidden />
        {showSums && (
          <span className={`bs-sum${hint >= 2 && lighter === side && deficit > 0 ? ' bs-sum--short' : ''}`}>
            {hint >= 2 && lighter === side && deficit > 0 ? `kurang ${deficit}` : sum}
          </span>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="bs-head">
        {total > 1 && (
          <div className="bs-dots" aria-label={`Langkah ${stepIx + 1} dari ${total}`}>
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={`bs-dot${i < stepIx ? ' bs-dot--done' : i === stepIx ? ' bs-dot--now' : ''}`} />
            ))}
          </div>
        )}
        <p className="bs-prompt">{say}</p>
      </div>

      {step.refs?.length ? (
        <div className={`bs-refs${hint >= 1 ? ' bs-refs--hint' : ''}`} aria-label="Timbangan kecil yang sudah seimbang">
          {step.refs.map((r, i) => (
            <div key={i} className="bs-ref">
              <span className="bs-ref__side">
                {r.left.map((b, j) => (
                  <BlockView key={j} block={b} where="ref" />
                ))}
              </span>
              <span className="bs-ref__eq" aria-hidden>
                =
              </span>
              <span className="bs-ref__side">
                {r.right.map((b, j) => (
                  <BlockView key={j} block={b} where="ref" />
                ))}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {eq && (
        <div className="bs-eq" aria-label="Persamaan">
          {[...eq.left, '=', ...eq.right].map((t, i, arr) => (
            <span key={i} className="bs-eq__part">
              {t === '?' ? (
                <span className={`bs-eq__q${filled !== null ? ' bs-eq__q--filled' : ''}`}>{filled ?? '?'}</span>
              ) : (
                t
              )}
              {t !== '=' && arr[i + 1] !== undefined && arr[i + 1] !== '=' ? ' +' : ''}
            </span>
          ))}
        </div>
      )}

      <div className="bs-stage" ref={stageRef}>
        <div className="bs-post" aria-hidden />
        <div className={`bs-beam${pegIn ? ' bs-beam--pegged' : ''}`} ref={beamRef} aria-hidden>
          <span className="bs-pivot" />
        </div>
        <span className={`bs-peg${pegIn ? '' : ' bs-peg--out'}`} aria-hidden hidden={!step.peg} />
        {renderPan('kiri')}
        {renderPan('kanan')}
        <div className="bs-base" aria-hidden>
          <ItemPic id="elephant" className="bs-guide" fallbackClassName="bs-guide bs-guide--emoji" />
        </div>
        <div className="bs-status" aria-live="polite">
          {phase === 'done' || (phase === 'cards' && balanced) ? 'Seimbang!' : ''}
        </div>
      </div>

      {phase === 'cards' || (phase === 'done' && step.mode === 'equation') ? (
        <div className="bs-cards">
          {cards.map((c, i) => (
            <button
              key={c.text}
              type="button"
              className={`bs-card${badCard === i ? ' bs-shake' : ''}${fadedCard === i && hint >= 1 ? ' bs-card--out' : ''}${
                phase === 'done' && c.correct ? ' bs-card--right' : ''
              }`}
              disabled={fadedCard === i && hint >= 1}
              onClick={() => pickCard(i)}
            >
              {c.text.replace(/ /g, ' ')}
            </button>
          ))}
        </div>
      ) : (
        <div className="bs-bottom">
          {step.mode === 'fewest' && (
            <div className="bs-count">
              Balok: {picked.length} / {step.fewest}
            </div>
          )}
          <div className="bs-tray">
            {step.tray.map((b, i) => (
              <div
                key={i}
                className={`bs-tray__slot${picked.includes(i) ? ' bs-tray__slot--used' : ''}${pulse.has(i) ? ' bs-tray__slot--hint' : ''}`}
                role="button"
                tabIndex={picked.includes(i) ? -1 : 0}
                aria-label={b.item ? 'Balok gambar' : `Balok ${b.v}`}
                data-tray={i}
                onPointerDown={(e) => !picked.includes(i) && onTrayDown(e, i)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return;
                  e.preventDefault();
                  place(i);
                }}
              >
                <BlockView block={b} where="tray" extra={dragIx === i ? 'bs-block--lifted' : ''} />
              </div>
            ))}
          </div>
          {step.peg && (
            <button
              type="button"
              className={`btn bs-peg-btn${shake === 'peg' ? ' bs-shake' : ''}`}
              onClick={releasePeg}
              disabled={phase !== 'play'}
            >
              <span className="bs-peg-btn__pin" aria-hidden />
              Lepas pasak!
            </button>
          )}
        </div>
      )}

      {dragIx !== null && (
        <div className="bs-ghost" ref={ghostRef} aria-hidden>
          <BlockView block={step.tray[dragIx]!} where="tray" />
        </div>
      )}
    </>
  );
}
