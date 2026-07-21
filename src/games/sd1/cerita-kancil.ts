import type { GameConfig } from '@/engine/core/types';

const config: GameConfig<'story-choice'> = {
  id: 'cerita-kancil',
  group: 'sd1',
  title: 'Cerita Si Kancil',
  emoji: '🦌',
  template: 'story-choice',
  freeDemo: true,
  levels: [
    {
      id: 'l1',
      narration:
        'Si Kancil berjalan di hutan. Perutnya lapar sekali. Ayo bantu Kancil mencari makan!',
      data: {
        pages: [
          {
            emoji: '🦌',
            text: 'Si Kancil berjalan di hutan. Perutnya lapar sekali.',
          },
          {
            emoji: '🥒',
            text: 'Kancil melihat kebun mentimun Pak Tani. Apa yang sebaiknya Kancil lakukan?',
            choices: [
              {
                text: 'Minta izin Pak Tani dulu',
                correct: true,
              },
              {
                text: 'Ambil diam-diam',
                feedback: 'Hmm, mengambil tanpa izin itu tidak baik. Coba pilih yang lain!',
              },
            ],
          },
          {
            emoji: '👨‍🌾',
            text: 'Pak Tani senang Kancil jujur. "Ambillah mentimun secukupnya," kata Pak Tani.',
          },
          {
            emoji: '🐊',
            text: 'Di sungai, ada buaya menghalangi jalan pulang. Bagaimana Kancil menyeberang?',
            choices: [
              {
                text: 'Berteriak marah pada buaya',
                feedback: 'Marah-marah tidak menyelesaikan masalah. Coba cara yang cerdik!',
              },
              {
                text: 'Ajak buaya berhitung sambil berbaris',
                correct: true,
              },
            ],
          },
          {
            emoji: '🎉',
            text: 'Buaya berbaris, Kancil melompat satu-satu sampai seberang. Kancil pulang dengan kenyang dan gembira!',
          },
        ],
      },
    },
  ],
};

export default config;
