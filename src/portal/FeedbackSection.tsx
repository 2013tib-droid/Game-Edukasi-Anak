import { emailUrl, whatsappUrl } from '@/data/contact';
import './feedback.css';

/**
 * Feedback channel (kritik & saran) — parent-facing only.
 *
 * WhatsApp leads because that is where Indonesian parents already are; email
 * follows for longer messages and screenshots. Both are plain links: no
 * backend, nothing stored, nothing to moderate.
 *
 * Renders nothing when no contact is configured in src/data/contact.ts, so a
 * half-configured build never shows a dead link. Keep this OFF kid screens —
 * the child area must stay free of outbound links.
 */
export default function FeedbackSection() {
  const wa = whatsappUrl();
  const mail = emailUrl();
  if (!wa && !mail) return null;

  return (
    <section className="feedback">
      <h2 className="fb-title">Ada kritik atau saran?</h2>
      <p className="fb-lead">
        Dibuat oleh satu orang, jadi masukan Anda benar-benar dibaca dan sering
        langsung dikerjakan. Ada bug, soal yang terasa terlalu sulit, atau ide game
        baru? Kabari ya!
      </p>

      <div className="fb-actions">
        {wa && (
          <a className="fb-btn fb-btn--wa" href={wa} target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.9.53 3.68 1.45 5.2L2 22l5.1-1.6a9.8 9.8 0 0 0 4.94 1.32c5.44 0 9.84-4.4 9.84-9.84S17.48 2 12.04 2zm5.7 13.9c-.24.68-1.4 1.3-1.94 1.34-.5.05-.98.22-3.3-.7-2.78-1.1-4.54-3.94-4.68-4.12-.13-.18-1.12-1.5-1.12-2.85s.7-2.02.96-2.3c.25-.27.55-.34.73-.34h.52c.17 0 .4-.06.62.48.24.57.8 1.98.87 2.12.07.14.12.3.02.48-.1.18-.15.3-.3.46l-.43.5c-.14.14-.29.3-.12.58.17.29.75 1.23 1.6 2 1.11.98 2.04 1.29 2.33 1.43.29.15.46.12.63-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.09 1.67.79 1.96.93.29.15.48.22.55.34.07.12.07.68-.17 1.35z" />
            </svg>
            Chat WhatsApp
          </a>
        )}
        {mail && (
          <a className="fb-btn fb-btn--mail" href={mail}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
              <path d="m3.5 7 8.5 6 8.5-6" />
            </svg>
            Kirim Email
          </a>
        )}
      </div>

      <p className="fb-note">Balasan biasanya dalam 1–2 hari kerja.</p>
    </section>
  );
}
