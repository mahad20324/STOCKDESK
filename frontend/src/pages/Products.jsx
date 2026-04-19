import { useEffect, useMemo, useState } from 'react';
import { fetchProducts, createProduct, updateProduct, deleteProduct, fetchSettings, restockProduct, fetchStockHistory } from '../utils/api';
import { getUser } from '../utils/auth';

const emptyForm = { name: '', category: '', buyPrice: '', sellPrice: '', quantity: 0, lowStock: 5 };

function formatMoney(currency, value) {
  return `${currency} ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function StatTile({ label, value, tone = 'default', eyebrow = 'Inventory' }) {
  const valueClass = {
    default: 'text-[var(--text-primary)]',
    success: 'text-[var(--success)]',
    danger: 'text-[var(--danger)]',
    warning: 'text-[var(--warning)]',
  }[tone];
  const borderAccent = {
    default: 'border-l-[3px] border-l-[var(--accent)]',
    success: 'border-l-[3px] border-l-[var(--success)]',
    danger: 'border-l-[3px] border-l-[var(--danger)]',
    warning: 'border-l-[3px] border-l-[var(--warning)]',
  }[tone];

  return (
    <div className={`app-panel rounded-[1.2rem] border ${borderAccent} p-4 transition duration-200 hover:shadow-lg`}>
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">{eyebrow}</p>
      <p className="mt-1.5 text-[13px] font-medium text-[var(--text-secondary)]">{label}</p>
      <p className={`mt-2 text-2xl font-bold tracking-tight ${valueClass}`}>{value}</p>
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
  const [restockmodal, setRestockModal] = useState(null); // product being restocked
  const [restockForm, setRestockForm] = useState({ quantity: '', costPrice: '', supplier: '', notes: '' });
  const [restockMessage, setRestockMessage] = useState('');
  const [stockHistory, setStockHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
      // Validation layer
      const validationErrors = [];
      if (!form.name || form.name.trim().length === 0) {
        validationErrors.push('Product name is required');
      }
      if (!form.buyPrice || parseFloat(form.buyPrice) < 0) {
        validationErrors.push('Buying price is required and must be a positive number');
      }
      if (!form.sellPrice || parseFloat(form.sellPrice) < 0) {
        validationErrors.push('Selling price is required and must be a positive number');
      }
      
      if (validationErrors.length > 0) {
        setMessage(validationErrors.join('; '));
        return;
      }
      
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

  const openRestock = async (product) => {
    setRestockModal(product);
    setRestockForm({ quantity: '', costPrice: product.buyPrice || '', supplier: '', notes: '' });
    setRestockMessage('');
    setHistoryLoading(true);
    try {
      const history = await fetchStockHistory(product.id);
      setStockHistory(history);
    } catch {
      setStockHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    try {
      const result = await restockProduct(restockmodal.id, restockForm);
      setRestockMessage(`Restocked. New stock: ${result.newQuantity} units.`);
      await loadData();
      setRestockForm((prev) => ({ ...prev, quantity: '' }));
    } catch (err) {
      setRestockMessage(err.message);
    }
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
  const uniqueCategories = useMemo(() => {
    const categories = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(categories).sort();
  }, [products]);

  return (
    <div className="space-y-6">
      <section className="app-panel relative overflow-hidden rounded-[1.7rem] border p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(30,167,189,0.14),transparent_58%)] lg:block" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="relative">
            <p className="text-sm text-[var(--text-muted)]">
              {isAdmin
                ? 'Manage your inventory catalog, prices, and stock levels from one place.'
                : 'Review current inventory levels. Only admins can make changes.'}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[460px]">
            <StatTile label="Products" value={products.length.toLocaleString()} eyebrow="Catalog" />
            <StatTile label="Units In Stock" value={totalUnits.toLocaleString()} tone="success" eyebrow="Availability" />
            <StatTile label="Low Stock" value={lowStockCount.toLocaleString()} tone={lowStockCount ? 'danger' : 'warning'} eyebrow="Attention" />
          </div>
        </div>

        {!isAdmin ? (
          <div className="app-alert-info mt-5 rounded-lg border border-[var(--border-default)] px-4 py-3 text-sm">
            Staff have read-only access here. Admins can add, edit, and delete products.
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
        <section className="app-panel rounded-[1.5rem] border p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 border-b border-[var(--border-default)] pb-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{editingId ? 'Update Product' : 'Add Product'}</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Keep stock counts and pricing accurate for smooth sales and reporting.</p>
            </div>
            <div className="app-panel-accent rounded-2xl px-3 py-2 text-sm font-medium">Stock value: {formatMoney(currency, stockValue)}</div>
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
                placeholder="Select or type a category"
                list="categoryList"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="app-input w-full rounded-lg border px-4 py-3"
              />
              <datalist id="categoryList">
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
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

      <section className="app-panel rounded-[1.5rem] border p-5 sm:p-6">
        <div className="flex flex-col gap-3 border-b border-[var(--border-default)] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Inventory List</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Current stock, pricing, and reorder thresholds.</p>
          </div>
          <div className="app-panel-soft rounded-2xl border px-3 py-2 text-sm text-[var(--text-muted)]">{currency} pricing shown per item</div>
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
          <div className="mt-5 overflow-x-auto rounded-[1.35rem] border border-[var(--border-default)]">
            <table className="min-w-full text-left text-sm">
              <thead className="app-table-head">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Buy</th>
                  <th className="px-4 py-3 font-medium">Sell</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Low Stock</th>
                  {isAdmin ? <th className="px-4 py-3 font-medium">Actions</th> : null}                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)] bg-[var(--surface-primary)]">
                {products.map((product) => {
                  const isLow = Number(product.quantity || 0) <= Math.max(5, Number(product.lowStock || 0));
                  return (
                    <tr key={product.id} className="app-row-hover transition">
                      <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-xs font-semibold text-[var(--accent-strong)]">
                            {String(product.name || 'P').slice(0, 1).toUpperCase()}
                          </span>
                          <span>{product.name}</span>
                        </div>
                      </td>
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
                              onClick={() => openRestock(product)}
                              className="app-btn-secondary rounded-lg border px-3 py-1.5 text-sm transition"
                            >
                              Restock
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

      {/* Restock Modal */}
      {restockmodal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={(e) => { if (e.target === e.currentTarget) setRestockModal(null); }}>
          <div className="app-panel w-full max-w-lg rounded-[1.5rem] border p-6">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Restock · {restockmodal.name}</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Current stock: {restockmodal.quantity} units</p>
              </div>
              <button type="button" onClick={() => setRestockModal(null)} className="app-btn-subtle rounded-full p-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            {restockMessage && (
              <div className={`mt-4 rounded-xl px-4 py-3 text-sm ${restockMessage.includes('Restocked') ? 'app-alert-success' : 'app-alert-danger'}`}>{restockMessage}</div>
            )}
            <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={handleRestock}>
              <label className="space-y-2 text-sm text-[var(--text-secondary)]">
                Add quantity *
                <input type="number" min="1" required value={restockForm.quantity} onChange={(e) => setRestockForm((prev) => ({ ...prev, quantity: e.target.value }))} className="app-input w-full rounded-lg border px-4 py-3" placeholder="e.g. 50" />
              </label>
              <label className="space-y-2 text-sm text-[var(--text-secondary)]">
                Cost price (updates buy price)
                <input type="number" step="0.01" min="0" value={restockForm.costPrice} onChange={(e) => setRestockForm((prev) => ({ ...prev, costPrice: e.target.value }))} className="app-input w-full rounded-lg border px-4 py-3" placeholder={String(restockmodal.buyPrice)} />
              </label>
              <label className="space-y-2 text-sm text-[var(--text-secondary)]">
                Supplier
                <input type="text" value={restockForm.supplier} onChange={(e) => setRestockForm((prev) => ({ ...prev, supplier: e.target.value }))} className="app-input w-full rounded-lg border px-4 py-3" placeholder="Supplier name" />
              </label>
              <label className="space-y-2 text-sm text-[var(--text-secondary)]">
                Notes
                <input type="text" value={restockForm.notes} onChange={(e) => setRestockForm((prev) => ({ ...prev, notes: e.target.value }))} className="app-input w-full rounded-lg border px-4 py-3" placeholder="Optional" />
              </label>
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" className="app-btn-primary rounded-xl px-5 py-3 text-white transition">Add Stock</button>
                <button type="button" onClick={() => setRestockModal(null)} className="app-btn-secondary rounded-xl border px-5 py-3 transition">Close</button>
              </div>
            </form>
            {/* Stock history */}
            {historyLoading ? (
              <div className="mt-5 h-20 animate-pulse rounded-xl bg-[var(--surface-secondary)]" />
            ) : stockHistory.length > 0 ? (
              <div className="mt-5">
                <p className="mb-3 text-sm font-medium text-[var(--text-muted)]">Recent restock history</p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {stockHistory.map((entry) => (
                    <div key={entry.id} className="app-panel-soft flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm">
                      <span className="text-[var(--text-primary)]">+{entry.quantity} units</span>
                      {entry.supplier && <span className="text-[var(--text-muted)]">{entry.supplier}</span>}
                      <span className="text-xs text-[var(--text-muted)]">{new Date(entry.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
