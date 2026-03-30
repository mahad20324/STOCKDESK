import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { logout, getUser } from '../utils/auth';

export default function Layout() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar user={user} />
        <div className="flex-1 p-6">
          <Header user={user} onLogout={handleLogout} />
          <div className="mt-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
