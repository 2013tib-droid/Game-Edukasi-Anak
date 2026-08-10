import type { SceneId } from '@/engine/core/types';
import '@/engine/ui/scene.css';

/**
 * Latar tempat cerita: hutan, kebun, sungai, sawah — digambar sebagai SVG di
 * ENGINE, bukan gambar yang diunduh.
 *
 * Alasannya sama dengan `Shape.tsx` (bangun datar) dan `Clock.tsx` (muka jam):
 * satu latar layar penuh sebagai WebP butuh beberapa ratus kB per tempat dan
 * harus disiapkan untuk potret HP maupun tablet, sedangkan SVG di sini ±2 kB,
 * ikut chunk cerita, dan tak pernah bisa gagal karena jaringan. Config cuma
 * MENYEBUT nama tempatnya (`StoryPage.scene`), geometrinya urusan engine —
 * pola yang sama dengan `RoadKind` di path-trace.
 *
 * ATURAN KETERBACAAN (jangan dilanggar saat menambah tempat baru):
 * gambarnya sengaja dibagi dua PITA — satu menempel di ATAS layar, satu di
 * BAWAH — dan bagian TENGAH dibiarkan langit polos. Teks cerita dan kartu
 * pilihan hidup di tengah layar; kalau pohon digambar sampai ke tengah,
 * tulisan cokelat tua di atasnya jadi susah dibaca. Warnanya juga harus tetap
 * pastel/muda dengan alasan yang sama.
 *
 * Pita dipasang dengan `preserveAspectRatio=slice` + tinggi dari CSS, jadi
 * layar mana pun (360×640 sampai tablet mendatar) memotong ke SAMPING, tidak
 * pernah memotong pucuk pohon atau garis tanahnya.
 */

/** Warna daun — muda ke tua, dipakai berlapis supaya rimbunnya terasa. */
const LEAF_LIGHT = '#8ed77a';
const LEAF = '#6cbb5c';
const LEAF_DARK = '#54a84b';
const TRUNK = '#b3835a';

/**
 * Satu pohon utuh. Titik (x, y) = PANGKAL batang di tanah; tajuknya tumbuh ke
 * atas, jadi config tinggal menaruhnya di garis tanah.
 */
function Tree({ x, y, s = 1, fill = LEAF }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-8" y="-64" width="16" height="66" rx="7" fill={TRUNK} />
      <circle cx="0" cy="-104" r="40" fill={fill} />
      <circle cx="-30" cy="-76" r="31" fill={fill} />
      <circle cx="30" cy="-76" r="31" fill={fill} />
      <circle cx="0" cy="-70" r="30" fill={fill} />
      {/* Sisi kena matahari — satu sapuan muda supaya tajuknya tidak rata. */}
      <circle cx="-12" cy="-112" r="17" fill={LEAF_LIGHT} opacity="0.55" />
    </g>
  );
}

/** Semak bulat di kaki layar. */
function Bush({ x, y, s = 1, fill = LEAF_DARK }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="-22" cy="0" r="22" fill={fill} />
      <circle cx="22" cy="0" r="22" fill={fill} />
      <circle cx="0" cy="-12" r="27" fill={fill} />
    </g>
  );
}

function Sun({ x, y, r = 34 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r + 14} fill="#ffe9a8" opacity="0.55" />
      <circle cx={x} cy={y} r={r} fill="#ffd45e" />
    </g>
  );
}

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#ffffff" opacity="0.9">
      <circle cx="-26" cy="6" r="20" />
      <circle cx="0" cy="-6" r="26" />
      <circle cx="28" cy="6" r="22" />
      <rect x="-26" y="6" width="54" height="20" rx="10" />
    </g>
  );
}

/** Langit terbuka: matahari + awan. Dipakai semua tempat kecuali hutan. */
function OpenSky() {
  return (
    <>
      <Sun x={330} y={34} />
      <Cloud x={80} y={44} s={0.9} />
      <Cloud x={210} y={22} s={0.65} />
    </>
  );
}

