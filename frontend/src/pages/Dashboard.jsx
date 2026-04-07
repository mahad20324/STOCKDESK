import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { downloadReceipt, fetchBestSelling, fetchCashierReport, fetchCustomers, fetchDashboardSummary, fetchProducts, fetchSales, fetchSettings } from '../utils/api';
import { getUser } from '../utils/auth';

const chartColors = ['#0f766e', '#0891b2', '#2563eb', '#14b8a6', '#f59e0b'];

function formatMoney(currency, value) {
  return `${currency} ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDelta(value) {
  const numeric = Number(value || 0);
  const prefix = numeric > 0 ? '+' : '';
  return `${prefix}${numeric.toFixed(1)}%`;
}

function comparisonTone(value) {
  if (value > 0) return 'text-emerald-600';
  if (value < 0) return 'text-rose-600';
  return 'text-slate-500';
}

export default function Dashboard() {
  const user = getUser();
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [cashierReport, setCashierReport] = useState([]);
  const [summary, setSummary] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [productData, saleData, settings, customerData, bestSellingData, cashierData, summaryData] = await Promise.all([
          fetchProducts(),
          fetchSales(),
          fetchSettings(),
          fetchCustomers(),
          fetchBestSelling(),
          fetchCashierReport(),
          fetchDashboardSummary(),
        ]);
        setProducts(productData);
        setSales(saleData);
        setCustomers(customerData);
        setBestSelling(bestSellingData);
        setCashierReport(cashierData);
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
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
  const lowStockCount = products.filter((product) => product.quantity <= product.lowStock).length;
  const todaysSales = summary?.periods?.today?.orderCount || 0;
  const todaysRevenue = summary?.periods?.today?.netSales || 0;

  const salesTrend = useMemo(() => {
    const buckets = new Map();
    sales.forEach((sale) => {
      const label = new Date(sale.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
      buckets.set(label, (buckets.get(label) || 0) + parseFloat(sale.total));
    });
    return Array.from(buckets.entries()).slice(-7).map(([name, total]) => ({ name, total }));
  }, [sales]);

  const bestProductData = useMemo(
    () => bestSelling.slice(0, 5).map((item, index) => ({
      name: item.Product?.name || 'Item',
      value: Number(item.unitsold || 0),
      fill: chartColors[index % chartColors.length],
    })),
    [bestSelling]
  );

  const cashierData = useMemo(
    () => cashierReport.slice(0, 5).map((item) => ({ name: item.cashier?.name || 'Cashier', revenue: Number(item.revenue || 0) })),
    [cashierReport]
  );

  const recentCustomers = useMemo(() => customers.slice(0, 5), [customers]);
  const repeatCustomers = useMemo(
    () => customers.filter((customer) => Number(customer.salesCount || 0) > 1).length,
    [customers]
  );
  const averageTicket = totalSales ? totalRevenue / totalSales : 0;
  const shopName = user?.shop?.name || 'StockDesk Shop';
  const shopSlug = user?.shop?.slug || 'legacy-shop';
  const todayMetrics = summary?.periods?.today;
  const yesterdayMetrics = summary?.periods?.yesterday;
  const weekMetrics = summary?.periods?.thisWeek;
  const monthMetrics = summary?.periods?.thisMonth;
  const todayVsYesterday = summary?.comparisons?.todayVsYesterday;
  const weekVsLastWeek = summary?.comparisons?.thisWeekVsLastWeek;
  const monthVsLastMonth = summary?.comparisons?.thisMonthVsLastMonth;

  const performanceCards = [
    {
      title: 'Today',
      metrics: todayMetrics,
      subtitle: `${todaysSales} sales closed today.`,
      comparisonLabel: 'vs yesterday',
      comparison: todayVsYesterday,
    },
    {
      title: 'Yesterday',
      metrics: yesterdayMetrics,
      subtitle: `${yesterdayMetrics?.orderCount || 0} sales yesterday.`,
      comparisonLabel: 'reference day',
      comparison: null,
    },
    {
      title: 'This Week',
      metrics: weekMetrics,
      subtitle: `${weekMetrics?.orderCount || 0} orders this week.`,
      comparisonLabel: 'vs last week',
      comparison: weekVsLastWeek,
    },
    {
      title: 'This Month',
      metrics: monthMetrics,
      subtitle: `${monthMetrics?.orderCount || 0} orders this month.`,
      comparisonLabel: 'vs last month',
      comparison: monthVsLastMonth,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.18),_transparent_32%),linear-gradient(135deg,#0f172a,_#102a43_50%,_#134e4a)] px-6 py-8 text-white">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-100">Operational Command Center</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight">{shopName} is tracking sales, stock pressure, and customer growth in one place.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Keep your daily flow visible: revenue momentum, inventory risk, customer activity, and the people driving sales.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">Shop Scope</p>
              <p className="mt-2 text-xl font-semibold">{shopName}</p>
              <p className="text-sm text-slate-300">{shopSlug}</p>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-[2rem] bg-white p-8 text-center text-slate-500 shadow-sm">Loading dashboard metrics...</div>
      ) : (
        <>
          <section className="grid gap-6 xl:grid-cols-4 md:grid-cols-2">
            {performanceCards.map((card) => (
              <div key={card.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{card.title}</p>
                    <h3 className="mt-3 text-3xl font-semibold text-slate-900">{formatMoney(currency, card.metrics?.netSales || 0)}</h3>
                    <p className="mt-2 text-sm text-slate-500">Net sales</p>
                  </div>
                  {card.comparison ? (
                    <div className={`rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold ${comparisonTone(card.comparison.netSales.percentChange)}`}>
                      {formatDelta(card.comparison.netSales.percentChange)}
                    </div>
                  ) : null}
                </div>
                <div className="mt-5 grid gap-3 text-sm">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-slate-500">Gross profit</span>
                    <span className="font-semibold text-slate-900">{formatMoney(currency, card.metrics?.grossProfit || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-slate-500">Items sold</span>
                    <span className="font-semibold text-slate-900">{Number(card.metrics?.itemsSold || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-slate-500">Gross sales</span>
                    <span className="font-semibold text-slate-900">{formatMoney(currency, card.metrics?.grossSales || 0)}</span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-500">{card.subtitle}</p>
                {card.comparison ? (
                  <div className="mt-3 flex flex-wrap gap-3 text-xs">
                    <span className={`${comparisonTone(card.comparison.netSales.percentChange)}`}>Sales {formatDelta(card.comparison.netSales.percentChange)} {card.comparisonLabel}</span>
                    <span className={`${comparisonTone(card.comparison.grossProfit.percentChange)}`}>Profit {formatDelta(card.comparison.grossProfit.percentChange)}</span>
                    <span className={`${comparisonTone(card.comparison.itemsSold.percentChange)}`}>Items {formatDelta(card.comparison.itemsSold.percentChange)}</span>
                  </div>
                ) : null}
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr_0.8fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Average Ticket</p>
              <h3 className="mt-3 text-3xl font-semibold text-slate-900">{formatMoney(currency, averageTicket)}</h3>
              <p className="mt-2 text-sm text-slate-500">Across {totalSales} recorded sales.</p>
            </div>
            <div className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100">Customers</p>
              <h3 className="mt-3 text-3xl font-semibold">{customers.length}</h3>
              <p className="mt-2 text-sm text-emerald-50">{repeatCustomers} repeat customers already in the system.</p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Inventory Risk</p>
              <h3 className="mt-3 text-3xl font-semibold text-slate-900">{lowStockCount}</h3>
              <p className="mt-2 text-sm text-slate-500">Products currently at or below their low-stock limit.</p>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Revenue Trend</h3>
                  <p className="mt-1 text-sm text-slate-500">Last seven sales days at a glance.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Total Revenue</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{formatMoney(currency, totalRevenue)}</p>
                </div>
              </div>
              <div className="mt-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrend}>
                    <defs>
                      <linearGradient id="dashboardRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f766e" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#0f766e" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" tickLine={false} axisLine={false} tickFormatter={(value) => Number(value).toLocaleString()} />
                    <Tooltip formatter={(value) => formatMoney(currency, value)} />
                    <Area type="monotone" dataKey="total" stroke="#0f766e" fill="url(#dashboardRevenue)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Best Sellers</h3>
                <div className="mt-5 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={bestProductData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                        {bestProductData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} units`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  {bestProductData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                      <span>{item.name}</span>
                      <span className="font-semibold text-slate-900">{item.value} units</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr_1fr]">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Customer Momentum</h3>
              <p className="mt-1 text-sm text-slate-500">Recent profiles added to your shop directory.</p>
              <div className="mt-5 space-y-3">
                {recentCustomers.map((customer) => (
                  <div key={customer.id} className="rounded-3xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{customer.name}</p>
                        <p className="text-xs text-slate-500">{customer.phone || customer.email || 'No contact saved yet'}</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {Number(customer.salesCount || 0)} sales
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Recent Sales</h3>
              <p className="mt-1 text-sm text-slate-500">Quick access to the most recent transactions.</p>
              <div className="mt-5 space-y-3">
                {sales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="rounded-3xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800">Sale #{sale.id}</p>
                        <p className="text-xs text-slate-500">{sale.customer?.name || 'Walk-in Customer'} • {new Date(sale.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-2xl bg-emerald-50 px-3 py-1 text-sm text-emerald-700 whitespace-nowrap">{formatMoney(sale.currency || currency, sale.total)}</span>
                        <button
                          type="button"
                          onClick={() => downloadReceipt(sale.id)}
                          className="rounded-2xl bg-blue-100 px-3 py-1 text-xs text-blue-700 hover:bg-blue-200 whitespace-nowrap"
                        >
                          Receipt
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Cashier Performance</h3>
              <p className="mt-1 text-sm text-slate-500">Revenue contribution by the top active cashiers.</p>
              <div className="mt-5 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashierData} layout="vertical" margin={{ left: 12, right: 12 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={96} tickLine={false} axisLine={false} stroke="#64748b" />
                    <Tooltip formatter={(value) => formatMoney(currency, value)} />
                    <Bar dataKey="revenue" fill="#2563eb" radius={[10, 10, 10, 10]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Inventory Watchlist</h3>
                <p className="mt-1 text-sm text-slate-500">Products that need replenishment attention before they affect sales.</p>
              </div>
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-right text-rose-700">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Low Stock Count</p>
                <p className="mt-1 text-lg font-semibold">{lowStockCount}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {products
                .filter((product) => product.quantity <= product.lowStock)
                .slice(0, 6)
                .map((product) => (
                  <div key={product.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{product.category}</p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-slate-500">On hand</span>
                      <span className="font-semibold text-slate-900">{product.quantity}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-slate-500">Low stock level</span>
                      <span className="font-semibold text-rose-700">{product.lowStock}</span>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
