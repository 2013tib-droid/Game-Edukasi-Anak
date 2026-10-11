import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import groupsData from '@/data/groups.json';
import { useAuth } from '@/auth/AuthContext';
import { isFirebaseConfigured } from '@/auth/firebase';
import {
  claimPaidOrder,
  errorMessage,
  fetchPaidOrders,
  type PaidOrder,
  type RedeemResult,
} from '@/auth/entitlements';
import './paid-orders.css';

/**
 * "Pembayaran diterima" — pesanan Mayar yang bisa diaktifkan tanpa mengetik
 * kode. Dipakai lonceng notifikasi DAN halaman /aktivasi, jadi dua tempat itu
 * tak bisa berbeda isi.
 *
 * Pencocokannya (email Mayar = email akun, wajib terverifikasi) seluruhnya di
 * Cloud Function `myPaidOrders`/`claimPaidOrder`. Kodenya tak pernah sampai ke
 * HP lewat jalur ini.
 */

function groupTitle(id: string): string {
  return groupsData.groups.find((g) => g.id === id)?.title ?? id;
}

/**
 * Jawaban disimpan per uid selama halaman terbuka: lonceng ada di landing DAN
 * portal, dan tanpa ini tiap perpindahan halaman memanggil function lagi.
 * Dibuang sesudah mengaktifkan, supaya kartunya tidak muncul lagi di halaman
 * berikutnya.
 */
const cache = new Map<string, Promise<PaidOrder[]>>();

export function usePaidOrders(): { orders: PaidOrder[] } {
  const { user, emailVerified } = useAuth();
  const [orders, setOrders] = useState<PaidOrder[]>([]);
  const uid = user?.uid ?? null;

  useEffect(() => {
    // Belum terverifikasi → server pasti menjawab kosong; jangan memanggilnya.
    if (!isFirebaseConfigured || !uid || !emailVerified) {
      setOrders([]);
      return;
    }
    let alive = true;
    let pending = cache.get(uid);
    if (!pending) {
      // Kegagalan (sinyal putus, function belum di-deploy) ditelan: ini
      // kemudahan tambahan, kode di email tetap jalan.
      pending = fetchPaidOrders()
        .then((r) => r.orders)
        .catch(() => {
          cache.delete(uid);
          return [];
        });
      cache.set(uid, pending);
    }
    void pending.then((list) => {
      if (alive) setOrders(list);
    });
    return () => {
      alive = false;
    };
  }, [uid, emailVerified]);

  return { orders };
}

/** Piala berwajah dari layar "Selamat!" (satu aset, dua tempat); 🎉 cadangan. */
function CheerPic() {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className="paid__pic paid__pic--emoji" aria-hidden="true">🎉</span>;
  return (
    <img
      className="paid__pic"
      src={`${import.meta.env.BASE_URL}assets/ui/selamat.webp`}
      alt=""
      onError={() => setFailed(true)}
    />
  );
}

/**
 * Satu kartu pesanan. `onDone` dipanggil sesudah berhasil; kalau tidak diberi,
 * kartunya sendiri yang menampilkan "Sudah aktif" + tombol main (lonceng).
 */
export function PaidOrderCard({
  order,
  onDone,
  onClaimed,
  claim = claimPaidOrder,
}: {
  order: PaidOrder;
  onDone?: (result: RedeemResult) => void;
  onClaimed?: () => void;
  /** Pengganti pemanggil server — hanya untuk halaman simulasi (build penguji). */
  claim?: (orderId: string) => Promise<RedeemResult>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<RedeemResult | null>(null);

  async function activate() {
    setError(null);
    setBusy(true);
    try {
      const result = await claim(order.orderId);
      cache.clear();
      onClaimed?.();
      if (onDone) onDone(result);
      else setDone(result);
    } catch (e) {
      setError(errorMessage(e, 'Gagal mengaktifkan. Periksa koneksi internetnya ya.'));
    } finally {
      setBusy(false);
    }
  }

  const title = groupTitle(order.group);

  if (done) {
    return (
      <div className="paid paid--done">
        <p className="paid__title">✅ {title} sudah aktif!</p>
        <Link className="paid__btn" to={`/kelompok/${done.group}`}>
          🎮 Mulai Main
        </Link>
      </div>
    );
  }

  return (
    <div className="paid">
      <div className="paid__head">
        <CheerPic />
        <div>
          <p className="paid__title">Pembayaran diterima</p>
          <p className="paid__group">{title}</p>
        </div>
      </div>
      <p className="paid__body">
        Silakan tekan tombol “Aktifkan Sekarang” untuk membuka semua game {title}.
      </p>
      {error && (
        <p className="paid__error" role="alert">
          {error}
        </p>
      )}
      <button className="paid__btn" type="button" onClick={activate} disabled={busy}>
        {busy ? 'Mengaktifkan…' : 'Aktifkan Sekarang'}
      </button>
    </div>
  );
}
