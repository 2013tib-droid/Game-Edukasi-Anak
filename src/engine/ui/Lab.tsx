import type { LabArt, LabThing } from '@/engine/core/types';
import { PITCH_STEPS, pitchStep } from '@/engine/core/lab';
import ItemPic from './ItemPic';

/**
 * Gambar Lab Cahaya & Bunyi — semuanya SVG engine (nol aset impor): bahan uji
 * tembus cahaya, alat listrik (dengan bagian yang bergerak saat menyala),
 * kunang-kunang, senter, gelas nada, papan karet, dan tiga wayang untuk misi
 * besar. Kotak 64×64 kecuali disebut lain.
 *
 * Alat listrik membawa bagian ber-kelas `lab-*` (baling-baling, cahaya, uap…)
 * yang dihidupkan CSS saat induknya ber-kelas `lab-on` — jadi satu gambar
 * melayani keadaan mati DAN menyala.
 */

const STROKE = '#3a2e20';

function Art({ art }: { art: LabArt }) {
  switch (art) {
    case 'kaca':
      return (
        <>
          <rect x="10" y="8" width="44" height="48" rx="3" fill="#dff3ff" fillOpacity="0.55" stroke="#6aa9c9" strokeWidth="3" />
          <path d="M18 18l10-6M18 30l22-14M30 46l16-10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case 'plastik-bening':
      return (
        <>
          <path
            d="M12 10q10 -3 20 0t20 0v44q-10 3 -20 0t-20 0z"
            fill="#eefaff"
            fillOpacity="0.6"
            stroke="#8fbcd4"
            strokeWidth="2.5"
          />
          <path d="M20 20q6 4 0 9M40 30q-5 5 2 10" stroke="#b9d9ea" strokeWidth="2" fill="none" />
          <path d="M18 14l8 0" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case 'kertas-minyak':
      return (
        <>
          <path d="M12 8h32l8 8v40H12z" fill="#fbf1d0" fillOpacity="0.85" stroke="#c9b27a" strokeWidth="2.5" />
          <path d="M44 8v8h8" fill="#efdfae" stroke="#c9b27a" strokeWidth="2" />
          <circle cx="26" cy="30" r="6" fill="#e9d79c" fillOpacity="0.7" />
          <circle cx="38" cy="42" r="4" fill="#e9d79c" fillOpacity="0.7" />
        </>
      );
    case 'kain-tipis':
      return (
        <>
          <path
            d="M10 10h44v38q-5 6 -11 0t-11 0t-11 0t-11 0z"
            fill="#fde7ef"
            fillOpacity="0.7"
            stroke="#d99ab3"
            strokeWidth="2.5"
          />
          <path d="M20 12v34M32 12v36M44 12v34" stroke="#f3c6d6" strokeWidth="2" />
        </>
      );
    case 'kaca-es':
      return (
        <>
          <rect x="10" y="8" width="44" height="48" rx="3" fill="#dbe4ea" stroke="#8fa3b0" strokeWidth="3" />
          {[
            [18, 16],
            [28, 22],
            [40, 15],
            [22, 34],
            [36, 32],
            [46, 40],
            [18, 46],
            [30, 48],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="#fff" fillOpacity="0.8" />
          ))}
        </>
      );
    case 'kayu':
      return (
        <>
          <rect x="8" y="12" width="48" height="40" rx="4" fill="#c88a4a" stroke="#7a4b20" strokeWidth="3" />
          <path d="M12 22q14 -4 40 0M12 32q20 4 40 -2M12 42q16 -3 40 2" stroke="#9c612b" strokeWidth="2.5" fill="none" />
          <ellipse cx="38" cy="30" rx="4" ry="2.5" fill="#9c612b" />
        </>
      );
    case 'kardus':
      return (
        <>
          <path d="M10 22l22-8 22 8v28l-22 8-22-8z" fill="#d6a76b" stroke="#8a5e2c" strokeWidth="2.5" />
          <path d="M10 22l22 8 22-8M32 30v28" stroke="#8a5e2c" strokeWidth="2.5" fill="none" />
          <path d="M18 25l14 5" stroke="#b9854a" strokeWidth="5" />
        </>
      );
    case 'piring':
      return (
        <>
          <ellipse cx="32" cy="34" rx="25" ry="20" fill="#fff" stroke="#9db4c8" strokeWidth="3" />
          <ellipse cx="32" cy="34" rx="15" ry="11" fill="none" stroke="#5b8ec2" strokeWidth="2.5" />
        </>
      );
    case 'kunang':
      return (
        <>
          <circle className="lab-light" cx="40" cy="42" r="16" fill="#fff59d" fillOpacity="0.7" />
          <ellipse cx="40" cy="42" rx="8" ry="7" fill="#ffe14d" stroke={STROKE} strokeWidth="2" />
          <ellipse cx="28" cy="32" rx="9" ry="8" fill="#5b4a3a" stroke={STROKE} strokeWidth="2" />
          <circle cx="20" cy="26" r="6" fill="#3e3128" stroke={STROKE} strokeWidth="2" />
          <path d="M26 24q-4 -10 6 -14M30 30q8 -14 18 -8" fill="#e8f4ff" fillOpacity="0.8" stroke="#8aa6c0" strokeWidth="2" />
          <circle cx="18" cy="25" r="1.6" fill="#fff" />
        </>
      );
    case 'lampu':
      return (
        <>
          <circle className="lab-light" cx="32" cy="26" r="24" fill="#fff59d" fillOpacity="0.75" />
          <path d="M32 6a17 17 0 0 1 10 30v6H22v-6A17 17 0 0 1 32 6z" fill="#fff6c2" stroke={STROKE} strokeWidth="2.5" />
          <path d="M27 36l2-10 3 5 3-5 2 10" stroke="#e0a000" strokeWidth="2" fill="none" />
          <rect x="22" y="42" width="20" height="10" rx="2" fill="#a7b4bf" stroke={STROKE} strokeWidth="2.5" />
          <path d="M23 47h18" stroke={STROKE} strokeWidth="1.5" />
          <path d="M28 52h8l-2 5h-4z" fill="#5f6b75" />
        </>
      );
    case 'kipas':
      return (
        <>
          <path d="M32 40v14M20 58h24" stroke="#5f6b75" strokeWidth="4" strokeLinecap="round" />
          <circle cx="32" cy="26" r="21" fill="#e9f5ff" stroke="#6b8aa5" strokeWidth="2.5" />
          <g className="lab-blades" style={{ transformOrigin: '32px 26px' }}>
            {[0, 120, 240].map((d) => (
              <ellipse key={d} cx="32" cy="15" rx="6" ry="11" fill="#74c0fc" stroke="#1c7ed6" strokeWidth="1.5" transform={`rotate(${d} 32 26)`} />
            ))}
          </g>
          <circle cx="32" cy="26" r="4" fill="#1c7ed6" />
          <path d="M14 26h36M32 8v36" stroke="#6b8aa5" strokeWidth="1" opacity="0.5" />
        </>
      );
    case 'setrika':
      return (
        <>
          <g className="lab-heat">
            <path d="M18 14q-4 -5 0 -10M30 14q-4 -5 0 -10M42 14q-4 -5 0 -10" stroke="#ff8a3d" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
          <path d="M8 50q2 -24 30 -28h14q4 0 4 6v22z" fill="#4dabf7" stroke={STROKE} strokeWidth="2.5" />
          <path d="M30 22q2 -8 12 -8h6v8" fill="none" stroke={STROKE} strokeWidth="3" />
          <rect className="lab-hot" x="6" y="50" width="52" height="6" rx="2" fill="#adb5bd" stroke={STROKE} strokeWidth="2" />
          <circle cx="44" cy="38" r="3.5" fill="#fff" stroke={STROKE} strokeWidth="1.5" />
        </>
      );
    case 'penanak':
      return (
        <>
          <g className="lab-heat">
            <path d="M26 12q-4 -5 0 -10M38 12q-4 -5 0 -10" stroke="#c2d6e6" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </g>
          <path d="M12 26q20 -14 40 0z" fill="#fff" stroke={STROKE} strokeWidth="2.5" />
          <rect x="10" y="26" width="44" height="28" rx="10" fill="#f8f9fa" stroke={STROKE} strokeWidth="2.5" />
          <rect x="24" y="36" width="16" height="8" rx="2" fill="#ffd8a8" stroke={STROKE} strokeWidth="1.5" />
          <circle className="lab-hot" cx="32" cy="40" r="2" fill="#adb5bd" />
          <rect x="29" y="15" width="6" height="4" rx="1" fill={STROKE} />
        </>
      );
    case 'bel':
      return (
        <>
          <g className="lab-ring" style={{ transformOrigin: '32px 30px' }}>
            <path d="M14 38a18 18 0 0 1 36 0z" fill="#ffd43b" stroke={STROKE} strokeWidth="2.5" />
            <circle cx="32" cy="18" r="3" fill="#f59f00" stroke={STROKE} strokeWidth="1.5" />
          </g>
          <rect x="12" y="40" width="40" height="14" rx="3" fill="#e03131" stroke={STROKE} strokeWidth="2.5" />
          <path className="lab-waves" d="M6 22q-3 6 0 12M58 22q3 6 0 12" stroke="#f08c00" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      );
    case 'radio':
      return (
        <>
          <path d="M44 16l10-12" stroke="#5f6b75" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="6" y="16" width="52" height="38" rx="7" fill="#ff922b" stroke={STROKE} strokeWidth="2.5" />
          <circle cx="22" cy="35" r="11" fill="#fff4e6" stroke={STROKE} strokeWidth="2" />
          <circle cx="22" cy="35" r="5" fill="#e8590c" />
          <rect x="38" y="25" width="14" height="8" rx="2" fill="#fff4e6" stroke={STROKE} strokeWidth="1.5" />
          <circle cx="42" cy="44" r="3" fill={STROKE} />
          <circle cx="50" cy="44" r="3" fill={STROKE} />
          <g className="lab-notes">
            <text x="50" y="12" fontSize="12" fill="#7048e8">♪</text>
          </g>
        </>
      );
    case 'mobil-mainan':
      return (
        <>
          <g className="lab-drive">
            <path d="M8 40v-8l10-12h20l10 12h6v8z" fill="#e03131" stroke={STROKE} strokeWidth="2.5" />
            <path d="M21 22h7v10H14zM32 22h5l8 10H32z" fill="#d0ebff" stroke={STROKE} strokeWidth="1.5" />
            <g className="lab-wheel" style={{ transformOrigin: '18px 42px' }}>
              <circle cx="18" cy="42" r="6.5" fill="#343a40" />
              <path d="M18 37v10" stroke="#adb5bd" strokeWidth="2" />
            </g>
            <g className="lab-wheel" style={{ transformOrigin: '44px 42px' }}>
              <circle cx="44" cy="42" r="6.5" fill="#343a40" />
              <path d="M44 37v10" stroke="#adb5bd" strokeWidth="2" />
            </g>
          </g>
          <path d="M6 52h52" stroke="#ced4da" strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case 'kulkas':
      return (
        <>
          <rect x="14" y="4" width="36" height="56" rx="5" fill="#e7f5ff" stroke={STROKE} strokeWidth="2.5" />
          <path d="M14 24h36" stroke={STROKE} strokeWidth="2" />
          <path d="M44 12v8M44 30v12" stroke="#5f6b75" strokeWidth="3" strokeLinecap="round" />
          <text x="20" y="20" fontSize="9" fill="#74c0fc">❄</text>
        </>
      );
    case 'wayang-gunungan':
      return (
        <>
          <path d="M32 2C20 14 8 30 10 54h44C56 30 44 14 32 2z" fill="#c9862f" stroke="#6b3d12" strokeWidth="2.5" />
          <path d="M32 12v40M32 22l-10 8M32 22l10 8M32 32l-13 9M32 32l13 9" stroke="#6b3d12" strokeWidth="2.5" />
          <circle cx="24" cy="18" r="2" fill="#e03131" />
          <circle cx="40" cy="18" r="2" fill="#e03131" />
          <path d="M24 54v8h16v-8" fill="#8a5a24" stroke="#6b3d12" strokeWidth="2" />
          <path d="M32 54v10" stroke="#6b3d12" strokeWidth="2.5" />
        </>
      );
    case 'getar-kecil':
    case 'getar-besar':
    case 'getar-diam':
      return <Vibration amp={art === 'getar-besar' ? 40 : art === 'getar-kecil' ? 12 : 0} />;
    case 'wayang-garuda':
      return (
        <>
          <path
            d="M32 14q6 0 6 6l6 -6q10 -4 18 -2q-8 4 -10 10q8 0 8 4q-10 2 -16 8l-4 14h-16l-4 -14q-6 -6 -16 -8q0 -4 8 -4q-2 -6 -10 -10q8 -2 18 2l6 6q0 -6 6 -6z"
            fill="#d9a441"
            stroke="#6b3d12"
            strokeWidth="2"
          />
          <path d="M30 14l2 -6 2 6" fill="#e03131" stroke="#6b3d12" strokeWidth="1.5" />
          <path d="M32 48v14" stroke="#6b3d12" strokeWidth="2" />
        </>
      );
  }
}

/**
 * Karet bergetar dilihat dari samping (kartu jawaban "getarannya besar /
 * kecil / berhenti"). Ketiganya bentuk yang SAMA, cuma simpangannya beda:
 * dua lengkung bayangan = jangkauan getaran, garis pekat = karet sekarang.
 * `amp` 0 = karet lurus diam.
 */
function Vibration({ amp }: { amp: number }) {
  const band = (bend: number, o: number, w: number) => (
    <path d={`M8 32Q32 ${32 + bend} 56 32`} stroke="#e64980" strokeOpacity={o} strokeWidth={w} fill="none" strokeLinecap="round" />
  );
  return (
    <>
      {amp > 0 && (
        <path d={`M8 32Q32 ${32 - amp} 56 32Q32 ${32 + amp} 8 32z`} fill="#ffdeeb" fillOpacity="0.8" />
      )}
      {amp > 0 && band(-amp, 0.35, 3)}
      {amp > 0 && band(amp, 0.35, 3)}
      {band(amp > 0 ? amp * 0.55 : 0, 1, 4)}
      <circle cx="8" cy="32" r="4.5" fill="#868e96" stroke={STROKE} strokeWidth="1.5" />
      <circle cx="56" cy="32" r="4.5" fill="#868e96" stroke={STROKE} strokeWidth="1.5" />
    </>
  );
}

export function LabArtSvg({ art, className }: { art: LabArt; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden data-art={art}>
      <Art art={art} />
    </svg>
  );
}

/** Satu benda lab: SVG engine, seni item, atau emoji. */
export function LabPic({ thing, className = '' }: { thing: LabThing; className?: string }) {
  if (thing.art) return <LabArtSvg art={thing.art} className={className} />;
  if (thing.item) return <ItemPic id={thing.item} className={className} fallbackClassName={`${className} lab-emoji`} />;
  return (
    <span className={`${className} lab-emoji`} aria-hidden>
      {thing.emoji}
    </span>
  );
}

/** Senter dari samping, menghadap kanan. Kotak 40×24 (mulut senter di x=40). */
export function SenterSvg({ on = true }: { on?: boolean }) {
  return (
    <g>
      <rect x="0" y="7" width="24" height="10" rx="3" fill="#495057" stroke={STROKE} strokeWidth="1.5" />
      <path d="M24 5h10l6-4v22l-6-4H24z" fill="#fab005" stroke={STROKE} strokeWidth="1.5" />
      <rect x="8" y="9" width="6" height="6" rx="1.5" fill={on ? '#ff6b6b' : '#adb5bd'} />
    </g>
  );
}

/**
 * Gelas nada. `fill` 0..1 = tinggi air (dibulatkan ke tingkat nada yang sama
 * dengan bunyinya, jadi gambar tak pernah "berbohong"). Kotak 40×60.
 */
export function GlassSvg({ fill, ring = false }: { fill: number; ring?: boolean }) {
  const step = pitchStep(fill);
  const top = 54 - (step / PITCH_STEPS) * 38 - 4;
  return (
    <svg viewBox="0 0 40 60" className={'lab-glass-svg' + (ring ? ' lab-glass-svg--ring' : '')} aria-hidden>
      <path d="M6 4h28l-3 52H9z" fill="#f1f9ff" stroke="#6aa9c9" strokeWidth="2.5" />
      <path d={`M${6 + ((top - 4) / 52) * 3 + 1} ${top}H${34 - ((top - 4) / 52) * 3 - 1}L31 55H9z`} fill="#4dabf7" fillOpacity="0.75" />
      <path d="M11 10l-1 18" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Papan karet gelang: makin kencang, karet makin tipis & pasaknya makin jauh.
 * Kotak 120×40. `bend` = lengkungan tengah karet (saat ditarik / bergetar).
 */
export function BandSvg({ tight, bend = 0, id }: { tight: number; bend?: number; id?: string }) {
  const step = pitchStep(tight);
  const half = 30 + step * 5; // jarak pasak
  const w = 5 - step * 0.6;
  return (
    <svg viewBox="0 0 120 40" className="lab-band-svg" aria-hidden data-band={id}>
      <rect x="4" y="22" width="112" height="14" rx="4" fill="#c88a4a" stroke="#7a4b20" strokeWidth="2" />
      <circle cx={60 - half} cy="20" r="4" fill="#868e96" stroke={STROKE} strokeWidth="1.5" />
      <circle cx={60 + half} cy="20" r="4" fill="#868e96" stroke={STROKE} strokeWidth="1.5" />
      <path
        className="lab-band-line"
        d={`M${60 - half} 20Q60 ${20 + bend} ${60 + half} 20`}
        stroke="#e64980"
        strokeWidth={w}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Profesor Panda: seni `panda` + kacamata lab di dahi (SVG di atasnya). */
export function Panda({ className = '' }: { className?: string }) {
  return (
    <span className={`lab-panda ${className}`}>
      <ItemPic id="panda" className="lab-panda__img" fallbackClassName="lab-panda__emoji" />
      <svg viewBox="0 0 100 40" className="lab-panda__goggles" aria-hidden>
        <path d="M6 22q44 -14 88 0" stroke="#343a40" strokeWidth="5" fill="none" />
        <circle cx="35" cy="17" r="11" fill="#d0ebff" fillOpacity="0.85" stroke="#1c7ed6" strokeWidth="4" />
        <circle cx="63" cy="17" r="11" fill="#d0ebff" fillOpacity="0.85" stroke="#1c7ed6" strokeWidth="4" />
        <path d="M31 12l4 -3M59 12l4 -3" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </span>
  );
}
