import GroupPic from '@/portal/GroupPic';
import './sign.css';

interface Props {
  group: { title: string; emoji: string; pic?: string };
  /** `h1` when the sign IS the page heading (daftar game tk/sd1). */
  as?: 'h1' | 'div';
}

/**
 * Nama kelompok sebagai PAPAN KAYU: kata kecil cokelat di atas, bagian
 * pentingnya besar jingga di bawah. Satu komponen untuk layar mapel
 * (sd2/sd3) DAN daftar game (tk/sd1, 2026-10-12) supaya keempat kelompok
 * terbaca satu keluarga.
 */
export default function SignTitle({ group, as = 'div' }: Props) {
  const [top, big] = splitTitle(group.title);
  const Tag = as;
  return (
    <Tag className="subj-sign" {...(as === 'div' ? { role: 'img' } : {})} aria-label={group.title}>
      <span className="subj-sign__pic" aria-hidden>
        <GroupPic pic={group.pic} emoji={group.emoji} height={58} emojiSize={40} />
      </span>
      <span className="subj-sign__text" aria-hidden>
        <span className="subj-sign__top">{top}</span>
        {big && (
          <span className="subj-sign__big">
            <span className="subj-sign__spark">✦</span>
            {big.replace(/ & /g, ' & ').replace(/ /g, ' ')}
            <span className="subj-sign__spark subj-sign__spark--b">✦</span>
          </span>
        )}
      </span>
    </Tag>
  );
}

/**
 * "SD Kelas 3 & 4" → ["SD Kelas", "3 & 4"]. Judul tanpa angka
 * ("Playgroup dan TK") dipecah di " dan " terakhir → ["Playgroup", "dan TK"].
 */
function splitTitle(title: string): [string, string | null] {
  const m = /^(.*?)\s*(\d.*)$/.exec(title);
  if (m && m[1]) return [m[1], m[2]];
  const i = title.lastIndexOf(' dan ');
  if (i > 0) return [title.slice(0, i), title.slice(i + 1)];
  return [title, null];
}
