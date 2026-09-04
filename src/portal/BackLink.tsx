/**
 * Versi <Link> dari tombol Kembali — ikon, label & gaya yang sama persis
 * dengan BackButton (engine). Dipisah supaya engine tetap bebas react-router.
 */
import { Link } from 'react-router-dom';
import { BACK_LABEL, BackArrow } from '@/engine/ui/BackButton';

export default function BackLink({ to }: { to: string }) {
  return (
    <Link to={to} className="btn back-btn">
      <BackArrow />
      <span className="back-btn__text">{BACK_LABEL}</span>
    </Link>
  );
}
