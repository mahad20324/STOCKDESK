export default function Header({ user, onLogout }) {
  const shopName = user?.shop?.name || 'Default Shop';
  const shopSlug = user?.shop?.slug || 'legacy-shop';

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm text-slate-500">Welcome back,</p>
        <h1 className="text-2xl font-semibold text-slate-900">{user?.name || 'Cashier'}</h1>
        <div className="mt-3 inline-flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-sm font-semibold text-white">
            {shopName.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Active Shop</p>
            <p className="text-sm font-semibold text-slate-900">{shopName}</p>
            <p className="text-xs text-slate-500">{shopSlug}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700">{user?.role}</div>
        <button onClick={onLogout} className="rounded-2xl bg-brand-600 px-4 py-2 text-sm text-white transition hover:bg-brand-700">
          Logout
        </button>
      </div>
    </div>
  );
}
