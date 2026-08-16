import { useEffect, useRef, useState } from 'react';
import { fetchProfile, updateProfile } from '../utils/api';
import { getToken, updateToken } from '../utils/auth';

function resizeImage(file, maxSize = 256) {
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
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      image.onerror = () => reject(new Error('Could not read the selected image'));
      image.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Could not read the selected file'));
    reader.readAsDataURL(file);
  });
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const fileInputRef = useRef(null);

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
      });
      setMessage('Profile updated successfully.');
      setMessageType('success');
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const initials = String(profile?.name || 'S').slice(0, 1).toUpperCase();
  const roleLabel = profile?.role === 'SuperAdmin' ? 'Platform Administrator' : profile?.role || 'User';

  return (
    <div className="space-y-6">
      <section className="app-panel rounded-[2rem] border p-6">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">My Profile</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">View and update your account details.</p>
          </div>
        </div>
      </section>

      {message && (
        <div className={`app-panel rounded-[1.2rem] border px-4 py-3 text-sm ${
          messageType === 'error'
            ? 'border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]'
            : 'border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success)]'
        }`}>
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="app-panel rounded-[1.2rem] border p-6">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Profile Picture</p>
          <div className="mt-5 flex flex-col items-center gap-4">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile avatar"
                className="h-32 w-32 rounded-full object-cover shadow-lg ring-4 ring-[var(--surface-secondary)]"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[var(--accent-soft)] text-5xl font-bold text-[var(--accent)] shadow-lg ring-4 ring-[var(--surface-secondary)]">
                {initials}
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="app-btn-primary rounded-xl px-4 py-2 text-sm font-medium transition"
              >
                Change Photo
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
            <p className="text-center text-xs text-[var(--text-muted)]">
              Square images look best. Photos are resized to 256px before saving.
            </p>
          </div>
        </section>

        <section className="app-panel rounded-[1.2rem] border p-6 lg:col-span-2">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Account Information</p>
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
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="app-input w-full rounded-lg border px-4 py-3"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Role</label>
                <input
                  type="text"
                  value={roleLabel}
                  className="app-input w-full cursor-not-allowed rounded-lg border bg-[var(--surface-secondary)] px-4 py-3 text-[var(--text-muted)]"
                  disabled
                />
              </div>
            </div>

            <div className="app-panel-soft rounded-xl border p-4">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {profile?.role === 'SuperAdmin' ? 'Platform Scope' : 'Shop'}
              </p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {profile?.shop ? `${profile.shop.name} (${profile.shop.slug})` : profile?.role === 'SuperAdmin' ? 'All registered shops' : 'No shop assigned'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving} className="app-btn-primary rounded-xl px-6 py-3 text-sm font-semibold transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
