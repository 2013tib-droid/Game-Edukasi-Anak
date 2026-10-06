import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import type { Place, PlaceCounts } from '@/engine/core/types';
import { PLACES, PLACE_KEY, PLACE_NAME, countsOf, valueOf } from '@/engine/core/placeValue';
import { sfx } from '@/engine/audio/sound';
import { sparkleAt } from '@/engine/ui/juice';
import { BlockIcon, BlockTower } from '@/engine/ui/Blocks';
import ItemPic from '@/engine/ui/ItemPic';
import '@/engine/ui/place-value.css';

/**
 * Bangun bilangan dari balok (Istana Bilangan, `sd2`) — kontrak datanya di
 * `PlaceValueData` (types.ts).
 *
 * Tiga menara istana = tiga nilai tempat. Di bawah tiap menara tertulis
 * banyak baloknya, jadi bilangannya terbentuk di layar sambil dibangun.
 *
 * - Balok gudang boleh DIKETUK (satu ketukan = satu balok masuk) atau
 *   DISERET ke istana. Ketuk saja harus cukup: soal "pakai puluhan saja"
 *   butuh belasan balok, dan menyeret belasan kali melelahkan jari anak.
 * - TUKAR OTOMATIS (mode build): balok ke-10 di satu menara membuat sepuluh
 *   balok itu bergoyang lalu menempel jadi SATU balok di menara sebelah kiri.
 *   Input dikunci selama ±0,5 detik itu supaya anak melihatnya terjadi.
 * - PECAH (mode take): pelat ratusan yang disentuh pecah jadi sepuluh batang
 *   puluhan — hanya kalau menara puluhan sedang kosong (sepuluh tempatnya
 *   pas sepuluh batang; begitulah "meminjam" dikerjakan di buku).
 *
 * Gerakannya pointer event + listener di window (pola Cashier), bukan HTML5
 * drag-and-drop yang rusak di HP. Animasi = CSS, state React cuma per balok.
 */

/** Jari harus bergeser sejauh ini sebelum ketukan berubah jadi seretan. */
const DRAG_PX = 8;
/** Lama sepuluh balok bergoyang sebelum menempel jadi satu. */
const MERGE_MS = 520;

const NEXT: Partial<Record<Place, Place>> = { 1: 10, 10: 100 };

interface Drag {
  place: Place;
  x0: number;
  y0: number;
  x: number;
  y: number;
  moved: boolean;
}

