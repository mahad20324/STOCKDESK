import { useEffect, useMemo, useState } from 'react';
import { fetchReports, fetchBestSelling, fetchCashierReport, fetchSettings } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

const colors = ['#2563EB', '#60A5FA', '#93C5FD', '#1D4ED8', '#DBEAFE'];

function formatMoney(currency, value) {
  return `${currency} ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function MetricCard({ label, value, helper }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-[#6B7280]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#111827]">{value}</p>
      <p className="mt-2 text-sm text-[#6B7280]">{helper}</p>
    </div>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-lg font-semibold text-[#111827]">{title}</h3>
        <p className="mt-1 text-sm text-[#6B7280]">{subtitle}</p>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function EmptyState({ title, message }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-[#F9FAFB] px-4 py-10 text-center">
      <p className="text-sm font-medium text-[#111827]">{title}</p>
      <p className="mt-2 text-sm text-[#6B7280]">{message}</p>
    </div>
  );
}

export default function Reports() {
  const [dailySales, setDailySales] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [cashierReport, setCashierReport] = useState([]);
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const [salesData, productData, cashierData, settings] = await Promise.all([
          fetchReports(),
          fetchBestSelling(),
          fetchCashierReport(),
          fetchSettings(),
        ]);
        setDailySales(salesData);
        setBestSelling(productData);
        setCashierReport(cashierData);
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
    () => dailySales.reduce((sum, sale) => sum + Number(sale.total || 0), 0),
    [dailySales]
  );

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-semibold text-[#111827]">Reports</h2>
        <p className="mt-2 text-sm text-[#6B7280]">Review sales performance, best-selling products, and cashier contribution with simple, readable charts.</p>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <MetricCard label="Recorded Sales" value={dailySales.length.toLocaleString()} helper="Transactions included in this report." />
          <MetricCard label="Revenue" value={formatMoney(currency, totalRevenue)} helper="Combined total from listed sales." />
          <MetricCard label="Top Products" value={bestProductData.length.toLocaleString()} helper="Products currently contributing the most sales." />
        </div>
      </section>

      {loading ? (
        <div className="grid gap-6 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-96 animate-pulse rounded-lg border border-slate-200 bg-white shadow-sm" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <SectionCard title="Sales Activity" subtitle="Recent sales totals shown per transaction.">
            {salesSummary.length ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesSummary} barCategoryGap="28%">
                    <CartesianGrid vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#6B7280" tickLine={false} axisLine={false} />
                    <YAxis stroke="#6B7280" tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value) => formatMoney(currency, value)} />
                    <Bar dataKey="total" fill="#2563EB" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="No sales data yet" message="Sales will appear here once transactions are recorded." />
            )}
          </SectionCard>

          <SectionCard title="Best Selling Products" subtitle="Top items by quantity sold.">
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
                    <div key={item.name} className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-3 py-2 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                        <span className="text-[#111827]">{item.name}</span>
                      </div>
                      <span className="font-medium text-[#6B7280]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState title="No product trends yet" message="Best-selling products will show once enough sales data is available." />
            )}
          </SectionCard>

          <SectionCard title="Revenue by Cashier" subtitle="Compare cashier contribution by revenue.">
            {cashierData.length ? (
              <>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashierData} layout="vertical" margin={{ left: 8, right: 8 }}>
                      <CartesianGrid horizontal={false} stroke="#E5E7EB" />
                      <XAxis type="number" stroke="#6B7280" tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="name" stroke="#6B7280" tickLine={false} axisLine={false} width={90} />
                      <Tooltip formatter={(value) => formatMoney(currency, value)} />
                      <Bar dataKey="revenue" fill="#2563EB" radius={[8, 8, 8, 8]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {cashierData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-3 py-2 text-sm">
                      <span className="text-[#111827]">{item.name}</span>
                      <span className="font-medium text-[#6B7280]">{formatMoney(currency, item.revenue)}</span>
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
