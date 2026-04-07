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

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const user = getUser();
  const isAdmin = user?.role === 'Admin';
  const shopName = user?.shop?.name || 'Default Shop';
  const shopSlug = user?.shop?.slug || 'legacy-shop';

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-900/40 transition lg:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white px-5 py-5 shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 lg:px-6 lg:py-6 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between lg:block">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2FA8C6] text-base font-semibold text-white">S</div>
              <div>
                <p className="text-lg font-semibold text-[#111827]">StockDesk</p>
                <p className="text-sm text-[#6B7280]">Business dashboard</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
            aria-label="Close navigation"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="mt-7 rounded-2xl border border-slate-200 bg-[#F5FAFD] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Active Shop</p>
          <p className="mt-2 text-base font-semibold text-[#111827]">{shopName}</p>
          <p className="mt-1 text-sm text-[#6B7280]">{shopSlug}</p>
        </div>

        <nav className="mt-7 space-y-1.5">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#2FA8C6] text-white shadow-sm'
                    : 'text-[#374151] hover:bg-[#EFF8FB] hover:text-[#111827]'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/app/users"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#2FA8C6] text-white shadow-sm'
                    : 'text-[#374151] hover:bg-[#EFF8FB] hover:text-[#111827]'
                }`
              }
            >
              <UsersIcon />
              <span>Users</span>
            </NavLink>
          )}
        </nav>

        <div className="mt-auto rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-[#111827]">Keep stock and sales in sync.</p>
          <p className="mt-1.5 text-sm leading-6 text-[#6B7280]">Use the dashboard to spot slow sales and low inventory quickly.</p>
        </div>
      </aside>
    </>
  );
}
