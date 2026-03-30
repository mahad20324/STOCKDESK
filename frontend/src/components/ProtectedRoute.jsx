import { Navigate } from 'react-router-dom';
import { getToken } from '../utils/auth';

export default function ProtectedRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}
