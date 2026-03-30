import { useEffect, useState } from 'react';
import { fetchProducts, fetchSales, fetchSettings, downloadReceipt } from '../utils/api';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [productData, saleData, settings] = await Promise.all([fetchProducts(), fetchSales(), fetchSettings()]);
        setProducts(productData);
        setSales(saleData);
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

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-4 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Today’s Sales</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">{totalSales}</h2>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total Products</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">{totalProducts}</h2>
        </div>
        <div className="rounded-[2rem] bg-gradient-to-r from-emerald-400 to-teal-500 p-6 text-white shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em]">Revenue</p>
          <h2 className="mt-3 text-3xl font-semibold">{currency} {totalRevenue.toFixed(2)}</h2>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Low Stock</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">{lowStockCount}</h2>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[2rem] bg-white p-8 text-center text-slate-500 shadow-sm">Loading dashboard metrics...</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Recent Sales</h3>
            <ul className="mt-4 space-y-3">
              {sales.slice(0, 5).map((sale) => (
                <li key={sale.id} className="rounded-3xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">Sale #{sale.id}</p>
                      <p className="text-sm text-slate-500">{new Date(sale.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-2xl bg-emerald-50 px-3 py-1 text-sm text-emerald-700 whitespace-nowrap">{sale.currency} {parseFloat(sale.total).toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => downloadReceipt(sale.id)}
                        className="rounded-2xl bg-blue-100 px-3 py-1 text-xs text-blue-700 hover:bg-blue-200 whitespace-nowrap"
                      >
                        Receipt
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Inventory Overview</h3>
            <p className="mt-3 text-sm text-slate-500">Monitoring product levels and low stock signals.</p>
            <div className="mt-6 grid gap-3">
              {products.slice(0, 3).map((product) => (
                <div key={product.id} className="rounded-3xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{product.name}</p>
                      <p className="text-sm text-slate-500">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-900">{product.quantity} units</p>
                      <p className="text-sm text-slate-500">Low stock at {product.lowStock}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
