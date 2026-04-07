import { useEffect, useMemo, useState } from 'react';
import { fetchProducts, createProduct, updateProduct, deleteProduct, fetchSettings } from '../utils/api';
import { getUser } from '../utils/auth';

const emptyForm = { name: '', category: '', buyPrice: '', sellPrice: '', quantity: 0, lowStock: 5 };

function formatMoney(currency, value) {
  return `${currency} ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function StatTile({ label, value, tone = 'default' }) {
  const tones = {
    default: 'text-[#111827] bg-white',
    success: 'text-[#16A34A] bg-[#F0FDF4]',
    danger: 'text-[#DC2626] bg-[#FEF2F2]',
    warning: 'text-[#F59E0B] bg-[#FFFBEB]',
  };

  return (
    <div className={`rounded-lg border border-slate-200 p-4 ${tones[tone]}`}>
      <p className="text-sm text-[#6B7280]">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function Products() {
  const isAdmin = getUser()?.role === 'Admin';
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const settings = await fetchSettings();
      setCurrency(settings.currency || 'USD');
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await updateProduct(editingId, form);
        setMessage('Product updated successfully.');
      } else {
        await createProduct(form);
        setMessage('Product added successfully.');
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const editProduct = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      buyPrice: product.buyPrice,
      sellPrice: product.sellPrice,
      quantity: product.quantity,
      lowStock: product.lowStock,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await deleteProduct(id);
    setMessage('Product deleted.');
    await loadData();
  };

  const totalUnits = useMemo(() => products.reduce((sum, product) => sum + Number(product.quantity || 0), 0), [products]);
  const lowStockCount = useMemo(
    () => products.filter((product) => Number(product.quantity || 0) <= Math.max(5, Number(product.lowStock || 0))).length,
    [products]
  );
  const stockValue = useMemo(
    () => products.reduce((sum, product) => sum + Number(product.quantity || 0) * Number(product.buyPrice || 0), 0),
    [products]
  );

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#111827]">Products</h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              {isAdmin
                ? 'Manage your inventory catalog, prices, and stock levels from one place.'
                : 'Review current inventory levels. Only admins can make changes.'}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[460px]">
            <StatTile label="Products" value={products.length.toLocaleString()} />
            <StatTile label="Units In Stock" value={totalUnits.toLocaleString()} tone="success" />
            <StatTile label="Low Stock" value={lowStockCount.toLocaleString()} tone={lowStockCount ? 'danger' : 'warning'} />
          </div>
        </div>

        {!isAdmin ? (
          <div className="mt-5 rounded-lg border border-slate-200 bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
            Cashiers have read-only access here. Admins can add, edit, and delete products.
          </div>
        ) : null}

        {message ? (
          <div
            className={`mt-5 rounded-lg px-4 py-3 text-sm ${
              message.toLowerCase().includes('success') || message.toLowerCase().includes('updated') || message.toLowerCase().includes('added') || message.toLowerCase().includes('deleted')
                ? 'bg-[#F0FDF4] text-[#166534]'
                : 'bg-[#FEF2F2] text-[#991B1B]'
            }`}
          >
            {message}
          </div>
        ) : null}
      </section>

      {isAdmin ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-semibold text-[#111827]">{editingId ? 'Update Product' : 'Add Product'}</h3>
              <p className="mt-1 text-sm text-[#6B7280]">Keep stock counts and pricing accurate for smooth sales and reporting.</p>
            </div>
            <div className="rounded-lg bg-[#F9FAFB] px-3 py-2 text-sm text-[#6B7280]">Stock value: {formatMoney(currency, stockValue)}</div>
          </div>

          <form className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={saveProduct}>
            <label className="space-y-2 text-sm text-[#374151]">
              Product name
              <input
                placeholder="e.g. Premium Rice"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-[#F9FAFB] px-4 py-3 outline-none transition focus:border-[#2563EB] focus:bg-white"
              />
            </label>
            <label className="space-y-2 text-sm text-[#374151]">
              Category
              <input
                placeholder="e.g. Grocery"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-[#F9FAFB] px-4 py-3 outline-none transition focus:border-[#2563EB] focus:bg-white"
              />
            </label>
            <label className="space-y-2 text-sm text-[#374151]">
              Buying price
              <input
                placeholder="0.00"
                type="number"
                step="0.01"
                value={form.buyPrice}
                onChange={(e) => setForm((prev) => ({ ...prev, buyPrice: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-[#F9FAFB] px-4 py-3 outline-none transition focus:border-[#2563EB] focus:bg-white"
              />
            </label>
            <label className="space-y-2 text-sm text-[#374151]">
              Selling price
              <input
                placeholder="0.00"
                type="number"
                step="0.01"
                value={form.sellPrice}
                onChange={(e) => setForm((prev) => ({ ...prev, sellPrice: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-[#F9FAFB] px-4 py-3 outline-none transition focus:border-[#2563EB] focus:bg-white"
              />
            </label>
            <label className="space-y-2 text-sm text-[#374151]">
              Quantity
              <input
                placeholder="0"
                type="number"
                value={form.quantity}
                onChange={(e) => setForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                className="w-full rounded-lg border border-slate-200 bg-[#F9FAFB] px-4 py-3 outline-none transition focus:border-[#2563EB] focus:bg-white"
              />
            </label>
            <label className="space-y-2 text-sm text-[#374151]">
              Low stock level
              <input
                placeholder="5"
                type="number"
                value={form.lowStock}
                onChange={(e) => setForm((prev) => ({ ...prev, lowStock: Number(e.target.value) }))}
                className="w-full rounded-lg border border-slate-200 bg-[#F9FAFB] px-4 py-3 outline-none transition focus:border-[#2563EB] focus:bg-white"
              />
            </label>
            <div className="md:col-span-2 xl:col-span-3 flex flex-wrap gap-3 pt-2">
              <button className="rounded-lg bg-[#2563EB] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#1D4ED8]">
                {editingId ? 'Update Product' : 'Add Product'}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-[#374151] transition hover:bg-[#F9FAFB]"
                >
                  Cancel Editing
                </button>
              ) : null}
            </div>
          </form>
        </section>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#111827]">Inventory List</h3>
            <p className="mt-1 text-sm text-[#6B7280]">Current stock, pricing, and reorder thresholds.</p>
          </div>
          <div className="rounded-lg bg-[#F9FAFB] px-3 py-2 text-sm text-[#6B7280]">{currency} pricing shown per item</div>
        </div>

        {loading ? (
          <div className="mt-5 grid gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-lg bg-[#F3F4F6]" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-[#F9FAFB] px-4 py-10 text-center">
            <p className="text-sm font-medium text-[#111827]">No products yet</p>
            <p className="mt-2 text-sm text-[#6B7280]">Add your first product to begin tracking inventory and sales.</p>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#F9FAFB] text-[#6B7280]">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Buy</th>
                  <th className="px-4 py-3 font-medium">Sell</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Low Stock</th>
                  {isAdmin ? <th className="px-4 py-3 font-medium">Actions</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {products.map((product) => {
                  const isLow = Number(product.quantity || 0) <= Math.max(5, Number(product.lowStock || 0));
                  return (
                    <tr key={product.id} className="transition hover:bg-[#F9FAFB]">
                      <td className="px-4 py-3 font-medium text-[#111827]">{product.name}</td>
                      <td className="px-4 py-3 text-[#6B7280]">{product.category || 'Uncategorized'}</td>
                      <td className="px-4 py-3 text-[#6B7280]">{formatMoney(currency, product.buyPrice)}</td>
                      <td className="px-4 py-3 text-[#111827]">{formatMoney(currency, product.sellPrice)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isLow ? 'bg-[#FEF2F2] text-[#DC2626]' : 'bg-[#F0FDF4] text-[#166534]'}`}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#6B7280]">{product.lowStock}</td>
                      {isAdmin ? (
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => editProduct(product)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-[#374151] transition hover:bg-[#F9FAFB]"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeProduct(product.id)}
                              className="rounded-lg bg-[#FEF2F2] px-3 py-1.5 text-sm text-[#DC2626] transition hover:bg-[#FEE2E2]"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
