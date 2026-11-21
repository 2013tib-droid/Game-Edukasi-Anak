import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import {
  COMPASS_LINES,
  DIR_NAME,
  METERS_PER_CELL,
  PLACES,
  SCREEN_SIDES,
  SYMBOL_NAME,
  cellOf,
  dirBetween,
  fromScreen,
  goalOf,
  northSide,
  placeAt,
  runMoves,
  same,
  screenSize,
  shortest,
  toScreen,
  walkable,
  type Cell,
  type PlaceId,
  type Town,
  parseTown,
} from '@/engine/core/compass';
import { sfx, speak } from '@/engine/audio/sound';
import { buzz, sparkleAt } from '@/engine/ui/juice';
import ItemPic from '@/engine/ui/ItemPic';
import Scene from '@/engine/ui/Scene';
import { BridgeGlyph, CompassRose, NorthArrow, SideArrow, SymbolTile, TreeGlyph, WaveGlyph } from '@/engine/ui/TownMap';
import '@/engine/ui/compass-map.css';

/**
 * KURIR KOMPAS (`compass-map`). Kontrak datanya `CompassMapData`, aturannya
 * `core/compass.ts`.
 *
 * - Peta digambar di koordinat LAYAR (`toScreen`) — tanpa CSS rotate, jadi
 *   ikon bangunan selalu tegak. Yang berputar cuma mawar anginnya.
 * - Langkah gerak (`follow`, `go`): anak MENARIK kurir sepanjang jalan atau
 *   mengetuk petak yang segaris; menarik balik = mundur. Dinilai saat
 *   "✓ Sampai!" — bukan otomatis, supaya tak bisa asal geser sampai menang.
 *   Salah = SENYAP (`onWrong(true)`): kurir bergoyang lalu pulang ke titik
 *   mulai langkah itu; tujuan yang benar TIDAK dibocorkan.
 * - Kartu arah cuma TULISAN (tanpa panah) supaya anak membaca mawar angin.
 * - P2: tingkat 1 = mawar angin berdenyut + panah utara melintasi peta
 *   (legenda: nama di legenda menyala; skala: petak jalur bernomor);
 *   tingkat 2 = ruas pertama yang benar berjejak kaki / satu kartu salah
 *   dipudarkan / bangunannya menyala.
 */

type Phase = 'play' | 'wrong' | 'done';

