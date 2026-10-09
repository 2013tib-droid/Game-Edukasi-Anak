import type { ReactNode } from 'react';
import type { EcoArt, EcoBin, EcoThing } from '@/engine/core/types';
import ItemPic from '@/engine/ui/ItemPic';

/**
 * Gambar Sahabat Bumi: benda sampah & sumber daya alam (SVG engine) dan tong
 * sampah berwarna. Keputusan pemilik 2026-10-09: digambar engine, bukan
 * emoji — 🍌 itu pisang utuh, bukan kulitnya; tak ada emoji kulit telur,
 * baterai bekas, atau batu bara. Semua dalam kotak 64×64, garis luar cokelat
 * tua supaya tetap terbaca kecil di HP 320.
 */

const INK = '#4a3a28';
const S = { stroke: INK, strokeWidth: 2.2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

const ART: Record<EcoArt, ReactNode> = {
  'kulit-pisang': (
    <>
      <path d="M32 20C24 26 12 34 8 46c-1 4 2 8 6 6 6-6 12-16 18-24z" fill="#f6d34a" {...S} />
      <path d="M32 20c8 6 20 14 24 26 1 4-2 8-6 6-6-6-12-16-18-24z" fill="#f0c331" {...S} />
      <path d="M32 20c-5 10-6 22-3 34 2 3 6 3 8 0 2-12 0-24-5-34z" fill="#fbe58a" {...S} />
      <path d="M28 8h8l-1 13h-6z" fill="#8a6a35" {...S} />
      <circle cx="16" cy="44" r="1.6" fill="#8a6a35" />
      <circle cx="46" cy="40" r="1.6" fill="#8a6a35" />
    </>
  ),
  'daun-kering': (
    <>
      <path d="M10 50C12 26 30 12 54 10c-2 24-18 40-44 40z" fill="#c9823c" {...S} />
      <path d="M12 48C26 34 38 24 50 14" fill="none" {...S} />
      <path d="M24 38l-2-10M32 30l-1-10M40 24l0-8M24 38l10 2M32 30l10 1" fill="none" {...S} strokeWidth={1.6} />
    </>
  ),
  'sisa-apel': (
    <>
      <path d="M18 14h28c0 8-6 12-8 18s2 10 8 18H18c6-8 10-12 8-18s-8-10-8-18z" fill="#fff4d6" {...S} />
      <path d="M17 14c0-5 30-5 30 0-6 3-24 3-30 0z" fill="#e8463a" {...S} />
      <path d="M17 50c6-3 24-3 30 0 0 5-30 5-30 0z" fill="#e8463a" {...S} />
      <path d="M32 11V4" {...S} fill="none" />
      <path d="M33 6c4-4 9-4 11-2-3 4-8 4-11 2z" fill="#5cb85c" {...S} strokeWidth={1.6} />
      <ellipse cx="29" cy="32" rx="2" ry="3.2" fill="#5b3a1e" />
      <ellipse cx="35" cy="32" rx="2" ry="3.2" fill="#5b3a1e" />
    </>
  ),
  'kulit-telur': (
    <>
      <path d="M8 34c0 12 8 20 18 20s14-8 14-14l-4-3-4 4-4-5-4 4-4-4-4 3-4-4z" fill="#fff8ec" {...S} />
      <path d="M30 26c0-12 7-18 14-18s12 8 12 18l-4 3-4-4-4 4-4-4-4 3z" fill="#f7ead3" {...S} />
    </>
  ),
  'tulang-ikan': (
    <>
      <path d="M6 32l12-10v20z" fill="#e9eef2" {...S} />
      <circle cx="12" cy="30" r="1.8" fill={INK} />
      <path d="M18 32h32" fill="none" {...S} />
      <path d="M24 32l-3-9M24 32l-3 9M31 32l-3-9M31 32l-3 9M38 32l-3-8M38 32l-3 8M45 32l-2-7M45 32l-2 7" fill="none" {...S} strokeWidth={1.8} />
      <path d="M50 32l10-9v18z" fill="#e9eef2" {...S} />
    </>
  ),
  botol: (
    <>
      <rect x="27" y="4" width="10" height="7" rx="2" fill="#2f74d0" {...S} />
      <path d="M27 11h10l2 7c4 2 5 6 5 10v26c0 3-2 6-6 6H26c-4 0-6-3-6-6V28c0-4 1-8 5-10z" fill="#bfe3ff" {...S} />
      <rect x="20" y="32" width="24" height="10" fill="#7fc0ff" {...S} />
      <path d="M26 22c-2 2-2 6-2 8" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
    </>
  ),
  kaleng: (
    <>
      <path d="M18 14v38c0 4 28 4 28 0V14z" fill="#e5483f" {...S} />
      <ellipse cx="32" cy="14" rx="14" ry="4" fill="#d9dee3" {...S} />
      <path d="M18 24h28M18 44h28" stroke="#fff" strokeWidth={3} opacity={0.7} />
      <rect x="29" y="11" width="7" height="3" rx="1.5" fill="#aeb6bf" stroke={INK} strokeWidth={1.4} />
      <path d="M25 30c4 3 10 3 14 0" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
    </>
  ),
  kantong: (
    <>
      <path d="M22 18c0-8 4-12 6-12M42 18c0-8-4-12-6-12" fill="none" {...S} />
      <path d="M14 20l36 0c2 10 4 22 2 30-2 6-36 6-38 0-2-8 0-20 0-30z" fill="#f4f7fb" {...S} />
      <path d="M20 30c6 4 14 4 24 0M18 42c8 3 20 3 28 0" fill="none" stroke="#b9c4d2" strokeWidth={1.8} />
    </>
  ),
  sedotan: (
    <>
      <path d="M14 56L36 20l12-10" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <path d="M14 56L36 20l12-10" fill="none" stroke="#ffffff" strokeWidth={5.5} strokeLinecap="round" />
      <path d="M14 56L36 20l12-10" fill="none" stroke="#f06595" strokeWidth={5.5} strokeLinecap="butt" strokeDasharray="5 5" />
    </>
  ),
  'gelas-plastik': (
    <>
      <path d="M16 20h32l-5 36H21z" fill="#dff3ff" {...S} />
      <path d="M13 14h38v6H13z" fill="#9ad3f5" {...S} />
      <path d="M38 14l6-10" {...S} fill="none" />
      <path d="M21 30h22" stroke="#9ad3f5" strokeWidth={2} />
    </>
  ),
  kardus: (
    <>
      <path d="M10 26h44v28H10z" fill="#d6a467" {...S} />
      <path d="M10 26l-4-10 18 4 8 6zM54 26l4-10-18 4-8 6z" fill="#e7bb7f" {...S} />
      <path d="M28 26v10h8V26" fill="#f2d7a8" {...S} />
      <path d="M16 46h10" {...S} />
    </>
  ),
  koran: (
    <>
      <path d="M10 14h40l4 4v36H14l-4-4z" fill="#f1f1ee" {...S} />
      <rect x="16" y="20" width="16" height="12" fill="#c9ccd1" stroke="none" />
      <path d="M36 21h12M36 26h12M36 31h10M16 38h32M16 43h32M16 48h24" stroke="#8b9099" strokeWidth={2} />
    </>
  ),
  paku: (
    <>
      <g transform="rotate(-14 22 34)">
        <ellipse cx="22" cy="12" rx="9" ry="3.5" fill="#b9c0c8" {...S} />
        <path d="M19 15h6v30l-3 9-3-9z" fill="#b9c0c8" {...S} />
      </g>
      <g transform="rotate(12 42 36)">
        <ellipse cx="42" cy="16" rx="9" ry="3.5" fill="#9aa3ad" {...S} />
        <path d="M39 19h6v28l-3 9-3-9z" fill="#9aa3ad" {...S} />
      </g>
    </>
  ),
  baterai: (
    <>
      <rect x="20" y="14" width="24" height="42" rx="4" fill="#2b2f38" {...S} />
      <rect x="27" y="8" width="10" height="6" rx="1.5" fill="#d9a441" {...S} />
      <rect x="20" y="40" width="24" height="16" rx="3" fill="#d9a441" {...S} />
      <path d="M32 22v10M27 27h10" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
    </>
  ),
  bohlam: (
    <>
      <path d="M32 6c-11 0-18 8-18 17 0 8 6 11 8 17h20c2-6 8-9 8-17 0-9-7-17-18-17z" fill="#fff2a8" {...S} />
      <path d="M22 40h20v6H22zM23 46h18v5H23zM26 51h12l-3 6h-6z" fill="#aab3bd" {...S} />
      <path d="M27 26l5 6 5-6" fill="none" stroke="#c9a227" strokeWidth={2} />
    </>
  ),
  semprotan: (
    <>
      <rect x="20" y="18" width="22" height="40" rx="4" fill="#3aa35a" {...S} />
      <rect x="24" y="10" width="14" height="8" rx="2" fill="#c9ced4" {...S} />
      <rect x="36" y="11" width="8" height="4" rx="1" fill="#c9ced4" {...S} />
      <circle cx="51" cy="10" r="1.6" fill="#e5483f" />
      <circle cx="55" cy="14" r="1.6" fill="#e5483f" />
      <circle cx="54" cy="7" r="1.4" fill="#e5483f" />
      <path d="M31 30l-6 10h12z" fill="#ffd43b" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M31 34v3" stroke={INK} strokeWidth={1.6} />
    </>
  ),
  minyak: (
    <>
      <path d="M16 12h32v42H16z" fill="#2f5aa8" {...S} />
      <ellipse cx="32" cy="12" rx="16" ry="4" fill="#4c76c4" {...S} />
      <path d="M16 26h32M16 42h32" stroke={INK} strokeWidth={2} />
      <path d="M32 28c-4 6-6 8-6 11a6 6 0 0012 0c0-3-2-5-6-11z" fill="#1a1a1a" stroke="#fff" strokeWidth={1.4} />
    </>
  ),
  'batu-bara': (
    <>
      <path d="M8 46l6-14 12-4 8 8-4 14H12z" fill="#2b2b2e" {...S} />
      <path d="M30 50l4-16 12-8 10 10-2 14z" fill="#3b3b40" {...S} />
      <path d="M20 22l8-8 10 2 2 10-12 4z" fill="#232326" {...S} />
      <path d="M38 34l4-3M14 40l4-3" stroke="#8a8f99" strokeWidth={1.6} />
    </>
  ),
  emas: (
    <>
      <path d="M10 48l8-14h20l8 14z" fill="#f2b705" {...S} />
      <path d="M26 34l7-12h18l7 12z" fill="#f7c948" {...S} />
      <path d="M38 48l7-12h11l4 12z" fill="#e6a700" {...S} />
      <path d="M22 38l4-3M36 26l4-3" stroke="#fff6c2" strokeWidth={2} strokeLinecap="round" />
    </>
  ),
};

export function EcoArtSvg({ art, className }: { art: EcoArt; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} data-eco={art} aria-hidden>
      {ART[art]}
    </svg>
  );
}

