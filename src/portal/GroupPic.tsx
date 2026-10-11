import { useState } from 'react';

/**
 * Group icon: the owner's art (public/assets/groups/<pic>.webp), falling back
 * to the emoji if the file is missing — same contract as `MascotPic`. Groups
 * whose art is not drawn yet carry no `pic`, so they render the emoji without
 * ever requesting a file that would 404.
 *
 * Shared by the portal cards (`HomePage`) and the group page header
 * (`GroupPage`) so the two screens can never show different icons. Subject
 * icons (`SUBJECT_STYLE.pic`, folder `assets/subjects/`) use the same
 * contract.
 *
 * The picture is sized by HEIGHT with `width: auto`: the art is cropped tight
 * to the drawing, so each file has its own aspect ratio and a fixed box would
 * squash one of them.
 */
export default function GroupPic({
  pic,
  emoji,
  height = 88,
  emojiSize = 48,
  dir = 'groups',
}: {
  pic?: string;
  /** Folder under public/assets/ — `subjects` for the subject icons. */
  dir?: 'groups' | 'subjects';
  emoji: string;
  height?: number;
  emojiSize?: number;
}) {
  const [failed, setFailed] = useState(false);
  if (!pic || failed) return <span style={{ fontSize: emojiSize }}>{emoji}</span>;
  return (
    <img
      src={`${import.meta.env.BASE_URL}assets/${dir}/${pic}.webp`}
      alt=""
      style={{ height, width: 'auto' }}
      onError={() => setFailed(true)}
    />
  );
}
