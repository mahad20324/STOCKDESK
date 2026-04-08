import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../utils/api';
import { saveSession } from '../utils/auth';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ shopName: '', username: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    shopName: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await login(loginForm);
      saveSession(data.token, data.user);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (signupForm.password !== signupForm.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      const data = await signup(signupForm);
      setCreatedCredentials(data);
      setSuccess(data.message || 'Shop created successfully.');
      setSignupForm({
        shopName: '',
        username: '',
        password: '',
        confirmPassword: '',
      });
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: 'var(--bg-auth)' }}>
      <div className="app-modal mx-auto w-full max-w-2xl rounded-[2rem] border p-8 backdrop-blur">
        <div className="mb-6 text-center">
          <div className="text-4xl font-bold text-[var(--accent-strong)]">StockDesk</div>
          <p className="mt-2 text-[var(--text-soft)]">Simple shop-based sign in for multi-tenant inventory and POS teams</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Super admin sign-in uses username and password only. Leave shop name blank for the platform dashboard.</p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-3xl bg-[var(--surface-secondary)] p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setSuccess('');
              setCreatedCredentials(null);
            }}
            className={`rounded-3xl px-4 py-3 text-sm font-semibold transition ${
              mode === 'login' ? 'app-panel text-[var(--accent-strong)]' : 'text-[var(--text-muted)]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
              setSuccess('');
            }}
            className={`rounded-3xl px-4 py-3 text-sm font-semibold transition ${
              mode === 'signup' ? 'app-panel text-[var(--accent-strong)]' : 'text-[var(--text-muted)]'
            }`}
          >
            Create Shop
          </button>
        </div>

        {mode === 'login' ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Shop Name</label>
            <input
              type="text"
              value={loginForm.shopName}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, shopName: event.target.value }))}
              placeholder="Enter shop name or leave blank for super admin"
              className="app-input w-full rounded-3xl border px-4 py-3 shadow-sm"
            />

            <label className="block text-sm font-medium text-[var(--text-secondary)]">Username</label>
            <input
              type="text"
              value={loginForm.username}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, username: event.target.value }))}
              placeholder="Enter admin or staff username"
              className="app-input w-full rounded-3xl border px-4 py-3 shadow-sm"
            />

            <label className="block text-sm font-medium text-[var(--text-secondary)]">Password</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
              className="app-input w-full rounded-3xl border px-4 py-3 shadow-sm"
            />

            {error && <div className="app-alert-danger rounded-2xl px-4 py-3 text-sm">{error}</div>}
            {success && <div className="app-alert-success rounded-2xl px-4 py-3 text-sm">{success}</div>}

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-3xl px-4 py-3 text-white transition ${
                loading ? 'cursor-not-allowed bg-gray-400' : 'app-btn-primary'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : createdCredentials ? (
          <div className="space-y-4">
            <div className="app-alert-success rounded-2xl px-4 py-3 text-sm">Shop created successfully. Save these credentials now. They are shown once.</div>
            <div className="app-panel-soft space-y-4 rounded-[1.5rem] border p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Shop Name</p>
                <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">{createdCredentials.shopName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Admin Username</p>
                <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">{createdCredentials.username}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Password</p>
                <p className="mt-2 rounded-2xl bg-[var(--surface-primary)] px-4 py-3 font-mono text-sm text-[var(--text-primary)]">{createdCredentials.password}</p>
              </div>
              <div className="app-alert-warning rounded-2xl px-4 py-3 text-sm">
                Save this password before leaving this screen. For security, StockDesk does not show stored passwords again.
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLoginForm({ shopName: createdCredentials.shopName, username: createdCredentials.username, password: '' });
                setCreatedCredentials(null);
                setSuccess('Shop created. Use the saved credentials to sign in.');
              }}
              className="app-btn-primary w-full rounded-3xl px-4 py-3 text-white transition"
            >
              I Saved These Details
            </button>
          </div>
        ) : (
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSignup}>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Shop Name</label>
              <input
                type="text"
                value={signupForm.shopName}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, shopName: event.target.value }))}
                className="app-input w-full rounded-3xl border px-4 py-3 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Admin Username</label>
              <input
                type="text"
                value={signupForm.username}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, username: event.target.value }))}
                className="app-input w-full rounded-3xl border px-4 py-3 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Password</label>
              <input
                type="password"
                value={signupForm.password}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, password: event.target.value }))}
                className="app-input w-full rounded-3xl border px-4 py-3 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Confirm Password</label>
              <input
                type="password"
                value={signupForm.confirmPassword}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                className="app-input w-full rounded-3xl border px-4 py-3 shadow-sm"
              />
            </div>

            <div className="app-alert-warning md:col-span-2 rounded-2xl px-4 py-3 text-sm">
              StockDesk will show the admin password once after signup. Save it before leaving the success screen.
            </div>

            {error && <div className="app-alert-danger md:col-span-2 rounded-2xl px-4 py-3 text-sm">{error}</div>}
            {success && <div className="app-alert-success md:col-span-2 rounded-2xl px-4 py-3 text-sm">{success}</div>}

            <button
              type="submit"
              disabled={loading}
              className={`md:col-span-2 w-full rounded-3xl px-4 py-3 text-white transition ${
                loading ? 'cursor-not-allowed bg-gray-400' : 'app-btn-primary'
              }`}
            >
              {loading ? 'Creating shop...' : 'Create Shop'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
