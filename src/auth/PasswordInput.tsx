import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from '@/app/icons';

/**
 * Kolom kata sandi dengan tombol mata untuk melihat hurufnya. Dipakai layar
 * Masuk DAN Daftar — satu komponen, supaya kedua layar tak pernah berbeda.
 * Mengetik kata sandi di HP gampang salah, dan orang tua yang tak bisa
 * memeriksa ketikannya baru tahu salah saat akunnya tak bisa dibuka.
 */
export default function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: 'current-password' | 'new-password';
}) {
  const [shown, setShown] = useState(false);
  return (
    <div className="pw-field">
      <input
        className="input"
        type={shown ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        required
      />
      <button
        type="button"
        className="pw-toggle"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
        aria-pressed={shown}
      >
        {shown ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}
