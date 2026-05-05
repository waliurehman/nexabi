import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false); // Reset overlay state on desktop
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div style={styles.layout}>
      <Topbar onToggleSidebar={handleToggleSidebar} isMobile={isMobile} />
      
      <Sidebar 
        collapsed={isMobile ? false : sidebarCollapsed} 
        open={sidebarOpen} 
        isMobile={isMobile}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div style={{
        ...styles.mainArea,
        marginLeft: isMobile ? '0' : (sidebarCollapsed ? '80px' : 'var(--sidebar-width)'),
      }}>
        <main style={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
};

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg)',
    position: 'relative',
    overflowX: 'hidden'
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    transition: 'margin-left 0.3s ease',
    minHeight: '100vh',
    width: '100%',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingTop: 'var(--topbar-height)',
  },
};

export default Layout;
