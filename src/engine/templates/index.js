import { lazy } from 'react';

// Each template is lazy-loaded so a game only downloads the mechanics it uses.
export const TEMPLATES = {
  'tap-answer': lazy(() => import('./TapAnswer.jsx')),
  'count-tap': lazy(() => import('./CountTap.jsx')),
  'memory': lazy(() => import('./Memory.jsx')),
  'drag-drop': lazy(() => import('./DragDrop.jsx')),
  'tracing': lazy(() => import('./Tracing.jsx')),
  'story': lazy(() => import('./StoryChoice.jsx')),
};
