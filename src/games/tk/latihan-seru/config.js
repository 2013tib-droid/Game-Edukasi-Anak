// Sample free-demo game exercising all 6 engine templates.
// Also serves as the reference for how game configs are written (Phase 4).
export default {
  levels: [
    {
      id: 'tap-buah',
      template: 'tap-answer',
      title: '🍎 Tebak Buah',
      rounds: [
        {
          prompt: 'Yang mana apel?',
          options: [
            { label: '🍎', correct: true },
            { label: '🍌' },
            { label: '🍇' },
          ],
        },
        {
          prompt: 'Yang mana pisang?',
          options: [
            { label: '🍉' },
            { label: '🍌', correct: true },
            { label: '🍓' },
          ],
        },
        {
          prompt: 'Yang mana semangka?',
          options: [
            { label: '🍉', correct: true },
            { label: '🍊' },
            { label: '🍍' },
            { label: '🥝' },
          ],
        },
      ],
    },
    {
      id: 'hitung-buah',
      template: 'count-tap',
      title: '🔢 Hitung Buah',
      rounds: [
        {
          // Per the owner's design rule: more targets than asked + distractors
          prompt: 'Ketuk 3 apel!',
          target: '🍎',
          need: 3,
          targetTotal: 5,
          distractors: { '🍌': 3, '🍇': 2 },
        },
        {
          prompt: 'Ketuk 4 jeruk!',
          target: '🍊',
          need: 4,
          targetTotal: 6,
          distractors: { '🍓': 3, '🍍': 2, '🥝': 1 },
        },
      ],
    },
    {
      id: 'kartu-hewan',
      template: 'memory',
      title: '🐾 Kartu Hewan',
      prompt: 'Temukan pasangan hewan yang sama!',
      pairs: ['🐰', '🐸', '🐱', '🐶'],
    },
    {
      id: 'kelompok-warna',
      template: 'drag-drop',
      title: '🎨 Kelompokkan Warna',
      prompt: 'Seret buah ke warna yang cocok!',
      zones: [
        { id: 'merah', label: '🔴 Merah' },
        { id: 'kuning', label: '🟡 Kuning' },
      ],
      items: [
        { id: 'apel', label: '🍎', zone: 'merah' },
        { id: 'stroberi', label: '🍓', zone: 'merah' },
        { id: 'pisang', label: '🍌', zone: 'kuning' },
        { id: 'nanas', label: '🍍', zone: 'kuning' },
      ],
    },
    {
      id: 'tulis-huruf',
      template: 'tracing',
      title: '✏️ Tulis Huruf',
      rounds: [{ char: 'A' }, { char: 'B' }, { char: '3' }],
    },
    {
      id: 'cerita-kancil',
      template: 'story',
      title: '📖 Cerita Si Kancil',
      pages: [
        {
          scene: '🦌🌳🌞',
          text: 'Si Kancil berjalan-jalan di hutan yang cerah.',
        },
        {
          scene: '🦌🍉',
          text: 'Kancil menemukan semangka besar. Berapa jumlah semangkanya?',
          choices: [
            { text: 'Satu', correct: true },
            { text: 'Dua', feedback: 'Hitung lagi ya, semangkanya cuma ada satu.' },
          ],
        },
        {
          scene: '🦌🎉',
          text: 'Benar! Kancil senang sekali. Sampai jumpa di petualangan berikutnya!',
        },
      ],
    },
  ],
};
