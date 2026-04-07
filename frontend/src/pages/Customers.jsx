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

function StatCard({ label, value, helper }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-[#6B7280]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#111827]">{value}</p>
      <p className="mt-2 text-sm text-[#6B7280]">{helper}</p>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const currentUser = getUser();
  const canDelete = ['Admin', 'Manager'].includes(currentUser?.role);

  const activeCustomers = useMemo(() => customers.filter((customer) => customer.isActive !== false).length, [customers]);
  const repeatCustomers = useMemo(() => customers.filter((customer) => Number(customer.salesCount || 0) > 1).length, [customers]);

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
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#111827]">Customers</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#6B7280]">
              Keep customer details organized so sales, follow-up, and repeat visits are easier to manage.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[460px]">
            <StatCard label="Total Customers" value={customers.length.toLocaleString()} helper="Profiles saved in your shop." />
            <StatCard label="Active" value={activeCustomers.toLocaleString()} helper="Customers available for new sales." />
            <StatCard label="Repeat Buyers" value={repeatCustomers.toLocaleString()} helper="Customers with more than one sale." />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[#111827]">Customer Directory</h3>
              <p className="mt-1 text-sm text-[#6B7280]">Search, review, and manage saved customer profiles.</p>
            </div>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customers"
              className="w-full max-w-xs rounded-lg border border-slate-200 bg-[#F9FAFB] px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white"
            />
          </div>

          <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-[#F9FAFB] text-[#6B7280]">
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
                    <td className="px-4 py-6 text-[#6B7280]" colSpan="5">Loading customers...</td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8" colSpan="5">
                      <div className="rounded-lg border border-dashed border-slate-200 bg-[#F9FAFB] px-4 py-8 text-center">
                        <p className="text-sm font-medium text-[#111827]">No customers found</p>
                        <p className="mt-2 text-sm text-[#6B7280]">Try a different search or create a new customer profile.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="transition hover:bg-[#F9FAFB]">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-semibold text-[#111827]">{customer.name}</p>
                          <p className="text-xs text-[#6B7280]">Added {new Date(customer.createdAt).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-[#374151]">{customer.phone || '-'}</p>
                        <p className="text-xs text-[#6B7280]">{customer.email || 'No email'}</p>
                      </td>
                      <td className="px-4 py-4 font-medium text-[#111827]">{Number(customer.salesCount || 0)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${customer.isActive ? 'bg-[#F0FDF4] text-[#166534]' : 'bg-slate-100 text-[#6B7280]'}`}>
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
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-[#374151] transition hover:bg-[#F9FAFB]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(customer)}
                            className="rounded-lg bg-[#FEF2F2] px-3 py-2 text-xs font-medium text-[#DC2626] transition hover:bg-[#FEE2E2] disabled:opacity-50"
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

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[#111827]">{form.id ? 'Edit Customer' : 'Add Customer'}</h3>
              <p className="mt-1 text-sm text-[#6B7280]">Capture the right details to support future sales and follow-up.</p>
            </div>
            {form.id ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-[#374151] transition hover:bg-[#F9FAFB]"
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
              className="w-full rounded-lg border border-slate-200 bg-[#F9FAFB] px-4 py-3 outline-none transition focus:border-[#2563EB] focus:bg-white"
            />
            <input
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="Phone number"
              className="w-full rounded-lg border border-slate-200 bg-[#F9FAFB] px-4 py-3 outline-none transition focus:border-[#2563EB] focus:bg-white"
            />
            <input
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="Email address"
              className="w-full rounded-lg border border-slate-200 bg-[#F9FAFB] px-4 py-3 outline-none transition focus:border-[#2563EB] focus:bg-white"
            />
            <input
              value={form.address}
              onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
              placeholder="Address"
              className="w-full rounded-lg border border-slate-200 bg-[#F9FAFB] px-4 py-3 outline-none transition focus:border-[#2563EB] focus:bg-white"
            />
            <textarea
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              placeholder="Notes about this customer"
              rows="4"
              className="w-full rounded-lg border border-slate-200 bg-[#F9FAFB] px-4 py-3 outline-none transition focus:border-[#2563EB] focus:bg-white"
            />
            <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-[#F9FAFB] px-4 py-3 text-sm text-[#374151]">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
              />
              Customer is active and available for new sales.
            </label>
            <button className="w-full rounded-lg bg-[#2563EB] px-4 py-3 text-white transition hover:bg-[#1D4ED8]">
              {form.id ? 'Save Changes' : 'Create Customer'}
            </button>
          </form>

          {message ? (
            <div className={`mt-4 rounded-lg px-4 py-3 text-sm ${message.includes('successfully') ? 'bg-[#F0FDF4] text-[#166534]' : 'bg-[#FEF2F2] text-[#991B1B]'}`}>
              {message}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}