import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../utils/api';
import { saveSession } from '../utils/auth';

const signupEnabled = String(import.meta.env.VITE_ENABLE_SIGNUP || 'false').toLowerCase() === 'true';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [loginInput, setLoginInput] = useState('mahad');
  const [password, setPassword] = useState('mahad@123');
  const [signupForm, setSignupForm] = useState({
    shopName: '',
    address: '',
    phone: '',
    currency: 'USD',
    name: '',
    username: '',
    email: '',
    password: '',
  });
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
      const data = await login({ username: loginInput, password });
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
      const data = await signup(signupForm);
      setSuccess(data.message || 'Verification email sent. Please verify your email before signing in.');
      setMode('login');
      setLoginInput(signupForm.email);
      setPassword('');
      setSignupForm({
        shopName: '',
        address: '',
        phone: '',
        currency: 'USD',
        name: '',
        username: '',
        email: '',
        password: '',
      });
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50 px-4 py-12">
      <div className="mx-auto w-full max-w-2xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="text-brand-700 text-4xl font-bold">StockDesk</div>
          <p className="mt-2 text-slate-500">Secure inventory and POS access for single or multi-shop teams</p>
        </div>

        <div className={`mb-6 grid rounded-3xl bg-slate-100 p-1 ${signupEnabled ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setSuccess('');
            }}
            className={`rounded-3xl px-4 py-3 text-sm font-semibold transition ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Sign In
          </button>
          {signupEnabled ? (
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
                setSuccess('');
              }}
              className={`rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Create Shop
            </button>
          ) : null}
        </div>

        {mode === 'login' ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-700">Username or Email</label>
            <input
              type="text"
              value={loginInput}
              onChange={(event) => setLoginInput(event.target.value)}
              placeholder="Enter username or email"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm"
            />

            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm"
            />

            {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {success && <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}
            {!signupEnabled && (
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Shop signup is temporarily disabled on this hosted build. Sign in with an existing profile.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-3xl px-4 py-3 text-white transition ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSignup}>
            <div>
              <label className="block text-sm font-medium text-slate-700">Shop Name</label>
              <input
                type="text"
                value={signupForm.shopName}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, shopName: event.target.value }))}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone <span className="text-slate-400">(optional)</span></label>
              <input
                type="text"
                value={signupForm.phone}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, phone: event.target.value }))}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Address <span className="text-slate-400">(optional)</span></label>
              <input
                type="text"
                value={signupForm.address}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, address: event.target.value }))}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Currency</label>
              <input
                type="text"
                maxLength={3}
                value={signupForm.currency}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Admin Name</label>
              <input
                type="text"
                value={signupForm.name}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Admin Username</label>
              <input
                type="text"
                value={signupForm.username}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, username: event.target.value }))}
                placeholder="Required for shop sign-in"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Admin Email</label>
              <input
                type="email"
                value={signupForm.email}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Required for verification"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Admin Password</label>
              <input
                type="password"
                value={signupForm.password}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, password: event.target.value }))}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm"
              />
            </div>

            <div className="md:col-span-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              After signup, we will email a verification link. Administrator access stays locked until that email is verified.
            </div>

            {error && <div className="md:col-span-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {success && <div className="md:col-span-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

            <button
              type="submit"
              disabled={loading}
              className={`md:col-span-2 w-full rounded-3xl px-4 py-3 text-white transition ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'
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
