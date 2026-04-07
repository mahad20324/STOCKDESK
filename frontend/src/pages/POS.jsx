import { useEffect, useMemo, useState } from 'react';
import { fetchProducts, createSale, fetchSettings, downloadReceipt, fetchSale, fetchCustomers, printReceiptToPrinter } from '../utils/api';
import { getToken, getUser } from '../utils/auth';
import PosReceipt from '../components/Receipt/PosReceipt';

const paymentMethods = ['Cash', 'Card', 'Mobile Money'];

function formatMoney(currency, value) {
  return `${currency} ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function SummaryStat({ label, value, helper }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-[#6B7280]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-[#111827]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[#6B7280]">{helper}</p>
    </div>
  );
}

export default function POS() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [customerId, setCustomerId] = useState('');
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
    loadCustomers();
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

  const loadCustomers = async () => {
    try {
      const data = await fetchCustomers();
      setCustomers(data);
      const walkIn = data.find((customer) => customer.name === 'Walk-in Customer');
      if (walkIn) {
        setCustomerId(String(walkIn.id));
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const filteredProducts = useMemo(
    () => products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  const selectedCustomer = useMemo(
    () => customers.find((customer) => String(customer.id) === String(customerId)),
    [customers, customerId]
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
      await printReceiptToPrinter(saleId);
      setMessage('Receipt printed to thermal printer.');
    } catch (error) {
      if (error.fallback) {
        window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/sales/${saleId}/receipt`, '_blank');
        setMessage('Thermal printer unavailable. Opened PDF in new tab.');
      } else {
        setMessage(`Print failed: ${error.message}`);
      }
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
      const response = await createSale({
        items: cart,
        paymentMethod,
        currency: currency || 'USD',
        discount,
        discountType,
        customerId: customerId ? Number(customerId) : null,
      });
      
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
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#111827]">Point of Sale</h2>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">Search products, add items to cart, apply discounts, and complete sales quickly.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[460px]">
            <SummaryStat label="Available Products" value={products.length.toLocaleString()} helper="Items ready to sell." />
            <SummaryStat label="Cart Items" value={cart.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()} helper="Units currently in cart." />
            <SummaryStat label="Cart Total" value={formatMoney(currency, total)} helper="Before completing the sale." />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-[#111827]">Product Search</h3>
              <p className="mt-1 text-sm leading-6 text-[#6B7280]">Find products quickly and add them to the current sale.</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product"
                className="w-full min-w-0 rounded-lg border border-slate-200 bg-[#F5FAFD] px-4 py-3 outline-none transition focus:border-[#2FA8C6] focus:bg-white"
              />
              <button
                type="button"
                onClick={loadProducts}
                className="rounded-lg bg-[#2FA8C6] px-4 py-3 text-white transition hover:bg-[#258EA8]"
              >
                Search
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {filteredProducts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-[#F5FAFD] px-4 py-12 text-center">
                <p className="text-sm font-medium text-[#111827]">No matching products</p>
                <p className="mt-2 text-sm text-[#6B7280]">Try another search term or refresh the product list.</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
                  <div>
                    <p className="font-semibold text-[#111827]">{product.name}</p>
                    <p className="mt-0.5 text-sm text-[#6B7280]">{product.category || 'Uncategorized'}</p>
                    <p className="mt-1 text-xs text-[#6B7280]">{product.quantity} units in stock</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#111827]">{formatMoney(currency, product.sellPrice)}</p>
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="mt-2 rounded-lg bg-[#2FA8C6] px-4 py-2 text-sm text-white transition hover:bg-[#258EA8]"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-[#111827]">Current Sale</h3>
                <p className="mt-1 text-sm leading-6 text-[#6B7280]">Review cart items, customer, and payment before checkout.</p>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                >
                  Clear Cart
                </button>
              )}
            </div>
            <div className="mt-4 space-y-4">
              {cart.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-[#F5FAFD] px-4 py-10 text-center">
                  <p className="text-sm font-medium text-[#111827]">No items in the cart yet</p>
                  <p className="mt-2 text-sm text-[#6B7280]">Add products from the list to start a sale.</p>
                </div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.productId} className="rounded-lg border border-slate-200 bg-[#F5FAFD] p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-[#111827]">{item.name}</p>
                          <p className="mt-0.5 text-sm text-[#6B7280]">{formatMoney(currency, item.price)} each</p>
                          <p className="mt-1 text-xs font-medium text-[#6B7280]">Line total: {formatMoney(currency, item.price * item.quantity)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.productId)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-700 transition hover:bg-rose-100"
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
                              className="rounded-full bg-white px-3 py-1 transition hover:bg-slate-100"
                              aria-label={`Decrease quantity of ${item.name}`}
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, 1)}
                              className="rounded-full bg-white px-3 py-1 transition hover:bg-slate-100"
                              aria-label={`Increase quantity of ${item.name}`}
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.productId)}
                            className="rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700 transition hover:bg-rose-200"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#374151]">Customer</label>
                    <select
                      value={customerId}
                      onChange={(event) => setCustomerId(event.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-[#F5FAFD] px-4 py-3 outline-none transition focus:border-[#2FA8C6] focus:bg-white"
                    >
                      <option value="">Walk-in / no customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}{customer.phone ? ` - ${customer.phone}` : ''}
                        </option>
                      ))}
                    </select>
                    {selectedCustomer ? (
                      <p className="mt-2 text-xs text-[#6B7280]">
                        Selected: {selectedCustomer.name}{selectedCustomer.phone ? ` • ${selectedCustomer.phone}` : ''}
                      </p>
                    ) : null}
                  </div>
                </>
              )}
            </div>
            <div className="mt-6 rounded-lg border border-slate-200 bg-[#F5FAFD] p-4 sm:p-5">
              <p className="text-sm text-[#6B7280]">Payment method</p>
              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#2FA8C6]"
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            <div className="mt-6 rounded-lg border border-slate-200 bg-[#F5FAFD] p-4 sm:p-5">
              <p className="text-sm text-[#6B7280]">Discount</p>
              <div className="mt-3 flex gap-2">
                <select
                  value={discountType}
                  onChange={(event) => setDiscountType(event.target.value)}
                  className="w-24 rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#2FA8C6]"
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
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#2FA8C6]"
                />
                <span className="flex items-center px-2 text-sm text-[#6B7280]">{discountType === 'percentage' ? '%' : currency}</span>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between text-sm text-[#6B7280]">
                <span>Subtotal</span>
                <span>{formatMoney(currency, subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="mt-2 flex items-center justify-between text-sm text-[#6B7280]">
                  <span>Discount</span>
                  <span>-{formatMoney(currency, discountAmount)}</span>
                </div>
              )}
              <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 text-[#111827]">
                <span>Total</span>
                <strong>{formatMoney(currency, total)}</strong>
              </div>
              <label className="mt-4 flex items-center gap-3 rounded-lg bg-[#F5FAFD] px-4 py-3 text-sm text-[#374151]">
                <input type="checkbox" checked={autoPrint} onChange={(event) => setAutoPrint(event.target.checked)} />
                Print receipt automatically after checkout
              </label>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className={`mt-4 w-full rounded-3xl px-4 py-3 text-white transition ${
                  loading ? 'cursor-not-allowed bg-gray-400' : 'bg-[#2FA8C6] hover:bg-[#258EA8]'
                }`}
              >
                {loading ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
            {message && (
              <div className={`mt-4 rounded-lg px-4 py-3 text-sm ${message.includes('successfully') ? 'bg-[#E9FBF4] text-[#1E8E65]' : 'bg-[#FFF1F0] text-[#C84E47]'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span>{message}</span>
                  {message.includes('successfully') && lastSaleId && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => downloadReceipt(lastSaleId)}
                        className="whitespace-nowrap rounded-lg bg-[#26B07C] px-3 py-1 text-xs text-white transition hover:bg-[#1E8E65]"
                      >
                        Download Receipt
                      </button>
                      <button
                        type="button"
                        onClick={() => printToThermalPrinter(lastSaleId)}
                        disabled={printing}
                        className="whitespace-nowrap rounded-lg bg-[#2FA8C6] px-3 py-1 text-xs text-white transition hover:bg-[#258EA8] disabled:opacity-50"
                      >
                        {printing ? 'Printing...' : 'Print Receipt'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
        </section>
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
