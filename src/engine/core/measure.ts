/**
 * Hitungan bangun berpetak (Ukur Yuk). Dipisah dari `Plot.tsx` supaya config
 * game & skrip Node bisa memakainya tanpa ikut membawa komponen React.
 * `#` = petak terisi.
 */

/** Keliling = banyak sisi petak yang berbatasan dengan petak kosong. */
export function gridPerimeter(rows: string[]): number {
  let n = 0;
  const at = (r: number, c: number) => rows[r]?.[c] === '#';
  rows.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      if (ch !== '#') return;
      n += +!at(r - 1, c) + +!at(r + 1, c) + +!at(r, c - 1) + +!at(r, c + 1);
    }),
  );
  return n;
}

/** Banyak petak — dipakai sebagai PENGECOH (kesalahan khas: luas ≠ keliling). */
export function gridArea(rows: string[]): number {
  return rows.join('').split('').filter((ch) => ch === '#').length;
}

