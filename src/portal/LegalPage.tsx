import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@/app/icons';
import FeedbackSection from '@/portal/FeedbackSection';
import { privacyDoc, termsDoc, type LegalDoc } from '@/data/legal';
import './legal.css';

/**
 * Halaman teks panjang untuk ORANG TUA: Kebijakan Privasi & Syarat/Ketentuan.
 *
 * Satu komponen untuk dua dokumen — isinya murni data di `src/data/legal.ts`,
 * jadi menyunting teks tidak pernah menyentuh komponen ini.
 *
 * `kind` sengaja cuma nama dokumen, BUKAN objek dokumennya: kalau App.tsx yang
 * mengoper `privacyDoc`, seluruh teksnya ikut ke bundel awal yang diunduh
 * semua anak. Dengan nama, teksnya tetap di chunk halaman ini.
 *
 * JANGAN ditaut dari area anak (`/portal`, `/kelompok/*`, `/game/*`) —
 * standar UX anak melarang tautan keluar dari sana. Pintunya dari kaki
 * landing page saja.
 */
export default function LegalPage({ kind }: { kind: 'privasi' | 'ketentuan' }) {
  const doc: LegalDoc = kind === 'privasi' ? privacyDoc : termsDoc;

  // Pintu masuknya ada di KAKI landing page, dan react-router tidak mereset
  // posisi gulir — tanpa ini halaman baru terbuka dalam keadaan sudah
  // tergulir ke bawah, seolah judulnya hilang.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [kind]);

  return (
    <div className="legal">
      <Link className="back-link" to="/">
        <ArrowLeftIcon /> Beranda
      </Link>

      <article className="legal-doc">
        <h1 className="legal-title">{doc.title}</h1>
        <p className="legal-updated">Terakhir diperbarui: {doc.updated}</p>
        <p className="legal-lead">{doc.lead}</p>

        {doc.sections.map((sec) => (
          <section key={sec.h} className="legal-sec">
            <h2 className="legal-h">{sec.h}</h2>
            {sec.body.map((block, i) =>
              Array.isArray(block) ? (
                <ul key={i} className="legal-list">
                  {block.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p key={i} className="legal-p">
                  {block}
                </p>
              ),
            )}
          </section>
        ))}
      </article>

      <nav className="legal-nav">
        {kind === 'privasi' ? (
          <Link to="/ketentuan">Syarat &amp; Ketentuan</Link>
        ) : (
          <Link to="/privasi">Kebijakan Privasi</Link>
        )}
      </nav>

      <FeedbackSection />
    </div>
  );
}
