import { useId, useMemo, useState } from 'react';
import type { Ref } from 'react';
import type { CollageArtwork } from '@/engine/core/types';
import type { CollageArtId, CollageMaterial, SeedKind } from '@/engine/core/collage';
import { MONTAGE, SEEDS, artOf, grains, isSeed, materialHex, seeded, tornPath } from '@/engine/core/collage';
import { PAINT_HEX } from '@/engine/core/paint';
import ItemPic from '@/engine/ui/ItemPic';

/**
 * Gambar Studio Kolase — semuanya SVG engine (keputusan pemilik 2026-10-09,
 * nol aset baru): sobekan kertas bertepi robek, butir biji-bijian, lembar
 * bahan di baki, gambar pola, mozaik, dan montase dari seni item yang ada.
 */

const INK = '#4a3a28';

/** id untuk url(#…): useId() memuat titik dua yang tak disukai sebagian WebView. */
function useSvgId(): string {
  return useId().replace(/[^a-zA-Z0-9_-]/g, '');
}

/* ---------- butir bahan alam ---------- */

function Grain({ kind, x, y, rot, s = 1 }: { kind: SeedKind; x: number; y: number; rot: number; s?: number }) {
  const look = SEEDS[kind];
  const common = { fill: look.fill, stroke: look.edge, strokeWidth: 0.45 * s, transform: `translate(${x} ${y}) rotate(${rot})` };
  switch (look.grain) {
    case 'bulat':
      return <circle r={1.7 * s} {...common} />;
    case 'lonjong':
      return <ellipse rx={2.1 * s} ry={0.95 * s} {...common} />;
    case 'kotak':
      return <rect x={-1.7 * s} y={-1.5 * s} width={3.4 * s} height={3 * s} rx={0.9 * s} {...common} />;
    case 'ginjal':
      return <path d={`M${-2.2 * s} 0C${-2.2 * s} ${-1.8 * s} ${2.2 * s} ${-1.8 * s} ${2.2 * s} 0C${2.2 * s} ${1.6 * s} ${0.4 * s} ${1.2 * s} 0 ${0.6 * s}C${-0.4 * s} ${1.2 * s} ${-2.2 * s} ${1.6 * s} ${-2.2 * s} 0Z`} {...common} />;
    case 'serpih':
      return <path d={`M${-2.6 * s} ${-1 * s}L${0.4 * s} ${-2 * s}L${2.6 * s} ${-0.4 * s}L${1.4 * s} ${1.8 * s}L${-1.8 * s} ${1.4 * s}Z`} {...common} />;
  }
}

/** Pola isi bagian biji-bijian yang sudah penuh (rapat seperti ditabur). */
function SeedPattern({ id, kind }: { id: string; kind: SeedKind }) {
  const pts = useMemo(() => grains(6, kind.length * 7 + 3, 7), [kind]);
  return (
    <pattern id={id} width="9" height="9" patternUnits="userSpaceOnUse">
      <rect width="9" height="9" fill={SEEDS[kind].edge} opacity={0.35} />
      {pts.map(([x, y, r], i) => (
        <Grain key={i} kind={kind} x={4.5 + x * 0.75} y={4.5 + y * 0.75} rot={r} s={0.85} />
      ))}
    </pattern>
  );
}

/* ---------- sobekan ---------- */

export interface Piece {
  id: number;
  region: string;
  material: CollageMaterial;
  x: number;
  y: number;
  r: number;
  rot: number;
  seed: number;
}

export function PieceArt({ material, r, seed }: { material: CollageMaterial; r: number; seed: number }) {
  if (isSeed(material)) {
    const pts = grains(r, seed, Math.max(7, Math.round(r * 1.1)));
    return (
      <>
        {pts.map(([x, y, rot], i) => (
          <Grain key={i} kind={material} x={x} y={y} rot={rot} s={1.15} />
        ))}
      </>
    );
  }
  const d = tornPath(r, seed);
  const white = material === 'putih';
  // Tiap lembar kertas sedikit beda terang-gelapnya, seperti kolase sungguhan.
  const shade = ((seed % 7) - 3) * 0.035;
  return (
    <>
      {/* Tepi robekan: serat kertas putih sedikit lebih lebar dari warnanya. */}
      <path d={d} fill={white ? '#e8e2d4' : '#ffffff'} transform="scale(1.08)" opacity={0.95} />
      <path d={d} fill={materialHex(material)} />
      {shade !== 0 && !white && <path d={d} fill={shade > 0 ? '#ffffff' : '#000000'} opacity={Math.abs(shade)} />}
    </>
  );
}

/* ---------- gambar pola ---------- */

