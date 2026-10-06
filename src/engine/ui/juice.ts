/**
 * LAPISAN PREMIUM P1 — "hidup" saat disentuh (docs/rencana-game-sd-kelas-3-4.md
 * bagian 2b.2). Dipakai SEMUA game lewat `GameShell`, jadi game lama ikut
 * terangkat tanpa menyentuh config-nya.
 *
 * - `popTap`: benda yang disentuh memantul kecil.
 * - `sparkleAt`: percikan bintang di titik jawaban yang benar.
 * - `flyStars`: bintang yang didapat "terbang" ke penghitung level di atas.
 * - `buzz`: getar halus (Android saja; iPhone tidak punya `navigator.vibrate`).
 *
 * Semuanya menulis langsung ke DOM, BUKAN state React — pelajaran PathTrace
 * (2026-07-28): animasi yang memicu render ulang seisi layar tersendat di HP
 * murah. Elemen percikan ditaruh di `document.body`, berumur satu animasi, lalu
 * dibuang sendiri. Animasinya CSS transform + opacity saja (lihat engine.css,
 * bagian "P1"), tanpa library.
 *
 * `prefers-reduced-motion` mematikan SEMUA gerakan di sini (bunyi tetap).
 * Getar juga ikut mati: anak yang mengaktifkan setelan itu umumnya tidak mau
 * HP-nya ikut "bergerak".
 */

/** Benda yang memantul saat disentuh. Sengaja daftar kelas, bukan semua elemen. */
const POP_SELECTOR = [
  '.choice-card',
  '.count-cell',
  '.memory-card',
  '.dd-item',
  '.pz-piece',
  '.spell-letter',
  '.pick-card',
  '.story-choice',
  '.cs-chip',
  '.cs-check',
  '.pv-tile',
  '.pv-col',
  '.pv-check',
].join(',');

function reducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Pantulkan benda yang disentuh. Dipanggil dari `pointerdown` yang ditangkap
 * `GameShell`. Memakai properti CSS `scale` (bukan `transform`), jadi tidak
 * pernah bertabrakan dengan `transform` yang dipakai template untuk menyeret
 * kartu atau menggoyang jawaban salah. Browser lama yang tak mengenal `scale`
 * cukup tidak memantul — tidak ada yang rusak.
 */
export function popTap(target: EventTarget | null): void {
  if (reducedMotion() || !(target instanceof Element)) return;
  const el = target.closest<HTMLElement>(POP_SELECTOR);
  if (!el || (el as HTMLButtonElement).disabled) return;
  el.classList.remove('juice-pop');
  // Paksa reflow supaya animasi mulai ulang walau disentuh berturut-turut.
  void el.offsetWidth;
  el.classList.add('juice-pop');
  el.addEventListener('animationend', () => el.classList.remove('juice-pop'), { once: true });
}

function particle(cls: string, x: number, y: number, text: string, vars: Record<string, string>) {
  const el = document.createElement('span');
  el.className = cls;
  el.textContent = text;
  el.setAttribute('aria-hidden', 'true');
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v);
  el.addEventListener('animationend', () => el.remove(), { once: true });
  // Jaring pengaman: tab yang disembunyikan tidak menjalankan animationend.
  window.setTimeout(() => el.remove(), 2000);
  document.body.appendChild(el);
}

/** Percikan bintang & kilau yang memancar dari (x, y), koordinat layar. */
export function sparkleAt(x: number, y: number, count = 10): void {
  if (reducedMotion() || typeof document === 'undefined') return;
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const dist = 56 + Math.random() * 46;
    particle('juice-spark', x, y, i % 3 === 0 ? '✨' : '⭐', {
      '--dx': `${Math.cos(a) * dist}px`,
      '--dy': `${Math.sin(a) * dist}px`,
      '--rot': `${Math.round(Math.random() * 300 - 150)}deg`,
      '--delay': `${Math.round(Math.random() * 60)}ms`,
    });
  }
}

/**
 * `count` bintang terbang dari (x, y) ke tengah elemen `to` (penghitung level
 * di atas layar), satu-satu berjarak sedikit. Elemen tujuannya ikut berdenyut
 * saat bintang terakhir tiba.
 */
export function flyStars(x: number, y: number, to: Element | null, count: number): void {
  if (reducedMotion() || !to || count <= 0 || typeof document === 'undefined') return;
  const r = to.getBoundingClientRect();
  const tx = r.left + r.width / 2;
  const ty = r.top + r.height / 2;
  for (let i = 0; i < count; i += 1) {
    const spread = (i - (count - 1) / 2) * 34;
    particle('juice-fly', x + spread, y, '⭐', {
      '--dx': `${tx - x - spread}px`,
      '--dy': `${ty - y}px`,
      '--delay': `${180 + i * 110}ms`,
    });
  }
  const land = 180 + (count - 1) * 110 + 620;
  window.setTimeout(() => {
    to.classList.remove('juice-land');
    void (to as HTMLElement).offsetWidth;
    to.classList.add('juice-land');
    to.addEventListener('animationend', () => to.classList.remove('juice-land'), { once: true });
  }, land);
}

/** Getar halus. Diam-diam tidak melakukan apa pun di HP yang tak mendukung. */
export function buzz(pattern: number | number[] = 22): void {
  if (reducedMotion() || typeof navigator === 'undefined') return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* Browser yang menolak (belum ada sentuhan, iframe) — getar itu bonus. */
  }
}
