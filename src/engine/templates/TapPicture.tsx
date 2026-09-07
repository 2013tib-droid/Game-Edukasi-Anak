import { useMemo, useState } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import type { BodyPartId } from '@/engine/core/types';
import { sfx } from '@/engine/audio/sound';
import ItemPic from '@/engine/ui/ItemPic';
import Kid, { BODY_PARTS, HIT_MAX } from '@/engine/ui/Kid';
import type { KidView } from '@/engine/ui/Kid';

/**
 * Sentuh bagian yang benar pada SATU gambar utuh (anggota tubuh).
 *
 * Bedanya dengan tap-answer: jawabannya bukan kartu, tapi tempat pada gambar.
 * Itu bukan gaya-gayaan — kartu jawaban untuk soal tubuh berarti memajang
 * potongan tubuh yang melayang (telinga sendirian, tangan terpotong), dan itu
 * menyeramkan untuk anak empat tahun. Di sini anak menunjuk, persis seperti ia
 * menunjuk hidungnya sendiri.
 *
 * Gambar & koordinatnya milik engine (`src/engine/ui/Kid.tsx`); config cuma
 * menyebut nama bagiannya.
 */

/** Satu titik sentuh yang sudah jadi: bagian mana, di mana, seberapa besar. */
interface Spot {
  part: BodyPartId;
  x: number;
  y: number;
  r: number;
}

/**
 * Besar daerah sentuh tiap titik, dalam satuan gambar.
 *
 * Radiusnya BUKAN angka tetap: tiap titik dipangkas jadi setengah jarak ke
 * titik milik bagian LAIN yang terdekat. Dengan begitu dua daerah sentuh tak
 * pernah bertindihan (r_a + r_b <= d), jadi tak pernah ada sentuhan yang
 * "sebenarnya benar tapi dihitung salah" — dan sekaligus jadi rem yang jujur:
 * level yang mengaktifkan bagian-bagian berdempetan akan terlihat sendiri
 * daerah sentuhnya menciut. `scripts/check-body-parts.mjs` mengukur ini untuk
 * SEMUA varian, jadi level yang terlalu sempit ketahuan sebelum sampai ke anak.
 *
 * Titik-titik milik bagian yang SAMA (dua mata, dua tangan) sengaja tidak
 * saling memangkas: keduanya jawaban yang sama, jadi bertindihan pun tak apa.
 */
function hitRadii(spots: Omit<Spot, 'r'>[]): number[] {
  return spots.map((a, i) => {
    let r = BODY_PARTS[a.part].cap ?? HIT_MAX;
    spots.forEach((b, j) => {
      if (i === j || a.part === b.part) return;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      r = Math.min(r, d / 2);
    });
    return r;
  });
}

export default function TapPicture({ level, onCorrect, onWrong }: TemplateProps<'tap-picture'>) {
  const data = level.data;
  const [solved, setSolved] = useState(false);
  const [shake, setShake] = useState<BodyPartId | null>(null);

  // Bingkai dipilih ENGINE, bukan config: kalau semua bagian yang aktif ada di
  // wajah, gambarnya dipotong ke kepala supaya hidung & mulut punya daerah
  // sentuh selebar jari. Satu bagian badan saja ikut aktif → seluruh badan.
  const view: KidView = data.parts.every((p) => BODY_PARTS[p].face) ? 'wajah' : 'badan';

  const spots = useMemo<Spot[]>(() => {
    const base = data.parts.flatMap((part) =>
      BODY_PARTS[part].points.map((pt) => ({ part, x: pt.x, y: pt.y })),
    );
    const radii = hitRadii(base);
    return base.map((s, i) => ({ ...s, r: radii[i]! }));
  }, [data.parts]);

  function handleTap(part: BodyPartId) {
    if (solved) return;
    if (part === data.answer) {
      setSolved(true);
      onCorrect();
      return;
    }
    sfx('tap');
    setShake(part);
    window.setTimeout(() => setShake(null), 450);
    onWrong();
  }

  return (
    <div className="tp-wrap">
      <div className="tp-side">
        <div className="game-prompt">{level.narration}</div>
      </div>
      <div className="game-area">
        <div className="tp-stage">
          <Kid view={view} className="tp-kid">
            {spots.map((s, i) => {
              const state = solved && s.part === data.answer ? ' tp-spot--ok' : shake === s.part ? ' tp-spot--miss' : '';
              return (
                <g
                  key={`${s.part}-${i}`}
                  className={'tp-spot' + state}
                  role="button"
                  tabIndex={solved ? -1 : 0}
                  aria-label={BODY_PARTS[s.part].label}
                  onClick={() => handleTap(s.part)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    handleTap(s.part);
                  }}
                >
                  {/* Lingkaran yang digambar ADALAH daerah yang menerima
                      sentuhan — tak ada daerah rahasia yang lebih kecil atau
                      lebih besar dari yang terlihat. Sengaja lingkaran KOSONG:
                      titik penanda di tengahnya sempat dicoba dan di gambar
                      wajah ia mendarat persis di atas pupil mata. */}
                  <circle className="tp-spot__ring" cx={s.x} cy={s.y} r={s.r} />
                </g>
              );
            })}
          </Kid>
          {/* Isyarat benda ("Topi dipakai di bagian mana?") duduk di pojok
              gambar: sudut bingkai memang kosong (gambarnya orang, bukan
              kotak), jadi ia tidak memakan tinggi layar sedikit pun. */}
          {data.cueItem && (
            <div className="tp-cue" aria-hidden>
              <ItemPic id={data.cueItem} className="tp-cue__img" fallbackClassName="tp-cue__emoji" />
            </div>
          )}
          {/* Namanya baru muncul SETELAH benar — sebelum itu ia cuma jawaban
              yang tertulis di layar, dan anak TK yang mulai mengenal huruf
              akan mencocokkan tulisan, bukan mengenali bagiannya. */}
          {solved && <div className="tp-label">{BODY_PARTS[data.answer].label}</div>}
        </div>
      </div>
    </div>
  );
}
