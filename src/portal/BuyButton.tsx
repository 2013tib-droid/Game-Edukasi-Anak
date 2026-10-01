import { CheckBadgeIcon } from '@/app/icons';
import { buyUrl, type SaleGroup } from '@/data/purchase';
import { countVisit } from '@/portal/stats';

/**
 * Tombol "Beli" di kartu harga landing → checkout Mayar.
 *
 * Tidak dirender kalau link kelompok itu belum diisi di `src/data/purchase.ts`.
 * Dibuka di tab baru supaya landing (dan app yang sudah termuat) tetap ada
 * saat orang tua kembali untuk memasukkan kodenya.
 *
 * Kalau akun yang masuk SUDAH memiliki kelompok ini (`owned`), tombol beli
 * diganti tanda "Sudah aktif" (tanpa tombol lain, keputusan pemilik) — menawari
 * orang tua membayar dua kali untuk barang yang sama terbaca seperti
 * aktivasinya tidak tersimpan. Ini cuma tampilan (dari `useOwnedGroups`).
 */
export function BuyButton({ group, owned = false }: { group: SaleGroup; owned?: boolean }) {
  if (owned) {
    return (
      <div className="pc-owned">
        <span className="pc-owned__icon">
          <CheckBadgeIcon />
        </span>
        Sudah aktif
      </div>
    );
  }
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