export interface CanvasProps {
  art: CollageArtId;
  parts: Record<string, CollageMaterial>;
  pieces: Piece[];
  /** Bagian yang sudah tertutup — diisi rata di bawah sobekannya. */
  full: ReadonlySet<string>;
  /** Petunjuk tingkat 1: bagian yang belum penuh diberi warna samar. */
  tint?: boolean;
  /** Bagian yang menyala (petunjuk tingkat 2). */
  glow?: string | null;
  /** Bagian yang baru saja ditolak (bahan salah). */
  flash?: string | null;
  /** Garis pola putus-putus untuk bagian yang belum penuh. */
  outline?: boolean;
  className?: string;
  svgRef?: Ref<SVGSVGElement>;
  regionRef?: (id: string, el: SVGPathElement | null) => void;
  onClick?: (e: React.MouseEvent<SVGSVGElement>) => void;
  label?: string;
}

export function CollageCanvas({
  art,
  parts,
  pieces,
  full,
  tint,
  glow,
  flash,
  outline = true,
  className,
  svgRef,
  regionRef,
  onClick,
  label,
}: CanvasProps) {
  const uid = useSvgId();
  const a = artOf(art);
  const seedKinds = [...new Set(Object.values(parts).filter(isSeed))];
  const fillOf = (m: CollageMaterial) => (isSeed(m) ? `url(#${uid}-p-${m})` : materialHex(m));
  return (
    <svg
      ref={svgRef}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={label ?? `Pola ${a.name}`}
      onClick={onClick}
    >
      <defs>
        {a.regions.map((r) => (
          <clipPath key={r.id} id={`${uid}-c-${r.id}`}>
            <path d={r.d} />
          </clipPath>
        ))}
        {seedKinds.map((k) => (
          <SeedPattern key={k} id={`${uid}-p-${k}`} kind={k} />
        ))}
      </defs>
      {a.regions.map((r) => {
        const m = parts[r.id]!;
        const isFull = full.has(r.id);
        return (
          <g key={r.id} data-region={r.id}>
            {/* Garis pola digambar DI BAWAH alasnya: bagian yang tersusun dari
                beberapa bentuk (awan, kepala+badan ayam) jadi hanya bergaris
                luar — garis di dalamnya tertutup alas. */}
            {!isFull && (outline || glow === r.id || flash === r.id) && (
              <path
                d={r.d}
                fill="none"
                className={
                  'ks-line' + (glow === r.id ? ' ks-line--glow' : '') + (flash === r.id ? ' ks-line--no' : '')
                }
                pointerEvents="none"
              />
            )}
            {isFull && <path d={r.d} fill="none" stroke={INK} strokeWidth={1.2} opacity={0.5} pointerEvents="none" />}
            {/* Alas kertas gambar; menerima sentuhan & dipakai menguji titik. */}
            <path
              ref={regionRef ? (el) => regionRef(r.id, el) : undefined}
              d={r.d}
              fill={isFull ? fillOf(m) : '#fffdf6'}
            />
            {!isFull && tint && <path d={r.d} fill={materialHex(m)} opacity={0.3} pointerEvents="none" />}
            <g clipPath={`url(#${uid}-c-${r.id})`} pointerEvents="none">
              {pieces
                .filter((p) => p.region === r.id)
                .map((p) => (
                  <g key={p.id} className="ks-piece" transform={`translate(${p.x} ${p.y}) rotate(${p.rot})`}>
                    <PieceArt material={p.material} r={p.r} seed={p.seed} />
                  </g>
                ))}
            </g>
          </g>
        );
      })}
      <g pointerEvents="none">
        {a.dots?.map((d, i) => <path key={i} d={d.d} fill={d.fill} />)}
        {a.ink?.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={INK} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </g>
    </svg>
  );
}

/** Sobekan yang sudah menempel di karya jadi (contoh & karya di soal pilih). */
function readyPieces(art: CollageArtId, parts: Record<string, CollageMaterial>, seed: number): Piece[] {
  const rnd = seeded(seed);
  const list: Piece[] = [];
  let id = 0;
  for (const r of artOf(art).regions) {
    const m = parts[r.id]!;
    // Sobekan disebar di seluruh kotak; clip bagian menyisakan yang di dalam.
    for (let gy = 0; gy < 6; gy += 1) {
      for (let gx = 0; gx < 6; gx += 1) {
        list.push({
          id: id++,
          region: r.id,
          material: m,
          x: gx * 18 + 4 + rnd() * 10,
          y: gy * 18 + 4 + rnd() * 10,
          r: 9 + rnd() * 3,
          rot: Math.floor(rnd() * 360),
          seed: Math.floor(rnd() * 1e6),
        });
      }
    }
  }
  return list;
}

/** Karya kolase yang sudah jadi. `flat` = contoh rata tanpa sobekan (kecil). */
export function CollageDone({
  art,
  parts,
  flat,
  className,
}: {
  art: CollageArtId;
  parts: Record<string, CollageMaterial>;
  flat?: boolean;
  className?: string;
}) {
  const full = useMemo(() => new Set(Object.keys(parts)), [parts]);
  const pieces = useMemo(() => (flat ? [] : readyPieces(art, parts, art.length * 31 + 7)), [art, parts, flat]);
  return (
    <CollageCanvas
      art={art}
      parts={parts}
      pieces={pieces}
      full={full}
      outline={false}
      className={className}
      label={flat ? `Contoh ${artOf(art).name}` : 'Karya kolase'}
    />
  );
}

/* ---------- mozaik ---------- */

/** Keping mozaik: persegi membulat, sedikit miring & bergradasi (buatan tangan). */
export function Tile({ x, y, color, seed, size = 1 }: { x: number; y: number; color: string; seed: number; size?: number }) {
  const rnd = seeded(seed);
  const rot = (rnd() - 0.5) * 9;
  const s = size;
  return (
    <g transform={`translate(${x + 0.5 * s} ${y + 0.5 * s}) rotate(${rot})`}>
      <rect x={-0.4 * s} y={-0.4 * s} width={0.8 * s} height={0.8 * s} rx={0.12 * s} fill={color} />
      <path
        d={`M${-0.3 * s} ${-0.26 * s}H${0.22 * s}`}
        stroke="#ffffff"
        strokeWidth={0.08 * s}
        strokeLinecap="round"
        opacity={color === '#ffffff' ? 0 : 0.45}
      />
      {color === '#ffffff' && (
        <rect x={-0.4 * s} y={-0.4 * s} width={0.8 * s} height={0.8 * s} rx={0.12 * s} fill="none" stroke="#cfc6b3" strokeWidth={0.05 * s} />
      )}
    </g>
  );
}

export function MosaicArt({
  rows,
  colors,
  className,
  label = 'Mozaik',
}: {
  rows: string[];
  colors: Record<string, keyof typeof PAINT_HEX>;
  className?: string;
  label?: string;
}) {
  const h = rows.length;
  const w = rows[0]!.length;
  return (
    <svg viewBox={`-0.15 -0.15 ${w + 0.3} ${h + 0.3}`} className={className} role="img" aria-label={label}>
      <rect x={-0.15} y={-0.15} width={w + 0.3} height={h + 0.3} rx={0.3} fill="#e7dfcf" />
      {rows.flatMap((row, y) =>
        [...row].map((ch, x) =>
          ch === '.' ? null : <Tile key={`${x}-${y}`} x={x} y={y} color={PAINT_HEX[colors[ch]!]} seed={y * 31 + x * 7 + 1} />,
        ),
      )}
    </svg>
  );
}

/* ---------- montase ---------- */

export function MontageArt({ scene, className }: { scene: keyof typeof MONTAGE; className?: string }) {
  return (
    <div className={'ks-montage ' + (className ?? '')} role="img" aria-label="Karya montase">
      {MONTAGE[scene].map((p, i) => (
        <span
          key={i}
          className="ks-montage__cut"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, rotate: `${((i * 37) % 11) - 5}deg` }}
        >
          <ItemPic id={p.item} className="ks-montage__img" fallbackClassName="ks-montage__emoji" />
        </span>
      ))}
    </div>
  );
}

