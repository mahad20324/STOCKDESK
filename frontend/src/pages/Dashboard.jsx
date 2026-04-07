import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchBestSelling, fetchDashboardSummary, fetchProducts, fetchSales, fetchSettings } from '../utils/api';
import { getUser } from '../utils/auth';

function formatMoney(currency, value) {
  return `${currency} ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function DashboardIcon({ children, tone = 'default' }) {
  const toneClasses = {
    default: 'bg-[var(--accent-soft)] text-[var(--accent-strong)]',
    success: 'bg-[var(--success-soft)] text-[var(--success)]',
    danger: 'bg-[var(--danger-soft)] text-[var(--danger)]',
    warning: 'bg-[var(--warning-soft)] text-[var(--warning)]',
  };

  return <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClasses[tone]}`}>{children}</div>;
}

function StatCard({ title, value, helper, tone = 'default', icon }) {
  const valueClass = tone === 'success' ? 'text-[var(--success)]' : tone === 'danger' ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]';

  return (
    <div className="app-panel rounded-lg border p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--text-muted)]">{title}</p>
          <p className={`mt-4 text-3xl font-semibold ${valueClass}`}>{value}</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{helper}</p>
        </div>
        <DashboardIcon tone={tone}>{icon}</DashboardIcon>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children, action }) {
  return (
    <section className="app-panel rounded-lg border p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 border-b border-[var(--border-default)] pb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function SkeletonCard() {
  return <div className="app-panel-soft h-36 animate-pulse rounded-lg border p-5" />;
}

function EmptyState({ title, message }) {
  return (
    <div className="app-panel-soft rounded-lg border border-dashed px-4 py-10 text-center">
      <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{message}</p>
    </div>
  );
}

export default function Dashboard() {
  const user = getUser();
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [summary, setSummary] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [productData, saleData, settings, bestSellingData, summaryData] = await Promise.all([
          fetchProducts(),
          fetchSales(),
          fetchSettings(),
          fetchBestSelling(),
          fetchDashboardSummary(),
        ]);
        setProducts(productData);
        setSales(saleData);
        setBestSelling(bestSellingData);
        setSummary(summaryData);
        setCurrency(settings.currency || 'USD');
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, product) => sum + Number(product.quantity || 0), 0);
  const lowStockItems = useMemo(
    () => products.filter((product) => Number(product.quantity || 0) < Math.max(5, Number(product.lowStock || 0))).slice(0, 5),
    [products]
  );
  const lowStockCount = lowStockItems.length;
  const todaysSales = Number(summary?.periods?.today?.orderCount || 0);
  const totalRevenue = Number(summary?.periods?.thisMonth?.netSales || sales.reduce((sum, sale) => sum + parseFloat(sale.total || 0), 0));

  const salesTrend = useMemo(() => {
    const today = new Date();
    const days = [];

    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date(today);
      date.setHours(0, 0, 0, 0);
      date.setDate(today.getDate() - index);

      days.push({
        key: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString([], { weekday: 'short' }),
        sales: 0,
      });
    }

    const dayMap = new Map(days.map((day) => [day.key, day]));
    sales.forEach((sale) => {
      const saleDate = new Date(sale.createdAt);
      saleDate.setHours(0, 0, 0, 0);
      const key = saleDate.toISOString().slice(0, 10);
      const bucket = dayMap.get(key);
      if (bucket) {
        bucket.sales += Number(sale.total || 0);
      }
    });

    return days;
  }, [sales]);

  const bestProductData = useMemo(
    () => bestSelling.slice(0, 5).map((item) => ({
      name: item.Product?.name || 'Item',
      value: Number(item.unitsold || 0),
    })),
    [bestSelling]
  );
  const shopName = user?.shop?.name || 'StockDesk Shop';
  const todayRevenue = Number(summary?.periods?.today?.netSales || 0);
  const lowStockProducts = products.filter((product) => Number(product.quantity || 0) < Math.max(5, Number(product.lowStock || 0)));

  return (
    <div className="space-y-6">
      <section className="app-panel rounded-lg border p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--text-muted)]">Welcome back</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">{shopName} at a glance</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">Track stock movement, daily sales, and products that need attention from one simple dashboard.</p>
          </div>
          <div className="app-panel-accent rounded-lg px-4 py-3 text-sm sm:min-w-[180px]">
            <p className="font-medium">Last updated</p>
            <p className="mt-1 text-[var(--accent)]">{new Date().toLocaleString()}</p>
          </div>
        </div>
      </section>

      {loading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
            <div className="app-panel-soft h-96 animate-pulse rounded-lg border" />
            <div className="app-panel-soft h-96 animate-pulse rounded-lg border" />
          </div>
        </>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              title="Total Products"
              value={totalProducts.toLocaleString()}
              helper="Products currently in catalog"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path d="m3 7 9-4 9 4-9 4-9-4Z" />
                  <path d="m3 7 9 4 9-4" />
                  <path d="M12 11v10" />
                </svg>
              }
            />
            <StatCard
              title="Total Stock"
              value={totalStock.toLocaleString()}
              helper="Units available for sale"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path d="M4 7h16v10H4z" />
                  <path d="M8 11h8" />
                </svg>
              }
            />
            <StatCard
              title="Today's Sales"
              value={todaysSales.toLocaleString()}
              helper="Orders recorded today"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path d="M4 19h16" />
                  <path d="M7 15V9" />
                  <path d="M12 15V5" />
                  <path d="M17 15v-2" />
                </svg>
              }
            />
            <StatCard
              title="Total Revenue"
              value={formatMoney(currency, totalRevenue)}
              helper="This month net sales"
              tone="success"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path d="M12 1v22" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
            />
            <StatCard
              title="Low Stock Items"
              value={lowStockProducts.length.toLocaleString()}
              helper="Products below safe stock level"
              tone="danger"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                  <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                </svg>
              }
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <SectionCard
              title="Sales Overview"
              subtitle="Net sales across the last 7 days."
              action={<div className="app-panel-accent rounded-lg px-3 py-2 text-sm font-medium">Today: {formatMoney(currency, todayRevenue)}</div>}
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesTrend} barCategoryGap="28%">
                    <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                    <YAxis tickLine={false} axisLine={false} stroke="var(--text-muted)" tickFormatter={(value) => Number(value).toLocaleString()} />
                    <Tooltip cursor={{ fill: 'var(--surface-secondary)' }} formatter={(value) => formatMoney(currency, value)} />
                    <Bar dataKey="sales" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {salesTrend.every((item) => item.sales === 0) ? (
                <div className="mt-4">
                  <EmptyState title="No sales yet" message="Sales recorded this week will appear here automatically." />
                </div>
              ) : null}
            </SectionCard>

            <SectionCard title="Low Stock Alert" subtitle="Products below the recommended threshold need restocking.">
              {lowStockItems.length ? (
                <div className="space-y-3">
                  {lowStockItems.map((product) => (
                    <div key={product.id} className="flex items-start gap-3 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 transition hover:border-[var(--danger)]">
                      <DashboardIcon tone={Number(product.quantity || 0) === 0 ? 'danger' : 'warning'}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                          <path d="M12 9v4" />
                          <path d="M12 17h.01" />
                          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                        </svg>
                      </DashboardIcon>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[var(--text-primary)]">{product.name}</p>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">{product.category || 'Uncategorized'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[var(--danger)]">{product.quantity} left</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">Threshold {Math.max(5, Number(product.lowStock || 0))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="Inventory looks healthy" message="No products are currently below the low stock threshold." />
              )}
            </SectionCard>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Top Products" subtitle="Best performing items by quantity sold.">
              {bestProductData.length ? (
                <div className="overflow-hidden rounded-lg border border-[var(--border-default)]">
                  <div className="app-table-head grid grid-cols-[minmax(0,1fr)_120px] px-4 py-3 text-sm font-medium">
                    <span>Product</span>
                    <span className="text-right">Quantity Sold</span>
                  </div>
                  {bestProductData.map((item) => (
                    <div key={item.name} className="app-row-hover grid grid-cols-[minmax(0,1fr)_120px] border-t border-[var(--border-default)] px-4 py-3.5 text-sm transition">
                      <span className="truncate font-medium text-[var(--text-primary)]">{item.name}</span>
                      <span className="text-right text-[var(--text-muted)]">{item.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No product sales yet" message="Top-selling products will appear here once sales are recorded." />
              )}
            </SectionCard>

            <SectionCard
              title="Stock Summary"
              subtitle="Quick health check for inventory and sales activity."
              action={<div className="app-panel-soft rounded-lg border px-3 py-2 text-sm text-[var(--text-muted)]">{sales.length} total sales</div>}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="app-panel-soft rounded-lg border p-4">
                  <p className="text-sm font-medium text-[var(--text-muted)]">Products In Stock</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{totalStock.toLocaleString()}</p>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">Across {totalProducts.toLocaleString()} products.</p>
                </div>
                <div className="app-panel-soft rounded-lg border p-4">
                  <p className="text-sm font-medium text-[var(--text-muted)]">Low Stock Alerts</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--danger)]">{lowStockCount.toLocaleString()}</p>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">Items that need restocking now.</p>
                </div>
                <div className="app-panel-soft rounded-lg border p-4">
                  <p className="text-sm font-medium text-[var(--text-muted)]">Today's Revenue</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--success)]">{formatMoney(currency, todayRevenue)}</p>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">From {todaysSales.toLocaleString()} completed sales.</p>
                </div>
                <div className="app-panel-soft rounded-lg border p-4">
                  <p className="text-sm font-medium text-[var(--text-muted)]">This Week Units Sold</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{Number(summary?.periods?.thisWeek?.itemsSold || 0).toLocaleString()}</p>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">Useful for reorder planning.</p>
                </div>
              </div>
            </SectionCard>
          </section>
        </>
      )}
    </div>
  );
}
