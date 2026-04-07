import { useEffect, useState } from 'react';
import { fetchUsers, createUser, deleteUser } from '../utils/api';
import { getUser } from '../utils/auth';

const initialForm = { name: '', username: '', email: '', password: '', role: 'Cashier' };

function StatCard({ label, value, helper }) {
  return (
    <div className="rounded-xl border border-[#d9edf3] bg-[#f5fafd] p-4 shadow-sm">
      <p className="text-sm text-[#6b7f8a]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#184b5a]">{value}</p>
      <p className="mt-1 text-sm text-[#6b7f8a]">{helper}</p>
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const currentUser = getUser();
  const adminCount = users.filter((user) => user.role === 'Admin').length;
  const managerCount = users.filter((user) => user.role === 'Manager').length;
  const cashierCount = users.filter((user) => user.role === 'Cashier').length;

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
      setNewUserEmail(response.email || '');
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
      <section className="rounded-[2rem] border border-[#d9edf3] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#184b5a]">User Management</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#6b7f8a]">Administrators can manage POS and system accounts here.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[460px]">
            <StatCard label="Total Users" value={users.length.toLocaleString()} helper="All shop accounts." />
            <StatCard label="Admins" value={adminCount.toLocaleString()} helper="Full-access accounts." />
            <StatCard label="Cashiers" value={(cashierCount + managerCount).toLocaleString()} helper="Frontline and managed staff." />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-[#d9edf3] bg-white p-6 shadow-sm">
          <div className="mb-4 rounded-2xl bg-[#f5fafd] px-4 py-3 text-sm text-[#5f7280]">
            Keep permissions tight. Admins can create users and remove accounts they do not own.
          </div>
          <div className="overflow-x-auto rounded-2xl border border-[#d9edf3]">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-[#f5fafd] text-[#6b7f8a]">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id} className="transition hover:bg-[#f8fcfe]">
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.username || '-'}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        user.role === 'Admin'
                          ? 'bg-[#e6f7fb] text-[#21778d]'
                          : user.role === 'Manager'
                          ? 'bg-[#fff8ec] text-[#e8a34e]'
                          : 'bg-[#e9fbf4] text-[#1e8e65]'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        disabled={user.id === currentUser?.id}
                        className="rounded-lg bg-[#fff1f0] px-3 py-1.5 text-sm text-[#f97066] transition hover:bg-[#fce1de] disabled:cursor-not-allowed disabled:opacity-50"
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

        <div className="rounded-[2rem] border border-[#d9edf3] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#184b5a]">Add User</h3>
          <p className="mt-1 text-sm text-[#6b7f8a]">Create a new team account with the right access level.</p>
          <form className="mt-4 space-y-4" onSubmit={handleCreate}>
            <label className="block text-sm text-[#3f5560]">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-3xl border border-[#d9edf3] bg-[#f5fafd] px-4 py-3"
            />
            <label className="block text-sm text-[#3f5560]">Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              placeholder="Optional. If empty, one is generated automatically"
              className="w-full rounded-3xl border border-[#d9edf3] bg-[#f5fafd] px-4 py-3"
            />
            <label className="block text-sm text-[#3f5560]">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-3xl border border-[#d9edf3] bg-[#f5fafd] px-4 py-3"
            />
            <label className="block text-sm text-[#3f5560]">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full rounded-3xl border border-[#d9edf3] bg-[#f5fafd] px-4 py-3"
            />
            <label className="block text-sm text-[#3f5560]">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              className="w-full rounded-3xl border border-[#d9edf3] bg-[#f5fafd] px-4 py-3"
            >
              <option value="Cashier">Cashier</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
            <button className="w-full rounded-3xl bg-[#2FA8C6] px-4 py-3 text-white transition hover:bg-[#258EA8]">Create User</button>
          </form>

          {message && (
            <div
              className={`mt-4 rounded-3xl px-4 py-3 text-sm ${
                message.includes('success') ? 'bg-[#e9fbf4] text-[#1e8e65]' : 'bg-[#fff1f0] text-[#c84e47]'
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#184b5a]/30 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-[1.5rem] border border-[#d9edf3] bg-white p-6 shadow-[0_24px_80px_rgba(31,100,118,0.18)]">
            <h3 className="mb-4 text-lg font-bold text-[#184b5a]">User Created Successfully</h3>
            <p className="mb-4 text-sm text-[#5f7280]">
              Share these login details with the new user.
            </p>

            <div className="mb-4 rounded-xl bg-[#f5fafd] p-4">
              <p className="mb-1 text-xs text-[#6b7f8a]">Login Username:</p>
              <input
                type="text"
                readOnly
                value={newUserUsername}
                className="w-full rounded-lg border border-[#d9edf3] bg-white px-3 py-2 text-sm font-mono"
              />
            </div>

            <div className="mb-4 rounded-xl bg-[#f5fafd] p-4">
              <p className="mb-1 text-xs text-[#6b7f8a]">Login Email:</p>
              <input
                type="text"
                readOnly
                value={newUserEmail}
                className="w-full rounded-lg border border-[#d9edf3] bg-white px-3 py-2 text-sm font-mono"
              />
            </div>
            
            <div className="mb-4 rounded-xl bg-[#f5fafd] p-4">
              <p className="mb-1 text-xs text-[#6b7f8a]">Login Password:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={newUserPassword}
                  className="flex-1 rounded-lg border border-[#d9edf3] bg-white px-3 py-2 text-sm font-mono"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newUserPassword);
                    setMessage('Password copied to clipboard!');
                  }}
                  className="rounded-lg bg-[#2FA8C6] px-3 py-2 text-sm text-white transition hover:bg-[#258EA8]"
                >
                  Copy
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowPasswordModal(false)}
              className="w-full rounded-lg bg-[#e6f7fb] px-4 py-2 text-[#184b5a] transition hover:bg-[#d5f0f7]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
