import { useEffect, useState } from 'react';
import { fetchUsers, createUser, deleteUser } from '../utils/api';
import { getUser } from '../utils/auth';

const ROLE_OPTIONS = ['Admin', 'Manager', 'Cashier'];
const initialForm = { name: '', username: '', password: '', displayRole: 'Cashier' };

function StatCard({ label, value, helper, tone = 'default' }) {
  const valueClass = {
    default: 'text-[var(--text-primary)]',
    success: 'text-[var(--success)]',
    danger: 'text-[var(--danger)]',
    warning: 'text-[var(--warning)]',
  }[tone];
  const borderAccent = {
    default: 'border-l-[var(--accent)]',
    success: 'border-l-[var(--success)]',
    danger: 'border-l-[var(--danger)]',
    warning: 'border-l-[var(--warning)]',
  }[tone];

  return (
    <div className={`app-panel rounded-[1.2rem] border border-l-[3px] ${borderAccent} p-4 transition hover:shadow-lg`}>
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</p>
      <p className={`mt-2 text-2xl font-bold tracking-tight ${valueClass}`}>{value}</p>
      <p className="mt-1.5 text-[12px] text-[var(--text-muted)]">{helper}</p>
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserDisplayRole, setNewUserDisplayRole] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const currentUser = getUser();
  const adminCount = users.filter((user) => (user.displayRole || user.role) === 'Admin').length;
  const managerCount = users.filter((user) => (user.displayRole || user.role) === 'Manager').length;
  const cashierCount = users.filter((user) => (user.displayRole || user.role) === 'Cashier' || ((user.displayRole || user.role) === 'Staff')).length;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      const response = await createUser(form);
      setNewUserPassword(response.plainPassword);
      setNewUserUsername(response.username || '');
      setNewUserName(response.name || '');
      setNewUserDisplayRole(response.displayRole || response.role || '');
      setShowPasswordModal(true);
      setMessage('User created successfully.');
      setForm(initialForm);
      await loadUsers();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (userId === currentUser?.id) {
      setMessage('Cannot delete your own account.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      try {
        await deleteUser(userId);
        setMessage('User deleted successfully.');
        await loadUsers();
      } catch (error) {
        setMessage(error.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <section className="app-panel rounded-[2rem] border p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">User Management</h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">Create clean team accounts with a full name, username, password, and assigned role.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-4 lg:min-w-[580px]">
            <StatCard label="Total Users" value={users.length.toLocaleString()} helper="All shop accounts." />
            <StatCard label="Admins" value={adminCount.toLocaleString()} helper="Full-access accounts." />
            <StatCard label="Managers" value={managerCount.toLocaleString()} helper="Operational supervisors." />
            <StatCard label="Cashiers" value={cashierCount.toLocaleString()} helper="Frontline sales users." />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="app-panel rounded-[2rem] border p-6">
          <div className="app-alert-info mb-4 rounded-2xl px-4 py-3 text-sm">
            Passwords are shown once after account creation. Store them safely before closing the confirmation screen.
          </div>
          <div className="overflow-x-auto rounded-2xl border border-[var(--border-default)]">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="app-table-head">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)] bg-[var(--surface-primary)]">
                {users.map((user) => (
                  <tr key={user.id} className="app-row-hover transition">
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{user.name || '-'}</td>
                    <td className="px-4 py-3">{user.username || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        (user.displayRole || user.role) === 'Admin'
                          ? 'app-panel-accent'
                          : (user.displayRole || user.role) === 'Manager'
                            ? 'app-alert-warning'
                            : 'app-alert-success'
                      }`}>
                        {user.displayRole || user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        disabled={user.id === currentUser?.id}
                        className="app-btn-danger rounded-lg px-3 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="app-panel rounded-[2rem] border p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Create Team Account</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Set the user’s full name, username, password, and operational role.</p>
          <form className="mt-4 space-y-4" onSubmit={handleCreate}>
            <label className="block text-sm text-[var(--text-secondary)]">Full Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="app-input w-full rounded-3xl border px-4 py-3"
            />
            <label className="block text-sm text-[var(--text-secondary)]">Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              className="app-input w-full rounded-3xl border px-4 py-3"
            />
            <label className="block text-sm text-[var(--text-secondary)]">Role</label>
            <select
              value={form.displayRole}
              onChange={(e) => setForm((prev) => ({ ...prev, displayRole: e.target.value }))}
              className="app-input w-full rounded-3xl border px-4 py-3"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <label className="block text-sm text-[var(--text-secondary)]">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="app-input w-full rounded-3xl border px-4 py-3"
            />
            <button className="app-btn-primary w-full rounded-3xl px-4 py-3 transition">Create User</button>
          </form>

          {message && (
            <div
              className={`mt-4 rounded-3xl px-4 py-3 text-sm ${
                message.includes('success') ? 'app-alert-success' : 'app-alert-danger'
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="app-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="app-modal mx-4 w-full max-w-md rounded-[1.5rem] border p-6">
            <h3 className="mb-4 text-lg font-bold text-[var(--accent-strong)]">User Created Successfully</h3>
            <p className="mb-4 text-sm text-[var(--text-soft)]">
              Share these login details with the new user.
            </p>

            <div className="app-panel-soft mb-4 rounded-xl border p-4">
              <p className="mb-1 text-xs text-[var(--text-muted)]">Full Name:</p>
              <input
                type="text"
                readOnly
                value={newUserName}
                className="app-btn-secondary w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>

            <div className="app-panel-soft mb-4 rounded-xl border p-4">
              <p className="mb-1 text-xs text-[var(--text-muted)]">Assigned Role:</p>
              <input
                type="text"
                readOnly
                value={newUserDisplayRole}
                className="app-btn-secondary w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>

            <div className="app-panel-soft mb-4 rounded-xl border p-4">
              <p className="mb-1 text-xs text-[var(--text-muted)]">Login Username:</p>
              <input
                type="text"
                readOnly
                value={newUserUsername}
                className="app-btn-secondary w-full rounded-lg border px-3 py-2 text-sm font-mono"
              />
            </div>
            
            <div className="app-panel-soft mb-4 rounded-xl border p-4">
              <p className="mb-1 text-xs text-[var(--text-muted)]">Login Password:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={newUserPassword}
                  className="app-btn-secondary flex-1 rounded-lg border px-3 py-2 text-sm font-mono"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newUserPassword);
                    setMessage('Password copied to clipboard!');
                  }}
                  className="app-btn-primary rounded-lg px-3 py-2 text-sm transition"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="app-alert-warning mb-4 rounded-xl px-4 py-3 text-sm">
              Save this password now. StockDesk stores hashed passwords and cannot reveal them later.
            </div>

            <button
              onClick={() => setShowPasswordModal(false)}
              className="app-btn-subtle w-full rounded-lg px-4 py-2 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