/** Gambar satu benda: SVG engine, seni item, atau emoji (urutan itu). */
export function EcoPic({ thing, className }: { thing: EcoThing; className?: string }) {
  if (thing.art) return <EcoArtSvg art={thing.art} className={className} />;
  if (thing.item) return <ItemPic id={thing.item} className={className} fallbackClassName={`${className ?? ''} eco-emoji`} />;
  return (
    <span className={`${className ?? ''} eco-emoji`} aria-hidden>
      {thing.emoji}
    </span>
  );
}

export const BIN_HEX: Record<EcoBin['color'], { body: string; lid: string; soft: string }> = {
  hijau: { body: '#2f9e44', lid: '#237a35', soft: '#e6f6ea' },
  kuning: { body: '#f2b705', lid: '#c99700', soft: '#fff7d6' },
  merah: { body: '#e03131', lid: '#b02525', soft: '#ffe8e8' },
  biru: { body: '#1c7ed6', lid: '#1561a8', soft: '#e7f2ff' },
  cokelat: { body: '#a0703c', lid: '#7d552b', soft: '#f6ebdc' },
  abu: { body: '#7b8794', lid: '#5c6670', soft: '#eef1f4' },
  ungu: { body: '#7048e8', lid: '#5634c4', soft: '#efeaff' },
};

/** Tong sampah berwarna (tutup terangkat) — tampak muka. */
export function TongArt({ color, className }: { color: EcoBin['color']; className?: string }) {
  const c = BIN_HEX[color];
  return (
    <svg viewBox="0 0 64 56" className={className} aria-hidden>
      <path d="M12 14h40l-4 40H16z" fill={c.body} {...S} />
      <path d="M22 22v26M32 22v26M42 22v26" stroke="#fff" strokeOpacity={0.45} strokeWidth={3} strokeLinecap="round" />
      <path d="M8 8c0-2 48-2 48 0v6H8z" fill={c.lid} {...S} />
      <path d="M26 4h12" stroke={INK} strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}
