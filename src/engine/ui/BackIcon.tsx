/**
 * Panah "Kembali" untuk layar anak.
 *
 * Menggantikan emoji ⬅️: emoji itu digambar tiap OS dengan gayanya sendiri
 * (di Android/Chrome jadi kotak biru mengkilap) sehingga bentrok dengan tombol
 * putih-cokelat kita. SVG ini ikut `currentColor` dan ukurannya dalam `em`,
 * jadi selalu sewarna dan seukuran teks tombolnya — baik di tombol besar
 * "Kembali" maupun tombol ikon kecil di topbar.
 */
export default function BackIcon({ size = '1.05em' }: { size?: number | string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ display: 'block', flex: 'none' }}
    >
      <path d="M20 12H6.6" />
      <path d="M12.6 5.6 6.2 12l6.4 6.4" />
    </svg>
  );
}
