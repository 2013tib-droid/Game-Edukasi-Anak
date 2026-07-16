import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="page">
      <h1 className="page-title">Halaman tidak ditemukan 🙈</h1>
      <Link to="/" className="btn btn-primary">Kembali ke Beranda</Link>
    </section>
  );
}
