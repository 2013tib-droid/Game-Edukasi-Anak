/**
 * Read/unread state for announcements — localStorage only (no account needed,
 * works for visitors who have not logged in yet).
 *
 * We store the ids that have been READ rather than "last seen date", so an
 * older entry added later still shows up as unread.
 *
 * Every function takes the list the reader may actually SEE (see
 * `announcementsFor`). Marking must never touch an entry that was hidden,
 * otherwise a buyers-only item would be silently marked read while logged out
 * and would never appear as new after signing in.
 */
import { announcements, type Announcement } from '@/data/announcements';

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

/** Ids in `visible` that are still unread. */
export function getUnreadIds(visible: Announcement[]): string[] {
  const read = new Set(getReadIds());
  return visible.filter((a) => !read.has(a.id)).map((a) => a.id);
}

/** Marks the visible announcements as read, leaving hidden ones untouched. */
export function markAllRead(visible: Announcement[]): void {
  try {
    const read = new Set(getReadIds());
    for (const a of visible) read.add(a.id);
    // Drop ids that no longer exist at all, so the key cannot grow forever.
    const known = new Set(announcements.map((a) => a.id));
    localStorage.setItem(KEY, JSON.stringify([...read].filter((id) => known.has(id))));
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