/** Karya jadi apa pun (soal "karya ini disebut apa?"). */
export function Artwork({ work, className }: { work: CollageArtwork; className?: string }) {
  switch (work.type) {
    case 'kolase':
      return <CollageDone art={work.art} parts={work.parts} className={className} />;
    case 'mozaik':
      return <MosaicArt rows={work.rows} colors={work.colors} className={className} label="Karya mozaik" />;
    case 'montase':
      return <MontageArt scene={work.scene} className={className} />;
  }
}

/* ---------- lembar bahan di baki ---------- */

export function SheetArt({ material }: { material: CollageMaterial }) {
  const [seed] = useState(() => Math.floor(Math.random() * 1e6));
  if (isSeed(material)) {
    const pts = grains(13, seed, 16);
    return (
      <svg viewBox="0 0 40 40" className="ks-sheet__art" aria-hidden>
        <path d="M4 20Q20 40 36 20Z" fill="#c98a4b" stroke={INK} strokeWidth={1} strokeLinejoin="round" />
        <g transform="translate(20 17) scale(1 0.55)">
          {pts.map(([x, y, r], i) => (
            <Grain key={i} kind={material} x={x} y={y - 3} rot={r} s={1.3} />
          ))}
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 40" className="ks-sheet__art" aria-hidden>
      <path
        d="M5 6H35V27L33 29L35 31L32 33L34 35H5Z"
        fill={materialHex(material)}
        stroke={material === 'putih' ? '#bdb3a0' : 'rgba(0,0,0,0.18)'}
        strokeWidth={0.8}
      />
      <path d="M5 6H35V9H5Z" fill="#ffffff" opacity={0.25} />
    </svg>
  );
}

/** Ukuran gambar baki: bayangan sobekan saat diseret keluar dari lembarnya. */
export function GhostPiece({ material, seed }: { material: CollageMaterial; seed: number }) {
  return (
    <svg viewBox="-12 -12 24 24" className="ks-ghost__art" aria-hidden>
      <PieceArt material={material} r={10} seed={seed} />
    </svg>
  );
}
