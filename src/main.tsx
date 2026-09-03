import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/App';
import ErrorBoundary from '@/app/ErrorBoundary';
import '@/app/global.css';
import { migrateMergedMath, migrateMergedStories } from '@/engine/core/progress';

// Sebelum React menggambar apa pun: bintang "Cerita Nusantara" & "Tambah
// Tangkas" dipindahkan ke game gabungannya. Dijalankan di sini, bukan di
// dalam komponen, supaya tidak ikut berjalan dua kali oleh StrictMode dan
// supaya kartu game di beranda sudah membaca angka yang benar pada render
// pertama.
migrateMergedStories();
migrateMergedMath();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Outside <App> so it also catches errors thrown by the router itself. */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
