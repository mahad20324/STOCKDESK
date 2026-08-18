import { useEffect, useRef, useState } from 'react';
import { fetchProfile, updateProfile, resendVerification, changePassword } from '../utils/api';
import { getToken, updateToken } from '../utils/auth';

function resizeImage(file, maxSize = 512) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      image.onerror = () => reject(new Error('Could not read the selected image'));
      image.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Could not read the selected file'));
    reader.readAsDataURL(file);
  });
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function EyeIcon({ on = false }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      {on ? (
        <>
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <path d="m1 1 22 22" />
          <path d="M10.73 10.73a3 3 0 0 0 4.1 4.1" />
        </>
      )}
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M3 21h18" />
      <path d="M5 21V8l7-4 7 4v13" />
      <path d="M9 21v-4h6v4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
    </svg>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const fileInputRef = useRef(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState('');
  const [pwMessageType, setPwMessageType] = useState('success');
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await fetchProfile();
      setProfile(data);
      setName(data.name || '');
      setEmail(data.email || '');
      setAvatarUrl(data.avatarUrl || null);
      setAvatarPreview(data.avatarUrl || null);
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (!file.type.startsWith('image/')) {
        setMessage('Please choose an image file.');
        setMessageType('error');
        return;
      }
      const dataUrl = await resizeImage(file);
      setAvatarUrl(dataUrl);
      setAvatarPreview(dataUrl);
      setAvatarChanged(true);
      setShowAvatarModal(true);
      setMessage('');
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    setAvatarPreview(null);
    setAvatarChanged(true);
    setShowAvatarModal(false);
    setMessage('');
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const body = { name };
      if (email !== (profile?.email || '')) {
        body.email = email;
      }
      if (avatarChanged) {
        body.avatarUrl = avatarUrl;
      }
      const data = await updateProfile(body);
      setProfile(data);
      setAvatarChanged(false);
      updateToken(getToken(), {
        ...(JSON.parse(localStorage.getItem('stockdesk_user') || 'null') || {}),
        name: data.name,
        avatarUrl: data.avatarUrl,
        isVerified: data.isVerified,
      });
      if (data.verificationPending) {
        setMessage(
          data.verificationEmailSent
            ? 'Email updated. A verification link has been sent to your new address — click it to verify your email.'
            : data.message || 'Email updated but the verification link could not be sent. You can resend it below.'
        );
        setMessageType('success');
      } else {
        setMessage('Profile updated successfully.');
        setMessageType('success');
      }
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setMessage('');
    try {
      await resendVerification({ email });
      setMessage('A new verification link has been sent to your email address.');
      setMessageType('success');
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setResending(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setPwSaving(true);
    setPwMessage('');
    try {
      const strongPw = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match.');
      }
      if (!strongPw.test(newPassword)) {
        throw new Error('Password must be at least 8 characters and include letters, numbers, and a special character.');
      }
      const data = await changePassword({ currentPassword, newPassword, confirmPassword });
      setPwMessage(data.message || 'Password updated successfully.');
      setPwMessageType('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPwMessage(error.message);
      setPwMessageType('error');
    } finally {
      setPwSaving(false);
    }
  };

  const initials = String(profile?.name || 'S').slice(0, 1).toUpperCase();
  const roleLabel = profile?.role === 'SuperAdmin' ? 'Platform Administrator' : profile?.displayRole || profile?.role || 'User';
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : '';
  const isSuperAdmin = profile?.role === 'SuperAdmin';
  const pwInputType = showPw ? 'text' : 'password';

  return (
    <div className="space-y-6">
      {/* Hero with Avatar */}
      <section className="app-panel overflow-hidden rounded-[2rem] border">
        <div className="relative h-32 bg-[linear-gradient(135deg,var(--accent),var(--accent-hover))]">
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 right-1/3 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute right-5 top-5 flex items-center gap-2">
            {profile?.isVerified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                <CheckIcon />
                Verified
              </span>
            ) : email ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                <AlertIcon />
                Pending
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative px-6 pb-6">
          <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
            {/* Avatar */}
            <div className="group relative shrink-0" onClick={() => fileInputRef.current?.click()}>
              <div className="relative h-28 w-28 cursor-pointer">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile avatar"
                    className="h-full w-full rounded-2xl object-cover ring-4 ring-[var(--surface-primary)] shadow-xl"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-4xl font-bold text-[var(--accent)] ring-4 ring-[var(--surface-primary)] shadow-xl">
                    {initials}
                  </div>
                )}
                <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 text-white opacity-0 transition group-hover:opacity-100 ring-4 ring-[var(--surface-primary)]">
                  <CameraIcon />
                </span>
                {/* Online status dot */}
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--surface-primary)] bg-[var(--success)]">
                  <CheckIcon />
                </span>
              </div>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">{profile?.name || 'Loading…'}</h1>
                <span className="inline-flex items-center rounded-full border border-[var(--accent)]/25 bg-[var(--accent-soft)] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
                  {roleLabel}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {isSuperAdmin
                  ? 'Platform Console · All registered shops'
                  : profile?.shop
                  ? `${profile.shop.name} · @${profile.shop.slug}`
                  : 'No shop assigned'}
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Member since {memberSince || '—'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="app-btn-secondary rounded-xl border px-4 py-2 text-sm font-medium transition"
              >
                Change photo
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="app-btn-secondary rounded-xl border px-4 py-2 text-sm font-medium transition"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Avatar Preview Modal */}
      {showAvatarModal && avatarPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAvatarModal(false)}>
          <div className="mx-4 w-full max-w-md rounded-3xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Profile Photo</h3>
              <button type="button" onClick={() => setShowAvatarModal(false)} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="mt-5 flex justify-center">
              <div className="relative">
                <img src={avatarPreview} alt="Avatar preview" className="h-40 w-40 rounded-3xl object-cover shadow-2xl ring-4 ring-[var(--accent)]/20" />
                <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--surface-primary)] bg-[var(--success)] text-white">
                  <CheckIcon />
                </span>
              </div>
            </div>
            <p className="mt-4 text-center text-sm text-[var(--text-muted)]">This photo will be visible across your account</p>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setShowAvatarModal(false)} className="app-btn-primary flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition">
                Keep Photo
              </button>
              <button type="button" onClick={handleRemoveAvatar} className="app-btn-secondary flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className={`app-panel rounded-[1.2rem] border px-4 py-3 text-sm ${
          messageType === 'error'
            ? 'border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]'
            : 'border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success)]'
        }`}>
          {message}
        </div>
      )}

      {/* Stats */}
      {profile?.stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="app-panel rounded-[1.2rem] border border-l-[3px] border-l-[var(--accent)] p-4 transition duration-200 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(30,167,189,0.18),rgba(30,167,189,0.08))] text-[var(--accent)] ring-1 ring-[rgba(30,167,189,0.12)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="m3 7 9-4 9 4-9 4-9-4Z" /><path d="m3 7 9 4 9-4" /><path d="M12 11v10" /></svg>
              </span>
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Products</p>
                <p className="mt-0.5 text-2xl font-bold tracking-tight text-[var(--text-primary)]">{profile.stats.products}</p>
              </div>
            </div>
          </div>
          <div className="app-panel rounded-[1.2rem] border border-l-[3px] border-l-[var(--success)] p-4 transition duration-200 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(74,168,132,0.18),rgba(74,168,132,0.08))] text-[var(--success)] ring-1 ring-[rgba(74,168,132,0.12)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M4 5h16v14H4z" /><path d="M8 9h8" /><path d="M8 13h3" /><path d="M14 13h2" /></svg>
              </span>
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Sales</p>
                <p className="mt-0.5 text-2xl font-bold tracking-tight text-[var(--text-primary)]">{profile.stats.sales}</p>
              </div>
            </div>
          </div>
          <div className="app-panel rounded-[1.2rem] border border-l-[3px] border-l-[var(--warning)] p-4 transition duration-200 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(216,155,73,0.18),rgba(216,155,73,0.08))] text-[var(--warning)] ring-1 ring-[rgba(216,155,73,0.12)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><path d="M9.5 11a4 4 0 1 0 0-8a4 4 0 0 0 0 8Z" /><path d="M21 21v-2a4 4 0 0 0-3-3.9" /><path d="M16 3.1a4 4 0 0 1 0 7.8" /></svg>
              </span>
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Customers</p>
                <p className="mt-0.5 text-2xl font-bold tracking-tight text-[var(--text-primary)]">{profile.stats.customers}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          <section className="app-panel rounded-[1.2rem] border p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                <UserIcon />
              </span>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Account Information</h2>
            </div>
            <form onSubmit={handleSave} className="mt-5 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="app-input w-full rounded-lg border px-4 py-3"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Username</label>
                  <input
                    type="text"
                    value={profile?.username || ''}
                    className="app-input w-full cursor-not-allowed rounded-lg border bg-[var(--surface-secondary)] px-4 py-3 text-[var(--text-muted)]"
                    disabled
                  />
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Username cannot be changed.</p>
                </div>
                <div className="sm:col-span-2">
                  <div className="mb-1.5 flex items-center gap-2">
                    <label className="text-sm font-medium text-[var(--text-primary)]">Email</label>
                    {profile?.isVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--success-border)] bg-[var(--success-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--success)]">
                        <CheckIcon />
                        Verified
                      </span>
                    ) : email ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--warning-border)] bg-[var(--warning-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--warning)]">
                        <AlertIcon />
                        Not verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--surface-secondary)] px-2 py-0.5 text-[11px] font-semibold text-[var(--text-muted)]">
                        No email set
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="app-input w-full rounded-lg border px-4 py-3"
                    placeholder="you@example.com"
                  />
                  {!profile?.isVerified && email && (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending}
                      className="mt-2 text-xs font-medium text-[var(--accent-strong)] hover:underline disabled:opacity-50"
                    >
                      {resending ? 'Sending…' : 'Resend verification link'}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-[var(--border-default)] pt-5">
                <p className="text-sm text-[var(--text-muted)]">
                  Role: <span className="font-semibold text-[var(--text-primary)]">{roleLabel}</span>
                </p>
                <button type="submit" disabled={saving} className="app-btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold transition disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>

          {profile && email && !profile.isVerified && (
            <section className="app-panel rounded-[1.2rem] border border-[var(--warning-border)] bg-[var(--warning-soft)] px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--warning)] text-white">
                    <AlertIcon />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--warning)]">Email verification required</p>
                    <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                      We sent a verification link to <strong className="font-semibold text-[var(--text-primary)]">{email}</strong>. Click it to
                      finish securing your account.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="app-btn-secondary shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition disabled:opacity-50"
                >
                  {resending ? 'Sending…' : 'Resend link'}
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <section className="app-panel rounded-[1.2rem] border p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                <ShieldIcon />
              </span>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Security</h2>
            </div>
            <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Current Password</label>
                <div className="relative">
                  <input
                    type={pwInputType}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="app-input w-full rounded-lg border px-4 py-2.5 pr-11"
                    placeholder="Current password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
                    aria-label={showPw ? 'Hide passwords' : 'Show passwords'}
                  >
                    <EyeIcon on={showPw} />
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">New Password</label>
                <input
                  type={pwInputType}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="app-input w-full rounded-lg border px-4 py-2.5"
                  placeholder="New password"
                  autoComplete="new-password"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Confirm New Password</label>
                <input
                  type={pwInputType}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="app-input w-full rounded-lg border px-4 py-2.5"
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                  required
                />
              </div>

              {pwMessage && (
                <p className={`text-sm ${pwMessageType === 'error' ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>{pwMessage}</p>
              )}

              <button type="submit" disabled={pwSaving} className="app-btn-primary w-full rounded-xl px-6 py-2.5 text-sm font-semibold transition disabled:opacity-50">
                {pwSaving ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </section>

          <section className="app-panel rounded-[1.2rem] border p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                <ShopIcon />
              </span>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                {isSuperAdmin ? 'Platform Scope' : 'Shop Information'}
              </h2>
            </div>
            {isSuperAdmin ? (
              <div className="mt-4 space-y-3">
                <div className="app-panel-soft rounded-xl border px-4 py-3">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Access</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">All registered shops</p>
                </div>
                <div className="app-panel-soft rounded-xl border px-4 py-3">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Username</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{profile?.username || '—'}</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="app-panel-soft rounded-xl border px-4 py-3">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Shop Name</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{profile?.shopDetails?.shopName || profile?.shop?.name || '—'}</p>
                </div>
                <div className="app-panel-soft rounded-xl border px-4 py-3">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Shop Slug</p>
                  <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{profile?.shop?.slug || '—'}</p>
                </div>
                <div className="app-panel-soft rounded-xl border px-4 py-3">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Phone</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{profile?.shopDetails?.phone || '—'}</p>
                </div>
                <div className="app-panel-soft rounded-xl border px-4 py-3">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Currency</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{profile?.shopDetails?.currency || '—'}</p>
                </div>
                <div className="app-panel-soft rounded-xl border px-4 py-3">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Address</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{profile?.shopDetails?.address || '—'}</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
