import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { login } from '../utils/api';
import { consumeSessionNotice, getToken, saveSession } from '../utils/auth';

export default function OwnerLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const nextNotice = consumeSessionNotice();

    if (nextNotice) {
      setNotice(nextNotice);
    }
  }, []);

  if (getToken()) {
    return <Navigate to="/app/shops" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login({ shopName: '', username: form.username, password: form.password });
      saveSession(data.token, data.user);
      navigate('/app/shops');
    } catch (err) {
      setError(err.message || 'Platform sign in failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: 'var(--bg-auth)' }}>
      <div className="app-modal mx-auto w-full max-w-md rounded-[2rem] border p-8 backdrop-blur">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
            Private Platform Access
          </div>
          <div className="mt-4 text-4xl font-bold text-[var(--accent-strong)]">StockDesk Owner</div>
          <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">
            Sign in to the platform console to monitor tenant signups, shop activity, and live business movement across the network.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              className="app-input mt-2 w-full rounded-3xl border px-4 py-3 shadow-sm"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              className="app-input mt-2 w-full rounded-3xl border px-4 py-3 shadow-sm"
              autoComplete="current-password"
            />
          </div>

          <div className="app-panel-soft rounded-2xl border px-4 py-3 text-sm text-[var(--text-muted)]">
            This route is for platform ownership only. Shop admins and staff should use the normal StockDesk login page.
          </div>

          {notice ? <div className="app-alert-success rounded-2xl px-4 py-3 text-sm">{notice}</div> : null}
          {error ? <div className="app-alert-danger rounded-2xl px-4 py-3 text-sm">{error}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-3xl px-4 py-3 text-white transition ${loading ? 'cursor-not-allowed bg-gray-400' : 'app-btn-primary'}`}
          >
            {loading ? 'Signing in...' : 'Enter Platform Console'}
          </button>
        </form>
      </div>
    </div>
  );
}