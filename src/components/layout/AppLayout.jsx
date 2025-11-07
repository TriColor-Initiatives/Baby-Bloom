import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './AppLayout.css';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setSidebarCollapsed(true);
  };

  const handleSidebarHoverState = (isCollapsed) => {
    setSidebarCollapsed(isCollapsed);
  };

  const effectiveCollapsed = sidebarOpen ? false : sidebarCollapsed;

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={effectiveCollapsed}
        onHoverChange={handleSidebarHoverState}
        onClose={closeSidebar}
      />
      <TopBar onMenuClick={toggleSidebar} />
      
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />
      
      <main className={`app-main ${effectiveCollapsed ? 'collapsed' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
