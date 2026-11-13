import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import {
  DRAG_SPAN_PX,
  FACE_OF,
  FEEL_ACTIONS,
  FEEL_EVENTS,
  FEEL_LINES,
  HANDLE_ZONES,
  HERO_NAME,
  clamp1,
  controlsFace,
  feelingOf,
  type FaceControls,
  type FaceRead,
  type FaceTask,
  type FeelCue,
  type FeelHero,
  type Feeling,
  type MakeFeeling,
} from '@/engine/core/feelings';
import { sfx, speak } from '@/engine/audio/sound';
import { buzz, sparkleAt } from '@/engine/ui/juice';
import FeelFace, { FeelStack } from '@/engine/ui/FeelFace';
import { ActionArt, EventArt } from '@/engine/ui/FeelArt';
import ItemPic from '@/engine/ui/ItemPic';
import Scene from '@/engine/ui/Scene';
import '@/engine/ui/face-feel.css';

/**
 * WAJAH PERASAAN (`face-feel`). Kontrak datanya `FaceFeelData`, aturannya
 * `core/feelings.ts`.
 *
 * - Satu level = satu atau beberapa LANGKAH (misi besar: pilih → tiru →
 *   tolong). Langkah pertama memakai narasi level, sesudahnya `say`.
 * - Kartu (pick / cause / help): menyentuh kartu membacakan namanya lalu
 *   langsung dinilai. Salah = SENYAP (`onWrong(true)`), kartunya bergoyang.
 * - Bentuk wajah (make / mirror): anak MENYERET mulut & alis anak ayam;
 *   bentuknya berubah langsung (rAF menulis atribut SVG ke DOM, bukan state
 *   React per gerakan). "✓ Cocok!" yang menilai — bergoyang + kalimat
 *   "wajahnya masih …" kalau belum.
 * - P2: tingkat 1 = satu kartu salah dipudarkan / bayangan mulut & alis
 *   sasaran; tingkat 2 = kartu benar berdenyut / pegangan menggeser diri ke
 *   arah yang benar (tidak menyelesaikan).
 */

const LINE_WAIT_MS = 1400;

