import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface LayoutProps {
  title?: string;
  backTo?: string;
  children: ReactNode;
}

export default function Layout({ title, backTo, children }: LayoutProps) {
  return (
    <div>
      <header className="app-header">
        {backTo ? (
          <Link className="btn secondary small" to={backTo} aria-label="Kembali">
            ⬅️ Kembali
          </Link>
        ) : (
          <span style={{ fontSize: '2rem' }}>🌈</span>
        )}
        {title && <h1 style={{ flex: 1, textAlign: 'center', margin: 0 }}>{title}</h1>}
        <Link className="btn secondary small" to="/orang-tua" aria-label="Area orang tua">
          👨‍👩‍👧 Orang Tua
        </Link>
      </header>
      {children}
    </div>
  );
}
