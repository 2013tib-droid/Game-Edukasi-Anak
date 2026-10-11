import { useState } from 'react';
import { Link } from 'react-router-dom';
import groupsData from '@/data/groups.json';
import { PaidOrderCard } from '@/auth/PaidOrders';
import type { RedeemResult } from '@/auth/entitlements';

/**
 * SIMULASI "sudah bayar di Mayar" — hanya terdaftar di dev server & build
 * penguji/development (`TEST_TOGGLE_ALLOWED`, lihat App.tsx).
 *
 * Memperlihatkan dua jalan yang dilihat pembeli sesudah membayar: email berisi
 * kode, dan kartu "Pembayaran diterima" + tombol "Aktifkan Sekarang" (kartu
 * yang SAMA dengan di lonceng & /aktivasi). NOL panggilan server: tak ada
 * pesanan, kode, atau akun sungguhan yang tersentuh — tombolnya memakai
 * pemanggil palsu sesuai skenario yang dipilih.
 */

type Scenario = 'ok' | 'offline' | 'used';

const SCENARIOS: { id: Scenario; label: string }[] = [
  { id: 'ok', label: 'Berhasil' },
  { id: 'offline', label: 'Sinyal putus' },
  { id: 'used', label: 'Sudah dipakai' },
];

const SELLABLE = groupsData.groups.filter((g) => !('draft' in g && g.draft));

function fakeClaim(scenario: Scenario, group: string) {
  return (_orderId: string) =>
    new Promise<RedeemResult>((resolve, reject) => {
      setTimeout(() => {
        if (scenario === 'ok') resolve({ group, already: false });
        else if (scenario === 'offline') reject(new Error(''));
        else reject(new Error('Pesanan ini sudah diaktifkan sebelumnya.'));
      }, 900);
    });
}

export default function SimulasiBayarPage() {
  const [group, setGroup] = useState(SELLABLE[0]?.id ?? 'tk');
  const [scenario, setScenario] = useState<Scenario>('ok');
  const [nonce, setNonce] = useState(0);
  const title = SELLABLE.find((g) => g.id === group)?.title ?? group;

  const chip = (on: boolean): React.CSSProperties => ({
    minHeight: 40,
    padding: '0 14px',
    borderRadius: 999,
    border: on ? '2px solid #3a2e20' : '1.5px solid rgba(58,46,32,0.25)',
    background: on ? '#ffe9a8' : '#fff',
    fontWeight: 800,
    fontSize: 14,
    color: '#3a2e20',
  });

  return (
    <div style={{ maxWidth: 440, margin: '0 auto', padding: '16px 16px 40px', color: '#3a2e20' }}>
      <Link className="back-link" to="/portal">
        ⬅️ Portal
      </Link>
      <h1 style={{ fontSize: 22, margin: '14px 0 4px' }}>🧪 Simulasi sudah bayar</h1>
      <p style={{ fontSize: 14, margin: '0 0 14px', opacity: 0.75 }}>
        Hanya di development. Tidak ada pesanan, kode, atau akun sungguhan yang tersentuh.
      </p>

      <p style={{ fontWeight: 800, fontSize: 14, margin: '0 0 6px' }}>Kelompok yang dibeli</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {SELLABLE.map((g) => (
          <button
            key={g.id}
            type="button"
            style={chip(g.id === group)}
            onClick={() => {
              setGroup(g.id);
              setNonce((n) => n + 1);
            }}
          >
            {g.title}
          </button>
        ))}
      </div>

      <p style={{ fontWeight: 800, fontSize: 14, margin: '0 0 6px' }}>Hasil saat ditekan</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            style={chip(s.id === scenario)}
            onClick={() => {
              setScenario(s.id);
              setNonce((n) => n + 1);
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <PaidOrderCard
        key={`${group}-${scenario}-${nonce}`}
        order={{ orderId: 'simulasi', group, paidAt: Date.now() }}
        claim={fakeClaim(scenario, group)}
      />

      <button
        type="button"
        className="back-link"
        style={{ marginTop: 12, border: 'none', cursor: 'pointer' }}
        onClick={() => setNonce((n) => n + 1)}
      >
        🔄 Ulangi
      </button>

      <p style={{ fontWeight: 800, fontSize: 14, margin: '22px 0 6px' }}>
        Email yang diterima pembeli (contoh)
      </p>
      <div
        style={{
          border: '1.5px dashed rgba(58,46,32,0.3)',
          borderRadius: 16,
          padding: '12px 14px',
          background: '#fff',
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        <div style={{ opacity: 0.6, fontSize: 12.5 }}>Dari: petualangsmart@gmail.com</div>
        <p style={{ margin: '6px 0' }}>
          Terima kasih! Kode aktivasi <b>{title}</b>:
        </p>
        <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 3 }}>K7P-M4X</div>
        <p style={{ margin: '6px 0 0', opacity: 0.7, fontSize: 12.5 }}>
          (kode contoh — tidak bisa ditukar)
        </p>
      </div>
    </div>
  );
}
