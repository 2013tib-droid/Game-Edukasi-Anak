/**
 * Owner contact details for the feedback channel (kritik & saran).
 *
 * Anything left as an empty string is simply hidden in the UI, so a build can
 * never show a dead link — the feedback section disappears instead.
 *
 * Both values are PUBLIC once deployed: the number and address sit in the
 * shipped JS and anyone can read them.
 */
export const contact = {
  /** WhatsApp number in international format, digits only: 62 + number without the leading 0. */
  whatsapp: '6285117378557',
  /** Support inbox. Temporary owner address — swap for a dedicated one later. */
  email: '2013.tib@gmail.com',
};

/** Pre-filled first message, so the parent does not face an empty chat box. */
const WA_TEXT =
  'Halo! Saya mau memberi masukan untuk Petualangan Pintar.\n\nMasukan saya:';

const MAIL_SUBJECT = 'Kritik & saran — Petualangan Pintar';
const MAIL_BODY =
  'Halo!\n\nMasukan saya:\n\n\n' +
  '(Kalau ada tampilan yang aneh, lampirkan screenshot ya — sangat membantu.)\n\n' +
  'Merek/tipe HP:\nBrowser:';

/** Chat link, or null when no number is configured. */
export function whatsappUrl(): string | null {
  const digits = contact.whatsapp.replace(/\D/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(WA_TEXT)}`;
}

/** Mail link, or null when no address is configured. */
export function emailUrl(): string | null {
  if (!contact.email) return null;
  const q = `subject=${encodeURIComponent(MAIL_SUBJECT)}&body=${encodeURIComponent(MAIL_BODY)}`;
  return `mailto:${contact.email}?${q}`;
}
