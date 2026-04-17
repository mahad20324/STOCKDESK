import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Layout from '../components/Layout';
import { api } from '../utils/api';

export default function StockReconciliation() {
  const [view, setView] = useState('reconcile'); // 'reconcile' or 'history'
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
    'Theft/Loss',
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getVarianceBadgeColor = (variance) => {
    if (variance === 0) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    if (variance > 0) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  return (
    <Layout>
      <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
        <Header title="Stock Reconciliation" />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              {/* View Toggle */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setView('reconcile')}
                  className={`px-6 py-2 rounded font-medium transition ${
                    view === 'reconcile'
                      ? 'bg-accent text-white'
                      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Reconcile Stock
                </button>
                <button
                  onClick={() => setView('history')}
                  className={`px-6 py-2 rounded font-medium transition ${
                    view === 'history'
                      ? 'bg-accent text-white'
                      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  History & Summary
                </button>
              </div>

              {/* Message Alert */}
              {message.text && (
                <div className={`mb-6 p-4 rounded ${
                  message.type === 'success'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {message.text}
                </div>
              )}

              {view === 'reconcile' ? (
                // Reconciliation Form
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="app-panel p-6 rounded-lg">
                      <h2 className="text-xl font-semibold text-text-primary mb-6">Record Stock Count</h2>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Product Search */}
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">
                            Select Product
                          </label>
                          {selectedProduct ? (
                            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-4 flex justify-between items-center">
                              <div>
                                <div className="font-semibold text-text-primary">{selectedProduct.name}</div>
                                <div className="text-sm text-text-secondary">SKU: {selectedProduct.sku}</div>
                                <div className="text-sm text-text-muted">System Qty: {selectedProduct.quantity}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedProduct(null)}
                                className="text-red-600 hover:text-red-800"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <>
                              <input
                                type="text"
                                placeholder="Search by product name or SKU..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="app-input w-full px-3 py-2 rounded border"
                              />
                              {products.length > 0 && (
                                <div className="mt-2 border border-border-default rounded-lg max-h-64 overflow-y-auto">
                                  {products.map(product => (
                                    <button
                                      key={product.id}
                                      type="button"
                                      onClick={() => handleSelectProduct(product)}
                                      className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-border-default last:border-b-0 transition"
                                    >
                                      <div className="font-medium text-text-primary">{product.name}</div>
                                      <div className="text-sm text-text-muted">
                                        SKU: {product.sku} | Qty: {product.quantity}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {selectedProduct && (
                          <>
                            {/* Physical Quantity */}
                            <div>
                              <label className="block text-sm font-medium text-text-primary mb-2">
                                Physical Count
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={physicalQuantity}
                                onChange={(e) => setPhysicalQuantity(e.target.value)}
                                className="app-input w-full px-3 py-2 rounded border"
                                placeholder="Enter actual quantity counted"
                              />
                              <div className="mt-2 text-sm text-text-secondary">
                                System Quantity: <span className="font-semibold">{selectedProduct.quantity}</span>
                                {physicalQuantity && (
                                  <>
                                    <br />
                                    Variance: <span className={physicalQuantity - selectedProduct.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                                      {(physicalQuantity - selectedProduct.quantity).toFixed(2)}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Reason */}
                            <div>
                              <label className="block text-sm font-medium text-text-primary mb-2">
                                Reason for Variance
                              </label>
                              <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="app-input w-full px-3 py-2 rounded border"
                              >
                                <option value="">Select a reason (optional)</option>
                                {reconciliationReasons.map(r => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            </div>

                            {/* Notes */}
                            <div>
                              <label className="block text-sm font-medium text-text-primary mb-2">
                                Additional Notes
                              </label>
                              <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="app-input w-full px-3 py-2 rounded border"
                                rows="3"
                                placeholder="Add any additional notes..."
                              />
                            </div>

                            {/* Submit Button */}
                            <button
                              type="submit"
                              disabled={loading}
                              className="app-btn-primary w-full px-4 py-2 rounded font-medium disabled:opacity-50"
                            >
                              {loading ? 'Recording...' : 'Record Reconciliation'}
                            </button>
                          </>
                        )}
                      </form>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="app-panel p-6 rounded-lg h-fit">
                    <h3 className="font-semibold text-text-primary mb-4">Quick Stats</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-2xl font-bold text-accent">{products.length}</div>
                        <div className="text-sm text-text-muted">Total Products</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-500">
                          {reconciliations.filter(r => new Date(r.reconciliationDate).toDateString() === new Date().toDateString()).length}
                        </div>
                        <div className="text-sm text-text-muted">Today's Reconciliations</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // History and Summary
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {summary.slice(0, 4).map((item) => (
                      <div key={item.productId} className="app-panel p-4 rounded-lg">
                        <div className="text-lg font-semibold text-text-primary truncate">{item.product?.name}</div>
                        <div className="text-sm text-text-muted mt-1">SKU: {item.product?.sku}</div>
                        <div className={`text-xl font-bold mt-2 ${item.totalVariance > 0 ? 'text-green-600' : item.totalVariance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {parseFloat(item.totalVariance).toFixed(2)}
                        </div>
                        <div className="text-xs text-text-muted mt-1">{item.reconciliationCount} reconciliation(s)</div>
                      </div>
                    ))}
                  </div>

                  {/* Filters */}
                  <div className="app-panel p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Reconciliation History</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">Product</label>
                        <select
                          value={historyFilters.productId}
                          onChange={(e) => setHistoryFilters(prev => ({ ...prev, productId: e.target.value }))}
                          className="app-input w-full px-3 py-2 rounded border"
                          onChangeCapture={() => fetchReconciliations()}
                        >
                          <option value="">All Products</option>
                          {summary.map(item => (
                            <option key={item.productId} value={item.productId}>
                              {item.product?.name} ({item.product?.sku})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">Start Date</label>
                        <input
                          type="date"
                          value={historyFilters.startDate}
                          onChange={(e) => setHistoryFilters(prev => ({ ...prev, startDate: e.target.value }))}
                          className="app-input w-full px-3 py-2 rounded border"
                          onChangeCapture={() => fetchReconciliations()}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">End Date</label>
                        <input
                          type="date"
                          value={historyFilters.endDate}
                          onChange={(e) => setHistoryFilters(prev => ({ ...prev, endDate: e.target.value }))}
                          className="app-input w-full px-3 py-2 rounded border"
                          onChangeCapture={() => fetchReconciliations()}
                        />
                      </div>
                    </div>

                    {/* History Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100 dark:bg-gray-800 border-b border-border-default">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">Date</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">Product</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-text-primary">System</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-text-primary">Physical</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-text-primary">Variance</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">Reason</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">Adjusted By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-default">
                          {loading ? (
                            <tr>
                              <td colSpan="7" className="px-6 py-8 text-center text-text-muted">
                                Loading...
                              </td>
                            </tr>
                          ) : reconciliations.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="px-6 py-8 text-center text-text-muted">
                                No reconciliations found
                              </td>
                            </tr>
                          ) : (
                            reconciliations.map((rec) => (
                              <tr key={rec.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="px-6 py-4 text-sm text-text-secondary">{formatDateTime(rec.reconciliationDate)}</td>
                                <td className="px-6 py-4 text-sm text-text-primary">{rec.product?.name}</td>
                                <td className="px-6 py-4 text-right text-sm text-text-secondary">{parseFloat(rec.systemQuantity).toFixed(2)}</td>
                                <td className="px-6 py-4 text-right text-sm text-text-secondary">{parseFloat(rec.physicalQuantity).toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getVarianceBadgeColor(rec.variance)}`}>
                                    {parseFloat(rec.variance).toFixed(2)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-text-muted">{rec.reason || '-'}</td>
                                <td className="px-6 py-4 text-sm text-text-primary">{rec.adjustedBy?.name}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
}
