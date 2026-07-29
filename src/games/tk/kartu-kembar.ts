import type { GameConfig, MemoryPair } from '@/engine/core/types';
import { ITEMS } from '@/engine/ui/items';

/**
 * Card face from the picture registry: real AI art (WebP), same on every
 * phone. The registry's emoji stays as fallback if an asset is missing.
 */
function pair(item: keyof typeof ITEMS): MemoryPair {
  return { id: item, item, emoji: ITEMS[item].emoji };
}

const config: GameConfig<'memory'> = {
  id: 'kartu-kembar',
  group: 'tk',
  title: 'Kartu Kembar',
  emoji: '🃏',
  template: 'memory',
  levels: [
    {
      id: 'l1',
      narration: 'Temukan pasangan hewan yang sama!',
      data: {
        pairs: [pair('cat'), pair('rabbit'), pair('duck')],
      },
    },
    {
      id: 'l2',
      narration: 'Sekarang lebih banyak! Temukan semua pasangannya!',
      data: {
        pairs: [pair('elephant'), pair('lion'), pair('monkey'), pair('panda')],
      },
    },
    {
      id: 'l3',
      narration: 'Level terakhir! Kamu pasti bisa!',
      data: {
        pairs: [
          pair('turtle'),
          pair('penguin'),
          pair('horse'),
          pair('koala'),
          pair('tiger'),
          pair('frog'),
        ],
      },
    },
  ],
};

export default config;
