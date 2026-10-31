import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import { sfx } from '@/engine/audio/sound';
import { sparkleAt } from '@/engine/ui/juice';
import ItemPic from '@/engine/ui/ItemPic';
import { SpotBackdrop, SpotShapeArt } from '@/engine/ui/SpotArt';
import {
  SPOT_H,
  SPOT_LAYOUTS,
  SPOT_W,
  hitTarget,
  pictureB,
  spotTargets,
  type SpotThing,
} from '@/engine/core/spotDiff';
import '@/engine/ui/spot-diff.css';

/**
 * CARI PERBEDAAN (2026-10-31): dua gambar, anak menyentuh tempat yang
 * berbeda — di gambar MANA PUN, keduanya benar. Gambar B dibuat mesin dari
 * gambar A + daftar perubahan (`src/engine/core/spotDiff.ts`), jadi tak ada
 * perbedaan yang tidak terdaftar.
 *
 * - Ketemu = lingkaran hijau di KEDUA gambar + percikan.
 * - Sentuhan yang tidak mengenai perbedaan = salah SENYAP (`onWrong(true)`,
 *   tetap mengurangi bintang) + tanda silang kecil sebentar. Overlay "coba
 *   lagi" layar penuh justru memutus anak yang sedang mengamati.
 * - Menyentuh perbedaan yang sudah ketemu tidak dihitung apa pun.
 * - PETUNJUK: sesudah tiga sentuhan salah sejak penemuan terakhir, satu
 *   perbedaan yang belum ketemu berdenyut di kedua gambar. Hitungannya milik
 *   template (bukan `hint` shell, yang tak pernah reset dalam satu level) —
 *   di sini satu level berisi beberapa penemuan.
 */

const HINT_AFTER = 3;
const MISS_MS = 650;

interface Miss {
  id: number;
  panel: 'a' | 'b';
  x: number;
  y: number;
}

export default function SpotDiff({ level, onCorrect, onWrong }: TemplateProps<'spot-diff'>) {
  const data = level.data;
  const layout = SPOT_LAYOUTS[data.layout];
  const targets = useMemo(() => spotTargets(data), [data]);
  const thingsB = useMemo(() => pictureB(data), [data]);
  const [found, setFound] = useState<number[]>([]);
  const [misses, setMisses] = useState<Miss[]>([]);
  const [missRun, setMissRun] = useState(0);
  const done = found.length === targets.length;
  const lastTap = useRef(0);
  const missSeq = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const hintAt = !done && missRun >= HINT_AFTER ? targets.find((t) => !found.includes(t.index)) : undefined;

  function tap(e: ReactPointerEvent<HTMLDivElement>, panel: 'a' | 'b') {
    if (done) return;
    const now = performance.now();
    // Satu jari yang memantul di kaca bukan dua sentuhan.
    if (now - lastTap.current < 180) return;
    lastTap.current = now;
    const box = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * SPOT_W;
    const y = ((e.clientY - box.top) / box.height) * SPOT_H;
    const hit = hitTarget(targets, x, y);
    if (hit) {
      if (found.includes(hit.index)) return;
      const next = [...found, hit.index];
      setFound(next);
      setMissRun(0);
      sfx('correct');
      sparkleAt(e.clientX, e.clientY, 8);
      if (next.length === targets.length) {
        timers.current.push(window.setTimeout(onCorrect, 700));
      }
      return;
    }
    sfx('tap');
    setMissRun((n) => n + 1);
    const id = ++missSeq.current;
    setMisses((m) => [...m, { id, panel, x, y }]);
    timers.current.push(window.setTimeout(() => setMisses((m) => m.filter((k) => k.id !== id)), MISS_MS));
    onWrong(true);
  }

  function panel(which: 'a' | 'b') {
    const items =
      which === 'a' ? data.things.map((thing) => ({ thing, scale: 1 })) : thingsB;
    return (
      <div
        className={`sd-pic sd-pic--${which}`}
        role="img"
        aria-label={which === 'a' ? 'Gambar pertama' : 'Gambar kedua'}
        data-panel={which}
        onPointerDown={(e) => tap(e, which)}
      >
        <SpotBackdrop place={data.place} uid={`${level.id}-${which}`} />
        {items.map(({ thing, scale }, i) =>
          thing ? <Thing key={i} thing={thing} pos={layout[i]!} scale={scale} /> : null,
        )}
        <svg className="sd-marks" viewBox={`0 0 ${SPOT_W} ${SPOT_H}`} aria-hidden>
          {targets
            .filter((t) => found.includes(t.index))
            .map((t) => (
              <circle key={t.index} className="sd-found" cx={t.x} cy={t.y} r={Math.max(t.r - 2, 10)} />
            ))}
          {hintAt && <circle className="sd-hint" cx={hintAt.x} cy={hintAt.y} r={hintAt.r} />}
          {misses
            .filter((m) => m.panel === which)
            .map((m) => (
              <g key={m.id} className="sd-miss" transform={`translate(${m.x} ${m.y})`}>
                <path d="M-4 -4 L4 4 M4 -4 L-4 4" />
              </g>
            ))}
        </svg>
      </div>
    );
  }

  return (
    <div className="sd-wrap">
      <div className="sd-head">
        <div className="game-prompt sd-prompt">{level.narration}</div>
        <div className="sd-count" aria-label={`${found.length} dari ${targets.length} ditemukan`}>
          {targets.map((t, i) => (
            <span key={t.index} className={'sd-dot' + (i < found.length ? ' sd-dot--on' : '')} />
          ))}
        </div>
      </div>
      <div className="sd-pics" data-found={found.length} data-total={targets.length}>
        {panel('a')}
        {panel('b')}
      </div>
    </div>
  );
}

function Thing({ thing, pos, scale }: { thing: SpotThing; pos: { x: number; y: number; size: number }; scale: number }) {
  const size = pos.size;
  const style = {
    left: `${((pos.x - size / 2) / SPOT_W) * 100}%`,
    top: `${((pos.y - size / 2) / SPOT_H) * 100}%`,
    width: `${(size / SPOT_W) * 100}%`,
    height: `${(size / SPOT_H) * 100}%`,
    transform: scale !== 1 ? `scale(${scale})` : undefined,
  };
  return (
    <div className="sd-thing" style={style} data-thing={thing.item ?? thing.shape}>
      <div className={'sd-thing__in' + (thing.flip ? ' sd-thing__in--flip' : '')}>
        {thing.shape && thing.color ? (
          <SpotShapeArt shape={thing.shape} color={thing.color} />
        ) : thing.item ? (
          <ItemPic id={thing.item} className="sd-img" fallbackClassName="sd-emoji" />
        ) : null}
      </div>
    </div>
  );
}
