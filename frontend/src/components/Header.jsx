import { useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

const pageTitles = {
  '/app': 'Dashboard',
  '/app/shops': 'Shops',
  '/app/products': 'Products',
  '/app/customers': 'Customers',
  '/app/pos': 'Sales',
  '/app/reports': 'Reports',
  '/app/settings': 'Settings',
  '/app/users': 'Users',
};

export default function Header({ onOpenSidebar, onToggleSidebar, sidebarCollapsed }) {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || 'StockDesk';

  return (
    <div className="app-topbar flex flex-wrap items-center justify-between gap-3 rounded-[1.35rem] border px-4 py-3 sm:px-5 sm:py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile hamburger */}
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
        {/* Desktop collapse toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          className="app-btn-secondary hidden rounded-lg border p-2 lg:flex"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            {sidebarCollapsed ? (
              <>
                <path d="M3 12h18" />
                <path d="M3 6h18" />
                <path d="M3 18h18" />
              </>
            ) : (
              <>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
              </>
            )}
          </svg>
        </button>
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--surface-secondary)] shadow-sm">
              <img src={logo} alt="StockDesk logo" className="h-8 w-8 object-contain" />
            </div>
            <span className="truncate text-base font-semibold tracking-tight text-[var(--text-primary)]">StockDesk</span>
          </div>
          <p className="text-[13px] font-medium tracking-tight text-[var(--text-muted)]">Overview</p>
          <h1 className="truncate text-[1.45rem] font-semibold leading-tight tracking-tight text-[var(--text-primary)] sm:text-[1.8rem]">{pageTitle}</h1>
        </div>
      </div>
    </div>
  );
}
