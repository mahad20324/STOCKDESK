import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import OwnerLogin from './pages/OwnerLogin';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import POS from './pages/POS';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Shops from './pages/Shops';
import ProtectedRoute from './components/ProtectedRoute';
import { getToken, getUser } from './utils/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
  const currentUser = getUser();
  const isSuperAdmin = currentUser?.role === 'SuperAdmin';

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!getToken());
    };

    window.addEventListener('auth-changed', checkAuth);
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('auth-changed', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/owner-login" element={isAuthenticated ? <Navigate to={isSuperAdmin ? '/app/shops' : '/app'} replace /> : <OwnerLogin />} />
      <Route path="/app" element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}>
        <Route index element={isSuperAdmin ? <Navigate to="/app/shops" replace /> : <Dashboard />} />
        <Route path="shops" element={isSuperAdmin ? <Shops /> : <Navigate to="/app" replace />} />
        <Route path="products" element={isSuperAdmin ? <Navigate to="/app/shops" replace /> : <Products />} />
        <Route path="customers" element={isSuperAdmin ? <Navigate to="/app/shops" replace /> : <Customers />} />
        <Route path="pos" element={isSuperAdmin ? <Navigate to="/app/shops" replace /> : <POS />} />
        <Route path="reports" element={isSuperAdmin ? <Navigate to="/app/shops" replace /> : <Reports />} />
        <Route path="settings" element={isSuperAdmin ? <Navigate to="/app/shops" replace /> : <Settings />} />
        <Route path="users" element={isSuperAdmin ? <Navigate to="/app/shops" replace /> : <Users />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? '/app' : '/login'} replace />} />
    </Routes>
  );
}

export default App;
