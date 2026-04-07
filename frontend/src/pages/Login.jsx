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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(47,168,198,0.18),_transparent_32%),linear-gradient(135deg,#eef6fb_0%,#f8fcfe_55%,#edf9f5_100%)] px-4 py-12">
      <div className="mx-auto w-full max-w-2xl rounded-[2rem] border border-[#d9edf3] bg-white/95 p-8 shadow-[0_24px_80px_rgba(31,100,118,0.12)] backdrop-blur">
        <div className="mb-6 text-center">
          <div className="text-4xl font-bold text-[#21778D]">StockDesk</div>
          <p className="mt-2 text-[#5f7280]">Secure inventory and POS access for single or multi-shop teams</p>
        </div>

        <div className={`mb-6 grid rounded-3xl bg-[#eef7fb] p-1 ${signupEnabled ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setSuccess('');
            }}
            className={`rounded-3xl px-4 py-3 text-sm font-semibold transition ${
              mode === 'login' ? 'bg-white text-[#184b5a] shadow-sm' : 'text-[#6b7f8a]'
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
                mode === 'signup' ? 'bg-white text-[#184b5a] shadow-sm' : 'text-[#6b7f8a]'
              }`}
            >
              Create Shop
            </button>
          ) : null}
        </div>

        {mode === 'login' ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-[#3f5560]">Username or Email</label>
            <input
              type="text"
              value={loginInput}
              onChange={(event) => setLoginInput(event.target.value)}
              placeholder="Enter username or email"
              className="w-full rounded-3xl border border-[#d9edf3] bg-[#f5fafd] px-4 py-3 shadow-sm"
            />

            <label className="block text-sm font-medium text-[#3f5560]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-3xl border border-[#d9edf3] bg-[#f5fafd] px-4 py-3 shadow-sm"
            />

            {error && <div className="rounded-2xl bg-[#fff1f0] px-4 py-3 text-sm text-[#c84e47]">{error}</div>}
            {success && <div className="rounded-2xl bg-[#e9fbf4] px-4 py-3 text-sm text-[#1e8e65]">{success}</div>}
            {!signupEnabled && (
              <div className="rounded-2xl bg-[#f5fafd] px-4 py-3 text-sm text-[#5f7280]">
                Shop signup is temporarily disabled on this hosted build. Sign in with an existing profile.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-3xl px-4 py-3 text-white transition ${
                loading ? 'cursor-not-allowed bg-gray-400' : 'bg-[#2FA8C6] hover:bg-[#258EA8]'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSignup}>
            <div>
              <label className="block text-sm font-medium text-[#3f5560]">Shop Name</label>
              <input
                type="text"
                value={signupForm.shopName}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, shopName: event.target.value }))}
                className="w-full rounded-3xl border border-[#d9edf3] bg-[#f5fafd] px-4 py-3 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3f5560]">Phone <span className="text-[#8aa0aa]">(optional)</span></label>
              <input
                type="text"
                value={signupForm.phone}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, phone: event.target.value }))}
                className="w-full rounded-3xl border border-[#d9edf3] bg-[#f5fafd] px-4 py-3 shadow-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#3f5560]">Address <span className="text-[#8aa0aa]">(optional)</span></label>
              <input
                type="text"
                value={signupForm.address}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, address: event.target.value }))}
                className="w-full rounded-3xl border border-[#d9edf3] bg-[#f5fafd] px-4 py-3 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3f5560]">Currency</label>
              <input
                type="text"
                maxLength={3}
                value={signupForm.currency}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))}
                className="w-full rounded-3xl border border-[#d9edf3] bg-[#f5fafd] px-4 py-3 shadow-sm uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3f5560]">Admin Name</label>
              <input
                type="text"
                value={signupForm.name}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full rounded-3xl border border-[#d9edf3] bg-[#f5fafd] px-4 py-3 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3f5560]">Admin Username</label>
              <input
                type="text"
                value={signupForm.username}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, username: event.target.value }))}
                placeholder="Required for shop sign-in"
                className="w-full rounded-3xl border border-[#d9edf3] bg-[#f5fafd] px-4 py-3 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3f5560]">Admin Email</label>
              <input
                type="email"
                value={signupForm.email}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Required for verification"
                className="w-full rounded-3xl border border-[#d9edf3] bg-[#f5fafd] px-4 py-3 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3f5560]">Admin Password</label>
              <input
                type="password"
                value={signupForm.password}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, password: event.target.value }))}
                className="w-full rounded-3xl border border-[#d9edf3] bg-[#f5fafd] px-4 py-3 shadow-sm"
              />
            </div>

            <div className="md:col-span-2 rounded-2xl bg-[#f5fafd] px-4 py-3 text-sm text-[#5f7280]">
              After signup, we will email a verification link. Administrator access stays locked until that email is verified.
            </div>

            {error && <div className="md:col-span-2 rounded-2xl bg-[#fff1f0] px-4 py-3 text-sm text-[#c84e47]">{error}</div>}
            {success && <div className="md:col-span-2 rounded-2xl bg-[#e9fbf4] px-4 py-3 text-sm text-[#1e8e65]">{success}</div>}

            <button
              type="submit"
              disabled={loading}
              className={`md:col-span-2 w-full rounded-3xl px-4 py-3 text-white transition ${
                loading ? 'cursor-not-allowed bg-gray-400' : 'bg-[#2FA8C6] hover:bg-[#258EA8]'
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
