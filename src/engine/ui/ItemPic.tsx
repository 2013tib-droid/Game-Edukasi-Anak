import { useState } from 'react';
import { ITEMS, itemImageUrl } from '@/engine/ui/items';

interface Props {
  /** Item id in the registry (`src/engine/ui/items.ts`). */
  id: string;
  /** Class for the image element. */
  className?: string;
  /** Class for the emoji fallback; defaults to `className`. */
  fallbackClassName?: string;
}

/**
 * One item picture from the registry. Renders the image asset; if it is
 * missing (art not shipped yet) or the id is unknown it degrades to the
 * item's emoji, so a board is never blank. Shared by every template that
 * shows item art (tap-answer boards & cues, spell cues).
 */
export default function ItemPic({ id, className, fallbackClassName }: Props) {
  const [failed, setFailed] = useState(false);
  const def = ITEMS[id];
  if (failed || !def) {
    return (
      <span className={fallbackClassName ?? className} aria-hidden>
        {def?.emoji ?? '❓'}
      </span>
    );
  }
  return (
    <img
      className={className}
      src={itemImageUrl(id)}
      alt=""
      aria-hidden
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
