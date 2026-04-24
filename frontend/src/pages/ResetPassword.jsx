import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../utils/api';
import { saveSessionNotice } from '../utils/auth';
import { useTheme } from '../components/ThemeProvider';
import logo from '../assets/logo.png';

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

function AuthField({ label, type = 'text', value, onChange, placeholder, autoComplete, Icon }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[var(--text-secondary)]">{label}</label>
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
          className="app-input w-full rounded-[1.15rem] border py-2.5 pl-12 pr-4 text-sm shadow-sm"
        />
      </div>
    </div>
  );
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resolvedTheme, themeMode } = useTheme();
  const activeTheme = themeMode === 'system' ? resolvedTheme : themeMode;

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const token = searchParams.get('token');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!token) {
      setError('This reset link is missing a token. Please use the link from your email.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, password: form.password, confirmPassword: form.confirmPassword });
      setDone(true);
      saveSessionNotice('Password updated. Sign in with your new password.');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err) {
      setError(err.message || 'Reset failed. Please try again or request a new link.');
    }
    setLoading(false);
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-8"
      style={{ background: 'var(--bg-auth)' }}
    >
      <div className="app-modal w-full max-w-md overflow-hidden rounded-[2rem] border p-8">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.3rem] bg-[var(--surface-secondary)] p-2.5 shadow-sm">
            <img src={logo} alt="StockDesk" className="h-10 w-10 object-contain" />
          </div>
        </div>

        {done ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-6 w-6">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Password updated!</h1>
            <p className="mt-2 text-sm text-[var(--text-soft)]">Your password has been changed successfully.</p>
            <p className="mt-3 text-[13px] text-[var(--text-muted)]">Redirecting you to sign in…</p>
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="app-btn-primary mt-5 inline-flex w-full items-center justify-center rounded-[1.1rem] px-4 py-3 text-sm font-semibold leading-none text-white transition"
            >
              Sign In Now
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 text-center">
              <h1 className="text-xl font-bold text-[var(--text-primary)]">Set a new password</h1>
              <p className="mt-1.5 text-sm text-[var(--text-soft)]">Choose a strong password for your account.</p>
            </div>

            <form className="space-y-3.5" onSubmit={handleSubmit}>
              <AuthField
                label="New Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                Icon={LockIcon}
              />
              <AuthField
                label="Confirm New Password"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Repeat your new password"
                autoComplete="new-password"
                Icon={LockIcon}
              />

              {error ? (
                <div className="app-alert-danger rounded-[1.1rem] px-4 py-2.5 text-sm">{error}</div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className={`inline-flex w-full items-center justify-center rounded-[1.1rem] px-4 py-3 text-sm font-semibold leading-none text-white transition ${
                  loading ? 'cursor-not-allowed bg-gray-400' : 'app-btn-primary'
                }`}
              >
                {loading ? 'Updating…' : 'Update Password'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/login', { replace: true })}
                className="inline-flex w-full items-center justify-center gap-1.5 text-sm font-medium text-[var(--accent-strong)] hover:underline"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Back to Sign In
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
