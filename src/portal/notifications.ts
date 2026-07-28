/**
 * Read/unread state for announcements — localStorage only (no account needed,
 * works for visitors who have not logged in yet).
 *
 * We store the ids that have been READ rather than "last seen date", so an
 * older entry added later still shows up as unread.
 */
import { announcements } from '@/data/announcements';

const KEY = 'pp_notif_read_v1';

function safeParse(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export function getReadIds(): string[] {
  try {
    return safeParse(localStorage.getItem(KEY));
  } catch {
    return [];
  }
}

/** Ids that exist in the current announcement list and are still unread. */
export function getUnreadIds(): string[] {
  const read = new Set(getReadIds());
  return announcements.filter((a) => !read.has(a.id)).map((a) => a.id);
}

export function getUnreadCount(): number {
  return getUnreadIds().length;
}

/** Marks every current announcement as read (called when the panel opens). */
export function markAllRead(): void {
  try {
    // Keep only ids that still exist, so the key does not grow forever.
    const ids = announcements.map((a) => a.id);
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* private mode / storage full — badge simply reappears next visit */
  }
}

/** "2026-07-28" → "28 Jul 2026". Falls back to the raw string if unparsable. */
export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
