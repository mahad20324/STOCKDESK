import { useEffect, useState } from 'react';
import { fetchProducts, createProduct, updateProduct, deleteProduct, fetchSettings } from '../utils/api';
import { getUser } from '../utils/auth';

const emptyForm = { name: '', category: '', buyPrice: '', sellPrice: '', quantity: 0, lowStock: 5 };

export default function Products() {
  const isAdmin = getUser()?.role === 'Admin';
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const settings = await fetchSettings();
      setCurrency(settings.currency || 'USD');
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await updateProduct(editingId, form);
        setMessage('Product updated.');
      } else {
        await createProduct(form);
        setMessage('Product added.');
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
  };

  const removeProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await deleteProduct(id);
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Products</h2>
            <p className="text-slate-500">{isAdmin ? 'Add, edit, and manage inventory items.' : 'View inventory items. Only admins can change products.'}</p>
          </div>
        </div>

        {isAdmin ? (
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={saveProduct}>
          <input
            placeholder="Product name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
          />
          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
          />
          <input
            placeholder="Buying price"
            type="number"
            step="0.01"
            value={form.buyPrice}
            onChange={(e) => setForm((prev) => ({ ...prev, buyPrice: e.target.value }))}
            className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
          />
          <input
            placeholder="Selling price"
            type="number"
            step="0.01"
            value={form.sellPrice}
            onChange={(e) => setForm((prev) => ({ ...prev, sellPrice: e.target.value }))}
            className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
          />
          <input
            placeholder="Quantity"
            type="number"
            value={form.quantity}
            onChange={(e) => setForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
            className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
          />
          <input
            placeholder="Low stock limit"
            type="number"
            value={form.lowStock}
            onChange={(e) => setForm((prev) => ({ ...prev, lowStock: Number(e.target.value) }))}
            className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
          />
          <div className="md:col-span-2">
            <button className="rounded-3xl bg-brand-600 px-6 py-3 text-white transition hover:bg-brand-700">
              {editingId ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
        ) : (
          <div className="mt-6 rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Cashiers can view stock levels, but only admins can add, edit, or delete products.
          </div>
        )}

        {message && <div className="mt-4 rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
      </div>

      <div className="rounded-[2rem] bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Inventory</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Sell</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Low Stock</th>
                {isAdmin && <th className="px-4 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3">{currency} {parseFloat(product.sellPrice).toFixed(2)}</td>
                  <td className="px-4 py-3">{product.quantity}</td>
                  <td className="px-4 py-3">{product.lowStock}</td>
                  {isAdmin && (
                    <td className="px-4 py-3 space-x-2">
                      <button
                        type="button"
                        onClick={() => editProduct(product)}
                        className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProduct(product.id)}
                        className="rounded-full bg-rose-100 px-3 py-1 text-sm text-rose-700 hover:bg-rose-200"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
