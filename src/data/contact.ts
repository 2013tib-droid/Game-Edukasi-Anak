/**
 * Owner contact details for the feedback channel (kritik & saran).
 *
 * FILL THESE IN before launch. Anything left as an empty string is simply
 * hidden in the UI, so shipping with blanks is safe — the feedback section
 * disappears rather than rendering a dead link.
 *
 * Use a WhatsApp Business number, not a personal one: this link is public.
 */
export const contact = {
  /** WhatsApp number in international format, digits only: 62 + number without the leading 0. */
  whatsapp: '',
  /** Support inbox, e.g. 'halo@petualanganpintar.id'. */
  email: '',
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
