import { useMemo, useState } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import type { BodyPartId } from '@/engine/core/types';
import { sfx } from '@/engine/audio/sound';
import ItemPic from '@/engine/ui/ItemPic';
import Kid, { BODY_PARTS, kidFrame, kidSpots } from '@/engine/ui/Kid';

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

export default function TapPicture({ level, onCorrect, onWrong }: TemplateProps<'tap-picture'>) {
  const data = level.data;
  const [solved, setSolved] = useState(false);
  const [shake, setShake] = useState<BodyPartId | null>(null);

  // Titik sentuh & bingkainya dihitung ENGINE, bukan config: config cuma
  // menyebut nama bagiannya. Bingkainya kotak terkecil yang memuat seluruh
  // lingkaran yang aktif, jadi soal wajah otomatis jadi close-up sementara
  // soal badan tetap seluruh badan — lihat `kidFrame` di Kid.tsx.
  const spots = useMemo(() => kidSpots(data.parts), [data.parts]);
  const frame = useMemo(() => kidFrame(spots), [spots]);

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
          <Kid frame={frame} className="tp-kid">
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
