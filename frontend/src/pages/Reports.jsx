import { useEffect, useMemo, useState } from 'react';
import { fetchReports, fetchBestSelling, fetchCashierReport, fetchDashboardSummary, fetchSettings } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

const colors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

function formatMoney(currency, value) {
  return `${currency} ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function MetricCard({ label, value, helper, eyebrow = 'Insight' }) {
  return (
    <div className="app-panel relative overflow-hidden rounded-[1.4rem] border p-5">
      <div className="absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(30,167,189,0.12),transparent)]" />
      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{eyebrow}</p>
        <p className="mt-3 text-sm font-medium text-[var(--text-muted)]">{label}</p>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">{value}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{helper}</p>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children, action }) {
  return (
    <section className="app-panel rounded-[1.5rem] border p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 border-b border-[var(--border-default)] pb-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function EmptyState({ title, message }) {
  return (
    <div className="app-panel-soft rounded-lg border border-dashed px-4 py-10 text-center">
      <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
      <p className="mt-2 text-sm text-[var(--text-muted)]">{message}</p>
    </div>
  );
}

function ChartTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="app-panel rounded-2xl border px-4 py-3 shadow-xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{formatMoney(currency, payload[0].value)}</p>
    </div>
  );
}

export default function Reports() {
  const [dailySales, setDailySales] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [cashierReport, setCashierReport] = useState([]);
  const [summary, setSummary] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const [salesData, productData, cashierData, summaryData, settings] = await Promise.all([
          fetchReports(),
          fetchBestSelling(),
          fetchCashierReport(),
          fetchDashboardSummary(),
          fetchSettings(),
        ]);
        setDailySales(salesData);
        setBestSelling(productData);
        setCashierReport(cashierData);
        setSummary(summaryData);
        setCurrency(settings.currency || 'USD');
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  const salesSummary = useMemo(
    () => dailySales.slice(0, 10).map((sale) => ({ name: `#${sale.id}`, total: parseFloat(sale.total || 0) })),
    [dailySales]
  );
  const bestProductData = useMemo(
    () => bestSelling.slice(0, 5).map((item, index) => ({
      name: item.Product?.name || 'Item',
      value: Number(item.unitsold || 0),
      fill: colors[index % colors.length],
    })),
    [bestSelling]
  );
  const cashierData = useMemo(
    () => cashierReport.map((item) => ({ name: item.cashier?.name || 'Cashier', revenue: Number(item.revenue || 0) })),
    [cashierReport]
  );
  const totalRevenue = useMemo(
    () => Number(summary?.periods?.today?.netSales || dailySales.reduce((sum, sale) => sum + Number(sale.total || 0), 0)),
    [dailySales, summary]
  );
  const totalProfit = useMemo(
    () => Number(summary?.periods?.today?.grossProfit || 0),
    [summary]
  );
  const averageSale = dailySales.length ? totalRevenue / dailySales.length : 0;

  return (
    <div className="space-y-6">
      <section className="app-panel relative overflow-hidden rounded-[1.7rem] border p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(30,167,189,0.14),transparent_58%)] lg:block" />
        <div className="relative">
          <div className="mb-3 inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
            Intelligence Hub
          </div>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Reports</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">Review sales performance, best-selling products, and cashier contribution with richer, clearer analytics.</p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <MetricCard label="Recorded Sales" value={dailySales.length.toLocaleString()} helper="Transactions included in this report." eyebrow="Activity" />
          <MetricCard label="Revenue" value={formatMoney(currency, totalRevenue)} helper="Combined total from listed sales." eyebrow="Revenue" />
          <MetricCard label="Gross Profit" value={formatMoney(currency, totalProfit)} helper="Estimated profit for the same sales period." eyebrow="Profit" />
          <MetricCard label="Average Sale" value={formatMoney(currency, averageSale)} helper="Typical transaction value across the report." eyebrow="Efficiency" />
        </div>
      </section>

      {loading ? (
        <div className="grid gap-6 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="app-panel-soft h-96 animate-pulse rounded-lg border" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <SectionCard
            title="Sales Activity"
            subtitle="Recent sales totals shown per transaction."
            action={<div className="app-panel-accent rounded-2xl px-3 py-2 text-sm font-medium">{salesSummary.length} transactions</div>}
          >
            {salesSummary.length ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesSummary} barCategoryGap="28%">
                    <defs>
                      <linearGradient id="reportSalesGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="var(--accent-hover)" stopOpacity="0.72" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltip currency={currency} />} />
                    <Bar dataKey="total" fill="url(#reportSalesGradient)" radius={[12, 12, 4, 4]} maxBarSize={52} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="No sales data yet" message="Sales will appear here once transactions are recorded." />
            )}
          </SectionCard>

          <SectionCard
            title="Best Selling Products"
            subtitle="Top items by quantity sold."
            action={<div className="app-panel-soft rounded-2xl border px-3 py-2 text-sm text-[var(--text-muted)]">Top {bestProductData.length || 0}</div>}
          >
            {bestProductData.length ? (
              <>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={bestProductData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                        {bestProductData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {bestProductData.map((item, index) => (
                    <div key={item.name} className="app-panel-soft flex items-center justify-between rounded-2xl border px-3 py-3 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ backgroundColor: colors[index % colors.length] }}>
                          {index + 1}
                        </span>
                        <span className="text-[var(--text-primary)]">{item.name}</span>
                      </div>
                      <span className="font-medium text-[var(--text-muted)]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState title="No product trends yet" message="Best-selling products will show once enough sales data is available." />
            )}
          </SectionCard>

          <SectionCard
            title="Revenue by Cashier"
            subtitle="Compare cashier contribution by revenue."
            action={<div className="app-panel-soft rounded-2xl border px-3 py-2 text-sm text-[var(--text-muted)]">{cashierData.length} cashiers</div>}
          >
            {cashierData.length ? (
              <>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashierData} layout="vertical" margin={{ left: 8, right: 8 }}>
                      <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
                      <XAxis type="number" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="name" stroke="var(--text-muted)" tickLine={false} axisLine={false} width={90} />
                      <Tooltip content={<ChartTooltip currency={currency} />} />
                      <Bar dataKey="revenue" fill="var(--chart-2)" radius={[10, 10, 10, 10]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {cashierData.map((item, index) => (
                    <div key={item.name} className="app-panel-soft flex items-center justify-between rounded-2xl border px-3 py-3 text-sm">
                      <span className="flex items-center gap-3 text-[var(--text-primary)]">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface-tertiary)] text-xs font-semibold text-[var(--accent-strong)]">{index + 1}</span>
                        {item.name}
                      </span>
                      <span className="font-medium text-[var(--text-muted)]">{formatMoney(currency, item.revenue)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState title="No cashier activity yet" message="Cashier performance will show after recorded sales are assigned." />
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}
