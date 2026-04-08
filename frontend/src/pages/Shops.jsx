import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchPlatformOverview } from '../utils/api';
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

function formatRelativeTime(value) {
  if (!value) {
    return 'No login activity yet';
  }

  const date = new Date(value);
  const diffMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));

  if (diffMinutes < 1) {
    return 'Just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  return date.toLocaleString();
}

export default function Shops() {
  const currentUser = getUser();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadOverview(isInitialLoad = false) {
      try {
        if (isInitialLoad) {
          setLoading(true);
        }
        const data = await fetchPlatformOverview();
        if (isMounted) {
          setOverview(data);
          setError('');
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || 'Failed to load platform overview.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadOverview(true);
    const intervalId = window.setInterval(() => loadOverview(false), 30000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const shops = overview?.shops || [];
  const summary = overview?.summary || {
    totalShops: 0,
    activeShops: 0,
    recentlyActiveShops: 0,
    newShopsToday: 0,
    totalUsers: 0,
  };

  const metrics = useMemo(() => {
    const adminAccounts = shops.filter((shop) => shop.owner?.username).length;
    const activeWindowHours = overview?.activityWindowHours || 24;
    const activityThreshold = new Date(Date.now() - activeWindowHours * 60 * 60 * 1000);
    const recentlyActiveShops = shops.filter((shop) => shop.activity?.lastLoginAt && new Date(shop.activity.lastLoginAt) >= activityThreshold);

    return {
      adminAccounts,
      recentlyActiveShops,
    };
  }, [overview?.activityWindowHours, shops]);

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
              Manage the platform safely with tenant counts, shop status, and login activity without exposing any shop sales or business revenue.
            </p>
          </div>
          <div className="space-y-2 text-right">
            <div className="app-panel-accent rounded-2xl px-4 py-3 text-sm font-medium">
              Platform user: {currentUser?.name || 'Super Admin'}
            </div>
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Auto refresh every 30 sec • Updated {formatRelativeTime(overview?.generatedAt)}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Registered Shops" value={summary.totalShops.toLocaleString()} helper="Total tenant shops on the platform." eyebrow="Tenant Base" />
          <StatCard label="Active Shops" value={summary.activeShops.toLocaleString()} helper="Shops currently enabled on the platform." eyebrow="Status" />
          <StatCard label="Recently Active" value={summary.recentlyActiveShops.toLocaleString()} helper={`Shops with a login in the last ${overview?.activityWindowHours || 24} hours.`} eyebrow="Activity" />
          <StatCard label="Platform Users" value={summary.totalUsers.toLocaleString()} helper="Users across all registered shops." eyebrow="Accounts" />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="app-panel-soft rounded-[1.3rem] border px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Growth</p>
            <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">{summary.newShopsToday.toLocaleString()}</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">New shops created today.</p>
          </div>
          <div className="app-panel-soft rounded-[1.3rem] border px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Access</p>
            <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">{metrics.adminAccounts.toLocaleString()}</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Shops with an assigned admin username.</p>
          </div>
          <div className="app-panel-soft rounded-[1.3rem] border px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Privacy</p>
            <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">Strict</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Sales, transactions, reports, and revenue stay inside each shop.</p>
          </div>
        </div>
      </section>

      {error ? <div className="app-alert-danger rounded-2xl px-4 py-3 text-sm">{error}</div> : null}

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="app-panel rounded-[1.5rem] border p-5 sm:p-6">
          <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recently Active Shops</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Businesses with at least one user login inside the activity window.</p>
            </div>
            <div className="app-panel-soft rounded-2xl border px-3 py-2 text-sm text-[var(--text-muted)]">{summary.recentlyActiveShops} active</div>
          </div>

          {loading ? (
            <div className="mt-5 grid gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="app-panel-soft h-20 animate-pulse rounded-2xl border" />
              ))}
            </div>
          ) : metrics.liveShopRows.length === 0 ? (
            <div className="app-panel-soft mt-5 rounded-2xl border border-dashed px-4 py-10 text-center">
              <p className="text-sm font-medium text-[var(--text-primary)]">No shops are live right now</p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">As sales come in, active shops will rise to the top here automatically.</p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {metrics.recentlyActiveShops.map((shop) => (
                <div key={shop.id} className="app-panel-soft rounded-2xl border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[var(--text-primary)]">{shop.name}</p>
                        <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600">Recently Active</span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">{shop.owner?.username || 'No admin username'} • {shop.currency}</p>
                    </div>
                    <div className="text-sm text-[var(--text-muted)]">Last login {formatRelativeTime(shop.activity?.lastLoginAt)}</div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Shop Status</p>
                      <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{shop.isActive ? 'Enabled' : 'Paused'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Last User</p>
                      <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{shop.activity?.lastActiveUser?.username || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Role</p>
                      <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{shop.activity?.lastActiveUser?.role || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="app-panel rounded-[1.5rem] border p-5 sm:p-6">
          <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Latest Shop Signups</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Newest tenants added to the platform.</p>
            </div>
            <div className="app-panel-soft rounded-2xl border px-3 py-2 text-sm text-[var(--text-muted)]">{shops.slice(0, 8).length} shown</div>
          </div>

          {loading ? (
            <div className="mt-5 grid gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="app-panel-soft h-16 animate-pulse rounded-2xl border" />
              ))}
            </div>
          ) : shops.length === 0 ? (
            <div className="app-panel-soft mt-5 rounded-2xl border border-dashed px-4 py-10 text-center">
              <p className="text-sm font-medium text-[var(--text-primary)]">No shop signups yet</p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">Newly registered shops will appear here as they join the platform.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {shops.slice(0, 8).map((shop) => (
                <div key={shop.id} className="app-panel-soft rounded-2xl border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">{shop.name}</p>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">{shop.owner?.username || 'No admin username'} • {shop.slug}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--text-primary)]">{shop.isActive ? 'Enabled' : 'Paused'}</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">Created {formatRelativeTime(shop.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

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
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${shop.activity?.lastLoginAt ? 'bg-emerald-500/15 text-emerald-600' : 'bg-[var(--surface-secondary)] text-[var(--text-muted)]'}`}>
                            {shop.activity?.lastLoginAt ? 'Seen' : shop.isActive ? 'No login yet' : 'Paused'}
                          </span>
                          <span>{shop.activity?.lastActiveUser?.username || 'No recent user'}</span>
                        </div>
                        <div>Last login {formatRelativeTime(shop.activity?.lastLoginAt)}</div>
                        <div>Status: {shop.isActive ? 'Enabled' : 'Paused'}</div>
                      </div>
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