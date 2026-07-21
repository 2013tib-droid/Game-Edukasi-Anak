import { Outlet } from 'react-router-dom';

// Shared shell for all pages. Header/nav intentionally minimal for now;
// the kid-facing area must stay free of external links and purchases.
export default function Layout() {
  return (
    <main>
      <Outlet />
    </main>
  );
}