/** Ucapkan lalu lanjut — dengan batas waktu kalau klip tak pernah melapor. */
function speakThen(text: string, then: () => void, maxMs = LINE_WAIT_MS) {
  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    then();
  };
  speak(text, go);
  window.setTimeout(go, maxMs);
}

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function centerOf(el: Element | null): { x: number; y: number } {
  if (!el) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export default function FaceFeel({ level, onCorrect, onWrong, setRepeat, hint }: TemplateProps<'face-feel'>) {
  const { steps } = level.data;
  const [stepIx, setStepIx] = useState(0);
  const step = steps[stepIx]!;
  const say = stepIx === 0 ? level.narration : step.say ?? level.narration;

  useEffect(() => {
    if (stepIx > 0) speak(say);
    setRepeat(() => speak(say));
  }, [stepIx, say, setRepeat]);
  useEffect(() => () => setRepeat(null), [setRepeat]);

  const advance = () => {
    if (stepIx + 1 >= steps.length) onCorrect();
    else {
      sfx('correct');
      setStepIx(stepIx + 1);
    }
  };

  const task = step.task;
  const big = task.kind === 'make' || task.kind === 'mirror';
  return (
    <div className={`ff-wrap ${big ? 'ff-wrap--make' : 'ff-wrap--cards'}`} data-step={stepIx} data-kind={task.kind}>
      <Scene id={level.data.scene ?? 'padang'} />
      {big ? (
        <MakeTask key={`${level.id}-${stepIx}`} task={task} say={say} stepIx={stepIx} total={steps.length} hint={hint} onMiss={() => onWrong(true)} onDone={advance} />
      ) : (
        <CardTask key={`${level.id}-${stepIx}`} task={task} say={say} stepIx={stepIx} total={steps.length} hint={hint} onMiss={() => onWrong(true)} onDone={advance} />
      )}
    </div>
  );
}

interface TaskProps<K extends FaceTask['kind']> {
  task: Extract<FaceTask, { kind: K }>;
  say: string;
  stepIx: number;
  total: number;
  hint: 0 | 1 | 2;
  onMiss: () => void;
  onDone: () => void;
}

function Prompt({ say, stepIx, total }: { say: string; stepIx: number; total: number }) {
  return (
    <div className="ff-head">
      {total > 1 && (
        <div className="ff-dots" aria-label={`Langkah ${stepIx + 1} dari ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`ff-dot${i < stepIx ? ' ff-dot--done' : i === stepIx ? ' ff-dot--now' : ''}`} />
          ))}
        </div>
      )}
      <p className="ff-prompt">{say}</p>
    </div>
  );
}

function Hero({ id, className }: { id: FeelHero; className?: string }) {
  return <ItemPic id={id} className={className ?? 'ff-hero'} />;
}

/** Panel kejadian: tokoh + gambar kejadiannya. */
function CuePanel({ cue, badge, compact, ask }: { cue: FeelCue; badge?: Feeling | 'aku'; compact?: boolean; ask?: boolean }) {
  return (
    <div className={`ff-cue${compact ? ' ff-cue--compact' : ''}`} role="img" aria-label={`${HERO_NAME[cue.hero]}, ${FEEL_EVENTS[cue.event].label}`}>
      <div className="ff-cue__who">
        <Hero id={cue.hero} />
        {badge && badge !== 'aku' && <FeelFace feeling={badge} className={`ff-badge ff-face ff-face--${badge}`} />}
        {/* Seni hewan registry selalu tersenyum — gelembung "?" menandai
            bahwa perasaannya justru yang ditanyakan. */}
        {ask && (
          <svg viewBox="0 0 60 60" className="ff-ask" aria-hidden>
            <path d="M30 4 C46 4 56 13 56 25 C56 37 46 45 32 45 L22 56 L24 44 C12 41 4 34 4 25 C4 13 14 4 30 4 Z" fill="#fff" stroke="#ff8a3d" strokeWidth="3.5" strokeLinejoin="round" />
            <text x="30" y="35" textAnchor="middle" fontSize="30" fontWeight="900" fill="#ff8a3d" fontFamily="sans-serif">?</text>
          </svg>
        )}
      </div>
      <EventArt id={cue.event} className="ff-event" />
    </div>
  );
}

/* ---------------- Kartu: pick · cause · help ---------------- */

type CardTaskKind = 'pick' | 'cause' | 'help';

function CardTask({ task, say, stepIx, total, hint, onMiss, onDone }: TaskProps<CardTaskKind>) {
  // Urutan kartu diacak sekali per soal — config tak perlu (dan tak bisa)
  // mengatur posisi jawaban.
  const choices = useMemo(() => shuffle(task.choices as string[]), [task]);
  const answer = task.answer as string;
  const [tried, setTried] = useState<Set<string>>(() => new Set());
  const [won, setWon] = useState<string | null>(null);
  const [bad, setBad] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const helpFace = useRef<HTMLDivElement>(null);
  const [better, setBetter] = useState<FaceRead | null>(null);

  const fadedId = hint >= 1 ? choices.find((c) => c !== answer && !tried.has(c)) : undefined;

  const labelOf = (c: string): string | null => {
    if (task.kind === 'pick') return FEEL_LINES.name[c as Feeling];
    if (task.kind === 'help') return FEEL_ACTIONS[c as keyof typeof FEEL_ACTIONS].label;
    return null;
  };

  const tap = (c: string) => {
    if (won) return;
    const label = labelOf(c);
    if (c === answer) {
      setWon(c);
      const p = centerOf(cardRefs.current[c] ?? null);
      sparkleAt(p.x, p.y, 12);
      buzz(24);
      const finish = () => {
        if (task.kind === 'help') {
          // Teman (atau aku) jadi lebih baik: wajahnya berubah pelan-pelan.
          setBetter(task.who ? 'senang' : 'biasa');
          const q = centerOf(helpFace.current);
          window.setTimeout(() => sparkleAt(q.x, q.y, 10), 450);
          speakThen(task.who ? FEEL_LINES.helped : FEEL_LINES.calm, onDone, 2600);
        } else window.setTimeout(onDone, 250);
      };
      if (label) speakThen(label, finish, 1100);
      else finish();
      return;
    }
    if (label) speak(label);
    sfx('wrong');
    setTried((t) => new Set(t).add(c));
    setBad(c);
    window.setTimeout(() => setBad((b) => (b === c ? null : b)), 520);
    onMiss();
  };

  let top: JSX.Element;
  if (task.kind === 'pick') top = <CuePanel cue={task.cue} ask />;
  else if (task.kind === 'cause')
    top = (
      <div className="ff-show">
        <FeelFace feeling={task.feeling} className={`ff-showface ff-face ff-face--${task.feeling}`} labelled />
      </div>
    );
  else
    top = (
      <div className="ff-cue ff-cue--help">
        <div className="ff-cue__who">
          {task.who && <Hero id={task.who} />}
          <div ref={helpFace} className={task.who ? 'ff-badge ff-badge--big' : 'ff-aku'}>
            <FeelStack set={[task.feeling, task.who ? 'senang' : 'biasa']} show={better ?? task.feeling} className={better ? '' : `ff-face ff-face--${task.feeling}`} />
          </div>
        </div>
        <EventArt id={task.event} className="ff-event" />
      </div>
    );

  return (
    <>
      <div className="ff-side">
        <Prompt say={say} stepIx={stepIx} total={total} />
      </div>
      <div className="ff-main">{top}</div>
      <div className={`ff-cards ff-cards--${choices.length} ff-cards--${task.kind}`}>
        {choices.map((c) => {
          const label = labelOf(c);
          const cls = [
            'ff-card',
            won === c ? 'ff-card--ok' : '',
            bad === c ? 'ff-card--bad' : '',
            fadedId === c && !won ? 'ff-card--out' : '',
            hint >= 2 && c === answer && !won ? 'ff-card--hint' : '',
            won && won !== c ? 'ff-card--rest' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={c}
              type="button"
              ref={(el) => {
                cardRefs.current[c] = el;
              }}
              className={cls}
              data-choice={c}
              data-answer={c === answer ? '1' : undefined}
              disabled={fadedId === c && !won}
              aria-label={label ?? FEEL_EVENTS[c as keyof typeof FEEL_EVENTS]?.label ?? c}
              onClick={() => tap(c)}
            >
              <span className="ff-card__art">
                {task.kind === 'pick' && <FeelFace feeling={c as Feeling} className={`ff-cardface ff-face ff-face--${c}`} />}
                {task.kind === 'cause' && <EventArt id={c as keyof typeof FEEL_EVENTS} className="ff-cardart" />}
                {task.kind === 'help' && <ActionArt id={c as keyof typeof FEEL_ACTIONS} className="ff-cardart" />}
              </span>
              {label && <span className="ff-card__label">{label}</span>}
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ---------------- Bentuk wajah: make · mirror ---------------- */

type Ctl = 'mouth' | 'brow';

function MakeTask({ task, say, stepIx, total, hint, onMiss, onDone }: TaskProps<'make' | 'mirror'>) {
  const controls: FaceControls = task.controls;
  const target: MakeFeeling = task.target;
  const boxRef = useRef<HTMLDivElement>(null);
  const overRef = useRef<SVGSVGElement>(null);
  const val = useRef({ mouth: 0, brow: 0 });
  const drag = useRef<{ ctl: Ctl; y0: number; v0: number; id: number } | null>(null);
  const raf = useRef(0);
  const [read, setRead] = useState<FaceRead>('biasa');
  const readRef = useRef<FaceRead>('biasa');
  const [touched, setTouched] = useState(false);
  const [state, setState] = useState<'idle' | 'nope' | 'won'>('idle');
  const [, force] = useState(0);

  const readNow = (): FaceRead => {
    const r = feelingOf(controlsFace(controls, val.current.mouth, val.current.brow));
    return r === 'kaget' ? 'biasa' : r;
  };
  const goal = FACE_OF[target];
  const goalOf = (ctl: Ctl): number | null => (ctl === 'mouth' ? goal.mouth : controls === 'mulut' ? null : goal.brow);

  const paint = () => {
    raf.current = 0;
    const svg = overRef.current;
    if (!svg) return;
    for (const ctl of ['mouth', 'brow'] as const) {
      const k = svg.querySelector<SVGGElement>(`[data-knob="${ctl}"]`);
      if (k) k.setAttribute('transform', `translate(100 ${knobY(ctl, val.current[ctl]).toFixed(1)})`);
    }
    const r = readNow();
    if (r !== readRef.current) {
      readRef.current = r;
      setRead(r); // gambar berganti hanya saat perasaannya berubah
      sfx('tick');
      buzz(12);
    }
  };
  const schedule = () => {
    if (!raf.current) raf.current = requestAnimationFrame(paint);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const zoneAt = (e: ReactPointerEvent<Element>): Ctl | null => {
    const r = boxRef.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 200;
    const y = ((e.clientY - r.top) / r.height) * 200;
    const inZ = (z: { x: number; y: number; w: number; h: number }) => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h;
    if (inZ(HANDLE_ZONES.mouth)) return 'mouth';
    if (inZ(HANDLE_ZONES.brow)) return controls === 'mulut-alis' ? 'brow' : 'mouth';
    return null;
  };

  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (state === 'won') return;
    const ctl = zoneAt(e);
    if (!ctl) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { ctl, y0: e.clientY, v0: val.current[ctl], id: e.pointerId };
    if (!touched) setTouched(true);
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    val.current[d.ctl] = clamp1(d.v0 + ((e.clientY - d.y0) / DRAG_SPAN_PX) * 2);
    schedule();
  };
  const up = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    force((n) => n + 1); // arah petunjuk tingkat 2 ikut posisi terbaru
  };

  const check = () => {
    if (state === 'won') return;
    const r = readNow();
    if (r === target) {
      setState('won');
      const p = centerOf(boxRef.current);
      sparkleAt(p.x, p.y, 16);
      buzz(30);
      speakThen(FEEL_LINES.name[target], onDone, 1200);
      return;
    }
    setState('nope');
    window.setTimeout(() => setState((s) => (s === 'nope' ? 'idle' : s)), 560);
    sfx('wrong');
    speak(FEEL_LINES.notYet[r as Exclude<FaceRead, 'kaget'>]);
    onMiss();
  };

  // Petunjuk tingkat 2: arah yang harus digeser (dari posisi terakhir).
  const nudge = (ctl: Ctl): 'up' | 'down' | null => {
    if (hint < 2 || state === 'won') return null;
    const want = goalOf(ctl);
    if (want === null) return null;
    const diff = want - val.current[ctl];
    if (Math.abs(diff) < 0.25) return null;
    return diff > 0 ? 'down' : 'up';
  };

  const ctls: Ctl[] = controls === 'mulut' ? ['mouth'] : ['mouth', 'brow'];

  const friend =
    task.kind === 'mirror' ? (
      <div className="ff-friend" role="img" aria-label={`Wajah ${HERO_NAME[task.who]}`}>
        <Hero id={task.who} className="ff-friend__hero" />
        <FeelFace feeling={target} className={`ff-friend__face ff-face ff-face--${target}`} />
        <EventArt id={task.event} className="ff-friend__event" />
      </div>
    ) : task.cue ? (
      <CuePanel cue={task.cue} compact />
    ) : null;

  return (
    <>
      <div className="ff-side">
        <Prompt say={say} stepIx={stepIx} total={total} />
        {friend}
      </div>
      <div className="ff-main ff-main--big">
        <div ref={boxRef} className="ff-bigbox">
          <div className={`ff-big${state === 'nope' ? ' ff-big--nope' : ''}${state === 'won' ? ' ff-big--won' : ''}`} role="img" aria-label="Wajah anak ayam">
            <FeelStack set={['biasa', 'senang', 'sedih', 'marah', 'takut']} show={read} />
          </div>
          {state !== 'won' && (
            <svg ref={overRef} viewBox="0 0 200 200" className="ff-over" aria-hidden>
              {ctls.map((ctl) => {
                const n = nudge(ctl);
                const want = goalOf(ctl);
                return (
                  <g key={ctl}>
                    <rect x="89" y={knobY(ctl, -1) - 13} width="22" height={knobY(ctl, 1) - knobY(ctl, -1) + 26} rx="11" className="ff-track" />
                    {hint >= 1 && want !== null && <circle cx="100" cy={knobY(ctl, want)} r="6" className="ff-ghost" />}
                    <g data-knob={ctl} transform={`translate(100 ${knobY(ctl, val.current[ctl])})`}>
                      <g className={`ff-knob${touched ? '' : ' ff-knob--invite'}${n ? ` ff-knob--nudge-${n}` : ''}`}>
                        <circle r="11" className="ff-knob__ring" />
                        <circle r="10" className="ff-knob__dot" />
                        <path d="M-4.5 -2.5 L0 -7 L4.5 -2.5 M-4.5 2.5 L0 7 L4.5 2.5" className="ff-knob__arrows" />
                      </g>
                    </g>
                  </g>
                );
              })}
            </svg>
          )}
          <div className="ff-bigtouch" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
        </div>
      </div>
      <div className="ff-cards ff-cards--check">
        <button type="button" className="ff-check" onClick={check} disabled={state === 'won'}>
          <svg viewBox="0 0 24 24" className="ff-check__icon" aria-hidden>
            <circle cx="12" cy="12" r="11" fill="#fff" />
            <path d="M6.5 12.5l3.5 3.5 7.5-8" fill="none" stroke="#2e9d4a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Cocok!
        </button>
      </div>
    </>
  );
}

/** Letak pegangan di atas gambar (satuan kotak 200): alis di dahi, mulut di dada. */
function knobY(ctl: Ctl, v: number): number {
  return ctl === 'mouth' ? 152 + 14 * v : 40 + 12 * v;
}
