import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/App';
import ErrorBoundary from '@/app/ErrorBoundary';
import '@/app/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Outside <App> so it also catches errors thrown by the router itself. */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
