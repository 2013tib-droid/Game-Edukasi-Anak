import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import { DIRS, sameCell, type Cell, type CodeDir } from '@/engine/core/codeQuest';
import {
  PAD_HEX,
  PATH_LINES,
  heroesOf,
  parsePathBoard,
  rulesComplete,
  runTeam,
  type PadColor,
  type PathRules,
} from '@/engine/core/colorPath';
import { sfx } from '@/engine/audio/sound';
import { sparkleAt } from '@/engine/ui/juice';
import ItemPic from '@/engine/ui/ItemPic';
import CodeCritter from '@/engine/ui/CodeCritters';
import { ArrowIcon, Rock } from '@/engine/ui/CodeArt';
import '@/engine/ui/code-quest.css';
import '@/engine/ui/color-path.css';

/**
 * PETAK WARNA (`color-path`): Petak Ajaib (TK) & Kode Warna (SD Kelas 1 & 2).
 * Kontraknya `ColorPathData` (types.ts), mesinnya `core/colorPath.ts`.
 *
 * - Tokoh berjalan SENDIRI lurus ke depan. Anak memasang SATU panah per
 *   warna petak ("kalau menginjak merah → belok atas"): pilih kotak aturan
 *   warnanya (atau langsung), lalu ketuk/seret panah dari baki — boleh juga
 *   diseret ke petak warnanya di papan. Begitu dipasang, SEMUA petak warna itu
 *   di papan ikut menampilkan panahnya: anak melihat sendiri bahwa satu aturan
 *   berlaku di banyak tempat.
 * - ▶️ Jalankan: tokoh berjalan petak demi petak; petak yang diinjak dan kotak
 *   aturannya menyala saat tokoh berbelok.
 * - Gagal (menabrak / berputar-putar / tiba tanpa semua barang) = SALAH SENYAP
 *   (`onWrong(true)`) + kalimat sebabnya; aturan TETAP terpasang, aturan yang
 *   terakhir membelokkan tokoh ditandai merah, tokoh pulang ke petak mulai.
 * - P2: tingkat 1 = jejak kaki jalan yang benar; tingkat 2 = aturan pertama
 *   yang salah ditandai, panah yang dibutuhkan di baki berdenyut.
 * - DUA TOKOH (`data.buddy`, huruf `s`/`g`): tokoh kedua berjalan BERSAMAAN
 *   dengan aturan yang sama; menang kalau keduanya sampai. Yang gagal duluan
 *   yang menentukan kalimatnya, dan tokoh itu yang bergoyang.
 *
 * Gerak tokoh = transisi CSS `left/top` (pola CodeQuest), satu render per langkah.
 */

const STEP_MS = 430;

const DIR_ARIA: Record<CodeDir, string> = {
  atas: 'Panah atas',
  kanan: 'Panah kanan',
  bawah: 'Panah bawah',
  kiri: 'Panah kiri',
};

