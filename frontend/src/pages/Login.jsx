import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../utils/api';
import { consumeSessionNotice, saveSession } from '../utils/auth';
import ThemeToggleButton from '../components/ThemeToggleButton';
import logo from '../assets/image.png';

const featureHighlights = [
  {
    title: 'Live inventory visibility',
    description: 'Monitor stock movement, low inventory, and restock priorities without jumping between screens.',
    Icon: InventoryIcon,
  },
  {
    title: 'Fast retail operations',
    description: 'Keep checkout, reporting, and cashier activity running from one focused workspace.',
    Icon: LightningIcon,
  },
  {
    title: 'Built for shop teams',
    description: 'Separate shop access from platform ownership with role-aware sign in and cleaner controls.',
    Icon: ShieldIcon,
  },
];

const brandStats = [
  { value: 'POS', label: 'Sales ready' },
  { value: 'Live', label: 'Stock status' },
  { value: '24/7', label: 'Business view' },
];

function InventoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="m3 7 9-4 9 4-9 4-9-4Z" />
      <path d="m3 7 9 4 9-4" />
      <path d="M12 11v10" />
      <path d="m3 17 9 4 9-4" />
    </svg>
  );
}

function LightningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M12 3 5 6v6c0 5 3.4 7.9 7 9 3.6-1.1 7-4 7-9V6l-7-3Z" />
      <path d="m9.5 12 1.7 1.7 3.3-3.7" />
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M3 21h18" />
      <path d="M5 21V8l7-4 7 4v13" />
      <path d="M9 10h6" />
      <path d="M9 14h6" />
      <path d="M10 21v-3h4v3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <path d="M12 11a4 4 0 1 0 0-8a4 4 0 0 0 0 8Z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M14.5 8a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7Z" />
      <path d="M11 12H4" />
      <path d="M7 12v3" />
      <path d="M9 12v2" />
    </svg>
  );
}

