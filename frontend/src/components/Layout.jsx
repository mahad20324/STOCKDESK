import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { logout, getUser } from '../utils/auth';

export default function Layout() {
  const user = getUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="app-shell min-h-screen">
      <div className="flex min-h-screen">
        <Sidebar
          user={user}
          isOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />
        <div className={`flex-1 min-w-0 px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-4.5 transition-all duration-300`}>
          <div className="mx-auto w-full max-w-[1440px]">
            <Header
              onOpenSidebar={() => setSidebarOpen(true)}
              onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
              sidebarCollapsed={sidebarCollapsed}
            />
            <div className="mt-4 sm:mt-5">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
