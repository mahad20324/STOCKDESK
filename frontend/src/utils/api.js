import { getToken, logout } from './auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (response.status === 401) {
    if (path === '/auth/login') {
      // Login failure — show actual error, don't logout
      throw new Error(data?.message || 'Invalid credentials');
    }
    logout();
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }
  return data;
}

export const login = (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) });
export const signup = (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) });
export const fetchUsers = () => request('/users');
export const createUser = (body) => request('/users', { method: 'POST', body: JSON.stringify(body) });
export const deleteUser = (id) => request(`/users/${id}`, { method: 'DELETE' });
export const fetchCustomers = (query = '') => request(`/customers${query}`);
export const createCustomer = (body) => request('/customers', { method: 'POST', body: JSON.stringify(body) });
export const updateCustomer = (id, body) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteCustomer = (id) => request(`/customers/${id}`, { method: 'DELETE' });
export const downloadReceipt = async (saleId) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/sales/${saleId}/receipt`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error('Failed to download receipt');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${saleId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    alert(`Error downloading receipt: ${error.message}`);
  }
};
export const fetchProducts = (query = '') => request(`/products${query}`);
export const createProduct = (body) => request('/products', { method: 'POST', body: JSON.stringify(body) });
export const updateProduct = (id, body) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteProduct = (id) => request(`/products/${id}`, { method: 'DELETE' });
export const fetchSettings = () => request('/settings');
export const saveSettings = (body) => request('/settings', { method: 'PUT', body: JSON.stringify(body) });
export const fetchReports = () => request('/reports/daily');
export const fetchSales = () => request('/sales');
export const fetchSale = (id) => request(`/sales/${id}`);
export const createSale = (body) => request('/sales', { method: 'POST', body: JSON.stringify(body) });
export const closeBusinessDay = () => request('/sales/close-day', { method: 'POST' });
export const fetchDayClosures = () => request('/sales/day-closures');
export const fetchBestSelling = () => request('/reports/best-selling');
export const fetchCashierReport = () => request('/reports/by-cashier');
export const fetchDashboardSummary = () => request('/reports/summary');
