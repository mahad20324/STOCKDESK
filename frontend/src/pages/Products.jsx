import { useEffect, useMemo, useState } from 'react';
import { fetchProducts, createProduct, updateProduct, deleteProduct, fetchSettings } from '../utils/api';
import { getUser } from '../utils/auth';

const emptyForm = { name: '', category: '', buyPrice: '', sellPrice: '', quantity: 0, lowStock: 5 };

function formatMoney(currency, value) {
  return `${currency} ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function StatTile({ label, value, tone = 'default' }) {
  const tones = {
    default: 'text-[var(--text-primary)] bg-[var(--surface-primary)]',
    success: 'text-[var(--success)] bg-[var(--success-soft)]',
    danger: 'text-[var(--danger)] bg-[var(--danger-soft)]',
    warning: 'text-[var(--warning)] bg-[var(--warning-soft)]',
  };

  return (
    <div className={`rounded-lg border border-[var(--border-default)] p-4 ${tones[tone]}`}>
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
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
      <section className="app-panel rounded-lg border p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Products</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
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
          <div className="app-alert-info mt-5 rounded-lg border border-[var(--border-default)] px-4 py-3 text-sm">
            Cashiers have read-only access here. Admins can add, edit, and delete products.
          </div>
        ) : null}

        {message ? (
          <div
            className={`mt-5 rounded-lg px-4 py-3 text-sm ${
              message.toLowerCase().includes('success') || message.toLowerCase().includes('updated') || message.toLowerCase().includes('added') || message.toLowerCase().includes('deleted')
                ? 'app-alert-success'
                : 'app-alert-danger'
            }`}
          >
            {message}
          </div>
        ) : null}
      </section>

      {isAdmin ? (
        <section className="app-panel rounded-lg border p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 border-b border-[var(--border-default)] pb-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{editingId ? 'Update Product' : 'Add Product'}</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Keep stock counts and pricing accurate for smooth sales and reporting.</p>
            </div>
            <div className="app-panel-soft rounded-lg border px-3 py-2 text-sm text-[var(--text-muted)]">Stock value: {formatMoney(currency, stockValue)}</div>
          </div>

          <form className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={saveProduct}>
            <label className="space-y-2 text-sm text-[var(--text-secondary)]">
              Product name
              <input
                placeholder="Product name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="app-input w-full rounded-lg border px-4 py-3"
              />
            </label>
            <label className="space-y-2 text-sm text-[var(--text-secondary)]">
              Category
              <input
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="app-input w-full rounded-lg border px-4 py-3"
              />
            </label>
            <label className="space-y-2 text-sm text-[var(--text-secondary)]">
              Buying price
              <input
                placeholder="0.00"
                type="number"
                step="0.01"
                value={form.buyPrice}
                onChange={(e) => setForm((prev) => ({ ...prev, buyPrice: e.target.value }))}
                className="app-input w-full rounded-lg border px-4 py-3"
              />
            </label>
            <label className="space-y-2 text-sm text-[var(--text-secondary)]">
              Selling price
              <input
                placeholder="0.00"
                type="number"
                step="0.01"
                value={form.sellPrice}
                onChange={(e) => setForm((prev) => ({ ...prev, sellPrice: e.target.value }))}
                className="app-input w-full rounded-lg border px-4 py-3"
              />
            </label>
            <label className="space-y-2 text-sm text-[var(--text-secondary)]">
              Quantity
              <input
                placeholder="0"
                type="number"
                value={form.quantity}
                onChange={(e) => setForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                className="app-input w-full rounded-lg border px-4 py-3"
              />
            </label>
            <label className="space-y-2 text-sm text-[var(--text-secondary)]">
              Low stock level
              <input
                placeholder="5"
                type="number"
                value={form.lowStock}
                onChange={(e) => setForm((prev) => ({ ...prev, lowStock: Number(e.target.value) }))}
                className="app-input w-full rounded-lg border px-4 py-3"
              />
            </label>
            <div className="md:col-span-2 xl:col-span-3 flex flex-wrap gap-3 pt-2">
              <button className="app-btn-primary rounded-lg px-5 py-3 text-sm font-medium transition">
                {editingId ? 'Update Product' : 'Add Product'}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className="app-btn-secondary rounded-lg border px-5 py-3 text-sm font-medium transition"
                >
                  Cancel Editing
                </button>
              ) : null}
            </div>
          </form>
        </section>
      ) : null}

      <section className="app-panel rounded-lg border p-5 sm:p-6">
        <div className="flex flex-col gap-3 border-b border-[var(--border-default)] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Inventory List</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Current stock, pricing, and reorder thresholds.</p>
          </div>
          <div className="app-panel-soft rounded-lg border px-3 py-2 text-sm text-[var(--text-muted)]">{currency} pricing shown per item</div>
        </div>

        {loading ? (
          <div className="mt-5 grid gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="app-panel-soft h-16 animate-pulse rounded-lg border" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="app-panel-soft mt-5 rounded-lg border border-dashed px-4 py-10 text-center">
            <p className="text-sm font-medium text-[var(--text-primary)]">No products yet</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Add your first product to begin tracking inventory and sales.</p>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto rounded-lg border border-[var(--border-default)]">
            <table className="min-w-full text-left text-sm">
              <thead className="app-table-head">
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
              <tbody className="divide-y divide-[var(--border-default)] bg-[var(--surface-primary)]">
                {products.map((product) => {
                  const isLow = Number(product.quantity || 0) <= Math.max(5, Number(product.lowStock || 0));
                  return (
                    <tr key={product.id} className="app-row-hover transition">
                      <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{product.name}</td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">{product.category || 'Uncategorized'}</td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">{formatMoney(currency, product.buyPrice)}</td>
                      <td className="px-4 py-3 text-[var(--text-primary)]">{formatMoney(currency, product.sellPrice)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isLow ? 'app-alert-danger' : 'app-alert-success'}`}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">{product.lowStock}</td>
                      {isAdmin ? (
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => editProduct(product)}
                              className="app-btn-secondary rounded-lg border px-3 py-1.5 text-sm transition"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeProduct(product.id)}
                              className="app-btn-danger rounded-lg px-3 py-1.5 text-sm transition"
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
