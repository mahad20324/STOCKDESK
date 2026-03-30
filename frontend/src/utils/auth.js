const STORAGE_KEY = 'stockdesk_token';
const USER_KEY = 'stockdesk_user';

export const saveSession = (token, user) => {
  localStorage.setItem(STORAGE_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('auth-changed'));
};

export const getToken = () => localStorage.getItem(STORAGE_KEY);
export const getUser = () => {
  const value = localStorage.getItem(USER_KEY);
  return value ? JSON.parse(value) : null;
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event('auth-changed'));
  window.location.href = '/login';
};
