import { Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { logout, getUser } from '../utils/auth';

export default function Layout() {
  const navigate = useNavigate();
  const user = getUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell min-h-screen">
      <div className="flex min-h-screen">
        <Sidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
          <Header user={user} onLogout={handleLogout} onOpenSidebar={() => setSidebarOpen(true)} />
          <div className="mt-5 sm:mt-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
