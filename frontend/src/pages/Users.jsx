import { useEffect, useState } from 'react';
import { fetchUsers, createUser, deleteUser } from '../utils/api';
import { getUser } from '../utils/auth';

const initialForm = { name: '', username: '', email: '', password: '', role: 'Cashier' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const currentUser = getUser();

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
      <div className="rounded-[2rem] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">User Management</h2>
        <p className="mt-2 text-slate-500">Administrators can manage POS and system accounts here.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
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
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.username || '-'}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.role}</td>
                    <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        disabled={user.id === currentUser?.id}
                        className="text-sm text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
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

        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Add User</h3>
          <form className="mt-4 space-y-4" onSubmit={handleCreate}>
            <label className="block text-sm text-slate-700">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
            <label className="block text-sm text-slate-700">Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              placeholder="Optional. If empty, one is generated automatically"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
            <label className="block text-sm text-slate-700">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
            <label className="block text-sm text-slate-700">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
            <label className="block text-sm text-slate-700">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <option value="Cashier">Cashier</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
            <button className="w-full rounded-3xl bg-brand-600 px-4 py-3 text-white hover:bg-brand-700">Create User</button>
          </form>

          {message && (
            <div
              className={`mt-4 rounded-3xl px-4 py-3 text-sm ${
                message.includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">User Created Successfully</h3>
            <p className="text-sm text-slate-600 mb-4">
              Share these login details with the new user.
            </p>

            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <p className="text-xs text-slate-500 mb-1">Login Username:</p>
              <input
                type="text"
                readOnly
                value={newUserUsername}
                className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm font-mono"
              />
            </div>

            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <p className="text-xs text-slate-500 mb-1">Login Email:</p>
              <input
                type="text"
                readOnly
                value={newUserEmail}
                className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm font-mono"
              />
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <p className="text-xs text-slate-500 mb-1">Login Password:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={newUserPassword}
                  className="flex-1 bg-white border border-slate-200 rounded px-3 py-2 text-sm font-mono"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newUserPassword);
                    setMessage('Password copied to clipboard!');
                  }}
                  className="bg-brand-600 text-white px-3 py-2 rounded text-sm hover:bg-brand-700"
                >
                  Copy
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowPasswordModal(false)}
              className="w-full bg-slate-200 text-slate-900 rounded-lg px-4 py-2 hover:bg-slate-300"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
