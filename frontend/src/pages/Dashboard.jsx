import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchBestSelling, fetchDashboardSummary, fetchProducts, fetchSales, fetchSettings } from '../utils/api';
import { getUser } from '../utils/auth';

function formatMoney(currency, value) {
  return `${currency} ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function DashboardIcon({ children, tone = 'default' }) {
  const toneClasses = {
    default: 'bg-[#E8F8FB] text-[#57C8D8]',
    success: 'bg-[#ECFAF4] text-[#63C7A0]',
    danger: 'bg-[#FFF2EF] text-[#FF8F7C]',
    warning: 'bg-[#FFF7EC] text-[#F3B676]',
  };

  return <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClasses[tone]}`}>{children}</div>;
}

function StatCard({ title, value, helper, tone = 'default', icon }) {
  const valueClass = tone === 'success' ? 'text-[#63C7A0]' : tone === 'danger' ? 'text-[#FF8F7C]' : 'text-[#111827]';

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">{title}</p>
          <p className={`mt-4 text-3xl font-semibold ${valueClass}`}>{value}</p>
          <p className="mt-2 text-sm text-[#6B7280]">{helper}</p>
        </div>
        <DashboardIcon tone={tone}>{icon}</DashboardIcon>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children, action }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[#111827]">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[#6B7280]">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function SkeletonCard() {
  return <div className="h-36 animate-pulse rounded-lg border border-slate-200 bg-white p-5 shadow-sm" />;
}

function EmptyState({ title, message }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-[#F5FAFD] px-4 py-10 text-center">
      <p className="text-sm font-medium text-[#111827]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#6B7280]">{message}</p>
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
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#6B7280]">Welcome back</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#111827]">{shopName} at a glance</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">Track stock movement, daily sales, and products that need attention from one simple dashboard.</p>
          </div>
          <div className="rounded-lg bg-[#E8F8FB] px-4 py-3 text-sm text-[#4A9FB1] sm:min-w-[180px]">
            <p className="font-medium">Last updated</p>
            <p className="mt-1 text-[#57C8D8]">{new Date().toLocaleString()}</p>
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
            <div className="h-96 animate-pulse rounded-lg border border-slate-200 bg-white shadow-sm" />
            <div className="h-96 animate-pulse rounded-lg border border-slate-200 bg-white shadow-sm" />
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
              action={<div className="rounded-lg bg-[#E8F8FB] px-3 py-2 text-sm font-medium text-[#57C8D8]">Today: {formatMoney(currency, todayRevenue)}</div>}
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesTrend} barCategoryGap="28%">
                    <CartesianGrid vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="#6B7280" />
                    <YAxis tickLine={false} axisLine={false} stroke="#6B7280" tickFormatter={(value) => Number(value).toLocaleString()} />
                    <Tooltip cursor={{ fill: '#E8F8FB' }} formatter={(value) => formatMoney(currency, value)} />
                    <Bar dataKey="sales" fill="#57C8D8" radius={[8, 8, 0, 0]} />
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
                    <div key={product.id} className="flex items-start gap-3 rounded-lg border border-[#F8D8D0] bg-[#FFF2EF] px-4 py-3 transition hover:border-[#F4B7AA]">
                      <DashboardIcon tone={Number(product.quantity || 0) === 0 ? 'danger' : 'warning'}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                          <path d="M12 9v4" />
                          <path d="M12 17h.01" />
                          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                        </svg>
                      </DashboardIcon>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#111827]">{product.name}</p>
                        <p className="mt-1 text-sm text-[#6B7280]">{product.category || 'Uncategorized'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[#FF8F7C]">{product.quantity} left</p>
                        <p className="mt-1 text-xs text-[#6B7280]">Threshold {Math.max(5, Number(product.lowStock || 0))}</p>
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
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <div className="grid grid-cols-[minmax(0,1fr)_120px] bg-[#F5FAFD] px-4 py-3 text-sm font-medium text-[#6B7280]">
                    <span>Product</span>
                    <span className="text-right">Quantity Sold</span>
                  </div>
                  {bestProductData.map((item) => (
                    <div key={item.name} className="grid grid-cols-[minmax(0,1fr)_120px] border-t border-slate-200 px-4 py-3.5 text-sm transition hover:bg-[#F5FAFD]">
                      <span className="truncate font-medium text-[#111827]">{item.name}</span>
                      <span className="text-right text-[#6B7280]">{item.value}</span>
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
              action={<div className="rounded-lg bg-[#F5FAFD] px-3 py-2 text-sm text-[#6B7280]">{sales.length} total sales</div>}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-[#F5FAFD] p-4">
                  <p className="text-sm font-medium text-[#6B7280]">Products In Stock</p>
                  <p className="mt-2 text-2xl font-semibold text-[#111827]">{totalStock.toLocaleString()}</p>
                  <p className="mt-2 text-sm text-[#6B7280]">Across {totalProducts.toLocaleString()} products.</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-[#F5FAFD] p-4">
                  <p className="text-sm font-medium text-[#6B7280]">Low Stock Alerts</p>
                  <p className="mt-2 text-2xl font-semibold text-[#FF8F7C]">{lowStockCount.toLocaleString()}</p>
                  <p className="mt-2 text-sm text-[#6B7280]">Items that need restocking now.</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-[#F5FAFD] p-4">
                  <p className="text-sm font-medium text-[#6B7280]">Today's Revenue</p>
                  <p className="mt-2 text-2xl font-semibold text-[#63C7A0]">{formatMoney(currency, todayRevenue)}</p>
                  <p className="mt-2 text-sm text-[#6B7280]">From {todaysSales.toLocaleString()} completed sales.</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-[#F5FAFD] p-4">
                  <p className="text-sm font-medium text-[#6B7280]">This Week Units Sold</p>
                  <p className="mt-2 text-2xl font-semibold text-[#111827]">{Number(summary?.periods?.thisWeek?.itemsSold || 0).toLocaleString()}</p>
                  <p className="mt-2 text-sm text-[#6B7280]">Useful for reorder planning.</p>
                </div>
              </div>
            </SectionCard>
          </section>
        </>
      )}
    </div>
  );
}
