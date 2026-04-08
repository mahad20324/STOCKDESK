import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchPlatformShops } from '../utils/api';
import { getUser } from '../utils/auth';

function StatCard({ label, value, helper, eyebrow = 'Platform' }) {
  return (
    <div className="app-panel relative overflow-hidden rounded-[1.4rem] border p-4">
      <div className="absolute inset-x-0 top-0 h-14 bg-[linear-gradient(180deg,rgba(30,167,189,0.10),transparent)]" />
      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{eyebrow}</p>
        <p className="mt-3 text-sm text-[var(--text-muted)]">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">{value}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{helper}</p>
      </div>
    </div>
  );
}

export default function Shops() {
  const currentUser = getUser();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadShops() {
      try {
        setLoading(true);
        const data = await fetchPlatformShops();
        setShops(data);
      } catch (loadError) {
        setError(loadError.message || 'Failed to load registered shops.');
      } finally {
        setLoading(false);
      }
    }

    loadShops();
  }, []);

  const metrics = useMemo(() => {
    const totalShops = shops.length;
    const activeShops = shops.filter((shop) => shop.isActive).length;
    const adminAccounts = shops.filter((shop) => shop.owner?.username).length;
    const totalUsers = shops.reduce((sum, shop) => sum + Number(shop.metrics?.userCount || 0), 0);

    return { totalShops, activeShops, adminAccounts, totalUsers };
  }, [shops]);

  if (currentUser?.role !== 'SuperAdmin') {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="space-y-6">
      <section className="app-panel relative overflow-hidden rounded-[1.7rem] border p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(30,167,189,0.14),transparent_58%)] lg:block" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
              Platform Console
            </div>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Registered Shops</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
              Review every tenant created through direct signup, along with admin usernames and usage indicators.
            </p>
          </div>
          <div className="app-panel-accent rounded-2xl px-4 py-3 text-sm font-medium">
            Platform user: {currentUser?.name || 'Super Admin'}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Registered Shops" value={metrics.totalShops.toLocaleString()} helper="Total tenant shops on the platform." eyebrow="Tenant Base" />
          <StatCard label="Active Shops" value={metrics.activeShops.toLocaleString()} helper="Shops currently marked active." eyebrow="Status" />
          <StatCard label="Admin Accounts" value={metrics.adminAccounts.toLocaleString()} helper="Shops with an assigned admin username." eyebrow="Access" />
          <StatCard label="Platform Users" value={metrics.totalUsers.toLocaleString()} helper="Users across all registered shops." eyebrow="Accounts" />
        </div>
      </section>

      {error ? <div className="app-alert-danger rounded-2xl px-4 py-3 text-sm">{error}</div> : null}

      <section className="app-panel rounded-[1.5rem] border p-5 sm:p-6">
        <div className="flex flex-col gap-2 border-b border-[var(--border-default)] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Tenant Directory</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Each row shows the shop, primary admin, and current usage footprint.</p>
          </div>
          <div className="app-panel-soft rounded-2xl border px-3 py-2 text-sm text-[var(--text-muted)]">{shops.length} total records</div>
        </div>

        {loading ? (
          <div className="mt-5 grid gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="app-panel-soft h-16 animate-pulse rounded-2xl border" />
            ))}
          </div>
        ) : shops.length === 0 ? (
          <div className="app-panel-soft mt-5 rounded-2xl border border-dashed px-4 py-10 text-center">
            <p className="text-sm font-medium text-[var(--text-primary)]">No registered shops yet</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Public signup activity will appear here once the first shop registers.</p>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto rounded-[1.35rem] border border-[var(--border-default)]">
            <table className="min-w-full text-left text-sm">
              <thead className="app-table-head">
                <tr>
                  <th className="px-4 py-3 font-medium">Shop</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Username</th>
                  <th className="px-4 py-3 font-medium">Users</th>
                  <th className="px-4 py-3 font-medium">Activity</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)] bg-[var(--surface-primary)]">
                {shops.map((shop) => (
                  <tr key={shop.id} className="app-row-hover transition">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-xs font-semibold text-[var(--accent-strong)]">
                          {String(shop.name || 'S').slice(0, 1).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">{shop.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{shop.slug} • {shop.currency}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {shop.owner ? (
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{shop.owner.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">Primary admin</p>
                        </div>
                      ) : (
                        <span className="text-[var(--text-muted)]">No admin found</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[var(--text-primary)]">{shop.owner?.username || 'Not set'}</span>
                    </td>
                    <td className="px-4 py-4 text-[var(--text-primary)]">{Number(shop.metrics?.userCount || 0)}</td>
                    <td className="px-4 py-4 text-[var(--text-muted)]">
                      {Number(shop.metrics?.productCount || 0)} products • {Number(shop.metrics?.saleCount || 0)} sales
                    </td>
                    <td className="px-4 py-4 text-[var(--text-muted)]">{new Date(shop.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}