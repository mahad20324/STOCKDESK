import { NavLink } from 'react-router-dom';
import { getUser } from '../utils/auth';

const links = [
  { to: '/app', label: 'Dashboard' },
  { to: '/app/products', label: 'Products' },
  { to: '/app/customers', label: 'Customers' },
  { to: '/app/pos', label: 'Sales (POS)' },
  { to: '/app/reports', label: 'Reports' },
  { to: '/app/settings', label: 'Settings' },
];

export default function Sidebar() {
  const user = getUser();
  const isAdmin = user?.role === 'Admin';
  const shopName = user?.shop?.name || 'Default Shop';
  const shopSlug = user?.shop?.slug || 'legacy-shop';

  return (
    <aside className="w-72 bg-white border-r border-slate-200 p-6 shadow-sm">
      <div className="mb-10">
        <div className="text-3xl font-semibold text-brand-700">StockDesk</div>
        <p className="mt-2 text-sm text-slate-500">Inventory & POS dashboard</p>
        <div className="mt-5 rounded-3xl bg-slate-900 p-4 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">Operating In</p>
          <p className="mt-2 text-lg font-semibold leading-tight">{shopName}</p>
          <p className="mt-1 text-xs text-slate-400">{shopSlug}</p>
        </div>
      </div>
      <nav className="space-y-2">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive ? 'bg-brand-100 text-brand-900' : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink
            to="/app/users"
            className={({ isActive }) =>
              `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive ? 'bg-brand-100 text-brand-900' : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            Users
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
