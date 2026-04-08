import { useEffect, useState } from 'react';
import { fetchUsers, createUser, deleteUser } from '../utils/api';
import { getUser } from '../utils/auth';

const initialForm = { username: '', password: '', confirmPassword: '', role: 'Staff' };

function StatCard({ label, value, helper }) {
  return (
    <div className="app-panel-soft rounded-xl border p-4">
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--accent-strong)]">{value}</p>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{helper}</p>
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const currentUser = getUser();
  const adminCount = users.filter((user) => user.role === 'Admin').length;
  const staffCount = users.filter((user) => user.role === 'Staff').length;

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
            <h2 className="text-2xl font-semibold text-[var(--accent-strong)]">User Management</h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">Administrators can create and manage shop staff accounts here.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[460px]">
            <StatCard label="Total Users" value={users.length.toLocaleString()} helper="All shop accounts." />
            <StatCard label="Admins" value={adminCount.toLocaleString()} helper="Full-access accounts." />
            <StatCard label="Staff" value={staffCount.toLocaleString()} helper="Shop users with daily access." />
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
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id} className="app-row-hover transition">
                    <td className="px-4 py-3">{user.username || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        user.role === 'Admin' ? 'app-panel-accent' : 'app-alert-success'
                      }`}>
                        {user.role}
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
          <h3 className="text-lg font-semibold text-[var(--accent-strong)]">Create Staff Account</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Create a simple username/password account for a team member.</p>
          <form className="mt-4 space-y-4" onSubmit={handleCreate}>
            <label className="block text-sm text-[var(--text-secondary)]">Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              className="app-input w-full rounded-3xl border px-4 py-3"
            />
            <label className="block text-sm text-[var(--text-secondary)]">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="app-input w-full rounded-3xl border px-4 py-3"
            />
            <label className="block text-sm text-[var(--text-secondary)]">Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
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
