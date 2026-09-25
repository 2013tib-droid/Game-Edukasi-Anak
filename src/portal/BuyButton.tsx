import { buyUrl, type SaleGroup } from '@/data/purchase';
import { countVisit } from '@/portal/stats';

/**
 * Tombol "Beli" di kartu harga landing → checkout Mayar.
 *
 * Tidak dirender kalau link kelompok itu belum diisi di `src/data/purchase.ts`.
 * Dibuka di tab baru supaya landing (dan app yang sudah termuat) tetap ada
 * saat orang tua kembali untuk memasukkan kodenya.
 */
export function BuyButton({ group }: { group: SaleGroup }) {
  const url = buyUrl(group);
  if (!url) return null;
  return (
    <a
      className="pc-buy"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => countVisit(group === 'tk' ? 'landing_buy_tk' : 'landing_buy_sd1')}
    >
      Beli Sekarang
    </a>
  );
}
