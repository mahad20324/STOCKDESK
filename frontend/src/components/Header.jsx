import { useLocation } from 'react-router-dom';

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
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm sm:px-5 sm:py-4">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 lg:hidden"
          aria-label="Open navigation"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
          </svg>
        </button>
        <div className="min-w-0">
          <p className="text-sm font-medium tracking-tight text-[#6B7280]">Overview</p>
          <h1 className="truncate text-[1.65rem] font-semibold leading-tight tracking-tight text-[#111827] sm:text-2xl">{pageTitle}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-[#111827]">{user?.name || 'Cashier'}</p>
          <p className="text-xs text-[#6B7280]">{user?.role || 'User'}</p>
        </div>
        <button onClick={onLogout} className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1D4ED8]">
          Logout
        </button>
      </div>
    </div>
  );
}