function AuthField({ label, type = 'text', value, onChange, placeholder, autoComplete, Icon }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-secondary)]">{label}</label>
      <div className="relative mt-2">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--text-muted)]">
          <Icon />
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="app-input w-full rounded-2xl border py-3 pl-12 pr-4 text-sm shadow-sm"
        />
      </div>
    </div>
  );
}

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

  const panelCopy =
    mode === 'login'
      ? {
          eyebrow: 'Shop Sign In',
          title: 'Welcome back',
          description: 'Sign in to open your dashboard, manage inventory, and keep sales moving without friction.',
          note: 'Use the exact shop name registered for your workspace.',
          action: loading ? 'Signing in...' : 'Enter Dashboard',
        }
      : {
          eyebrow: 'Create Workspace',
          title: 'Launch a new shop',
          description: 'Set up a new StockDesk workspace for your team and save the generated admin credentials carefully.',
          note: 'The generated admin password is shown once after signup.',
          action: loading ? 'Creating shop...' : 'Create Shop',
        };

  useEffect(() => {
    const notice = consumeSessionNotice();

    if (notice) {
      setSuccess(notice);
    }
  }, []);

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
    <div className="relative min-h-screen overflow-hidden px-4 py-5 sm:px-6 lg:px-8" style={{ background: 'var(--bg-auth)' }}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-[var(--accent)]/15 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-[var(--success)]/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-[var(--accent-hover)]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-6xl justify-end">
        <ThemeToggleButton compact className="mb-4" />
      </div>

      <div className="app-modal relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border backdrop-blur lg:grid-cols-[1.05fr_minmax(0,0.95fr)]">
        <section className="relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12" style={{ background: 'var(--sidebar-bg)' }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(30,167,189,0.24),transparent_34%)]" />
          <div className="absolute right-8 top-8 h-24 w-24 rounded-full border border-white/10 bg-white/5 blur-2xl" />
          <div className="absolute bottom-10 left-10 h-32 w-32 rounded-full bg-[var(--accent)]/15 blur-3xl" />

          <div className="relative flex h-full flex-col">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.6rem] border border-white/10 bg-white/10 p-2 shadow-[0_18px_45px_rgba(0,0,0,0.18)] backdrop-blur">
                <img src={logo} alt="StockDesk logo" className="h-12 w-12 object-contain" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">StockDesk</p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">Inventory and POS control</p>
              </div>
            </div>

            <div className="mt-8 max-w-xl">
              <div className="inline-flex items-center rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
                Retail operations workspace
              </div>
              <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-[2.7rem]">
                Run sales, stock, and staff from one cleaner control surface.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/72 sm:text-base">
                The reference you shared has the right structure. This version keeps that split-screen feel, but uses your own StockDesk palette and product tone instead of copying it.
              </p>
            </div>

            <div className="mt-8 grid gap-3">
              {featureHighlights.map(({ title, description, Icon }) => (
                <div key={title} className="flex items-start gap-4 rounded-[1.4rem] border border-white/10 bg-white/6 px-4 py-4 backdrop-blur-sm">
                  <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <Icon />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white sm:text-[15px]">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/65">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {brandStats.map((item) => (
                <div key={item.label} className="rounded-[1.35rem] border border-white/10 bg-white/8 px-4 py-4 text-center backdrop-blur-sm">
                  <div className="text-lg font-semibold tracking-tight text-white sm:text-xl">{item.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/60">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="mx-auto max-w-xl">
            <div className="inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
              {panelCopy.eyebrow}
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-[2.4rem]">{panelCopy.title}</h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--text-soft)] sm:text-base">{panelCopy.description}</p>

            <div className="mt-6 grid grid-cols-2 rounded-[1.2rem] bg-[var(--surface-secondary)] p-1.5">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccess('');
                  setCreatedCredentials(null);
                }}
                className={`rounded-[1rem] px-4 py-3 text-sm font-semibold transition ${
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
                  setCreatedCredentials(null);
                }}
                className={`rounded-[1rem] px-4 py-3 text-sm font-semibold transition ${
                  mode === 'signup' ? 'app-panel text-[var(--accent-strong)]' : 'text-[var(--text-muted)]'
                }`}
              >
                Create Shop
              </button>
            </div>

            <div className="app-panel-soft mt-6 rounded-[1.6rem] border p-5 sm:p-6">
              {mode === 'login' ? (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <AuthField
                    label="Shop Name"
                    value={loginForm.shopName}
                    onChange={(event) => setLoginForm((prev) => ({ ...prev, shopName: event.target.value }))}
                    placeholder="Enter your shop name"
                    autoComplete="organization"
                    Icon={ShopIcon}
                  />

                  <AuthField
                    label="Username"
                    value={loginForm.username}
                    onChange={(event) => setLoginForm((prev) => ({ ...prev, username: event.target.value }))}
                    placeholder="Enter admin or staff username"
                    autoComplete="username"
                    Icon={UserIcon}
                  />

                  <AuthField
                    label="Password"
                    type="password"
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                    autoComplete="current-password"
                    Icon={LockIcon}
                  />

                  <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-primary)] px-4 py-3 text-sm text-[var(--text-muted)]">
                    {panelCopy.note}
                  </div>

                  {error ? <div className="app-alert-danger rounded-2xl px-4 py-3 text-sm">{error}</div> : null}
                  {success ? <div className="app-alert-success rounded-2xl px-4 py-3 text-sm">{success}</div> : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full rounded-2xl px-4 py-3.5 text-sm font-semibold text-white transition ${
                      loading ? 'cursor-not-allowed bg-gray-400' : 'app-btn-primary'
                    }`}
                  >
                    {panelCopy.action}
                  </button>
                </form>
              ) : createdCredentials ? (
                <div className="space-y-4">
                  <div className="app-alert-success rounded-2xl px-4 py-3 text-sm">
                    Shop created successfully. Save these credentials now. They are shown once.
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-primary)] px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Shop Name</p>
                      <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">{createdCredentials.shopName}</p>
                    </div>
                    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-primary)] px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Admin Username</p>
                      <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">{createdCredentials.username}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-primary)] px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Password</p>
                    <p className="mt-2 rounded-2xl bg-[var(--surface-secondary)] px-4 py-3 font-mono text-sm text-[var(--text-primary)]">
                      {createdCredentials.password}
                    </p>
                  </div>
                  <div className="app-alert-warning rounded-2xl px-4 py-3 text-sm">
                    Save this password before leaving this screen. For security, StockDesk does not show stored passwords again.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setLoginForm({ shopName: createdCredentials.shopName, username: createdCredentials.username, password: '' });
                      setCreatedCredentials(null);
                      setSuccess('Shop created. Use the saved credentials to sign in.');
                    }}
                    className="app-btn-primary w-full rounded-2xl px-4 py-3.5 text-sm font-semibold text-white transition"
                  >
                    I Saved These Details
                  </button>
                </div>
              ) : (
                <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSignup}>
                  <AuthField
                    label="Shop Name"
                    value={signupForm.shopName}
                    onChange={(event) => setSignupForm((prev) => ({ ...prev, shopName: event.target.value }))}
                    placeholder="Choose a shop name"
                    autoComplete="organization"
                    Icon={ShopIcon}
                  />
                  <AuthField
                    label="Admin Username"
                    value={signupForm.username}
                    onChange={(event) => setSignupForm((prev) => ({ ...prev, username: event.target.value }))}
                    placeholder="Create an admin username"
                    autoComplete="username"
                    Icon={UserIcon}
                  />
                  <AuthField
                    label="Password"
                    type="password"
                    value={signupForm.password}
                    onChange={(event) => setSignupForm((prev) => ({ ...prev, password: event.target.value }))}
                    autoComplete="new-password"
                    Icon={LockIcon}
                  />
                  <AuthField
                    label="Confirm Password"
                    type="password"
                    value={signupForm.confirmPassword}
                    onChange={(event) => setSignupForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                    autoComplete="new-password"
                    Icon={KeyIcon}
                  />

                  <div className="app-alert-warning md:col-span-2 rounded-2xl px-4 py-3 text-sm">
                    {panelCopy.note}
                  </div>

                  {error ? <div className="app-alert-danger md:col-span-2 rounded-2xl px-4 py-3 text-sm">{error}</div> : null}
                  {success ? <div className="app-alert-success md:col-span-2 rounded-2xl px-4 py-3 text-sm">{success}</div> : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`md:col-span-2 w-full rounded-2xl px-4 py-3.5 text-sm font-semibold text-white transition ${
                      loading ? 'cursor-not-allowed bg-gray-400' : 'app-btn-primary'
                    }`}
                  >
                    {panelCopy.action}
                  </button>
                </form>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-3 rounded-[1.35rem] border border-[var(--border-default)] bg-[var(--surface-primary)] px-4 py-4 text-sm text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-[var(--text-secondary)]">Platform owner access</p>
                <p className="mt-1 text-sm leading-6">Use the separate console route if you manage all shops.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/owner/login')}
                className="app-btn-secondary shrink-0 rounded-2xl border px-4 py-2.5 font-medium transition"
              >
                Owner Login
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
