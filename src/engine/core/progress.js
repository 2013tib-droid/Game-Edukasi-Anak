import { getFirebase, isFirebaseConfigured } from '../../app/firebase.js';

// Stars per level are kept in localStorage (works offline / demo mode) and
// mirrored to users/{uid}/progress/{gameId} when a user is signed in.

const KEY_PREFIX = 'progress:';

// Total stars across ALL games on this device — drives the evolving mascot.
export function totalStars() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key?.startsWith(KEY_PREFIX)) continue;
    try {
      const { stars } = JSON.parse(localStorage.getItem(key)) ?? {};
      total += Object.values(stars ?? {}).reduce((a, b) => a + b, 0);
    } catch {
      // ignore corrupt entries
    }
  }
  return total;
}

export function loadProgress(gameId) {
  try {
    return JSON.parse(localStorage.getItem(KEY_PREFIX + gameId)) ?? { stars: {} };
  } catch {
    return { stars: {} };
  }
}

export function saveLevelStars(gameId, levelId, stars, user) {
  const progress = loadProgress(gameId);
  progress.stars[levelId] = Math.max(progress.stars[levelId] ?? 0, stars);
  try {
    localStorage.setItem(KEY_PREFIX + gameId, JSON.stringify(progress));
  } catch {
    // storage full/blocked: keep playing, progress just won't persist
  }

  if (isFirebaseConfigured && user) {
    getFirebase()
      .then(({ db, firestoreMod }) =>
        firestoreMod.setDoc(
          firestoreMod.doc(db, 'users', user.uid, 'progress', gameId),
          { stars: progress.stars, updatedAt: firestoreMod.serverTimestamp() },
          { merge: true }
        )
      )
      .catch(() => {
        // offline or rules issue: local copy is still the source for the UI
      });
  }

  return progress;
}
