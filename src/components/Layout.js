import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div style={styles.layout}>
      <Sidebar collapsed={sidebarCollapsed} />
      <div style={{
        ...styles.mainArea,
        marginLeft: sidebarCollapsed ? '80px' : 'var(--sidebar-width)',
      }}>
        <Topbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
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
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    transition: 'margin-left 0.3s ease',
    minHeight: '100vh',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    paddingTop: 'var(--topbar-height)',
  },
};

export default Layout;
