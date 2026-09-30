import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import type { Denom } from '@/engine/core/types';
import { DENOM_ITEM, fewestPieces, formatRp, isCoin } from '@/engine/core/money';
import { sfx } from '@/engine/audio/sound';
import ItemPic from '@/engine/ui/ItemPic';

/**
 * Kasir (Toko Kembalian, sd2): tarik uang dari dompet ke SATU baki sampai
 * jumlahnya pas. Kontrak datanya & alasan dua cara menilai ada di
 * `CashierData` (types.ts).
 *
 * Gerakannya pointer event, bukan HTML5 drag-and-drop (rusak di HP) — pola
 * yang sama dengan DragDrop. Lembar yang sedang ditarik adalah SALINAN: dompet
 * tak pernah habis, jadi tile aslinya tetap di tempat.
 *
 * GAMBAR UANG = foto SPECIMEN resmi BI (lihat komentar registry di items.ts).
 * Tanda SPECIMEN tak boleh tertutup elemen UI, jadi nominal ditulis DI BAWAH
 * gambar, tidak pernah di atasnya — dan tetap ditulis walau gambarnya ada:
 * kalau aset gagal dimuat, emoji cadangannya sama semua (💵), dan tanpa
 * tulisan soalnya jadi mustahil.
 */

const TRAY: Record<'laci' | 'tangan' | 'celengan', { icon: string; label: string; action: string }> = {
  laci: { icon: '🗄️', label: 'Laci', action: '✅ Bayar' },
  tangan: { icon: '🤲', label: 'Kembalian', action: '✅ Berikan' },
  celengan: { icon: '🐷', label: 'Celengan', action: '✅ Simpan' },
};

interface Drag {
  denom: Denom;
  x: number;
  y: number;
}

function Money({ denom, className }: { denom: Denom; className: string }) {
  return (
    <ItemPic
      id={DENOM_ITEM[denom]}
      className={`${className} ${isCoin(denom) ? 'cs-coin' : 'cs-note'}`}
      fallbackClassName="cs-money-emoji"
    />
  );
}