export default function PlaceValue({ level, onCorrect, onWrong, hint }: TemplateProps<'place-value'>) {
  const data = level.data;
  const take = data.mode === 'take';
  const start = take ? (data.start ?? countsOf(0)) : countsOf(0);
  const [counts, setCounts] = useState<PlaceCounts>(start);
  const [taken, setTaken] = useState(0);
  const [merging, setMerging] = useState<Place | null>(null);
  const [shake, setShake] = useState<Place | 'all' | null>(null);
  const [solved, setSolved] = useState(false);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [over, setOver] = useState(false);
  const castleRef = useRef<HTMLDivElement>(null);
  const colRefs = useRef<Record<Place, HTMLButtonElement | null>>({ 100: null, 10: null, 1: null });
  // Dibaca di dalam listener window & timer — selalu nilai terbaru.
  const live = useRef({ counts, merging, solved });
  live.current = { counts, merging, solved };

  const busy = merging !== null || solved;
  const goal = countsOf(data.target);

  function wiggle(which: Place | 'all') {
    setShake(which);
    window.setTimeout(() => setShake(null), 450);
  }

  function sparkleOn(place: Place) {
    const r = colRefs.current[place]?.getBoundingClientRect();
    if (r) sparkleAt(r.left + r.width / 2, r.top + r.height / 2, 8);
  }

  /** Sepuluh balok di `place` → satu balok di tempat sebelah kiri (berantai). */
  function merge(place: Place, c: PlaceCounts) {
    const next = NEXT[place];
    if (!next) return;
    setMerging(place);
    window.setTimeout(() => {
      const n: PlaceCounts = { ...c, [PLACE_KEY[place]]: 0, [PLACE_KEY[next]]: c[PLACE_KEY[next]] + 1 };
      setCounts(n);
      setMerging(null);
      sfx('correct');
      sparkleOn(next);
      if (n[PLACE_KEY[next]] >= 10) merge(next, n);
    }, MERGE_MS);
  }

  function add(place: Place) {
    const { counts: c, merging: m, solved: s } = live.current;
    if (m !== null || s) return;
    if (valueOf(c) + place > 999) {
      // Istana ini berhenti di 999 (batas bilangan `sd2`). Bukan kesalahan
      // yang dihitung — cuma tanda "sudah penuh".
      sfx('tap');
      wiggle(place);
      return;
    }
    sfx('tap');
    const n: PlaceCounts = { ...c, [PLACE_KEY[place]]: c[PLACE_KEY[place]] + 1 };
    setCounts(n);
    if (n[PLACE_KEY[place]] >= 10) merge(place, n);
  }

  /** Menara disentuh. */
  function tapTower(place: Place) {
    if (busy) return;
    const key = PLACE_KEY[place];
    if (!take) {
      if (counts[key] === 0) return;
      sfx('tap');
      setCounts({ ...counts, [key]: counts[key] - 1 });
      return;
    }
    if (place === 100) {
      if (counts.h === 0) return;
      if (counts.t > 0) {
        // Masih ada batang puluhan: belum perlu memecah pelat.
        sfx('tap');
        wiggle(100);
        return;
      }
      sfx('correct');
      setCounts({ ...counts, h: counts.h - 1, t: 10 });
      window.setTimeout(() => sparkleOn(10), 30);
      return;
    }
    if (counts[key] === 0) {
      sfx('tap');
      wiggle(place);
      return;
    }
    sfx('tap');
    setCounts({ ...counts, [key]: counts[key] - 1 });
    setTaken(taken + place);
  }

  function check() {
    if (busy) return;
    if (valueOf(counts) === data.target) {
      setSolved(true);
      onCorrect();
    } else {
      sfx('tap');
      wiggle('all');
      onWrong();
    }
  }

  function overCastle(x: number, y: number): boolean {
    const r = castleRef.current?.getBoundingClientRect();
    return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  function handleDown(e: ReactPointerEvent, place: Place) {
    if (busy) return;
    e.preventDefault();
    setDrag({ place, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, moved: false });
  }

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      setDrag((d) => {
        if (!d) return d;
        const moved = d.moved || Math.hypot(e.clientX - d.x0, e.clientY - d.y0) > DRAG_PX;
        return { ...d, x: e.clientX, y: e.clientY, moved };
      });
      setOver(overCastle(e.clientX, e.clientY));
    };
    const up = (e: PointerEvent) => {
      const d = drag;
      setDrag(null);
      setOver(false);
      const moved = d.moved || Math.hypot(e.clientX - d.x0, e.clientY - d.y0) > DRAG_PX;
      // Ketukan (tanpa geser) = satu balok masuk. Seretan hanya masuk kalau
      // dilepas di atas istana; dilepas di luar = kembali ke gudang, tanpa hukuman.
      if (e.type === 'pointercancel') return;
      if (!moved || overCastle(e.clientX, e.clientY)) add(d.place);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    // Dipasang ulang hanya saat seretan baru dimulai; posisi dibaca lewat setDrag.
  }, [drag?.place, drag?.x0, drag?.y0]);

  /** Menara yang perlu dilihat (petunjuk P2 tingkat 1). */
  function needsLook(place: Place): boolean {
    if (hint < 1) return false;
    if (!take) return counts[PLACE_KEY[place]] !== goal[PLACE_KEY[place]];
    // Mode ambil: kalau puluhannya habis & masih kurang, pelatnya yang harus disentuh.
    const left = (data.take ?? 0) - taken;
    if (left <= 0) return false;
    if (place === 100) return counts.t === 0 && left >= 10;
    if (place === 10) return counts.t > 0 && left >= 10;
    return left < 10 && counts.o > 0;
  }

  /** Petunjuk tingkat 2: satu langkah diperlihatkan di menara. */
  function stepHint(place: Place): string | null {
    if (hint < 2 || !needsLook(place)) return null;
    if (!take) return String(goal[PLACE_KEY[place]]);
    return '👆';
  }

  return (
    <>
      <div className="game-prompt pv-prompt">{level.narration}</div>
      <div className="game-area pv-area">
        <div className="pv-order">
          <ItemPic id="lion" className="pv-order__lion" fallbackClassName="pv-order__lion-emoji" />
          <div className="pv-bubble" aria-live="polite">
            {take ? (
              <>
                <span className="pv-bubble__small">Ambil</span> {data.take}
              </>
            ) : (
              data.target
            )}
          </div>
          {take && (
            <div className="pv-taken" aria-label={`Sudah diambil ${taken}`}>
              🧺 <b>{taken}</b>
            </div>
          )}
        </div>

        <div
          ref={castleRef}
          className={
            'pv-castle' +
            (over ? ' pv-castle--over' : '') +
            (shake === 'all' ? ' pv-castle--shake' : '') +
            (solved ? ' pv-castle--done' : '')
          }
        >
          {PLACES.map((p) => {
            const n = counts[PLACE_KEY[p]];
            const look = needsLook(p);
            const step = stepHint(p);
            return (
              <button
                key={p}
                ref={(el) => {
                  colRefs.current[p] = el;
                }}
                type="button"
                className={
                  'pv-col' +
                  (look ? ' pv-col--hint' : '') +
                  (shake === p ? ' pv-col--shake' : '') +
                  (take && p === 100 ? ' pv-col--breakable' : '')
                }
                onClick={() => tapTower(p)}
                aria-label={`${PLACE_NAME[p]}: ${n}`}
              >
                <span className="pv-col__name">{PLACE_NAME[p]}</span>
                <BlockTower place={p} count={n} merging={merging === p} className="pv-col__blocks" />
                <span className="pv-col__digit">{n}</span>
                {step && <span className="pv-col__step">{step}</span>}
              </button>
            );
          })}
        </div>

        <div className="pv-controls">
          {!take &&
            (data.wallet ?? PLACES).map((p) => (
              <div
                key={p}
                className="pv-tile"
                role="button"
                tabIndex={0}
                aria-label={`Tambah ${PLACE_NAME[p].toLowerCase()}`}
                onPointerDown={(e) => handleDown(e, p)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return;
                  e.preventDefault();
                  add(p);
                }}
              >
                <BlockIcon place={p} className="pv-tile__img" />
                <span className="pv-tile__label">{p}</span>
              </div>
            ))}
          <button type="button" className="btn btn--primary pv-check" onClick={check} disabled={busy}>
            ✓ Cocok!
          </button>
        </div>
      </div>
      {drag?.moved && (
        <div className="pv-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden>
          <BlockIcon place={drag.place} className="pv-tile__img" />
        </div>
      )}
    </>
  );
}
