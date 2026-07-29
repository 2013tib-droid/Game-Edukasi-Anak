import type { GameConfig } from '@/engine/core/types';

// SD kelas 1–2: membaca kata → pasangkan ke gambarnya.
const config: GameConfig<'drag-drop'> = {
  id: 'pasang-kata',
  group: 'sd1',
  title: 'Pasang Kata',
  emoji: '🧩',
  template: 'drag-drop',
  levels: [
    {
      id: 'l1',
      narration: 'Tarik kata ke gambar yang cocok!',
      data: {
        targets: [
          { id: 'kucing', emoji: '🐱', label: '?' },
          { id: 'bola', emoji: '⚽', label: '?' },
          { id: 'buku', emoji: '📖', label: '?' },
        ],
        items: [
          { id: 'i1', text: 'kucing', targetId: 'kucing' },
          { id: 'i2', text: 'bola', targetId: 'bola' },
          { id: 'i3', text: 'buku', targetId: 'buku' },
        ],
      },
    },
    {
      id: 'l2',
      narration: 'Tarik kata ke gambar yang cocok!',
      data: {
        targets: [
          { id: 'rumah', emoji: '🏠', label: '?' },
          { id: 'mobil', emoji: '🚗', label: '?' },
          { id: 'pohon', emoji: '🌳', label: '?' },
          { id: 'matahari', emoji: '☀️', label: '?' },
        ],
        items: [
          { id: 'i1', text: 'rumah', targetId: 'rumah' },
          { id: 'i2', text: 'mobil', targetId: 'mobil' },
          { id: 'i3', text: 'pohon', targetId: 'pohon' },
          { id: 'i4', text: 'matahari', targetId: 'matahari' },
        ],
      },
    },
    {
      id: 'l3',
      narration: 'Pasangkan hewan dengan makanannya!',
      data: {
        targets: [
          { id: 'wortel', emoji: '🥕', label: 'wortel' },
          { id: 'pisang', emoji: '🍌', label: 'pisang' },
          { id: 'tulang', emoji: '🦴', label: 'tulang' },
        ],
        items: [
          { id: 'i1', emoji: '🐰', text: 'kelinci', targetId: 'wortel' },
          { id: 'i2', emoji: '🐵', text: 'monyet', targetId: 'pisang' },
          { id: 'i3', emoji: '🐶', text: 'anjing', targetId: 'tulang' },
        ],
      },
    },
  ],
};

export default config;
