// Evolving mascot (concept carried over from the legacy Petualangan Pintar):
// the mascot grows with the child's TOTAL stars across all games.
export const MASCOTS = [
  { min: 0, emoji: '🥚', name: 'Telur Ajaib' },
  { min: 10, emoji: '🐣', name: 'Si Menetas' },
  { min: 25, emoji: '🐥', name: 'Anak Ayam Ceria' },
  { min: 45, emoji: '🦉', name: 'Burung Hantu Pintar' },
  { min: 70, emoji: '🦄', name: 'Unicorn Ajaib' },
  { min: 100, emoji: '🐲', name: 'Naga Jenius' },
];

export function mascotFor(stars) {
  let current = MASCOTS[0];
  MASCOTS.forEach((m) => {
    if (stars >= m.min) current = m;
  });
  const index = MASCOTS.indexOf(current);
  return { ...current, level: index + 1, next: MASCOTS[index + 1] ?? null };
}