/** Pita ATAS per tempat. */
function TopBand({ id }: { id: SceneId }) {
  if (id === 'hutan') {
    // Tajuk yang menjuntai dari tepi atas layar — anak merasa berada DI DALAM
    // hutan, tanpa satu pun daun turun ke tengah layar tempat teksnya berada.
    return (
      <>
        <g fill={LEAF_DARK}>
          <circle cx="30" cy="-6" r="62" />
          <circle cx="130" cy="-14" r="66" />
          <circle cx="240" cy="-8" r="60" />
          <circle cx="350" cy="-16" r="68" />
        </g>
        <g fill={LEAF}>
          <circle cx="-10" cy="-24" r="58" />
          <circle cx="80" cy="-30" r="60" />
          <circle cx="180" cy="-22" r="56" />
          <circle cx="290" cy="-28" r="58" />
          <circle cx="392" cy="-24" r="56" />
        </g>
        {/* Dua sulur menjuntai — memberi kedalaman tanpa menutupi apa pun. */}
        <g stroke={LEAF_DARK} strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M64 22 q10 26 -4 44" />
          <path d="M326 16 q-12 28 2 46" />
        </g>
        <ellipse cx="58" cy="70" rx="11" ry="7" fill={LEAF_LIGHT} transform="rotate(-20 58 70)" />
        <ellipse cx="330" cy="66" rx="11" ry="7" fill={LEAF_LIGHT} transform="rotate(18 330 66)" />
      </>
    );
  }

  if (id === 'rumah') {
    // Di dalam rumah: yang menempel di langit-langit adalah lampu gantung +
    // rak dinding. "Langit"-nya = warna dinding (lihat scene.css).
    return (
      <>
        <rect x="0" y="0" width="400" height="10" fill="#e6d3b8" />
        {/* Lampu gantung */}
        <g>
          <rect x="196" y="10" width="8" height="26" fill="#c9b48f" />
          <path d="M164 74 Q200 26 236 74 Z" fill="#ffd45e" />
          <ellipse cx="200" cy="74" rx="36" ry="8" fill="#ffe9a8" />
        </g>
        {/* Jendela dengan pemandangan hijau — supaya kamarnya tidak pengap.
            Sengaja di pita ATAS: jendela itu barang tinggi, kalau digambar di
            pita bawah ia berdiri sejajar karpet dan terlihat seperti lubang. */}
        <g>
          <rect x="30" y="22" width="92" height="80" rx="8" fill="#bfe3f7" />
          <path d="M34 102 Q60 68 82 102 Q100 76 118 102 Z" fill={LEAF_LIGHT} />
          <rect x="72" y="22" width="8" height="80" fill="#ffffff" />
          <rect x="30" y="58" width="92" height="8" fill="#ffffff" />
          <rect
            x="24"
            y="16"
            width="104"
            height="92"
            rx="10"
            fill="none"
            stroke="#d8ae7c"
            strokeWidth="8"
          />
        </g>
        {/* Rak dinding + pot */}
        <g>
          <rect x="290" y="76" width="78" height="8" rx="4" fill="#d8ae7c" />
          <rect x="304" y="56" width="18" height="20" rx="4" fill="#ef7d6b" />
          <circle cx="346" cy="62" r="13" fill={LEAF} />
          <rect x="340" y="66" width="12" height="10" rx="3" fill="#c98f5f" />
        </g>
      </>
    );
  }

  if (id === 'malam') {
    // Bulan & bintang. Langitnya sengaja TIDAK gelap — lihat catatan warna di
    // scene.css: teks cerita berwarna cokelat tua dan harus tetap terbaca.
    return (
      <>
        {/* Bulan sengaja TIDAK di pojok kanan atas: di sana selalu ada tombol
            🔊, dan bulan sabit itu bentuk yang justru harus terlihat. */}
        <circle cx="238" cy="44" r="44" fill="#fff6c9" opacity="0.5" />
        <path d="M258 16 A30 30 0 1 0 258 72 Q236 44 258 16 Z" fill="#ffe9a8" />
        <g fill="#ffffff">
          {[
            [46, 34, 5],
            [104, 66, 4],
            [158, 28, 6],
            [312, 62, 5],
            [352, 26, 4],
            [72, 100, 4],
            [186, 104, 5],
          ].map(([x, y, r]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
          ))}
        </g>
        <Cloud x={112} y={46} s={0.7} />
      </>
    );
  }

  if (id === 'laut') {
    return (
      <>
        <OpenSky />
        {/* Burung camar — dua goresan, jangan lebih: ini cuma suasana. */}
        <g stroke="#8fa9bd" strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M120 92 q10 -10 20 0 q10 -10 20 0" />
          <path d="M244 74 q8 -8 16 0 q8 -8 16 0" />
        </g>
      </>
    );
  }

  return <OpenSky />;
}

