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
 * linked circles are 2.08 and would be 150px). Such art renders shorter than
 * the 72px the card asks for — correct, but visually lighter than its
 * neighbours, so prefer drawing icons no wider than tall-ish in the first
 * place. See docs/prompt-ikon-game.md.
 */
export default function GameIcon({
  pic,
  emoji,
  height,
  emojiSize,
}: {
  pic?: string;
  emoji: string;
  /** Rendered height of the art, in CSS pixels. */
  height: number;
  /** Font size for the emoji fallback — tuned so both read as the same weight. */
  emojiSize: number;
}) {
  const [failed, setFailed] = useState(false);
  if (!pic || failed) {
    return <span style={{ fontSize: emojiSize, lineHeight: 1 }}>{emoji}</span>;
  }
  return (
    <img
      src={gameImageUrl(pic)}
      alt=""
      style={{ height, width: 'auto', maxWidth: '100%', display: 'block' }}
      onError={() => setFailed(true)}
    />
  );
}
