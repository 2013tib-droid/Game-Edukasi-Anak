import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './notebook.css';

/**
 * Motif sampul buku tulis. Digambar CSS (notebook.css), jadi nol unduhan.
 * Tiap mapel/kelompok punya motifnya sendiri supaya anak mengenali bukunya
 * dari pola sampulnya, bukan cuma dari warnanya.
 */
export type CoverPattern = 'kotak' | 'garis' | 'titik' | 'serong' | 'konfeti' | 'bintang';

export interface NotebookLook {
  /** Warna sampul — cukup gelap supaya pita & spiral tetap terlihat. */
  cover: string;
  /** Warna tulisan kecil di label (senada sampul, lebih gelap). */
  ink: string;
  pattern: CoverPattern;
  /** Coretan kecil di sampul (≤ 4 karakter teks, BUKAN emoji). */
  doodles?: readonly string[];
}

interface Props {
  look: NotebookLook;
  /** Gambar (seni WebP / emoji) yang ditempel seperti stiker di sampul. */
  sticker: ReactNode;
  kicker: string;
  name: string;
  desc?: string;
  /** Angka di pita pembatas buku ("10 game"). Kosong = tanpa pita. */
  count?: number;
  /** Null = buku belum bisa dibuka ("Segera hadir"). */
  to: string | null;
  ariaLabel?: string;
}

/**
 * Kartu "buku tulis" — bahasa rupa layar portal & pilih mapel (2026-10-11).
 * Sampul bermotif dengan spiral di kiri, tumpukan halaman di kanan, stiker
 * gambar, dan label nama ala buku tulis sekolah. Satu komponen untuk kedua
 * layar supaya tak bisa menyimpang.
 */
export default function Notebook({ look, sticker, kicker, name, desc, count, to, ariaLabel }: Props) {
  // Kata terpanjang menentukan ukuran nama (notebook.css): nama tak boleh patah
  // di tengah kata ("Matematik / a") di buku selebar 130 px.
  const longest = Math.max(...name.split(/[\s\u00a0]+/).map((w) => w.length));
  const style = {
    '--nb-cover': look.cover,
    '--nb-ink': look.ink,
    '--nb-len': Math.max(longest, 7),
  } as CSSProperties;
  const soon = to === null;
  const body = (
    <>
      <span className="nb__spiral" aria-hidden />
      {look.doodles?.slice(0, 4).map((d, i) => (
        <span key={i} className={`nb__doodle nb__doodle--${i + 1}`} aria-hidden>
          {d}
        </span>
      ))}
      {!!count && !soon && (
        <span className="nb__ribbon" aria-hidden>
          <b>{count}</b>
          game
        </span>
      )}
      <span className="nb__sticker" aria-hidden>
        {sticker}
      </span>
      <span className="nb__label">
        <span className="nb__kicker">{kicker}</span>
        <span className="nb__name">{name}</span>
        {desc && <span className="nb__desc">{desc}</span>}
        <span className="nb__star" aria-hidden>
          ★
        </span>
      </span>
      {soon && (
        <span className="nb__tape" aria-hidden>
          Segera hadir
        </span>
      )}
    </>
  );
  const className = `nb nb--${look.pattern}${soon ? ' nb--soon' : ''}`;
  return soon ? (
    <div className={className} style={style} aria-label={ariaLabel ?? `${name} — segera hadir`}>
      {body}
    </div>
  ) : (
    <Link to={to} className={className} style={style} aria-label={ariaLabel}>
      {body}
    </Link>
  );
}
