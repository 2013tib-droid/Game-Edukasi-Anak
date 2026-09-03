import { useState } from 'react';

/** Where a game's icon art lives once it has been drawn. */
export function gameImageUrl(pic: string): string {
  return `${import.meta.env.BASE_URL}assets/games/${pic}.webp`;
}

/**
 * A game's icon as the owner's art (`public/assets/games/<pic>.webp`), falling
 * back to its emoji if the file is missing — same graceful-degradation contract
 * as `MascotPic`. Games whose art is not drawn yet carry no `pic` in the
 * registry, so they render the emoji without ever requesting a file that 404s.
 *
 * Sized by HEIGHT with `width: auto`: every file is cropped tight to its own
 * drawing, so the aspect ratios differ and a fixed box would squash the wide
 * ones (Taman Huruf's tent sits under a cloud of letters).
 *
 * `maxWidth: 100%` is the guard for art that is unusually WIDE. The portal card
 * is only ~116px of content on a 360px phone, so anything past a ~1.5 aspect
 * ratio would render wider than its card and spill out (Pasangan Pintar's two
 * linked circles are 2.08 and would be 150px).
 *
 * `objectFit: contain` WAJIB menemani `maxWidth` itu. Pada elemen gambar yang
 * tingginya dipatok dan lebarnya `auto`, `max-width` memangkas LEBARNYA saja —
 * tingginya tetap 72px, jadi gambarnya GEPENG, bukan mengecil. Terukur
 * 2026-09-03 di kartu portal SD: `pasangan-pintar.webp` tampil rasio 1,84
 * padahal aslinya 2,08. Dengan `contain`, kotaknya tetap selebar kartu tapi
 * gambarnya dipaskan di dalamnya — jadi memang tampil lebih pendek dari 72px
 * yang diminta kartu (benar, tapi terlihat lebih ringan dari tetangganya).
 * Karena itu tetap gambar ikon yang tidak lebih lebar daripada tingginya.
 * See docs/prompt-ikon-game.md.
 */
export default function GameIcon({
  pic,
  emoji,
  height,
  emojiSize,
  className,
  fallbackClassName,
}: {
  pic?: string;
  emoji: string;
  /** Rendered height of the art, in CSS pixels. Omit when `className` sizes it. */
  height?: number;
  /** Font size for the emoji fallback — tuned so both read as the same weight. */
  emojiSize?: number;
  /**
   * Class for the image, for callers whose size changes with the viewport —
   * chip di landing mengecil di layar 340px, dan angka `height` yang ditulis
   * inline tak bisa ditimpa media query. Kontraknya sama dengan `ItemPic`.
   * Kalau dipakai, CSS-nya WAJIB memuat `height`, `width: auto` dan
   * `max-width: 100%` — tanpa itu seni yang lebar akan meluber.
   */
  className?: string;
  /** Class for the emoji fallback; defaults to `className`. */
  fallbackClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!pic || failed) {
    return (
      <span
        className={fallbackClassName ?? className}
        style={emojiSize ? { fontSize: emojiSize, lineHeight: 1 } : undefined}
      >
        {emoji}
      </span>
    );
  }
  return (
    <img
      className={className}
      src={gameImageUrl(pic)}
      alt=""
      style={
        height
          ? { height, width: 'auto', maxWidth: '100%', objectFit: 'contain', display: 'block' }
          : undefined
      }
      onError={() => setFailed(true)}
    />
  );
}