function PlaceIcon({ id }: { id: PlaceId }) {
  const p = PLACES[id];
  return p.item ? (
    <ItemPic id={p.item} className="cm-place__img" fallbackClassName="cm-place__emoji" />
  ) : (
    <span className="cm-place__emoji" aria-hidden>
      {p.emoji}
    </span>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const meters = (v: number) => `${v >= 1000 ? `${Math.floor(v / 1000)}.${String(v % 1000).padStart(3, '0')}` : v} m`;

export default function CompassMap({ level, onCorrect, onWrong, setRepeat, hint }: TemplateProps<'compass-map'>) {
  const data = level.data;
  const town: Town = useMemo(() => parseTown(data.rows, data.places), [data]);
  const size = screenSize(town, data.rot);

  const [stepIx, setStepIx] = useState(0);
  const step = data.steps[stepIx]!;
  const task = step.task;
  const say = stepIx === 0 ? level.narration : step.say ?? level.narration;
  const isMove = task.kind === 'follow' || task.kind === 'go';

  const [phase, setPhase] = useState<Phase>('play');
  const [pos, setPos] = useState<Cell | null>(data.start ?? null);
  const [trail, setTrail] = useState<Cell[]>(data.start ? [data.start] : []);
  const [faceRight, setFaceRight] = useState(false);
  const [shake, setShake] = useState<string | null>(null);
  const [badCard, setBadCard] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const posRef = useRef<Cell | null>(data.start ?? null);
  const trailRef = useRef<Cell[]>(data.start ? [data.start] : []);
  const origin = useRef<Cell | null>(data.start ?? null);
  const walked = useRef(0);
  const checkSaid = useRef(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  useEffect(() => {
    if (stepIx > 0) speak(say);
    setRepeat(() => speak(say));
  }, [stepIx, say, setRepeat]);
  useEffect(() => () => setRepeat(null), [setRepeat]);

  // ---------- Selesai / salah ----------
  function wiggle(what: string) {
    setShake(what);
    later(() => setShake(null), 450);
  }

  function celebrateAt(el: Element | null | undefined) {
    const r = (el ?? boardRef.current)?.getBoundingClientRect();
    if (r) sparkleAt(r.left + r.width / 2, r.top + r.height / 2, 10);
  }

  function advance(text = 'Benar!', wait = 750) {
    setPhase('done');
    setStatus(text);
    sfx('correct');
    buzz();
    later(() => {
      if (stepIx + 1 >= data.steps.length) {
        onCorrect();
        return;
      }
      origin.current = posRef.current;
      trailRef.current = posRef.current ? [posRef.current] : [];
      setTrail(trailRef.current);
      walked.current = 0;
      setStatus('');
      setPhase('play');
      setStepIx(stepIx + 1);
    }, wait);
  }

  function miss() {
    onWrong(true);
    sfx('wrong');
  }

  function pickCard(key: string, right: boolean, el: Element) {
    if (phase !== 'play') return;
    if (right) {
      celebrateAt(el);
      advance();
    } else {
      miss();
      setBadCard(key);
      later(() => setBadCard(null), 450);
    }
  }

  // ---------- Gerak kurir ----------
  function moveToward(target: Cell) {
    const from = posRef.current;
    if (!isMove || phase !== 'play' || !from) return;
    const dc = Math.sign(target[0] - from[0]);
    const dr = Math.sign(target[1] - from[1]);
    if ((dc !== 0) === (dr !== 0)) return; // petak yang sama, atau tidak segaris
    let [c, r] = from;
    const t = [...trailRef.current];
    let changed = false;
    while (c !== target[0] || r !== target[1]) {
      if (!walkable(town, c + dc, r + dr)) break;
      c += dc;
      r += dr;
      const back = t[t.length - 2];
      if (back && back[0] === c && back[1] === r) t.pop();
      else t.push([c, r]);
      walked.current += 1;
      changed = true;
    }
    if (!changed) return;
    const a = toScreen(town, data.rot, from);
    const b = toScreen(town, data.rot, [c, r]);
    if (a[0] !== b[0]) setFaceRight(b[0] > a[0]);
    posRef.current = [c, r];
    trailRef.current = t;
    setPos(posRef.current);
    setTrail(t);
    sfx('tick');
  }

  function cellFromEvent(e: ReactPointerEvent): Cell | null {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const sc = Math.floor(((e.clientX - rect.left) / rect.width) * size.cols);
    const sr = Math.floor(((e.clientY - rect.top) / rect.height) * size.rows);
    if (sc < 0 || sr < 0 || sc >= size.cols || sr >= size.rows) return null;
    return fromScreen(town, data.rot, sc, sr);
  }

  const dragging = useRef(false);
  function onBoardDown(e: ReactPointerEvent<HTMLDivElement>) {
    const cell = cellFromEvent(e);
    if (!cell || phase !== 'play') return;
    if (task.kind === 'find') {
      const here = placeAt(town, cell);
      if (!here) return;
      if (here === task.place) {
        sparkleAt(e.clientX, e.clientY, 10);
        advance();
      } else {
        miss();
        wiggle(`place-${here}`);
      }
      return;
    }
    if (!isMove) return;
    e.preventDefault();
    dragging.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    moveToward(cell);
  }
  function onBoardMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const cell = cellFromEvent(e);
    if (cell) moveToward(cell);
  }
  const onBoardUp = () => {
    dragging.current = false;
  };

  function resetCourier() {
    posRef.current = origin.current;
    trailRef.current = origin.current ? [origin.current] : [];
    walked.current = 0;
    setPos(posRef.current);
    setTrail(trailRef.current);
  }

  function arrive() {
    const at = posRef.current;
    const from = origin.current;
    if (phase !== 'play' || !isMove || !at || !from) return;
    if (same(at, from)) {
      wiggle('arrive');
      return;
    }
    const goal = goalOf(town, task, from);
    if (goal && same(goal, at)) {
      celebrateAt(boardRef.current?.querySelector('.cm-courier'));
      const best = (shortest(town, from, goal)?.length ?? 1) - 1;
      advance(task.kind === 'go' && walked.current <= best ? '⭐ Rute hemat!' : 'Sampai!', 900);
      return;
    }
    miss();
    setPhase('wrong');
    wiggle('courier');
    if (!checkSaid.current) {
      checkSaid.current = true;
      speak(COMPASS_LINES.check);
    }
    later(() => {
      resetCourier();
      setPhase('play');
    }, 700);
  }

  // ---------- Petunjuk & sorotan ----------
  const key = (c: Cell) => `${c[0]},${c[1]}`;
  const trailSet = new Set(isMove ? trail.map(key) : []);
  const scalePath = useMemo(
    () => (task.kind === 'scale' ? shortest(town, cellOf(town, task.from), cellOf(town, task.to)) ?? [] : []),
    [task, town],
  );
  const scaleIx = new Map(scalePath.map((c, i) => [key(c), i]));
  const hintCells = new Set<string>();
  if (hint >= 2 && isMove && phase === 'play' && origin.current) {
    const from = origin.current;
    const first =
      task.kind === 'follow'
        ? runMoves(town, from, task.moves.slice(0, 1)) ?? []
        : (shortest(town, from, cellOf(town, task.to)) ?? []).slice(0, 3);
    first.slice(1).forEach((c) => hintCells.add(key(c)));
  }
  const showNorth = hint >= 1 && (isMove || task.kind === 'where');
  const rosePulse = hint >= 1 && (isMove || task.kind === 'where' || task.kind === 'north');
  const ringOf = task.kind === 'where' ? task.of : task.kind === 'scale' ? task.to : null;
  const ringFrom = task.kind === 'where' ? task.from : task.kind === 'scale' ? task.from : null;

  // ---------- Kartu ----------
  type Card = { key: string; right: boolean; label: string; node?: JSX.Element };
  let cards: Card[] = [];
  if (task.kind === 'north') {
    const right = northSide(data.rot);
    cards = SCREEN_SIDES.map((s) => ({ key: s, right: s === right, label: `Sisi ${s}`, node: <SideArrow side={s} /> }));
  } else if (task.kind === 'where') {
    const right = dirBetween(cellOf(town, task.from), cellOf(town, task.of));
    cards = task.choices.map((d) => ({ key: d, right: d === right, label: cap(DIR_NAME[d]) }));
  } else if (task.kind === 'symbol') {
    cards = task.choices.map((s) => ({ key: s, right: s === task.symbol, label: SYMBOL_NAME[s] }));
  } else if (task.kind === 'scale') {
    const right = (scalePath.length - 1) * METERS_PER_CELL;
    cards = task.choices.map((v) => ({ key: String(v), right: v === right, label: meters(v) }));
  }
  // Satu kartu salah dipudarkan: `north`/`symbol` sejak tingkat 1, sisanya tingkat 2.
  const fadeFrom = task.kind === 'north' || task.kind === 'symbol' ? 1 : 2;
  const faded = hint >= fadeFrom ? cards.filter((c) => !c.right).slice(-1)[0]?.key : undefined;

  // ---------- Gambar ----------
  const cells: JSX.Element[] = [];
  for (let sr = 0; sr < size.rows; sr += 1) {
    for (let sc = 0; sc < size.cols; sc += 1) {
      const cell = fromScreen(town, data.rot, sc, sr);
      const tile = town.tiles[cell[1]]![cell[0]]!;
      const place = placeAt(town, cell);
      const k = key(cell);
      const cls = [`cm-cell cm-cell--${tile}`];
      if (trailSet.has(k) || scaleIx.has(k)) cls.push('cm-cell--trail');
      if (hintCells.has(k)) cls.push('cm-cell--hint');
      if (place && place === ringOf) cls.push('cm-cell--of');
      if (place && place === ringFrom) cls.push('cm-cell--from');
      if (place && shake === `place-${place}`) cls.push('cm-shake');
      if (place && task.kind === 'find' && hint >= 2 && place === task.place) cls.push('cm-cell--glow');
      let across: 'datar' | 'tegak' = 'datar';
      if (tile === 'jembatan') {
        const l = fromScreen(town, data.rot, sc - 1, sr);
        const r = fromScreen(town, data.rot, sc + 1, sr);
        across = sc > 0 && sc < size.cols - 1 && walkable(town, l[0], l[1]) && walkable(town, r[0], r[1]) ? 'datar' : 'tegak';
      }
      cells.push(
        <div key={k} className={cls.join(' ')} data-cell={k} data-place={place ?? undefined}>
          {tile === 'pohon' && <TreeGlyph />}
          {tile === 'sungai' && <WaveGlyph />}
          {tile === 'jembatan' && (
            <>
              <WaveGlyph />
              <BridgeGlyph across={across} />
            </>
          )}
          {place && (
            <span className="cm-place" role="img" aria-label={PLACES[place].name}>
              <PlaceIcon id={place} />
            </span>
          )}
          {hintCells.has(k) && (
            <span className="cm-steps" aria-hidden>
              👣
            </span>
          )}
          {task.kind === 'scale' && hint >= 1 && (scaleIx.get(k) ?? 0) > 0 && <span className="cm-num">{scaleIx.get(k)}</span>}
        </div>,
      );
    }
  }

  const courierAt = pos && (isMove || data.steps.some((s) => s.task.kind === 'follow' || s.task.kind === 'go')) ? toScreen(town, data.rot, pos) : null;
  const total = data.steps.length;

  return (
    <div className={`cm-wrap cm-wrap--${task.kind}`} data-step={stepIx} data-kind={task.kind} data-rot={data.rot}>
      <Scene id="kota" />
      <div className="cm-head">
        {total > 1 && (
          <div className="cm-dots" aria-label={`Langkah ${stepIx + 1} dari ${total}`}>
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={`cm-dot${i < stepIx ? ' cm-dot--done' : i === stepIx ? ' cm-dot--now' : ''}`} />
            ))}
          </div>
        )}
        <p className="cm-prompt">{say}</p>
      </div>

      <div className="cm-boardbox">
        <div
          ref={boardRef}
          className={`cm-board${isMove ? ' cm-board--move' : ''}`}
          style={{ '--cols': size.cols, '--rows': size.rows } as CSSProperties}
          onPointerDown={onBoardDown}
          onPointerMove={onBoardMove}
          onPointerUp={onBoardUp}
          onPointerCancel={onBoardUp}
        >
          {cells}
          {showNorth && <NorthArrow rot={data.rot} />}
          {courierAt && (
            <span
              className={`cm-courier${shake === 'courier' ? ' cm-shake' : ''}${faceRight ? ' cm-courier--right' : ''}`}
              style={{
                left: `${((courierAt[0] + 0.5) / size.cols) * 100}%`,
                top: `${((courierAt[1] + 0.5) / size.rows) * 100}%`,
                width: `${100 / size.cols}%`,
              }}
              data-pos={pos ? key(pos) : undefined}
              aria-label="Kurir"
              role="img"
            >
              <ItemPic id={data.courier} className="cm-courier__img" fallbackClassName="cm-courier__emoji" />
            </span>
          )}
          <span className="cm-status" aria-live="polite">
            {status}
          </span>
        </div>
      </div>

      <div className="cm-foot">
        <CompassRose rot={data.rot} className={rosePulse ? 'cm-rose--pulse' : ''} />
        <ul className="cm-legend" aria-label="Keterangan peta">
          {town.places.map((p) => (
            <li key={p.id} className={`cm-legend__item${task.kind === 'find' && hint >= 1 && p.id === task.place ? ' cm-legend__item--hint' : ''}`}>
              <span className="cm-legend__icon">
                <PlaceIcon id={p.id} />
              </span>
              {cap(PLACES[p.id].name)}
            </li>
          ))}
          {task.kind === 'scale' && <li className="cm-legend__item cm-legend__item--scale">1 kotak = {METERS_PER_CELL} m</li>}
        </ul>
      </div>

      <div className="cm-bottom">
        {task.kind === 'symbol' && <SymbolTile symbol={task.symbol} />}
        {isMove && (
          <div className="cm-move">
            <button type="button" className="cm-btn cm-btn--undo" onClick={() => phase === 'play' && resetCourier()} aria-label="Ulang dari awal">
              <svg viewBox="0 0 40 40" aria-hidden>
                <path d="M12 16 H25 a8 8 0 0 1 0 16 H14" fill="none" stroke="#5a4630" strokeWidth="4" strokeLinecap="round" />
                <path d="M17 8 L8 16 L17 24 Z" fill="#5a4630" />
              </svg>
            </button>
            <span className="cm-count" aria-label="Langkah">
              👣 {Math.max(0, trail.length - 1)}
            </span>
            <button type="button" className={`btn cm-arrive${shake === 'arrive' ? ' cm-shake' : ''}`} onClick={arrive} disabled={phase !== 'play'}>
              ✓ Sampai!
            </button>
          </div>
        )}
        {cards.length > 0 && (
          <div
            className={`cm-cards cm-cards--${task.kind}${cards.length === 4 && !cards[0]!.node ? ' cm-cards--long' : ''}`}
            style={{ '--n': cards.length } as CSSProperties}
          >
            {cards.map((c) => (
              <button
                key={c.key}
                type="button"
                className={`cm-card${badCard === c.key ? ' cm-shake' : ''}${faded === c.key ? ' cm-card--out' : ''}`}
                disabled={faded === c.key || phase !== 'play'}
                aria-label={c.label}
                data-card={c.key}
                onClick={(e) => pickCard(c.key, c.right, e.currentTarget)}
              >
                {c.node ?? c.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
