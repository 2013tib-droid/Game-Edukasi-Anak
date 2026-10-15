import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import {
  RULE_LINES,
  expectedBoxes,
  runSort,
  sameChips,
  type RuleChip,
  type RuleProgram,
  type RuleToy,
} from '@/engine/core/ruleSort';
import { sfx } from '@/engine/audio/sound';
import { sparkleAt } from '@/engine/ui/juice';
import ItemPic from '@/engine/ui/ItemPic';
import { ChipArt, ToyArt } from '@/engine/ui/RuleArt';
import '@/engine/ui/rule-sort.css';

/**
 * Mesin "KALAU" (`rule-sort`): Pabrik Mainan (TK) & Robot Pemilah (SD Kelas
 * 1 & 2). Kontraknya `RuleSortData` (types.ts), mesinnya `core/ruleSort.ts`.
 *
 * - Anak memasang TANDA di papan nama tiap kotak (ketuk tanda di baki → masuk
 *   ke tempat yang dipilih / tempat kosong pertama; atau diseret). Tanda di
 *   kotak disentuh = dilepas.
 * - ▶️ Jalankan: mainan keluar satu per satu dari corong, berjalan di ban dari
 *   KIRI ke KANAN. Di atas tiap kotak tanda-tandanya menyala ✓/✗ satu per
 *   satu (DAN), dan mainan jatuh ke kotak PERTAMA yang cocok. Itulah
 *   `if / else if / else` yang kelihatan.
 * - Gagal (salah kotak / tak cocok kotak mana pun) = SALAH SENYAP
 *   (`onWrong(true)`): mesin berhenti di mainan itu, kotaknya bergoyang,
 *   kalimat sebabnya dibacakan, lalu semuanya kembali — TANDA TETAP TERPASANG
 *   untuk diperbaiki. Memperbaiki aturan itu inti coding.
 * - P2: tingkat 1 = kotak pertama yang tandanya berbeda dari jawaban contoh
 *   menyala; tingkat 2 = tanda yang salah di kotak itu bergaris merah dan
 *   tanda yang dibutuhkan di baki berdenyut.
 *
 * Gerak mainan = satu elemen yang digeser `transform` + transisi CSS, satu
 * render per langkah (pola CodeQuest).
 */

interface Token {
  toy: RuleToy;
  x: number;
  y: number;
  instant?: boolean;
  fall?: boolean;
}

interface Check {
  box: number;
  hits: boolean[];
  ok: boolean;
}

type Slot = { box: number; slot: number };

const ARIA: Record<RuleChip, string> = RULE_LINES.chip;

