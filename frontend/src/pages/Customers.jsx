import { useEffect, useMemo, useState } from 'react';
import { createCustomer, deleteCustomer, fetchCustomers, updateCustomer } from '../utils/api';
import { getUser } from '../utils/auth';

const initialForm = {
  id: null,
  name: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
  isActive: true,
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const currentUser = getUser();
  const canDelete = ['Admin', 'Manager'].includes(currentUser?.role);

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return customers;
    }

    return customers.filter((customer) =>
      [customer.name, customer.phone, customer.email].filter(Boolean).some((value) => value.toLowerCase().includes(query))
    );
  }, [customers, search]);

  async function loadCustomers() {
    try {
      setLoading(true);
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      if (form.id) {
        await updateCustomer(form.id, form);
        setMessage('Customer updated successfully.');
      } else {
        await createCustomer(form);
        setMessage('Customer added successfully.');
      }

      resetForm();
      await loadCustomers();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleDelete(customer) {
    if (!canDelete) {
      setMessage('You do not have permission to delete customers.');
      return;
    }

    if (!window.confirm(`Delete customer \"${customer.name}\"?`)) {
      return;
    }

    try {
      await deleteCustomer(customer.id);
      setMessage('Customer deleted successfully.');
      await loadCustomers();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.18),_transparent_40%),linear-gradient(135deg,#f8fafc,#ffffff)] px-6 py-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-700">Customer Hub</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">Build repeat business, not just transactions</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Track people behind the sales, keep contact details ready for follow-up, and connect each sale to a real customer profile.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 px-5 py-4 text-right shadow-sm backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Customer Count</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{customers.length}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Customer Directory</h3>
              <p className="mt-1 text-sm text-slate-500">Search, review, and manage all saved customer profiles.</p>
            </div>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customers"
              className="w-full max-w-xs rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            />
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Sales</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan="5">Loading customers...</td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan="5">No customers found.</td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">{customer.name}</p>
                          <p className="text-xs text-slate-500">Added {new Date(customer.createdAt).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-slate-700">{customer.phone || '-'}</p>
                        <p className="text-xs text-slate-500">{customer.email || 'No email'}</p>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-800">{Number(customer.salesCount || 0)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${customer.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setForm({
                              id: customer.id,
                              name: customer.name || '',
                              phone: customer.phone || '',
                              email: customer.email || '',
                              address: customer.address || '',
                              notes: customer.notes || '',
                              isActive: customer.isActive !== false,
                            })}
                            className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(customer)}
                            className="rounded-2xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                            disabled={!canDelete}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{form.id ? 'Edit Customer' : 'Add Customer'}</h3>
              <p className="mt-1 text-sm text-slate-500">Capture enough information to make customer relationships useful later.</p>
            </div>
            {form.id ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                New Customer
              </button>
            ) : null}
          </div>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Customer name"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
            <input
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="Phone number"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
            <input
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="Email address"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
            <input
              value={form.address}
              onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
              placeholder="Address"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
            <textarea
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              placeholder="Notes about this customer"
              rows="4"
              className="w-full rounded-[1.75rem] border border-slate-200 bg-slate-50 px-4 py-3"
            />
            <label className="flex items-center gap-3 rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
              />
              Customer is active and available for new sales.
            </label>
            <button className="w-full rounded-3xl bg-brand-600 px-4 py-3 text-white hover:bg-brand-700">
              {form.id ? 'Save Changes' : 'Create Customer'}
            </button>
          </form>

          {message ? (
            <div className={`mt-4 rounded-3xl px-4 py-3 text-sm ${message.includes('successfully') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {message}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}