/** Pita BAWAH per tempat: garis cakrawala, tanah, dan isinya. */
function BottomBand({ id }: { id: SceneId }) {
  if (id === 'hutan') {
    return (
      <>
        {/* Bukit jauh */}
        <path d="M0 132 Q70 96 140 126 Q210 88 280 122 Q340 98 400 126 V260 H0 Z" fill="#c3e6ad" />
        {/* Barisan pohon latar */}
        <Tree x={60} y={150} s={0.62} fill={LEAF_LIGHT} />
        <Tree x={200} y={146} s={0.55} fill={LEAF_LIGHT} />
        <Tree x={330} y={150} s={0.6} fill={LEAF_LIGHT} />
        {/* Tanah */}
        <path d="M0 168 Q100 154 200 166 Q300 178 400 160 V260 H0 Z" fill="#8ed274" />
        <path d="M0 212 Q120 198 250 210 Q330 217 400 202 V260 H0 Z" fill="#79c261" />
        {/* Pohon depan di kiri & kanan — tengah layar sengaja dibiarkan lapang */}
        <Tree x={22} y={200} s={1.05} fill={LEAF} />
        <Tree x={378} y={206} s={1.15} fill={LEAF} />
        <Bush x={120} y={238} s={0.9} />
        <Bush x={296} y={244} s={1} />
        {/* Jamur & bunga kecil */}
        <g>
          <rect x="176" y="228" width="7" height="12" rx="3" fill="#fff3e0" />
          <ellipse cx="179" cy="228" rx="13" ry="9" fill="#ef7d6b" />
          <circle cx="228" cy="234" r="5" fill="#ffd45e" />
          <circle cx="244" cy="240" r="4" fill="#ff9fb2" />
        </g>
      </>
    );
  }

  if (id === 'kebun') {
    return (
      <>
        <path d="M0 128 Q80 108 160 124 Q260 142 400 118 V260 H0 Z" fill="#bfe3a8" />
        <Tree x={352} y={168} s={0.75} fill={LEAF} />
        {/* Pagar kebun */}
        <g fill="#d8ae7c">
          {[24, 76, 128, 180, 232, 284].map((x) => (
            <rect key={x} x={x} y="132" width="10" height="46" rx="4" />
          ))}
          <rect x="18" y="142" width="278" height="8" rx="4" />
          <rect x="18" y="160" width="278" height="8" rx="4" />
        </g>
        {/* Tanah kebun + guludan */}
        <path d="M0 176 Q120 166 260 176 Q330 181 400 172 V260 H0 Z" fill="#8ed274" />
        <path d="M0 222 Q140 210 260 222 Q330 228 400 218 V260 H0 Z" fill="#cda578" />
        {/* Tanaman sayur berbunga kuning */}
        <g>
          {[40, 110, 180, 250, 320, 384].map((x, i) => (
            <g key={x} transform={`translate(${x} ${232 + (i % 2) * 8}) scale(1.2)`}>
              <path d="M0 0 q-4 -22 -20 -30 q18 -2 20 16 q2 -20 20 -18 q-16 10 -20 32 Z" fill={LEAF_DARK} />
              <circle cx="-14" cy="-24" r="5" fill="#ffd45e" />
              <circle cx="15" cy="-18" r="5" fill="#ffd45e" />
              <ellipse cx="2" cy="-6" rx="9" ry="6" fill="#7fbf3f" transform="rotate(-18 2 -6)" />
            </g>
          ))}
        </g>
      </>
    );
  }

  if (id === 'sungai') {
    return (
      <>
        <path d="M0 120 Q80 92 150 116 Q240 142 400 108 V260 H0 Z" fill="#bfe3a8" />
        <Tree x={40} y={150} s={0.62} fill={LEAF_LIGHT} />
        <Tree x={356} y={146} s={0.58} fill={LEAF_LIGHT} />
        {/* Tepian */}
        <path d="M0 150 Q110 138 220 152 Q320 164 400 146 V260 H0 Z" fill="#8ed274" />
        {/* Air */}
        <path d="M0 186 Q110 168 220 186 Q320 202 400 182 V244 Q300 232 200 244 Q100 256 0 240 Z" fill="#7ec8e3" />
        <g stroke="#e6f7ff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.85">
          <path d="M40 206 q18 -8 36 0" />
          <path d="M150 216 q18 -8 36 0" />
          <path d="M264 208 q18 -8 36 0" />
          <path d="M96 228 q18 -8 36 0" />
          <path d="M300 230 q18 -8 36 0" />
        </g>
        {/* Batu & rumput tepi */}
        <ellipse cx="60" cy="248" rx="26" ry="13" fill="#cbbfa8" />
        <ellipse cx="340" cy="252" rx="30" ry="14" fill="#cbbfa8" />
        <g stroke={LEAF_DARK} strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M14 172 q4 -20 -4 -32" />
          <path d="M26 174 q8 -22 4 -34" />
          <path d="M382 166 q-4 -20 4 -32" />
          <path d="M370 168 q-8 -22 -4 -34" />
        </g>
      </>
    );
  }

  if (id === 'padang') {
    return (
      <>
        {/* Padang rumput: bukit landai, satu pohon rindang, bunga-bunga. */}
        <path d="M0 118 Q90 82 190 112 Q290 142 400 100 V260 H0 Z" fill="#cbe8a0" />
        <path d="M0 156 Q110 128 230 158 Q320 180 400 150 V260 H0 Z" fill="#a8db78" />
        <Tree x={330} y={186} s={0.95} fill={LEAF} />
        <path d="M0 198 Q120 184 250 198 Q330 205 400 192 V260 H0 Z" fill="#8ed274" />
        {/* Pagar kayu di kejauhan */}
        <g fill="#d8ae7c" opacity="0.9">
          {[36, 82, 128, 174].map((x) => (
            <rect key={x} x={x} y="146" width="8" height="36" rx="3" />
          ))}
          <rect x="32" y="154" width="153" height="6" rx="3" />
          <rect x="32" y="170" width="153" height="6" rx="3" />
        </g>
        {/* Rumpun rumput di kaki layar — tiga helai condong ke arah yang sama,
            kalau dua helai simetris bentuknya malah terbaca seperti kurung. */}
        <g stroke={LEAF_DARK} strokeWidth="4" strokeLinecap="round" fill="none">
          {[20, 96, 168, 244, 316, 384].map((x, i) => (
            <g key={x} transform={`translate(${x} ${248 + (i % 2) * 6})`}>
              <path d="M0 0 q-9 -14 -15 -22" />
              <path d="M0 0 q-2 -18 -3 -29" />
              <path d="M0 0 q9 -15 16 -24" />
            </g>
          ))}
        </g>
        <g>
          <circle cx="62" cy="228" r="6" fill="#ffd45e" />
          <circle cx="140" cy="240" r="6" fill="#ff9fb2" />
          <circle cx="214" cy="226" r="6" fill="#fff0f3" />
          <circle cx="288" cy="242" r="6" fill="#ffd45e" />
        </g>
      </>
    );
  }

  if (id === 'kota') {
    // Jalan di kampung/kota: deretan rumah pastel, trotoar, jalan. Warnanya
    // sengaja muda — jalan abu-abu tua akan mengalahkan teks cerita.
    const houses: { x: number; w: number; h: number; wall: string; roof: string }[] = [
      { x: 6, w: 78, h: 92, wall: '#ffe0b8', roof: '#e08a6a' },
      { x: 96, w: 66, h: 116, wall: '#dce8ff', roof: '#7fa3d8' },
      { x: 174, w: 86, h: 100, wall: '#ffeaea', roof: '#e0806f' },
      { x: 272, w: 70, h: 124, wall: '#e6f4dd', roof: '#79a86a' },
      { x: 352, w: 62, h: 96, wall: '#fff2cc', roof: '#e0a95e' },
    ];
    return (
      <>
        <g>
          {houses.map((h) => (
            <g key={h.x}>
              <rect x={h.x} y={186 - h.h} width={h.w} height={h.h} rx="6" fill={h.wall} />
              <path
                d={`M${h.x - 7} ${186 - h.h} L${h.x + h.w / 2} ${170 - h.h} L${h.x + h.w + 7} ${186 - h.h} Z`}
                fill={h.roof}
              />
              <rect x={h.x + 12} y={200 - h.h} width={18} height={18} rx="4" fill="#ffffff" opacity="0.85" />
              <rect
                x={h.x + h.w - 30}
                y={200 - h.h}
                width={18}
                height={18}
                rx="4"
                fill="#ffffff"
                opacity="0.85"
              />
              <rect x={h.x + h.w / 2 - 11} y={150} width={22} height={36} rx="4" fill="#c98f5f" />
            </g>
          ))}
        </g>
        <Tree x={86} y={188} s={0.5} fill={LEAF} />
        <Tree x={266} y={188} s={0.45} fill={LEAF} />
        {/* Trotoar & jalan */}
        <rect x="0" y="186" width="400" height="26" fill="#e6ddcd" />
        <rect x="0" y="212" width="400" height="48" fill="#c9c2b6" />
        <g fill="#fffdf6">
          {[16, 96, 176, 256, 336].map((x) => (
            <rect key={x} x={x} y="233" width="46" height="7" rx="3" />
          ))}
        </g>
        {/* Rumput tepi jalan */}
        <rect x="0" y="182" width="400" height="8" rx="4" fill="#a8db78" />
      </>
    );
  }

  if (id === 'rumah') {
    // Dalam rumah: lantai kayu + perabot rendah. Semua perabot menempel di
    // garis lantai (y=150) supaya tak ada yang mengambang.
    return (
      <>
        {/* Dinding bawah + lis */}
        <rect x="0" y="0" width="400" height="150" fill="#f7e7cf" />
        {/* Meja rendah dengan buku */}
        <g>
          <rect x="26" y="104" width="104" height="12" rx="5" fill="#e0b98c" />
          <rect x="36" y="116" width="10" height="34" rx="4" fill="#c98f5f" />
          <rect x="110" y="116" width="10" height="34" rx="4" fill="#c98f5f" />
          <rect x="50" y="92" width="34" height="12" rx="3" fill="#ef7d6b" />
          <rect x="56" y="84" width="34" height="10" rx="3" fill="#7fa3d8" />
        </g>
        {/* Lemari kecil + vas berbunga */}
        <g>
          <rect x="286" y="74" width="90" height="76" rx="8" fill="#e0b98c" />
          <rect x="296" y="88" width="70" height="24" rx="5" fill="#f2dcbe" />
          <rect x="296" y="118" width="70" height="24" rx="5" fill="#f2dcbe" />
          <ellipse cx="331" cy="66" rx="16" ry="10" fill="#a9d8ef" />
          <path d="M320 66 q11 -30 22 0 Z" fill={LEAF} />
          <circle cx="331" cy="42" r="8" fill="#ff9fb2" />
        </g>
        <rect x="0" y="144" width="400" height="12" fill="#e6d3b8" />
        {/* Lantai kayu */}
        <rect x="0" y="156" width="400" height="104" fill="#e8c9a0" />
        <g stroke="#d9b489" strokeWidth="4" strokeLinecap="round">
          <path d="M0 186 H400" />
          <path d="M0 216 H400" />
          <path d="M0 246 H400" />
        </g>
        {/* Karpet */}
        <ellipse cx="200" cy="222" rx="150" ry="42" fill="#f6b9a6" />
        <ellipse cx="200" cy="222" rx="118" ry="30" fill="#ffd9c9" />
      </>
    );
  }

  if (id === 'laut') {
    return (
      <>
        {/* Laut sampai cakrawala */}
        <rect x="0" y="96" width="400" height="102" fill="#7ec8e3" />
        <rect x="0" y="96" width="400" height="26" fill="#5fb3d4" />
        <g stroke="#e6f7ff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9">
          <path d="M28 140 q18 -8 36 0" />
          <path d="M132 158 q18 -8 36 0" />
          <path d="M244 138 q18 -8 36 0" />
          <path d="M320 162 q18 -8 36 0" />
        </g>
        {/* Perahu kecil di kejauhan */}
        <g transform="translate(268 120)">
          <path d="M-22 0 H22 L14 12 H-14 Z" fill="#e0805f" />
          <path d="M0 -26 L16 -4 H0 Z" fill="#ffffff" />
          <rect x="-2" y="-28" width="4" height="26" fill="#b3835a" />
        </g>
        {/* Buih tepi pantai */}
        <path d="M0 198 Q100 186 200 198 Q300 210 400 194 V214 Q300 226 200 214 Q100 202 0 214 Z" fill="#dff4ff" />
        {/* Pasir */}
        <path d="M0 212 Q100 200 200 212 Q300 224 400 208 V260 H0 Z" fill="#f4e0b8" />
        {/* Pohon kelapa */}
        <g transform="translate(46 250)">
          <path d="M0 0 q-10 -44 6 -76" stroke="#b3835a" strokeWidth="13" strokeLinecap="round" fill="none" />
          <g fill={LEAF}>
            <ellipse cx="-22" cy="-80" rx="28" ry="11" transform="rotate(-18 -22 -80)" />
            <ellipse cx="30" cy="-84" rx="28" ry="11" transform="rotate(14 30 -84)" />
            <ellipse cx="4" cy="-96" rx="26" ry="11" />
          </g>
          <circle cx="6" cy="-74" r="7" fill="#8a5a3b" />
        </g>
        {/* Kerang & bintang laut */}
        <g>
          <ellipse cx="212" cy="242" rx="12" ry="9" fill="#ffd9c9" />
          <path d="M300 236 l5 11 12 1 -9 8 3 12 -11 -7 -11 7 3 -12 -9 -8 12 -1 Z" fill="#f6a08a" />
        </g>
      </>
    );
  }

  if (id === 'gunung') {
    return (
      <>
        {/* Punggungan berlapis — makin dekat makin pekat warnanya */}
        <path d="M-20 150 L70 40 L160 150 Z" fill="#b7cfe0" />
        <path d="M60 150 L170 24 L286 150 Z" fill="#9dbdd4" />
        <path d="M240 150 L330 46 L420 150 Z" fill="#b7cfe0" />
        <path d="M170 24 L200 60 L140 60 Z" fill="#ffffff" />
        <path d="M330 46 L352 74 L308 74 Z" fill="#ffffff" />
        {/* Kaki gunung */}
        <path d="M0 138 Q100 118 200 136 Q300 152 400 130 V260 H0 Z" fill="#bfe3a8" />
        {/* Pohon cemara */}
        <g fill="#4f9a55">
          {[
            [40, 172, 1],
            [96, 164, 0.8],
            [318, 168, 0.9],
            [372, 176, 1.05],
          ].map(([x, y, s]) => (
            <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${s})`}>
              <path d="M0 -74 L22 -30 H-22 Z" />
              <path d="M0 -50 L28 -4 H-28 Z" />
              <rect x="-6" y="-6" width="12" height="18" rx="3" fill={TRUNK} />
            </g>
          ))}
        </g>
        {/* Padang di kaki gunung + jalan setapak */}
        <path d="M0 176 Q110 162 230 178 Q320 188 400 172 V260 H0 Z" fill="#a8db78" />
        <path d="M186 260 Q200 216 236 186 L268 190 Q214 222 214 260 Z" fill="#e8d5b0" />
        <path d="M0 218 Q120 206 250 220 Q330 226 400 214 V260 H0 Z" fill="#8ed274" opacity="0.75" />
        <Bush x={92} y={244} s={0.85} />
        <Bush x={330} y={250} s={0.95} />
      </>
    );
  }

  if (id === 'malam') {
    // Malam di luar rumah: bukit gelap-lembut, pohon, kunang-kunang.
    return (
      <>
        <path d="M0 128 Q80 96 170 122 Q260 148 400 112 V260 H0 Z" fill="#9db9c9" />
        <path d="M0 166 Q110 146 230 168 Q320 182 400 158 V260 H0 Z" fill="#7fa08f" />
        <g>
          <Tree x={44} y={196} s={0.9} fill="#4f7a5c" />
          <Tree x={352} y={202} s={1} fill="#4f7a5c" />
          <Tree x={196} y={182} s={0.6} fill="#5d8a68" />
        </g>
        <path d="M0 212 Q120 198 250 212 Q330 219 400 206 V260 H0 Z" fill="#6d9280" />
        {/* Kunang-kunang */}
        <g fill="#fff3b0">
          {[
            [118, 200, 5],
            [162, 226, 4],
            [244, 208, 5],
            [292, 236, 4],
            [82, 240, 4],
          ].map(([x, y, r]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r={r + 5} opacity="0.35" />
              <circle cx={x} cy={y} r={r} />
            </g>
          ))}
        </g>
      </>
    );
  }

  // sawah
  return (
    <>
      {/* Gunung — pemandangan sawah Indonesia yang paling dikenal anak */}
      <path d="M0 130 L86 52 L150 130 Z" fill="#a9cfc0" />
      <path d="M110 130 L206 44 L300 130 Z" fill="#93c3b4" />
      <path d="M86 52 L110 74 L62 74 Z" fill="#eaf6f2" />
      <path d="M206 44 L232 72 L180 72 Z" fill="#eaf6f2" />
      {/* Petak sawah bertingkat */}
      <path d="M0 126 Q120 112 260 126 Q330 132 400 120 V260 H0 Z" fill="#cbe8a0" />
      <path d="M0 158 Q140 144 270 158 Q340 164 400 152 V260 H0 Z" fill="#a8db78" />
      <path d="M0 196 Q130 182 260 196 Q340 202 400 190 V260 H0 Z" fill="#8ed274" />
      {/* Genangan air di petak — kilau tipis, bukan biru pekat */}
      <g stroke="#e8f9ff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.75">
        <path d="M46 176 q26 -6 52 0" />
        <path d="M228 178 q26 -6 52 0" />
        <path d="M120 142 q22 -5 44 0" />
      </g>
      {/* Batang padi di barisan depan */}
      <g stroke="#6cbb5c" strokeWidth="4" strokeLinecap="round" fill="none">
        {[26, 74, 122, 170, 218, 266, 314, 362].map((x) => (
          <g key={x}>
            <path d={`M${x} 250 q-6 -22 -2 -34`} />
            <path d={`M${x + 10} 252 q6 -22 2 -36`} />
          </g>
        ))}
      </g>
      <g fill="#f2d06b">
        {[26, 122, 218, 314].map((x) => (
          <ellipse key={x} cx={x - 2} cy="214" rx="6" ry="9" />
        ))}
      </g>
    </>
  );
}

/**
 * Latar layar penuh untuk halaman cerita. Dipasang `position: fixed` di
 * belakang isi layar (lihat `scene.css`), jadi tidak ikut menghitung tinggi
 * konten dan tak pernah membuat layar bisa di-scroll.
 */
export default function Scene({ id }: { id: SceneId }) {
  return (
    <div className={`scene scene--${id}`} data-scene={id} aria-hidden>
      <svg
        className="scene__band scene__band--top"
        viewBox="0 0 400 140"
        preserveAspectRatio="xMidYMin slice"
      >
        <TopBand id={id} />
      </svg>
      <svg
        className="scene__band scene__band--bottom"
        viewBox="0 0 400 260"
        preserveAspectRatio="xMidYMax slice"
      >
        <BottomBand id={id} />
      </svg>
    </div>
  );
}