export default function Cashier({ level, onCorrect, onWrong }: TemplateProps<'cashier'>) {
  const data = level.data;
  const auto = data.check === 'auto';
  const tray = TRAY[data.tray];
  /** Isi baki, urut masuk (yang terakhir memantul balik saat kelebihan). */
  const [pieces, setPieces] = useState<Denom[]>([]);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [over, setOver] = useState(false);
  const [shake, setShake] = useState(false);
  const [solved, setSolved] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);

  const total = pieces.reduce((a, b) => a + b, 0);
  const minPieces = useMemo(
    () => (data.fewest ? fewestPieces(data.target, data.wallet) : Infinity),
    [data.fewest, data.target, data.wallet],
  );

  /** Kelompokkan isi baki per pecahan (besar dulu) supaya 10 lembar tak memenuhi layar. */
  const groups = useMemo(() => {
    const m = new Map<Denom, number>();
    for (const p of pieces) m.set(p, (m.get(p) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[0] - a[0]);
  }, [pieces]);

  function wiggle() {
    setShake(true);
    window.setTimeout(() => setShake(false), 450);
  }

  function succeed() {
    setSolved(true);
    window.setTimeout(onCorrect, 350);
  }

  function add(denom: Denom) {
    if (solved) return;
    const next = [...pieces, denom];
    const sum = total + denom;
    if (auto && sum > data.target) {
      // Kelebihan: lembarnya memantul balik. Senyap — bagian dari mencoba,
      // bukan jawaban yang diserahkan (pola salah-taruh di Puzzle).
      sfx('wrong');
      wiggle();
      onWrong(true);
      return;
    }
    sfx('tap');
    setPieces(next);
    if (auto && sum === data.target) {
      if (data.fewest && next.length > minPieces) {
        // Pas, tapi lembarnya kebanyakan: itu memang kesalahan soal ini.
        wiggle();
        onWrong();
        window.setTimeout(() => setPieces([]), 600);
        return;
      }
      succeed();
    }
  }

  function removeOne(denom: Denom) {
    if (solved) return;
    const i = pieces.lastIndexOf(denom);
    if (i < 0) return;
    sfx('tap');
    setPieces(pieces.filter((_, j) => j !== i));
  }

  function submit() {
    if (solved || pieces.length === 0) return;
    if (total === data.target && (!data.fewest || pieces.length <= minPieces)) {
      succeed();
    } else {
      wiggle();
      onWrong();
    }
  }

  function overTray(x: number, y: number): boolean {
    const r = trayRef.current?.getBoundingClientRect();
    return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  function handleDown(e: ReactPointerEvent, denom: Denom) {
    if (solved) return;
    e.preventDefault();
    setDrag({ denom, x: e.clientX, y: e.clientY });
  }

  // Listener di window, bukan di pembungkus: jari yang keluar pembungkus
  // (menyeret ke tepi layar) tetap harus bisa melepas lembarnya.
  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
      setOver(overTray(e.clientX, e.clientY));
    };
    const up = (e: PointerEvent) => {
      const hit = overTray(e.clientX, e.clientY);
      const denom = drag.denom;
      setDrag(null);
      setOver(false);
      // Dilepas di luar baki: kembali ke dompet tanpa hukuman (pola DragDrop).
      if (hit) add(denom);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    // add() dibaca dari render terbaru lewat closure efek ini; efeknya dipasang
    // ulang tiap isi baki berubah, jadi `pieces` yang dipakai selalu mutakhir.
  }, [drag?.denom, pieces, solved]);

  const cue = data.goods?.length || data.paid?.length;

  return (
    <>
      <div className="game-prompt">{level.narration}</div>
      <div className="game-area cs-area">
        {cue ? (
          <div className="cs-board" aria-hidden>
            {data.goods?.map((g, i) => (
              <div key={i} className="cs-good">
                {g.item ? (
                  <ItemPic id={g.item} className="cs-good__img" fallbackClassName="cs-good__emoji" />
                ) : (
                  <span className="cs-good__emoji">{g.emoji}</span>
                )}
                <span className="cs-price">{formatRp(g.price)}</span>
              </div>
            ))}
            {data.paid?.length ? (
              <div className="cs-paid">
                <span className="cs-paid__label">Dibayar</span>
                <div className="cs-paid__money">
                  {data.paid.map((d, i) => (
                    <div key={i} className="cs-paid__piece">
                      <Money denom={d} className="cs-paid__img" />
                      <span className="cs-money-label">{formatRp(d)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div
          ref={trayRef}
          className={
            'cs-tray' + (over ? ' cs-tray--over' : '') + (shake ? ' cs-tray--shake' : '') + (solved ? ' cs-tray--done' : '')
          }
        >
          <div className="cs-tray__head">
            <span className="cs-tray__name">
              {tray.icon} {tray.label}
            </span>
            <span className="cs-total" aria-live="polite">
              {formatRp(total)}
              {auto && <span className="cs-total__target"> / {formatRp(data.target)}</span>}
            </span>
          </div>
          {data.fewest && (
            // Soal "paling sedikit": banyaknya lembar ikut dinilai, jadi harus
            // terlihat — tanpa ini anak tak tahu kenapa jawaban yang pas ditolak.
            <div className="cs-count">{pieces.length} buah uang</div>
          )}
          <div className="cs-tray__row">
            <div className="cs-tray__body">
              {groups.length === 0 ? (
                <span className="cs-tray__hint">Tarik uang ke sini</span>
              ) : (
                groups.map(([d, n]) => (
                  <button
                    key={d}
                    type="button"
                    className="cs-stack"
                    onClick={() => removeOne(d)}
                    aria-label={`Kembalikan ${formatRp(d)}`}
                  >
                    <Money denom={d} className="cs-stack__img" />
                    {n > 1 && <span className="cs-stack__count">×{n}</span>}
                  </button>
                ))
              )}
            </div>
            {/* Tombol serah di SAMPING isi baki, bukan di bawahnya: satu baris
                setinggi tombol 64 px lebih murah daripada baris tambahan, dan
                HP 320×568 tak punya sisa tinggi untuk itu (terukur). */}
            {!auto && (
              <button type="button" className="btn cs-submit" onClick={submit} disabled={pieces.length === 0 || solved}>
                {tray.action}
              </button>
            )}
          </div>
        </div>

        <div className="cs-wallet">
          {data.wallet.map((d) => (
            <div
              key={d}
              className="cs-tile"
              role="button"
              tabIndex={0}
              aria-label={formatRp(d)}
              onPointerDown={(e) => handleDown(e, d)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                e.preventDefault();
                add(d);
              }}
            >
              <Money denom={d} className="cs-tile__img" />
              <span className="cs-money-label">{formatRp(d)}</span>
            </div>
          ))}
        </div>
      </div>
      {drag && (
        <div className="cs-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden>
          <Money denom={drag.denom} className="cs-tile__img" />
        </div>
      )}
    </>
  );
}
