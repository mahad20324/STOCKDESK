export default function Header({ user, onLogout }) {
  const shopName = user?.shop?.name || 'Default Shop';
  const shopSlug = user?.shop?.slug || 'legacy-shop';

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.75rem] border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Welcome back</p>
        <h1 className="mt-1 text-[1.7rem] font-semibold leading-tight text-slate-900">{user?.name || 'Cashier'}</h1>
        <div className="mt-3 inline-flex items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50 px-3 py-2 text-left">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-sm font-semibold text-white">
            {shopName.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">Active Shop</p>
            <p className="text-sm font-semibold text-slate-900">{shopName}</p>
            <p className="text-xs text-slate-500">{shopSlug}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-700">{user?.role}</div>
        <button onClick={onLogout} className="rounded-2xl bg-[#2f6787] px-4 py-2 text-sm text-white transition hover:bg-[#25526d]">
          Logout
        </button>
      </div>
    </div>
  );
}
