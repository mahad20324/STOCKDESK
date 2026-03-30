import { useEffect, useMemo, useState } from 'react';
import { fetchProducts, createSale, fetchSettings, downloadReceipt, fetchSale } from '../utils/api';
import { getToken, getUser } from '../utils/auth';
import PosReceipt from '../components/Receipt/PosReceipt';

const paymentMethods = ['Cash', 'Card', 'Mobile Money'];

export default function POS() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [currency, setCurrency] = useState('USD');
  const [message, setMessage] = useState('');
  const [lastSaleId, setLastSaleId] = useState(null);
  const [lastSale, setLastSale] = useState(null);
  const [settings, setSettingsState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('fixed');
  const [autoPrint, setAutoPrint] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    loadProducts();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsData = await fetchSettings();
      setSettingsState(settingsData);
      setCurrency(settingsData.currency || 'USD');
      setAutoPrint(false);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadProducts = async () => {
    const data = await fetchProducts(search ? `?search=${encodeURIComponent(search)}` : '');
    setProducts(data);
  };

  const filteredProducts = useMemo(
    () => products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.quantity) } : item
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: parseFloat(product.sellPrice), quantity: 1 }];
    });
  };

  const updateQuantity = (productId, amount) => {
    setCart((prev) =>
      prev
        .map((item) => (item.productId === productId ? { ...item, quantity: Math.max(0, item.quantity + amount) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setDiscountType('fixed');
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = discountType === 'percentage' ? (subtotal * discount) / 100 : discount;
  const total = Math.max(0, subtotal - discountAmount);

  const printToThermalPrinter = async (saleId) => {
    try {
      setPrinting(true);
      const token = getToken();
      if (!token) {
        setMessage('Not authenticated. Opening PDF instead.');
        window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/sales/${saleId}/receipt`, '_blank');
        setPrinting(false);
        return;
      }
      const response = await fetch('http://localhost:4000/api/printer/print-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ saleId }),
      });

      if (response.ok) {
        setMessage('Receipt printed to thermal printer.');
      } else {
        const data = await response.json();
        if (data.fallback) {
          // Fallback to browser print
          window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/sales/${saleId}/receipt`, '_blank');
          setMessage('Thermal printer unavailable. Opened PDF in new tab.');
        } else {
          setMessage(`Print failed: ${data.error}`);
        }
      }
    } catch (error) {
      // Fallback to browser print
      window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/sales/${saleId}/receipt`, '_blank');
      setMessage('Thermal printer unavailable. Opened PDF in new tab.');
    } finally {
      setPrinting(false);
    }
  };

  const handleCheckout = async () => {
    try {
      if (!cart.length) {
        setMessage('Add at least one product to cart.');
        return;
      }
      setLoading(true);
      setMessage('');
      const response = await createSale({ items: cart, paymentMethod, currency: currency || 'USD', discount, discountType });
      
      // Fetch the full sale data to display in receipt
      const saleData = await fetchSale(response.saleId);
      
      setLastSaleId(response.saleId);
      setLastSale(saleData);
      setShowReceipt(true);
      setCart([]);
      setDiscount(0);
      setDiscountType('fixed');
      setMessage('Sale recorded successfully.');
      
      // Auto-print if enabled
      if (autoPrint) {
        setTimeout(() => {
          printToThermalPrinter(response.saleId);
        }, 500);
      }
      
      setLoading(false);
    } catch (error) {
      setMessage(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Point of Sale</h2>
            <p className="text-slate-500">Search products, build a cart, and complete a sale.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
              />
              <button
                type="button"
                onClick={loadProducts}
                className="rounded-3xl bg-brand-600 px-4 py-3 text-white hover:bg-brand-700"
              >
                Search
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-3xl border border-slate-200 p-4 shadow-sm">
                  <div>
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-500">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{currency} {parseFloat(product.sellPrice).toFixed(2)}</p>
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="mt-2 rounded-3xl bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">Cart</h3>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="rounded-3xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                >
                  Clear Cart
                </button>
              )}
            </div>
            <div className="mt-4 space-y-4">
              {cart.length === 0 ? (
                <p className="text-sm text-slate-500">No items in the cart yet.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.productId} className="rounded-3xl bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">{currency} {item.price.toFixed(2)} each</p>
                        <p className="mt-1 text-xs font-medium text-slate-400">Line total: {currency} {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                          </svg>
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, -1)}
                            className="rounded-full bg-slate-100 px-3 py-1"
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, 1)}
                            className="rounded-full bg-slate-100 px-3 py-1"
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          className="rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700 hover:bg-rose-200"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Payment method</p>
              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            <div className="mt-6 rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Discount</p>
              <div className="mt-3 flex gap-2">
                <select
                  value={discountType}
                  onChange={(event) => setDiscountType(event.target.value)}
                  className="w-24 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <option value="fixed">Fixed</option>
                  <option value="percentage">Percent</option>
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  placeholder={discountType === 'percentage' ? 'e.g., 10' : 'Amount'}
                  className="flex-1 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
                />
                <span className="flex items-center px-2 text-sm text-slate-500">{discountType === 'percentage' ? '%' : currency}</span>
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-600 text-sm">
                <span>Subtotal</span>
                <span>{currency} {subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="mt-2 flex items-center justify-between text-slate-600 text-sm">
                  <span>Discount</span>
                  <span>-{currency} {discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="mt-2 border-t border-slate-200 pt-2 flex items-center justify-between text-slate-700">
                <span>Total</span>
                <strong>{currency} {total.toFixed(2)}</strong>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className={`mt-4 w-full rounded-3xl px-4 py-3 text-white transition ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'
                }`}
              >
                {loading ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
            {message && (
              <div className={`mt-4 rounded-3xl px-4 py-3 text-sm ${message.includes('successfully') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span>{message}</span>
                  {message.includes('successfully') && lastSaleId && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => downloadReceipt(lastSaleId)}
                        className="rounded-2xl bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-700 whitespace-nowrap"
                      >
                        Download Receipt
                      </button>
                      <button
                        type="button"
                        onClick={() => printToThermalPrinter(lastSaleId)}
                        disabled={printing}
                        className="rounded-2xl bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 whitespace-nowrap disabled:opacity-50"
                      >
                        {printing ? 'Printing...' : 'Print Receipt'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* POS Receipt Modal */}
      {showReceipt && lastSale && settings && (
        <PosReceipt
          sale={lastSale}
          settings={settings}
          cashierName={getUser()?.name || 'Unknown'}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}