export default function RuleSort({ level, onCorrect, onWrong, narrate, hint }: TemplateProps<'rule-sort'>) {
  const data = level.data;
  const n = data.boxes.length;
  // Kotak bertanda dua dapat kolom lebih lebar di deret tiga kotak — kalau
  // sama rata, dua tempat tandanya menciut di bawah target sentuh di HP 320.
  const cols = data.boxes
    .map((b) => (b.slots === 2 && n === 3 ? 'minmax(0, 1.6fr)' : 'minmax(0, 1fr)'))
    .join(' ');
  const want = useMemo(() => expectedBoxes(data.solution, data.queue), [data.solution, data.queue]);

  // Tempat tanda per kotak (null = kosong), supaya urutan tempat tetap saat satu dilepas.
  const [slots, setSlots] = useState<(RuleChip | null)[][]>(() =>
    data.boxes.map((b) => Array.from({ length: b.slots }, (_, i) => b.given?.[i] ?? null)),
  );
  const [sel, setSel] = useState<Slot | null>(null);
  const [running, setRunning] = useState(false);
  const [solved, setSolved] = useState(false);
  const [taken, setTaken] = useState(0);
  const [token, setToken] = useState<Token | null>(null);
  const [check, setCheck] = useState<Check | null>(null);
  const [inBox, setInBox] = useState<{ toy: RuleToy; bad?: boolean }[][]>(() => data.boxes.map(() => []));
  const [badBox, setBadBox] = useState<number | null>(null);
  const [cheer, setCheer] = useState<number[]>(() => data.boxes.map(() => 0));
  const [ping, setPing] = useState(0);
  const [beltOn, setBeltOn] = useState(false);
  const timers = useRef<number[]>([]);
  const factoryRef = useRef<HTMLDivElement>(null);
  const beltRef = useRef<HTMLDivElement>(null);
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const queueRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const prog: RuleProgram = useMemo(() => slots.map((s) => s.filter((c): c is RuleChip => c !== null)), [slots]);

  const locked = running || solved;

  // ---- Petunjuk P2 ----
  const hintBox = useMemo(() => {
    if (hint < 1) return -1;
    return data.solution.findIndex((want, b) => !sameChips(prog[b] ?? [], want));
  }, [hint, prog, data.solution]);
  const needChips = useMemo(() => {
    if (hint < 2 || hintBox < 0) return new Set<RuleChip>();
    const have = prog[hintBox] ?? [];
    return new Set(data.solution[hintBox]!.filter((c) => !have.includes(c)));
  }, [hint, hintBox, prog, data.solution]);

  // ---- Memasang tanda ----
  function firstEmpty(from?: Slot): Slot | null {
    const order: Slot[] = [];
    slots.forEach((row, box) => row.forEach((_, slot) => order.push({ box, slot })));
    const start = from ? order.findIndex((s) => s.box === from.box && s.slot === from.slot) + 1 : 0;
    for (let k = 0; k < order.length; k++) {
      const s = order[(start + k) % order.length]!;
      if (!slots[s.box]![s.slot]) return s;
    }
    return null;
  }

  function place(chip: RuleChip, at?: Slot | null) {
    if (locked) return;
    const target = at ?? (sel && !slots[sel.box]![sel.slot] ? sel : null) ?? sel ?? firstEmpty();
    if (!target) {
      // Semua penuh: anak harus melepas satu tanda dulu.
      sfx('tap');
      setPing((k) => k + 1);
      return;
    }
    const next = slots.map((r) => [...r]);
    next[target.box]![target.slot] = chip;
    setSlots(next);
    sfx('tick');
    narrate(RULE_LINES.chip[chip]);
    setBadBox(null);
    // Pilihan pindah ke tempat kosong berikutnya.
    const after = (() => {
      const order: Slot[] = [];
      next.forEach((row, box) => row.forEach((_, slot) => order.push({ box, slot })));
      const i = order.findIndex((s) => s.box === target.box && s.slot === target.slot);
      for (let k = 1; k <= order.length; k++) {
        const s = order[(i + k) % order.length]!;
        if (!next[s.box]![s.slot]) return s;
      }
      return null;
    })();
    setSel(after);
  }

  function tapSlot(s: Slot) {
    if (locked) return;
    const chip = slots[s.box]![s.slot];
    if (chip) {
      sfx('tap');
      const next = slots.map((r) => [...r]);
      next[s.box]![s.slot] = null;
      setSlots(next);
      setBadBox(null);
    } else sfx('tick');
    setSel(s);
  }

  // ---- Seret dari baki ----
  const drag = useRef<{ chip: RuleChip; x: number; y: number; ghost: HTMLElement | null; moved: boolean } | null>(null);

  function trayDown(e: ReactPointerEvent<HTMLButtonElement>, chip: RuleChip) {
    if (locked) return;
    e.preventDefault();
    drag.current = { chip, x: e.clientX, y: e.clientY, ghost: null, moved: false };
  }

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 10) return;
      if (!d.moved) {
        d.moved = true;
        const src = document.querySelector<HTMLElement>(`.rs-tray [data-tray="${d.chip}"]`);
        if (src) {
          const ghost = src.cloneNode(true) as HTMLElement;
          ghost.classList.add('rs-ghost');
          const r = src.getBoundingClientRect();
          ghost.style.width = `${r.width}px`;
          ghost.style.height = `${r.height}px`;
          document.body.appendChild(ghost);
          d.ghost = ghost;
        }
      }
      if (d.ghost) {
        d.ghost.style.transform = `translate(${e.clientX - d.ghost.offsetWidth / 2}px, ${e.clientY - d.ghost.offsetHeight / 2}px)`;
      }
    };
    const up = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      drag.current = null;
      d.ghost?.remove();
      if (!d.moved) return place(d.chip);
      // Tempat tanda terdekat di bawah jari (papan nama kotak cukup).
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-slot], [data-plate]');
      if (!el) return sfx('tap');
      const box = Number(el.dataset.box);
      const slot = el.dataset.slot !== undefined ? Number(el.dataset.slot) : (() => {
        const row = slots[box]!;
        const empty = row.findIndex((c) => !c);
        return empty >= 0 ? empty : row.length - 1;
      })();
      place(d.chip, { box, slot });
    };
    const cancel = () => {
      drag.current?.ghost?.remove();
      drag.current = null;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
      drag.current?.ghost?.remove();
    };
  });

  // ---- Menjalankan ----
  function measure() {
    const f = factoryRef.current!.getBoundingClientRect();
    const belt = beltRef.current!.getBoundingClientRect();
    const beltY = belt.top + belt.height / 2 - f.top;
    const boxX = boxRefs.current.map((b) => {
      const r = b!.getBoundingClientRect();
      return r.left + r.width / 2 - f.left;
    });
    const boxY = boxRefs.current.map((b) => b!.getBoundingClientRect().top - f.top + 30);
    const queue = queueRefs.current.map((q) => {
      const r = q!.getBoundingClientRect();
      return { x: r.left + r.width / 2 - f.left, y: r.top + r.height / 2 - f.top };
    });
    return { beltY, boxX, boxY, queue, startX: belt.left - f.left + 14, endX: belt.right - f.left + 34 };
  }

  function shakeEmpty() {
    sfx('tap');
    narrate(RULE_LINES.empty);
    setPing((k) => k + 1);
    const e = firstEmpty();
    if (e) setSel(e);
  }

  function run() {
    if (locked) return;
    if (slots.some((row) => row.some((c) => !c))) return shakeEmpty();
    const result = runSort(prog, data.queue, want);
    const geo = measure();
    setRunning(true);
    setSel(null);
    setBadBox(null);
    setBeltOn(true);
    let t = 120;
    const delivered: { toy: RuleToy; bad?: boolean }[][] = data.boxes.map(() => []);

    result.routes.forEach((route, i) => {
      const toy = data.queue[i]!;
      // Dua mainan pertama pelan (anak sedang memahami mesinnya), sisanya lebih cepat.
      const f = i < 2 ? 1 : 0.72;
      const MOVE = Math.round(330 * f);
      const LOOK = Math.round(300 * f);
      const q = geo.queue[i]!;
      later(() => {
        setTaken(i + 1);
        setToken({ toy, x: q.x, y: q.y, instant: true });
      }, t);
      t += 40;
      later(() => setToken({ toy, x: geo.startX, y: geo.beltY }), t);
      t += MOVE;
      for (const c of route.checks) {
        later(() => {
          setCheck(null);
          setToken({ toy, x: geo.boxX[c.box]!, y: geo.beltY });
        }, t);
        t += MOVE;
        later(() => {
          setCheck(c);
          sfx(c.ok ? 'tick' : 'tap');
        }, t);
        t += LOOK;
      }
      const bad = i === result.failAt;
      if (route.box >= 0) {
        const b = route.box;
        later(() => {
          setCheck(null);
          setToken({ toy, x: geo.boxX[b]!, y: geo.boxY[b]! });
        }, t);
        t += Math.round(MOVE * 0.8);
        later(() => {
          setToken(null);
          delivered[b]!.push({ toy, bad });
          setInBox(delivered.map((d) => [...d]));
          if (!bad) {
            setCheer((c) => c.map((v, k) => (k === b ? v + 1 : v)));
            const r = boxRefs.current[b]?.getBoundingClientRect();
            if (r) sparkleAt(r.left + r.width / 2, r.top + 24, 5);
          } else setBadBox(b);
        }, t);
        t += 160;
      } else {
        later(() => {
          setCheck(null);
          setToken({ toy, x: geo.endX, y: geo.beltY });
        }, t);
        t += MOVE;
        later(() => {
          sfx('tap');
          setToken({ toy, x: geo.endX + 10, y: geo.beltY + 90, fall: true });
        }, t);
        t += 520;
      }
    });

    if (result.outcome === 'benar') {
      later(() => {
        setBeltOn(false);
        setToken(null);
        sfx('correct');
        boxRefs.current.forEach((b) => {
          const r = b?.getBoundingClientRect();
          if (r) sparkleAt(r.left + r.width / 2, r.top + 30, 8);
        });
        setCheer((c) => c.map((v) => v + 1));
        setSolved(true);
        later(() => onCorrect(), 900);
      }, t + 100);
      return;
    }
    later(() => {
      setBeltOn(false);
      setToken(null);
      narrate(result.outcome === 'tanpa-kotak' ? RULE_LINES.noBox : RULE_LINES.wrongBox);
      onWrong(true);
    }, t + 250);
    // Semua kembali; tanda tetap terpasang untuk diperbaiki.
    later(() => {
      setInBox(data.boxes.map(() => []));
      setTaken(0);
      setCheck(null);
      setRunning(false);
      // Kotak yang salah tetap ditandai sampai tandanya diubah.
      const route = result.routes[result.failAt];
      if (route && route.box < 0) setBadBox(null);
    }, t + 1700);
  }

  // ---- Gambar ----
  const tokenStyle: CSSProperties | undefined = token
    ? { transform: `translate(${token.x}px, ${token.y}px)`, transition: token.instant ? 'none' : undefined }
    : undefined;

  return (
    <div className="rs-wrap" style={{ '--rs-cols': cols } as CSSProperties}>
      <div className="game-prompt rs-prompt">{level.narration}</div>

      <div className="rs-factory" ref={factoryRef}>
        <div className="rs-queue" aria-label="Mainan yang akan lewat">
          <span className="rs-funnel" aria-hidden>
            {data.machine === 'robot' ? (
              <svg viewBox="0 0 60 60">
                <line x1="30" y1="4" x2="30" y2="13" stroke="#5c6b7a" strokeWidth="3" />
                <circle cx="30" cy="5" r="4" fill={running ? '#ff6b6b' : '#ffd43b'} />
                <rect x="8" y="13" width="44" height="34" rx="11" fill="#74c0fc" stroke="#1c6fd6" strokeWidth="3.5" />
                <rect x="14" y="20" width="32" height="18" rx="8" fill="#e7f5ff" />
                <circle cx="23" cy="29" r="4" fill="#1b2a3a" />
                <circle cx="37" cy="29" r="4" fill="#1b2a3a" />
                <path d="M20 47 V54 H40 V47" fill="#a5d8ff" stroke="#1c6fd6" strokeWidth="3" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 60 60">
                <path d="M6 10 H54 L38 34 V50 H22 V34 Z" fill="#ff9f43" stroke="#c96a12" strokeWidth="4" strokeLinejoin="round" />
                <rect x="10" y="6" width="40" height="8" rx="4" fill="#ffd166" stroke="#c96a12" strokeWidth="3" />
              </svg>
            )}
          </span>
          <div className="rs-queue__toys">
            {data.queue.map((toy, i) => (
              <span
                key={i}
                ref={(el) => {
                  queueRefs.current[i] = el;
                }}
                className={'rs-queue__slot' + (i < taken ? ' rs-queue__slot--gone' : '')}
              >
                <ToyArt toy={toy} />
              </span>
            ))}
          </div>
        </div>

        <div ref={beltRef} className={'rs-belt' + (beltOn ? ' rs-belt--on' : '')} aria-hidden>
          <span className="rs-belt__top" />
          <span className="rs-belt__arrow">
            <svg viewBox="0 0 40 20">
              <path d="M4 10 H30 M24 3 L33 10 L24 17" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        <div className="rs-boxes">
          {data.boxes.map((box, b) => {
            const checking = check?.box === b ? check : null;
            return (
              <div
                key={b}
                ref={(el) => {
                  boxRefs.current[b] = el;
                }}
                className={
                  'rs-col' +
                  (checking ? (checking.ok ? ' rs-col--yes' : ' rs-col--no') : '') +
                  (badBox === b ? ' rs-col--bad' : '') +
                  (hintBox === b ? ' rs-col--hint' : '')
                }
              >
                <div className="rs-box">
                  <span key={`o${cheer[b]}`} className={'rs-owner' + (cheer[b] ? ' rs-owner--cheer' : '')}>
                    <ItemPic id={box.owner} className="rs-owner__img" fallbackClassName="rs-owner__emoji" />
                  </span>
                  {data.bubbles && (
                    <span className="rs-bubble" aria-label="Pesanan">
                      {data.solution[b]!.map((c, k) => (
                        <ChipArt key={k} chip={c} />
                      ))}
                    </span>
                  )}
                  <div
                    className={
                      'rs-box__inside' +
                      (() => {
                        // Kotak makin penuh = mainan di dalamnya mengecil, supaya yang
                        // terakhir masuk tetap kelihatan (bukan terpotong).
                        const count = (box.examples?.length ?? 0) + inBox[b]!.length;
                        return count >= 7 ? ' rs-box__inside--packed' : count >= 5 ? ' rs-box__inside--crowd' : '';
                      })()
                    }
                  >
                    {(box.examples ?? []).map((toy, k) => (
                      <ToyArt key={`e${k}`} toy={toy} className="rs-toy--in" />
                    ))}
                    {inBox[b]!.map((it, k) => (
                      <ToyArt key={`n${k}`} toy={it.toy} className={'rs-toy--in rs-toy--new' + (it.bad ? ' rs-toy--bad' : '')} />
                    ))}
                  </div>
                  <div
                    key={`p${ping}`}
                    className={'rs-plate' + (box.slots === 2 ? ' rs-plate--two' : '') + (ping ? ' rs-plate--ping' : '')}
                    data-plate
                    data-box={b}
                  >
                    {slots[b]!.map((chip, s) => {
                      const isSel = sel?.box === b && sel.slot === s;
                      const hit = checking?.hits[s];
                      const wrongHint = hint >= 2 && hintBox === b && chip && !data.solution[b]!.includes(chip);
                      return (
                        <span key={s} className="rs-plate__cell">
                          {s > 0 && (
                            <span className="rs-plus" aria-hidden>
                              +
                            </span>
                          )}
                          <button
                            type="button"
                            data-slot={s}
                            data-box={b}
                            className={
                              'rs-slot' +
                              (chip ? ' rs-slot--full' : '') +
                              (isSel && !chip ? ' rs-slot--sel' : '') +
                              (hit === true ? ' rs-slot--hit' : hit === false ? ' rs-slot--miss' : '') +
                              (wrongHint ? ' rs-slot--hintbad' : '')
                            }
                            onClick={() => tapSlot({ box: b, slot: s })}
                            disabled={locked}
                            aria-label={chip ? `Tanda ${ARIA[chip]}, sentuh untuk melepas` : 'Tempat tanda kosong'}
                          >
                            {chip && <ChipArt chip={chip} />}
                            {hit !== undefined && (
                              <span className={'rs-mark' + (hit ? ' rs-mark--yes' : ' rs-mark--no')} aria-hidden>
                                {hit ? '✓' : '✗'}
                              </span>
                            )}
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {token && (
          <span className={'rs-token' + (token.fall ? ' rs-token--fall' : '')} style={tokenStyle} aria-hidden>
            <ToyArt toy={token.toy} />
          </span>
        )}
      </div>

      <div className="rs-tray">
        {data.tray.map((chip) => (
          <button
            key={chip}
            type="button"
            data-tray={chip}
            className={'rs-traychip' + (needChips.has(chip) ? ' rs-traychip--hint' : '')}
            onPointerDown={(e) => trayDown(e, chip)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                place(chip);
              }
            }}
            disabled={locked}
            aria-label={`Tanda ${ARIA[chip]}`}
          >
            <ChipArt chip={chip} />
          </button>
        ))}
      </div>

      <div className="rs-actions">
        <button type="button" className="rs-run" onClick={run} disabled={locked}>
          <span className="rs-run__play" aria-hidden>
            <svg viewBox="0 0 24 24">
              <path d="M8 5.5 L19 12 L8 18.5 Z" fill="#fff" strokeLinejoin="round" stroke="#fff" strokeWidth="2" />
            </svg>
          </span>
          <span className="rs-run__text">Jalankan</span>
        </button>
      </div>
    </div>
  );
}
