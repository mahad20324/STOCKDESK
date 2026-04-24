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
import Expenses from './pages/Expenses';
import AuditLogs from './pages/AuditLogs';
import StockReconciliation from './pages/StockReconciliation';
import Returns from './pages/Returns';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import { getUser, hasActiveSession } from './utils/auth';
import useInactivityLogout from './hooks/useInactivityLogout';

function App() {
  const [session, setSession] = useState({
    isAuthenticated: hasActiveSession(),
    user: getUser(),
  });
  const currentUser = session.user;
  const isSuperAdmin = currentUser?.role === 'SuperAdmin';

  useInactivityLogout(session.isAuthenticated);

  useEffect(() => {
    const checkAuth = () => {
      setSession({
        isAuthenticated: hasActiveSession(),
        user: getUser(),
      });
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
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/owner-login" element={session.isAuthenticated ? <Navigate to={isSuperAdmin ? '/app/shops' : '/app'} replace /> : <OwnerLogin />} />
      <Route path="/app" element={session.isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}>
        <Route index element={isSuperAdmin ? <Navigate to="/app/shops" replace /> : <Dashboard />} />
        <Route path="shops" element={isSuperAdmin ? <Shops /> : <Navigate to="/app" replace />} />
        <Route path="products" element={isSuperAdmin ? <Navigate to="/app/shops" replace /> : <Products />} />
        <Route path="customers" element={isSuperAdmin ? <Navigate to="/app/shops" replace /> : <Customers />} />
        <Route path="pos" element={isSuperAdmin ? <Navigate to="/app/shops" replace /> : <POS />} />
        <Route path="reports" element={isSuperAdmin ? <Navigate to="/app/shops" replace /> : <Reports />} />
        <Route path="expenses" element={isSuperAdmin ? <Navigate to="/app/shops" replace /> : <Expenses />} />
        <Route path="stock-reconciliation" element={isSuperAdmin ? <Navigate to="/app/shops" replace /> : <StockReconciliation />} />
        <Route path="returns" element={isSuperAdmin ? <Navigate to="/app/shops" replace /> : <Returns />} />
        <Route path="audit-logs" element={isSuperAdmin ? <Navigate to="/app/shops" replace /> : <AuditLogs />} />
        <Route path="settings" element={isSuperAdmin ? <Navigate to="/app/shops" replace /> : <Settings />} />
        <Route path="users" element={isSuperAdmin ? <Navigate to="/app/shops" replace /> : <Users />} />
      </Route>
      <Route path="*" element={<Navigate to={session.isAuthenticated ? '/app' : '/login'} replace />} />
    </Routes>
  );
}

export default App;