export default function ColorPath({ level, onCorrect, onWrong, narrate, hint }: TemplateProps<'color-path'>) {
  const data = level.data;
  const board = useMemo(() => parsePathBoard(data.grid), [data.grid]);
  const colors = board.colors;
  const dirs = useMemo(
    () => (data.buddy ? [data.startDir, data.buddy.startDir] : [data.startDir]),
    [data.startDir, data.buddy],
  );
  const heroes = useMemo(() => heroesOf(board, dirs), [board, dirs]);
  /** Rupa tiap tokoh: seni, arah hadap seninya, tujuannya. */
  const cast = useMemo(
    () => [
      { item: data.heroItem, faces: data.heroFaces, goal: data.goalItem },
      ...(data.buddy ? [{ item: data.buddy.heroItem, faces: data.buddy.heroFaces, goal: data.buddy.goalItem }] : []),
    ],
    [data],
  );
  const homes = () => heroes.map((h) => h.start);
  const faces = () => heroes.map((h) => h.dir === 'kiri');

  const [rules, setRules] = useState<PathRules>(() => ({ ...(data.given ?? {}) }));
  const [sel, setSel] = useState<PadColor | null>(() => colors.find((c) => !data.given?.[c]) ?? colors[0] ?? null);
  const [pos, setPos] = useState<Cell[]>(homes);
  const [hop, setHop] = useState<number[]>(() => heroes.map(() => 0));
  const [faceLeft, setFaceLeft] = useState<boolean[]>(faces);
  const [bump, setBump] = useState<{ who: number; dir: CodeDir } | null>(null);
  const [got, setGot] = useState<Set<number>>(() => new Set());
  const [running, setRunning] = useState(false);
  const [solved, setSolved] = useState(false);
  const [nowPads, setNowPads] = useState<{ color: PadColor; cell: Cell; k: number }[]>([]);
  const [bad, setBad] = useState<PadColor | null>(null);
  const [ping, setPing] = useState(0);
  const timers = useRef<number[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const locked = running || solved;

  // ---- Petunjuk P2 ----
  const footprints = useMemo(() => {
    if (hint < 1) return new Set<string>();
    const team = runTeam(board, dirs, data.solution);
    return new Set(team.runs.flatMap((run) => run.steps.filter((s) => !s.bump).map((s) => `${s.to.r},${s.to.c}`)));
  }, [hint, board, dirs, data.solution]);
  const nudge = useMemo(() => {
    if (hint < 2) return null;
    const c = colors.find((col) => rules[col] !== data.solution[col]);
    return c ? { color: c, need: data.solution[c]! } : null;
  }, [hint, colors, rules, data.solution]);

  // ---- Memasang aturan ----
  function place(dir: CodeDir, at?: PadColor | null) {
    if (locked) return;
    const target = at ?? sel ?? colors.find((c) => !rules[c]) ?? null;
    if (!target) {
      sfx('tap');
      setPing((k) => k + 1);
      return;
    }
    const next = { ...rules, [target]: dir };
    setRules(next);
    sfx('tick');
    narrate(PATH_LINES.dir[dir]);
    setBad(null);
    // Pilihan pindah ke warna berikutnya yang belum berpanah (kalau ada).
    const i = colors.indexOf(target);
    const after = [...colors.slice(i + 1), ...colors.slice(0, i)].find((c) => !next[c]);
    setSel(after ?? target);
  }

  function pick(color: PadColor) {
    if (locked) return;
    sfx('tick');
    narrate(PATH_LINES.color[color]);
    setSel(color);
  }

  // ---- Seret dari baki ----
  const drag = useRef<{ dir: CodeDir; x: number; y: number; ghost: HTMLElement | null; moved: boolean } | null>(null);

  function trayDown(e: ReactPointerEvent<HTMLButtonElement>, dir: CodeDir) {
    if (locked) return;
    e.preventDefault();
    drag.current = { dir, x: e.clientX, y: e.clientY, ghost: null, moved: false };
  }

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 10) return;
      if (!d.moved) {
        d.moved = true;
        const src = document.querySelector<HTMLElement>(`.cp-tray [data-card="${d.dir}"]`);
        if (src) {
          const ghost = src.cloneNode(true) as HTMLElement;
          ghost.classList.add('cq-ghost');
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
      if (!d.moved) return place(d.dir);
      // Kotak aturan ATAU petak warna di papan.
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-color]');
      if (!el) return sfx('tap');
      place(d.dir, el.dataset.color as PadColor);
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
  function sparkleCell(p: Cell, n = 8) {
    const r = boardRef.current?.getBoundingClientRect();
    if (r) sparkleAt(r.left + ((p.c + 0.5) / board.cols) * r.width, r.top + ((p.r + 0.5) / board.rows) * r.height, n);
  }

  function run() {
    if (locked) return;
    if (!rulesComplete(board, rules)) {
      sfx('tap');
      narrate(PATH_LINES.empty);
      setPing((k) => k + 1);
      const empty = colors.find((c) => !rules[c]);
      if (empty) setSel(empty);
      return;
    }
    const team = runTeam(board, dirs, rules);
    setRunning(true);
    setBad(null);
    const collected = new Set<number>();
    const setAt = <T,>(set: (f: (a: T[]) => T[]) => void, i: number, v: T) =>
      set((a) => a.map((x, j) => (j === i ? v : x)));
    // Gagal: berhenti di langkah terakhir tokoh yang gagal duluan.
    const length =
      team.outcome === 'sampai'
        ? Math.max(...team.runs.map((r) => r.steps.length))
        : team.runs[team.who ?? 0]!.steps.length;
    let t = 0;
    for (let k = 0; k < length; k++) {
      later(() => {
        const lit: { color: PadColor; cell: Cell; k: number }[] = [];
        let moved = false;
        team.runs.forEach((run, i) => {
          const s = run.steps[k];
          if (!s) return;
          if (s.dir === 'kiri' || s.dir === 'kanan') setAt(setFaceLeft, i, s.dir === 'kiri');
          if (s.bump) {
            sfx('tap');
            setBump({ who: i, dir: s.dir });
            return;
          }
          moved = true;
          setAt(setPos, i, s.to);
          setHop((a) => a.map((x, j) => (j === i ? x + 1 : x)));
          if (s.pad) {
            lit.push({ color: s.pad, cell: s.to, k });
            const nd = rules[s.pad]!;
            if (nd === 'kiri' || nd === 'kanan') later(() => setAt(setFaceLeft, i, nd === 'kiri'), STEP_MS * 0.6);
          }
          if (s.got !== undefined) {
            collected.add(s.got);
            setGot(new Set(collected));
            later(() => sparkleCell(s.to, 6), STEP_MS * 0.6);
          }
        });
        if (moved) sfx('tick');
        setNowPads(lit);
      }, t);
      // Jalan yang panjang (berputar-putar) dipercepat sesudah langkah ke-12.
      t += k < 12 ? STEP_MS : Math.round(STEP_MS * 0.6);
    }

    const end = t + 120;
    if (team.outcome === 'sampai') {
      later(() => {
        setNowPads([]);
        sfx('correct');
        heroes.forEach((h) => sparkleCell(h.goal, 12));
        setSolved(true);
        later(() => onCorrect(), 700);
      }, end);
      return;
    }
    later(() => {
      setNowPads([]);
      setBad(team.blame ?? null);
      narrate(team.outcome === 'putar' ? PATH_LINES.loop : team.outcome === 'belum-ambil' ? PATH_LINES.missing : PATH_LINES.bump);
      onWrong(true);
    }, end + 200);
    // Pulang ke petak mulai; aturannya tetap terpasang untuk diperbaiki.
    later(() => {
      setBump(null);
      setPos(homes());
      setHop((a) => a.map((x) => x + 1));
      setFaceLeft(faces());
      setGot(new Set());
      setRunning(false);
    }, end + 1500);
  }

  // ---- Gambar ----
  const idle = !running && !solved;

  return (
    <div className="cq-wrap cp-wrap">
      <div className="game-prompt cq-prompt">{level.narration}</div>
      <div className="cq-area">
        <div className="cq-boardbox">
          <div className="cq-board" style={{ '--cq-cols': board.cols, '--cq-rows': board.rows } as CSSProperties}>
            <div ref={boardRef} className="cq-grid">
              {board.tiles.map((row, r) =>
                row.map((tile, c) => {
                  const p = { r, c };
                  const pad = board.pads[r]![c];
                  const pi = board.pickups.findIndex((q) => sameCell(q, p));
                  const rule = pad ? rules[pad] : undefined;
                  const lit = nowPads.find((n) => sameCell(n.cell, p));
                  return (
                    <div key={`${r}-${c}`} className={'cq-cell cq-cell--' + tile + ((r + c) % 2 ? ' cq-cell--alt' : '')}>
                      {pad && (
                        <span
                          key={lit ? `p${lit.k}` : 'p'}
                          data-color={pad}
                          className={
                            'cp-pad' +
                            (lit ? ' cp-pad--now' : '') +
                            (bad === pad ? ' cp-pad--bad' : '') +
                            (sel === pad && !locked ? ' cp-pad--sel' : '')
                          }
                          style={{ '--cp-pad': PAD_HEX[pad] } as CSSProperties}
                          onClick={() => pick(pad)}
                          aria-label={`Petak ${PATH_LINES.color[pad].toLowerCase()}`}
                        >
                          {rule ? <ArrowIcon dir={rule} /> : <span className="cp-pad__q">?</span>}
                        </span>
                      )}
                      {tile === 'batu' && <Rock />}
                      {tile === 'pohon' && <ItemPic id="tree" className="cq-pic" fallbackClassName="cq-emoji" />}
                      {footprints.has(`${r},${c}`) && !pad && <span className="cq-foot" aria-hidden />}
                      {heroes.map(
                        (h, i) =>
                          sameCell(p, h.goal) && (
                            <ItemPic
                              key={`g${i}`}
                              id={cast[i]!.goal}
                              className={'cq-pic cq-goal' + (solved ? ' cq-goal--won' : '')}
                              fallbackClassName="cq-emoji"
                            />
                          ),
                      )}
                      {pi >= 0 && !got.has(pi) && data.pickupItem && (
                        <ItemPic id={data.pickupItem} className="cq-pic cq-pickup" fallbackClassName="cq-emoji" />
                      )}
                      {heroes.map(
                        (h, i) =>
                          sameCell(p, h.start) && (
                            <span key={`s${i}`} className={'cp-start cp-start--' + h.dir} aria-hidden>
                              <ArrowIcon dir={h.dir} />
                            </span>
                          ),
                      )}
                    </div>
                  );
                }),
              )}
              {heroes.map((h, i) => {
                const at = pos[i] ?? h.start;
                const flip = faceLeft[i] !== (cast[i]!.faces === 'kiri');
                const hopped = (hop[i] ?? 0) > 0;
                const style: CSSProperties = {
                  left: `${(at.c / board.cols) * 100}%`,
                  top: `${(at.r / board.rows) * 100}%`,
                  width: `${100 / board.cols}%`,
                  height: `${100 / board.rows}%`,
                };
                return (
                  <div
                    key={i}
                    className={'cq-hero' + (idle && sameCell(at, h.start) ? ' cp-hero--wait' : '')}
                    style={style}
                  >
                    <span
                      key={hop[i]}
                      className={
                        'cq-hero__body' +
                        (hopped ? ' cq-hero__body--hop' : '') +
                        (bump?.who === i ? ` cq-hero__body--bump-${bump.dir}` : '')
                      }
                    >
                      <ItemPic
                        id={cast[i]!.item}
                        className={'cq-hero__img' + (flip ? ' cq-hero__img--flip' : '')}
                        fallbackClassName="cq-emoji"
                      />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div key={`r${ping}`} className={'cq-code cp-rules' + (ping ? ' cp-rules--ping' : '')} aria-label="Aturan warna">
          {colors.map((color) => {
            const dir = rules[color];
            const now = nowPads.some((n) => n.color === color);
            return (
              <button
                key={color}
                type="button"
                data-color={color}
                className={
                  'cp-rule' +
                  (sel === color && !locked ? ' cp-rule--sel' : '') +
                  (now ? ' cp-rule--now' : '') +
                  (bad === color ? ' cp-rule--bad' : '') +
                  (nudge?.color === color && dir ? ' cp-rule--hintbad' : '')
                }
                style={{ '--cp-pad': PAD_HEX[color] } as CSSProperties}
                onClick={() => pick(color)}
                disabled={locked}
                aria-label={`Aturan ${PATH_LINES.color[color].toLowerCase()}${dir ? `: ${DIR_ARIA[dir].toLowerCase()}` : ', belum ada panah'}`}
              >
                <span className="cp-rule__then" aria-hidden>
                  <svg viewBox="0 0 20 20">
                    <path d="M3 10 H14 M10 5 L15 10 L10 15" fill="none" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {dir ? (
                  <span className={'cp-rule__slot cq-card cq-card--' + dir}>
                    <ArrowIcon dir={dir} />
                  </span>
                ) : (
                  <span className="cp-rule__slot cp-rule__slot--empty">?</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="cq-tray cp-tray">
          {DIRS.map((dir) => (
            <button
              key={dir}
              type="button"
              data-card={dir}
              className={'cq-card cq-card--' + dir + ' cq-tray__card' + (nudge && nudge.need === dir ? ' cq-card--hint' : '')}
              onPointerDown={(e) => trayDown(e, dir)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  place(dir);
                }
              }}
              disabled={locked}
              aria-label={DIR_ARIA[dir]}
            >
              <CodeCritter dir={dir} />
              <ArrowIcon dir={dir} />
            </button>
          ))}
        </div>

        <div className="cq-actions">
          <button type="button" className="cq-run" onClick={run} disabled={locked}>
            <img
              src={`${import.meta.env.BASE_URL}assets/mascot/mascot-3.webp`}
              alt=""
              className="cq-run__chick"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <span className="cq-run__play" aria-hidden>
              <svg viewBox="0 0 24 24">
                <path d="M8 5.5 L19 12 L8 18.5 Z" fill="#fff" strokeLinejoin="round" stroke="#fff" strokeWidth="2" />
              </svg>
            </span>
            <span className="cq-run__text">Jalankan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
