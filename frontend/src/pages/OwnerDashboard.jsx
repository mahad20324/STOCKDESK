import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchPlatformDashboard } from '../utils/api';
import { getUser } from '../utils/auth';

const ACTION_META = {
  CREATE: { label: 'Create', text: 'text-[var(--success)]', bg: 'bg-[rgba(74,168,132,0.12)]' },
  UPDATE: { label: 'Update', text: 'text-[var(--accent)]', bg: 'bg-[rgba(30,167,189,0.12)]' },
  DELETE: { label: 'Delete', text: 'text-[var(--danger)]', bg: 'bg-[rgba(218,106,90,0.12)]' },
  LOGIN: { label: 'Login', text: 'text-[#8e7cc3]', bg: 'bg-[rgba(142,124,195,0.12)]' },
  LOGOUT: { label: 'Logout', text: 'text-[var(--text-muted)]', bg: 'bg-[var(--surface-secondary)]' },
};

function formatRelativeTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  const diffMin = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString();
}

function KpiCard({ icon, label, value, hint, accent = false }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 transition ${
        accent ? 'border-[var(--accent)]/20 bg-[var(--accent-soft)]' : 'app-panel hover:border-[var(--border-strong)]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent ? 'bg-[var(--accent)]/15 text-[var(--accent-strong)]' : 'bg-[var(--surface-secondary)] text-[var(--text-muted)]'}`}>
          {icon}
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</span>
      </div>
      <p className={`mt-3 text-2xl font-bold tracking-tight ${accent ? 'text-[var(--accent-strong)]' : 'text-[var(--text-primary)]'}`}>
        {value.toLocaleString()}
      </p>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{hint}</p>
    </div>
  );
}

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold text-[var(--text-primary)]">{label}</p>
      <p className="mt-0.5 text-xs text-[var(--text-muted)]">
        {payload[0].value.toLocaleString()} {payload[0].name}
      </p>
    </div>
  );
}

