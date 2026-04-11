import { Navigate } from 'react-router-dom';
import { hasActiveSession } from '../utils/auth';

export default function ProtectedRoute({ children }) {
  return hasActiveSession() ? children : <Navigate to="/login" replace />;
}
