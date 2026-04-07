import { useLocation } from 'react-router-dom';
import ThemeToggleButton from './ThemeToggleButton';

const pageTitles = {
  '/app': 'Dashboard',
  '/app/products': 'Products',
  '/app/customers': 'Customers',
  '/app/pos': 'Sales',
  '/app/reports': 'Reports',
  '/app/settings': 'Settings',
  '/app/users': 'Users',
};

export default function Header({ user, onLogout, onOpenSidebar }) {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || 'StockDesk';

  return (
    <div className="app-topbar flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border px-4 py-3.5 sm:px-6 sm:py-4.5">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="app-btn-secondary rounded-lg border p-2 lg:hidden"
          aria-label="Open navigation"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
          </svg>
        </button>
        <div className="min-w-0">
          <p className="text-sm font-medium tracking-tight text-[var(--text-muted)]">Overview</p>
          <h1 className="truncate text-[1.65rem] font-semibold leading-tight tracking-tight text-[var(--text-primary)] sm:text-2xl">{pageTitle}</h1>
        </div>
      </div>
      <div className="flex w-full items-center justify-between gap-2.5 sm:w-auto sm:justify-end sm:gap-3">
        <ThemeToggleButton compact className="shrink-0" />
        <div className="hidden rounded-xl border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-2 text-right sm:block">
          <p className="text-sm font-medium text-[var(--text-primary)]">{user?.name || 'Cashier'}</p>
          <p className="text-xs text-[var(--text-muted)]">{user?.role || 'User'}</p>
        </div>
        <button onClick={onLogout} className="app-btn-primary rounded-lg px-4 py-2 text-sm font-medium transition">
          Logout
        </button>
      </div>
    </div>
  );
}
