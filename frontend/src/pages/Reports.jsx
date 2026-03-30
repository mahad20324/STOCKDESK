import { useEffect, useState } from 'react';
import { fetchReports, fetchBestSelling, fetchCashierReport } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getUser } from '../utils/auth';

const colors = ['#0f766e', '#0891b2', '#6366f1', '#a855f7', '#10b981'];

export default function Reports() {
  const user = getUser();
  const shopName = user?.shop?.name || 'Default Shop';
  const shopSlug = user?.shop?.slug || 'legacy-shop';
  const [dailySales, setDailySales] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [cashierReport, setCashierReport] = useState([]);

  useEffect(() => {
    async function loadReports() {
      try {
        setDailySales(await fetchReports());
        setBestSelling(await fetchBestSelling());
        setCashierReport(await fetchCashierReport());
      } catch (error) {
        console.error(error);
      }
    }

    loadReports();
  }, []);

  const salesSummary = dailySales.map((sale) => ({ name: `#${sale.id}`, total: parseFloat(sale.total) }));
  const bestProductData = bestSelling.map((item, index) => ({ name: item.Product.name, value: Number(item.unitsold), fill: colors[index % colors.length] }));
  const cashierData = cashierReport.map((item) => ({ name: item.cashier.name, revenue: Number(item.revenue) }));

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Reports</h2>
            <p className="mt-2 text-slate-500">Sales analytics for today, best-selling products, and cashier revenue.</p>
          </div>
          <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 px-4 py-3 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Shop Scope</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{shopName}</p>
            <p className="text-xs text-slate-500">{shopSlug}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Sales Activity</h3>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesSummary}>
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="total" fill="#14b8a6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Best Selling</h3>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={bestProductData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {bestProductData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Revenue by Cashier</h3>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashierData} layout="vertical">
                <XAxis type="number" stroke="#64748b" />
                <YAxis type="category" dataKey="name" stroke="#64748b" width={120} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 8, 8]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
