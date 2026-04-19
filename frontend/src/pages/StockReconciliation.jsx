import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

function VariancePill({ variance }) {
  const v = parseFloat(variance);
  if (v === 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-secondary)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-muted)]">
        ±0
      </span>
    );
  if (v > 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(74,168,132,0.12)] px-2.5 py-0.5 text-xs font-semibold text-[var(--success)]">
        +{v.toFixed(2)}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(218,106,90,0.12)] px-2.5 py-0.5 text-xs font-semibold text-[var(--danger)]">
      {v.toFixed(2)}
    </span>
  );
}

function SkeletonLine({ w = 'w-full', h = 'h-4' }) {
  return <div className={`animate-pulse rounded-md bg-[var(--surface-secondary)] ${w} ${h}`} />;
}

const REASON_META = {
  'Damage':            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, color: 'var(--warning)' },
  'Theft / Loss':      { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, color: 'var(--danger)' },
  'Count Error':       { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, color: 'var(--accent)' },
  'Expired Product':   { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>, color: 'var(--warning)' },
  'Mis-shipment':      { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, color: 'var(--accent)' },
  'System Adjustment': { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>, color: 'var(--text-muted)' },
  'Other':             { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v.01"/><path d="M12 8v4"/></svg>, color: 'var(--text-muted)' },
};

function getRelativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString([], { dateStyle: 'medium' });
}

function UserAvatar({ name }) {
  const initials = String(name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-[10px] font-bold text-[var(--accent)]">
      {initials}
    </span>
  );
}

