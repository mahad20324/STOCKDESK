import { useEffect, useMemo, useState } from 'react';
import { fetchExpenses, createExpense, updateExpense, deleteExpense, fetchSettings } from '../utils/api';
import { getUser } from '../utils/auth';

const CATEGORIES = ['Rent', 'Utilities', 'Supplies', 'Salaries', 'Maintenance', 'Marketing', 'Other'];

const emptyForm = { id: null, category: CATEGORIES[0], description: '', amount: '', date: new Date().toISOString().slice(0, 10), notes: '' };

export default function Expenses() {
  const currentUser = getUser();
  const isAdmin = currentUser?.role === 'Admin';
  const [currency, setCurrency] = useState('USD');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadExpenses = async (start, end) => {
    setLoading(true);
    try {
      const data = await fetchExpenses(start || undefined, end || undefined);
      setExpenses(Array.isArray(data) ? data : []);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings().then((s) => setCurrency(s?.currency || 'USD')).catch(() => {});
    loadExpenses();
  }, []);

  const totalThisMonth = useMemo(() => {
    const now = new Date();
    return expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses]);

  const totalAll = useMemo(() => expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0), [expenses]);

  const topCategory = useMemo(() => {
    const map = {};
    expenses.forEach((e) => { map[e.category] = (map[e.category] || 0) + Number(e.amount || 0); });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || '—';
  }, [expenses]);

  const fmt = (v) => `${currency} ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      if (form.id) {
        await updateExpense(form.id, form);
        setMessage('Expense updated.');
      } else {
        await createExpense(form);
        setMessage('Expense recorded.');
      }
      setForm(emptyForm);
      await loadExpenses(startDate, endDate);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleDelete = async (expense) => {
    if (!window.confirm(`Delete expense "${expense.description || expense.category}"?`)) return;
    try {
      await deleteExpense(expense.id);
      await loadExpenses(startDate, endDate);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="page-root">
      {/* Hero */}
      <div className="mb-8 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-dark)] shadow-[var(--brand-shadow)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Expenses</h1>
            <p className="text-sm text-[var(--text-muted)]">Track and manage business expenditure</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'This Month', value: fmt(totalThisMonth) },
          { label: 'Total (Filtered)', value: fmt(totalAll) },
          { label: 'Top Category', value: topCategory },
        ].map((card) => (
          <div key={card.label} className="app-panel rounded-[1.5rem] border p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left: Table */}
        <section className="min-w-0 flex-1">
          {/* Date filters */}
          <div className="app-panel mb-4 flex flex-wrap items-end gap-3 rounded-[1.5rem] border p-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[var(--text-muted)]">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="app-input rounded-xl border px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[var(--text-muted)]">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="app-input rounded-xl border px-3 py-2 text-sm"
              />
            </div>
            <button type="button" onClick={() => loadExpenses(startDate, endDate)} className="app-btn-primary rounded-xl px-4 py-2 text-sm font-medium">
              Filter
            </button>
            {(startDate || endDate) && (
              <button type="button" onClick={() => { setStartDate(''); setEndDate(''); loadExpenses(); }} className="app-btn-secondary rounded-xl border px-4 py-2 text-sm font-medium">
                Clear
              </button>
            )}
          </div>

          <div className="app-panel overflow-hidden rounded-[1.7rem] border">
            <div className="border-b border-[var(--border-default)] px-6 py-4">
              <p className="font-semibold text-[var(--text-primary)]">Expense Records</p>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">{expenses.length} record{expenses.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-default)] text-left">
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Date</th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Category</th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Description</th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Amount</th>
                    {isAdmin && <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: isAdmin ? 5 : 4 }).map((__, j) => (
                          <td key={j} className="px-6 py-4">
                            <div className="h-4 w-full animate-pulse rounded-lg bg-[var(--surface-secondary)]" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : expenses.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 5 : 4} className="px-6 py-10 text-center text-sm text-[var(--text-muted)]">
                        No expenses found.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((expense) => (
                      <tr key={expense.id} className="transition hover:bg-[var(--surface-secondary)]">
                        <td className="px-6 py-4 text-[var(--text-secondary)]">{expense.date}</td>
                        <td className="px-6 py-4">
                          <span className="inline-block rounded-lg bg-[var(--surface-secondary)] px-2 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[var(--text-primary)]">{expense.description || '—'}</td>
                        <td className="px-6 py-4 font-semibold text-[var(--text-primary)]">{fmt(expense.amount)}</td>
                        {isAdmin && (
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setForm({ id: expense.id, category: expense.category, description: expense.description || '', amount: expense.amount, date: expense.date, notes: expense.notes || '' })}
                                className="app-btn-secondary rounded-lg border px-3 py-1.5 text-xs font-medium transition"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(expense)}
                                className="app-btn-danger rounded-lg px-3 py-1.5 text-xs font-medium transition"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Right: Form */}
        {isAdmin && (
          <aside className="w-full lg:w-80 xl:w-96">
            <div className="app-panel sticky top-6 rounded-[1.7rem] border p-6">
              <h2 className="mb-5 font-semibold text-[var(--text-primary)]">{form.id ? 'Edit Expense' : 'Record Expense'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="app-input w-full rounded-xl border px-3 py-2 text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">Description</label>
                  <input
                    type="text"
                    placeholder="Brief description"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="app-input w-full rounded-xl border px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">Amount *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={form.amount}
                      onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                      className="app-input w-full rounded-xl border px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">Date *</label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      className="app-input w-full rounded-xl border px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Optional notes"
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    className="app-input w-full rounded-xl border px-3 py-2 text-sm"
                  />
                </div>
                {message && (
                  <p className={`text-xs font-medium ${message.toLowerCase().includes('error') || message.toLowerCase().includes('fail') ? 'text-red-500' : 'text-[var(--brand)]'}`}>
                    {message}
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <button type="submit" className="app-btn-primary flex-1 rounded-xl py-2 text-sm font-semibold">
                    {form.id ? 'Save Changes' : 'Record Expense'}
                  </button>
                  {form.id && (
                    <button type="button" onClick={() => { setForm(emptyForm); setMessage(''); }} className="app-btn-secondary rounded-xl border px-4 py-2 text-sm font-medium">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
