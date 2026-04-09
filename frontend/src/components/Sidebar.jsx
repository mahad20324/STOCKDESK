import { NavLink } from 'react-router-dom';
import { getUser } from '../utils/auth';

const links = [
  {
    to: '/app',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M4 13h7V4H4v9Z" />
        <path d="M13 20h7v-5h-7v5Z" />
        <path d="M13 13h7V4h-7v9Z" />
        <path d="M4 20h7v-5H4v5Z" />
      </svg>
    ),
  },
  {
    to: '/app/products',
    label: 'Products',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="m3 7 9-4 9 4-9 4-9-4Z" />
        <path d="m3 7 9 4 9-4" />
        <path d="M12 11v10" />
        <path d="m3 17 9 4 9-4" />
      </svg>
    ),
  },
  {
    to: '/app/pos',
    label: 'Sales',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M4 5h16v14H4z" />
        <path d="M8 9h8" />
        <path d="M8 13h3" />
        <path d="M14 13h2" />
      </svg>
    ),
  },
  {
    to: '/app/reports',
    label: 'Reports',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M4 19h16" />
        <path d="M7 16V9" />
        <path d="M12 16V5" />
        <path d="M17 16v-3" />
      </svg>
    ),
  },
  {
    to: '/app/settings',
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5z" />
        <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 0 1-4 0v-.2a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 0 1 0-4h.2a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 0 1 4 0v.2a1 1 0 0 0 .7.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 0 1 0 4h-.2a1 1 0 0 0-.9.7Z" />
      </svg>
    ),
  },
];

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <path d="M9.5 11a4 4 0 1 0 0-8a4 4 0 0 0 0 8Z" />
      <path d="M21 21v-2a4 4 0 0 0-3-3.9" />
      <path d="M16 3.1a4 4 0 0 1 0 7.8" />
    </svg>
  );
}

function ShopsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M3 21h18" />
      <path d="M5 21V8l7-4 7 4v13" />
      <path d="M9 10h6" />
      <path d="M9 14h6" />
      <path d="M10 21v-3h4v3" />
    </svg>
  );
}

export default function Sidebar({ user: providedUser, isOpen = false, onClose = () => {}, onLogout = () => {} }) {
  const user = providedUser || getUser();
  const isAdmin = user?.role === 'Admin';
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const shopName = isSuperAdmin ? 'Platform Console' : user?.shop?.name || 'Default Shop';
  const shopSlug = isSuperAdmin ? 'all-registered-shops' : user?.shop?.slug || 'legacy-shop';
  const visibleLinks = isSuperAdmin
    ? [
        {
          to: '/app/shops',
          label: 'Platform',
          icon: <ShopsIcon />,
        },
      ]
    : links;

  return (
    <>
      <div
        className={`app-overlay fixed inset-0 z-30 transition lg:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`app-sidebar-shell fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r px-5 py-5 transition-transform duration-300 lg:static lg:translate-x-0 lg:px-6 lg:py-6 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between lg:block">
          <div>
            <div className="flex items-center gap-3">
              <div className="app-brand-mark flex h-11 w-11 items-center justify-center rounded-xl text-base font-semibold">S</div>
              <div>
                <p className="text-lg font-semibold text-[var(--sidebar-text)]">StockDesk</p>
                <p className="text-sm text-[var(--sidebar-muted)]">Business dashboard</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--sidebar-border)] bg-white/5 p-2 text-[var(--sidebar-text)] transition hover:bg-white/10 lg:hidden"
            aria-label="Close navigation"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="app-sidebar-card mt-7 rounded-2xl border p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--sidebar-muted)]">{isSuperAdmin ? 'Platform Scope' : 'Active Shop'}</p>
          <p className="mt-2 text-base font-semibold text-[var(--sidebar-text)]">{shopName}</p>
          <p className="mt-1 text-sm text-[var(--sidebar-muted)]">{shopSlug}</p>
        </div>

        <nav className="mt-7 space-y-1.5">
          {visibleLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `app-sidebar-link flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'app-sidebar-link-active'
                    : ''
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
          {!isSuperAdmin && isAdmin && (
            <NavLink
              to="/app/users"
              onClick={onClose}
              className={({ isActive }) =>
                `app-sidebar-link flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'app-sidebar-link-active'
                    : ''
                }`
              }
            >
              <UsersIcon />
              <span>Users</span>
            </NavLink>
          )}
        </nav>

        <div className="app-sidebar-card mt-auto rounded-2xl border p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--sidebar-muted)]">
            {isSuperAdmin ? 'Platform User' : 'Current User'}
          </p>
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-[var(--sidebar-hover)] px-3 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--sidebar-active-bg)] text-sm font-semibold text-[var(--sidebar-active-text)] shadow-[var(--sidebar-active-shadow)]">
              {String(user?.name || 'S').slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--sidebar-text)]">{user?.name || 'Staff'}</p>
              <p className="truncate text-xs text-[var(--sidebar-muted)]">{user?.displayRole || user?.role || 'User'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="app-btn-secondary mt-4 w-full rounded-xl border px-4 py-3 text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
