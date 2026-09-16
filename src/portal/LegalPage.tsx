import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ArrowLeftIcon } from '@/app/icons';
import { emailUrl, whatsappUrl } from '@/data/contact';
import './legal.css';

/**
 * Kerangka bersama halaman hukum (`/privasi`, `/ketentuan`).
 *
 * INI HALAMAN ORANG TUA. Jangan pernah menautkannya dari area anak
 * (`/portal`, `/kelompok/*`, `/game/*`) — standar UX anak melarang link
 * keluar dari sana. Kembalinya karena itu ke `/` (landing, tempat orang tua
 * datang), bukan ke `/portal`.
 *
 * Gayanya sengaja rata KIRI dan teksnya jauh lebih kecil dari layar anak:
 * ini bacaan panjang untuk orang dewasa, satu-satunya di app ini selain FAQ
 * landing (yang juga rata kiri, dengan alasan yang sama).
 */
export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  /** Tanggal berlakunya, ditulis apa adanya. */
  updated: string;
  children: ReactNode;
}) {
  const wa = whatsappUrl();
  const mail = emailUrl();

  return (
    <div className="page legal">
      <Link className="back-link" to="/">
        <ArrowLeftIcon /> Kembali
      </Link>

      <h1 className="legal-title">{title}</h1>
      <p className="legal-updated">Berlaku sejak {updated}</p>

      {children}

      <section className="legal-contact">
        <h2>Menghubungi kami</h2>
        <p>
          Pertanyaan soal halaman ini, permintaan menghapus akun, atau permintaan pengembalian
          dana dikirim lewat:
        </p>
        <ul>
          {wa && (
            <li>
              WhatsApp:{' '}
              <a href={wa} target="_blank" rel="noopener noreferrer">
                chat di WhatsApp
              </a>
            </li>
          )}
          {mail && (
            <li>
              Email: <a href={mail}>{mail.replace(/^mailto:/, '').split('?')[0]}</a>
            </li>
          )}
        </ul>
      </section>

      <p className="legal-note">
        <strong>Catatan:</strong> halaman ini ditulis untuk dibaca orang tua, bukan oleh ahli
        hukum, dan <strong>bukan nasihat hukum</strong>. Isinya menggambarkan cara aplikasi ini
        benar-benar bekerja sejauh yang kami ketahui. Sebelum dipakai untuk berjualan, sebaiknya
        dibaca ulang — dan kalau perlu diperiksa penasihat hukum — oleh pemilik usaha.
      </p>

      <nav className="legal-nav">
        <Link to="/privasi">Kebijakan Privasi</Link>
        <Link to="/ketentuan">Syarat &amp; Ketentuan</Link>
        <Link to="/">Beranda</Link>
      </nav>
    </div>
  );
}