export default function StockReconciliation() {
  const [view, setView] = useState('reconcile');
  const [products, setProducts] = useState([]);
  const [reconciliations, setReconciliations] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [physicalQuantity, setPhysicalQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const [historyFilters, setHistoryFilters] = useState({
    productId: '',
    startDate: '',
    endDate: '',
  });

  const reconciliationReasons = [
    'Damage',
    'Theft / Loss',
    'Count Error',
    'Expired Product',
    'Mis-shipment',
    'System Adjustment',
    'Other',
  ];

  useEffect(() => {
    if (view === 'reconcile') {
      fetchProducts();
    } else {
      fetchReconciliations();
      fetchSummary();
    }
  }, [view]);

  const fetchProducts = async (search = '') => {
    try {
      setLoading(true);
      const params = search ? `?search=${search}` : '';
      const response = await api.get(`/stock-reconciliation/products${params}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage({ type: 'error', text: 'Failed to load products' });
    } finally {
      setLoading(false);
    }
  };

  const fetchReconciliations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (historyFilters.productId) params.append('productId', historyFilters.productId);
      if (historyFilters.startDate) params.append('startDate', historyFilters.startDate);
      if (historyFilters.endDate) params.append('endDate', historyFilters.endDate);

      const response = await api.get(`/stock-reconciliation/history?${params}`);
      setReconciliations(response.data.data);
    } catch (error) {
      console.error('Error fetching reconciliations:', error);
      setMessage({ type: 'error', text: 'Failed to load reconciliation history' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get('/stock-reconciliation/summary');
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      fetchProducts(query);
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setPhysicalQuantity('');
    setReason('');
    setNotes('');
    setSearchQuery('');
    setProducts([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProduct || physicalQuantity === '') {
      setMessage({ type: 'error', text: 'Please select a product and enter physical quantity' });
      return;
    }

    try {
      setLoading(true);
      await api.post('/stock-reconciliation/create', {
        productId: selectedProduct.id,
        physicalQuantity: parseFloat(physicalQuantity),
        reason: reason || null,
        notes: notes || null,
      });

      setMessage({ type: 'success', text: 'Stock reconciliation recorded successfully!' });
      setSelectedProduct(null);
      setPhysicalQuantity('');
      setReason('');
      setNotes('');

      // Refresh products list
      setTimeout(() => {
        fetchProducts();
        setMessage({ type: '', text: '' });
      }, 2000);
    } catch (error) {
      console.error('Error submitting reconciliation:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to record reconciliation' });
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  };

  const variance =
    selectedProduct && physicalQuantity !== ''
      ? parseFloat(physicalQuantity) - parseFloat(selectedProduct.quantity)
      : null;

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="app-panel flex items-center gap-1 rounded-[1.3rem] border p-1">
        {[
          { key: 'reconcile', label: 'Reconcile Stock', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="m3 7 9-4 9 4-9 4-9-4Z"/><path d="m3 7 9 4 9-4"/><path d="M12 11v10"/></svg> },
          { key: 'history', label: 'History & Summary', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setView(key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-[1.1rem] px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
              view === key
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Alert banner */}
      {message.text && (
        <div
          className={`flex items-start gap-3 rounded-[1.15rem] border px-4 py-3 text-sm font-medium ${
            message.type === 'success'
              ? 'border-[rgba(74,168,132,0.3)] bg-[rgba(74,168,132,0.08)] text-[var(--success)]'
              : 'border-[rgba(218,106,90,0.3)] bg-[rgba(218,106,90,0.08)] text-[var(--danger)]'
          }`}
        >
          {message.type === 'success' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 h-4 w-4 shrink-0">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 h-4 w-4 shrink-0">
              <circle cx="12" cy="12" r="9" /><path d="M12 8v4" /><path d="M12 16h.01" />
            </svg>
          )}
          {message.text}
        </div>
      )}

      {view === 'reconcile' ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          {/* Main form */}
          <section className="app-panel rounded-[1.4rem] border p-5 sm:p-6">
            <div className="border-b border-[var(--border-default)] pb-4">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">Record Stock Count</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Search for a product, enter the physical count you observed, and optionally note the reason for any variance.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              {/* Product selector */}
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[var(--text-secondary)]">Product</label>
                {selectedProduct ? (
                  <div className="flex items-start justify-between gap-3 rounded-[1.15rem] border border-[rgba(30,167,189,0.25)] bg-[rgba(30,167,189,0.06)] px-4 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--text-primary)]">{selectedProduct.name}</p>
                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                        System quantity: <span className="font-semibold text-[var(--text-secondary)]">{selectedProduct.quantity}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedProduct(null); setPhysicalQuantity(''); }}
                      className="shrink-0 rounded-full p-1 text-[var(--text-muted)] transition hover:text-[var(--danger)]"
                      aria-label="Remove product"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-muted)]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                        <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search product by name…"
                      value={searchQuery}
                      onChange={handleSearch}
                      className="app-input w-full rounded-[1.1rem] border py-2.5 pl-10 pr-4 text-sm"
                    />
                    {loading && !selectedProduct && searchQuery && (
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
                      </div>
                    )}
                    {products.length > 0 && (
                      <ul className="absolute z-20 mt-1.5 max-h-60 w-full overflow-y-auto rounded-[1.1rem] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-xl">
                        {products.map((product) => (
                          <li key={product.id}>
                            <button
                              type="button"
                              onClick={() => handleSelectProduct(product)}
                              className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-[var(--surface-secondary)]"
                            >
                              <span className="font-medium text-[var(--text-primary)]">{product.name}</span>
                              <span className="ml-4 shrink-0 text-xs text-[var(--text-muted)]">Qty {product.quantity}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {selectedProduct && (
                <>
                  {/* Physical count */}
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-[var(--text-secondary)]">
                      Physical Count
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={physicalQuantity}
                      onChange={(e) => setPhysicalQuantity(e.target.value)}
                      className="app-input w-full rounded-[1.1rem] border px-4 py-2.5 text-sm"
                      placeholder="Enter actual quantity counted"
                    />
                    {variance !== null && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <span>Variance:</span>
                        <VariancePill variance={variance} />
                        <span className="text-xs">
                          ({variance > 0 ? 'surplus' : variance < 0 ? 'shortage' : 'exact match'})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-[var(--text-secondary)]">
                      Reason for Variance <span className="font-normal text-[var(--text-muted)]">(optional)</span>
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="app-input w-full rounded-[1.1rem] border px-4 py-2.5 text-sm"
                    >
                      <option value="">Select a reason…</option>
                      {reconciliationReasons.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-[var(--text-secondary)]">
                      Notes <span className="font-normal text-[var(--text-muted)]">(optional)</span>
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="app-input w-full resize-none rounded-[1.1rem] border px-4 py-2.5 text-sm"
                      rows={3}
                      placeholder="Any additional context about this count…"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="app-btn-primary w-full rounded-[1.1rem] py-2.5 text-sm font-semibold disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Recording…
                      </span>
                    ) : (
                      'Record Reconciliation'
                    )}
                  </button>
                </>
              )}
            </form>
          </section>

          {/* Sidebar stats */}
          <aside className="space-y-4">
            <section className="app-panel rounded-[1.4rem] border p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Overview</p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-[2rem] font-bold tracking-tight leading-none text-[var(--accent)]">
                    {products.length > 0 ? products.length : '—'}
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">Products loaded</p>
                </div>
                <div className="border-t border-[var(--border-default)] pt-4">
                  <p className="text-[1.5rem] font-bold tracking-tight leading-none text-[var(--text-primary)]">
                    {summary.reduce((sum, s) => sum + (s.reconciliationCount || 0), 0)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">Total reconciliations</p>
                </div>
              </div>
            </section>

            <section className="app-panel rounded-[1.4rem] border p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">How it works</p>
              <ul className="mt-3 space-y-2.5 text-sm text-[var(--text-secondary)]">
                {[
                  'Search and select a product',
                  'Enter the physical count you observed',
                  'System calculates the variance',
                  'Optionally note the reason',
                  'Submit to update records',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-[10px] font-bold text-[var(--text-muted)]">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      ) : (
        /* History & Summary */
        <div className="space-y-4">
          {/* Summary strip */}
          {summary.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {summary.slice(0, 4).map((item) => {
                const v = parseFloat(item.totalVariance);
                const tone = v > 0 ? 'success' : v < 0 ? 'danger' : 'default';
                const colors = {
                  success: 'border-l-[var(--success)]',
                  danger: 'border-l-[var(--danger)]',
                  default: 'border-l-[var(--accent)]',
                };
                return (
                  <div
                    key={item.productId}
                    className={`app-panel rounded-[1.2rem] border border-l-[3px] p-4 transition duration-200 hover:shadow-lg ${colors[tone]}`}
                  >
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{item.product?.name}</p>
                    <p
                      className={`mt-1.5 text-2xl font-bold leading-none ${
                        v > 0 ? 'text-[var(--success)]' : v < 0 ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {v > 0 ? '+' : ''}{v.toFixed(2)}
                    </p>
                    <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                      {item.reconciliationCount} reconciliation{item.reconciliationCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Filters */}
          <section className="app-panel rounded-[1.4rem] border p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">Reconciliation History</h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-secondary)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
                {reconciliations.length} record{reconciliations.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-muted)]">Product</label>
                <select
                  value={historyFilters.productId}
                  onChange={(e) => {
                    setHistoryFilters((prev) => ({ ...prev, productId: e.target.value }));
                    fetchReconciliations();
                  }}
                  className="app-input w-full rounded-[1rem] border px-3 py-2 text-sm"
                >
                  <option value="">All products</option>
                  {summary.map((item) => (
                    <option key={item.productId} value={item.productId}>
                      {item.product?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-muted)]">From</label>
                <input
                  type="date"
                  value={historyFilters.startDate}
                  onChange={(e) => {
                    setHistoryFilters((prev) => ({ ...prev, startDate: e.target.value }));
                    fetchReconciliations();
                  }}
                  className="app-input w-full rounded-[1rem] border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-muted)]">To</label>
                <input
                  type="date"
                  value={historyFilters.endDate}
                  onChange={(e) => {
                    setHistoryFilters((prev) => ({ ...prev, endDate: e.target.value }));
                    fetchReconciliations();
                  }}
                  className="app-input w-full rounded-[1rem] border px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Table */}
            <div className="mt-4 overflow-x-auto rounded-[1.1rem] border border-[var(--border-default)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-default)] bg-[var(--surface-secondary)]">
                    {['Date', 'Product', 'System', 'Physical', 'Variance', 'Reason', 'By'].map((h, i) => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] ${
                          i >= 2 && i <= 4 ? 'text-right' : 'text-left'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((__, j) => (
                          <td key={j} className="px-4 py-3">
                            <SkeletonLine w="w-full" h="h-3" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : reconciliations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-[var(--text-muted)]">
                        No reconciliation records found
                      </td>
                    </tr>
                  ) : (
                    reconciliations.map((rec) => {
                      const v = parseFloat(rec.variance);
                      const borderColor = v > 0 ? 'var(--success)' : v < 0 ? 'var(--danger)' : 'var(--accent)';
                      const reasonMeta = REASON_META[rec.reason] || REASON_META.Other;
                      return (
                      <tr key={rec.id} className="border-l-[3px] transition hover:bg-[var(--surface-secondary)]" style={{ borderLeftColor: borderColor }}>
                        <td className="whitespace-nowrap px-4 py-3">
                          <p className="text-xs text-[var(--text-secondary)]">{formatDateTime(rec.reconciliationDate)}</p>
                          <p className="text-[11px] text-[var(--text-muted)]">{getRelativeTime(rec.reconciliationDate)}</p>
                        </td>
                        <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                          {rec.product?.name}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-[var(--text-secondary)]">
                          {parseFloat(rec.systemQuantity).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-[var(--text-secondary)]">
                          {parseFloat(rec.physicalQuantity).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <VariancePill variance={rec.variance} />
                        </td>
                        <td className="px-4 py-3">
                          {rec.reason ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: reasonMeta.color }}>
                              {reasonMeta.icon}
                              {rec.reason}
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <UserAvatar name={rec.adjustedBy?.name} />
                            <span className="text-xs text-[var(--text-secondary)]">{rec.adjustedBy?.name || '—'}</span>
                          </div>
                        </td>
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