export default function OwnerDashboard() {
  const currentUser = getUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const mountedRef = useRef(true);

  const load = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setRefreshing(true);
      const result = await fetchPlatformDashboard();
      if (mountedRef.current) {
        setData(result);
        setError('');
      }
    } catch (err) {
      if (mountedRef.current) setError(err.message || 'Failed to load platform dashboard.');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    load(true);
    const intervalId = window.setInterval(() => load(false), 30000);
    return () => {
      mountedRef.current = false;
      window.clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const s = data?.summary || {
    totalShops: 0,
    activeShops: 0,
    recentlyActiveShops: 0,
    newShopsToday: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalSales: 0,
    pendingSignups: 0,
    unverifiedUsers: 0,
  };
  const pendingCount = s.pendingSignups + s.unverifiedUsers;
  const totalSalesSeries = (data?.salesTrend || []).map((d) => ({ ...d, sales: d.count }));
  const maxSales = Math.max(1, ...totalSalesSeries.map((d) => d.sales));

  return (
    <div className="space-y-6">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="app-panel relative overflow-hidden rounded-[1.8rem] border p-6">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-2/5 bg-[radial-gradient(ellipse_at_top_right,rgba(13,148,136,0.13),transparent_65%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/25 bg-[var(--accent-soft)] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                Platform Console · Owner Dashboard
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Welcome back, {currentUser?.name || 'Owner'}</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
              Live health of every shop on the network — signups, activity, and usage footprint across the platform.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <div className="flex items-center gap-2 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-secondary)] px-4 py-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-sm font-semibold text-[var(--text-primary)]">Live monitoring</span>
            </div>
            <button
              type="button"
              onClick={() => load(false)}
              className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-2 text-xs font-medium text-[var(--text-muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            >
              {refreshing ? 'Refreshing…' : `Updated ${formatRelativeTime(data?.generatedAt)}`}
            </button>
          </div>
        </div>

        {/* ── KPI STRIP ─────────────────────────────────────────────── */}
        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <KpiCard accent label="Shops" value={s.totalShops} hint="Registered tenants" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M3 21h18" /><path d="M5 21V8l7-4 7 4v13" /></svg>} />
          <KpiCard label="Active" value={s.activeShops} hint="Enabled on platform" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>} />
          <KpiCard label="Live now" value={s.recentlyActiveShops} hint={`Logins last ${data?.activityWindowHours || 24}h`} icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>} />
          <KpiCard label="New today" value={s.newShopsToday} hint="Shops signed up" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M12 5v14" /><path d="M5 12h14" /></svg>} />
          <KpiCard label="Users" value={s.totalUsers} hint="Across all shops" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="4" /><path d="M21 21v-2a4 4 0 0 0-3-3.9" /><path d="M16 3.1a4 4 0 0 1 0 7.8" /></svg>} />
          <KpiCard label="Products" value={s.totalProducts} hint="Listed catalogue" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="m3 7 9-4 9 4-9 4-9-4Z" /><path d="M12 11v10" /></svg>} />
          <KpiCard label="Sales" value={s.totalSales} hint="All-time transactions" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M4 19h16" /><path d="M7 16V9" /><path d="M12 16V5" /><path d="M17 16v-3" /></svg>} />
          <KpiCard label="Pending" value={pendingCount} hint="Unverified signups" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>} />
        </div>
      </section>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]">
          {error}
        </div>
      )}

      {pendingCount > 0 && !loading && (
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--warning-border)] bg-[var(--warning-soft)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-[var(--warning)]">
            {pendingCount} account{pendingCount > 1 ? 's' : ''} waiting for email verification{s.pendingSignups ? ` — ${s.pendingSignups} new shop${s.pendingSignups > 1 ? 's' : ''} signup${s.pendingSignups > 1 ? 's' : ''} and ${s.unverifiedUsers} legacy admin${s.unverifiedUsers > 1 ? 's' : ''}` : ''}. Remind shop admins to verify in their profile.
          </p>
          <Link to="/app/shops" className="app-btn-secondary shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition">
            View shops
          </Link>
        </div>
      )}

      {/* ── TRENDS ──────────────────────────────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="app-panel rounded-[1.5rem] border p-5 sm:p-6">
          <div className="border-b border-[var(--border-default)] pb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Sales activity · last 14 days</h3>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">Transactions recorded across all shops</p>
          </div>
          {loading ? (
            <div className="mt-4 h-56 animate-pulse rounded-2xl bg-[var(--surface-secondary)]" />
          ) : (
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={totalSalesSeries} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="platformSalesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} allowDecimals={false} domain={[0, Math.ceil(maxSales * 1.1)]} />
                  <Tooltip cursor={{ stroke: 'var(--chart-1)', strokeWidth: 1, strokeDasharray: '4 2' }} content={<TrendTooltip />} />
                  <Area type="monotone" dataKey="sales" name="sales" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#platformSalesGradient)" dot={false} activeDot={{ r: 5, fill: 'var(--chart-1)', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="app-panel rounded-[1.5rem] border p-5 sm:p-6">
          <div className="border-b border-[var(--border-default)] pb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Shop signups · last 14 days</h3>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">New tenants joining the platform</p>
          </div>
          {loading ? (
            <div className="mt-4 h-56 animate-pulse rounded-2xl bg-[var(--surface-secondary)]" />
          ) : (
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.signupsTrend || []} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="platformSignupsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8e7cc3" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#8e7cc3" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ stroke: '#8e7cc3', strokeWidth: 1, strokeDasharray: '4 2' }} content={<TrendTooltip />} />
                  <Area type="monotone" dataKey="count" name="signups" stroke="#8e7cc3" strokeWidth={2.5} fill="url(#platformSignupsGradient)" dot={false} activeDot={{ r: 5, fill: '#8e7cc3', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ── ACTIVITY + TOP SHOPS ─────────────────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="app-panel rounded-[1.5rem] border p-5 sm:p-6">
          <div className="border-b border-[var(--border-default)] pb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Live activity feed</h3>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">Recent events across the platform</p>
          </div>
          {loading ? (
            <div className="mt-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl bg-[var(--surface-secondary)]" />
              ))}
            </div>
          ) : (data?.liveActivity || []).length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-[var(--border-strong)] px-4 py-12 text-center">
              <p className="text-sm font-semibold text-[var(--text-primary)]">No activity yet</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Events appear here as shops use StockDesk</p>
            </div>
          ) : (
            <div className="mt-4 space-y-2.5">
              {(data?.liveActivity || []).slice(0, 12).map((event) => {
                const meta = ACTION_META[event.action] || { label: event.action, text: 'text-[var(--text-muted)]', bg: 'bg-[var(--surface-secondary)]' };
                return (
                  <div key={event.id} className="flex items-center gap-3 rounded-2xl border border-[var(--border-default)] px-3 py-2.5 transition hover:bg-[var(--surface-secondary)]">
                    <span className={`inline-flex w-16 shrink-0 items-center justify-center rounded-full px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${meta.bg} ${meta.text}`}>
                      {meta.label}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-[var(--text-primary)]">
                        <span className="font-semibold">{event.user?.username || 'System'}</span>
                        <span className="text-[var(--text-muted)]"> · {event.entityType?.toLowerCase()}{event.entityId ? ` #${event.entityId}` : ''}</span>
                        {event.shopName && <span className="text-[var(--text-muted)]"> · <Link to={`/app/shops/${event.shopId}`} className="font-medium text-[var(--accent-strong)] hover:underline">{event.shopName}</Link></span>}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-[var(--text-muted)]">{formatRelativeTime(event.createdAt)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="app-panel rounded-[1.5rem] border p-5">
            <div className="border-b border-[var(--border-default)] pb-4">
              <h3 className="font-semibold text-[var(--text-primary)]">Top shops by activity</h3>
              <p className="mt-0.5 text-sm text-[var(--text-muted)]">Ranked by recorded sales</p>
            </div>
            {loading ? (
              <div className="mt-4 space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-xl bg-[var(--surface-secondary)]" />
                ))}
              </div>
            ) : (data?.topShops || []).length === 0 ? (
              <p className="mt-4 text-sm text-[var(--text-muted)]">No data yet</p>
            ) : (
              <div className="mt-4 space-y-2">
                {(data?.topShops || []).map((shop, i) => (
                  <Link
                    key={shop.id}
                    to={`/app/shops/${shop.id}`}
                    className="flex items-center gap-3 rounded-xl border border-[var(--border-default)] px-3 py-2.5 transition hover:bg-[var(--surface-secondary)]"
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${i === 0 ? 'bg-amber-400/20 text-amber-600' : i === 1 ? 'bg-slate-400/15 text-slate-500' : i === 2 ? 'bg-orange-400/15 text-orange-500' : 'bg-[var(--surface-secondary)] text-[var(--text-muted)]'}`}>
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{shop.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{shop.metrics?.userCount || 0} users · {shop.metrics?.productCount || 0} products</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[var(--text-primary)]">{(shop.metrics?.saleCount || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">sales</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="app-panel rounded-[1.5rem] border p-5">
            <div className="border-b border-[var(--border-default)] pb-4">
              <h3 className="font-semibold text-[var(--text-primary)]">Manage platform</h3>
              <p className="mt-0.5 text-sm text-[var(--text-muted)]">Admin actions &amp; settings</p>
            </div>
            <div className="mt-4 space-y-2">
              <Link to="/app/shops" className="flex items-center justify-between rounded-xl border border-[var(--border-default)] px-4 py-3 transition hover:bg-[var(--surface-secondary)]">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Shops &amp; tenants</p>
                  <p className="text-xs text-[var(--text-muted)]">View registry, activity &amp; delete shops</p>
                </div>
                <span className="text-[var(--text-muted)]">→</span>
              </Link>
              <Link to="/app/profile" className="flex items-center justify-between rounded-xl border border-[var(--border-default)] px-4 py-3 transition hover:bg-[var(--surface-secondary)]">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">My profile</p>
                  <p className="text-xs text-[var(--text-muted)]">Account, security &amp; password</p>
                </div>
                <span className="text-[var(--text-muted)]">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
