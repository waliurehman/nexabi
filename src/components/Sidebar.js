import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, BarChart2, MessageSquare, Upload,
  FileText, Settings, Plus, Sparkles, Zap, ArrowUpRight,
  PieChart
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/query', label: 'AI Query', icon: MessageSquare },
  { path: '/chart-builder', label: 'Chart Builder', icon: PieChart },
  { path: '/upload', label: 'Upload Data', icon: Upload },
  { path: '/documents', label: 'Documents', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ collapsed }) => {
  const location = useLocation();

  return (
    <motion.aside
      style={{
        ...styles.sidebar,
        width: collapsed ? '80px' : 'var(--sidebar-width)',
      }}
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div style={styles.logoArea}>
        <div style={styles.logoIcon}>
          <Sparkles size={22} color="#fff" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span style={styles.logoText}>Nexa</span>
            <span style={styles.logoAI}>BI</span>
          </motion.div>
        )}
      </div>

      {!collapsed ? (
        <motion.button
          style={styles.newBtn}
          whileHover={{ scale: 1.02, boxShadow: '0 6px 25px rgba(108,99,255,0.35)' }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={18} />
          New Analysis
        </motion.button>
      ) : (
        <motion.button
          style={styles.newBtnSmall}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
        </motion.button>
      )}

      <nav style={styles.nav}>
        <div style={styles.menuLabel}>{!collapsed && 'MENU'}</div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
              <motion.div
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '12px' : '11px 16px',
                }}
                whileHover={{
                  backgroundColor: isActive ? undefined : 'var(--hover-bg)',
                  x: isActive ? 0 : 2,
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={20} style={{ color: isActive ? '#fff' : 'var(--text-secondary)', flexShrink: 0 }} />
                {!collapsed && (
                  <span style={{
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                  }}>
                    {item.label}
                  </span>
                )}
                {isActive && !collapsed && <div style={styles.activeDot} />}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {!collapsed && (
        <motion.div
          style={styles.upgradeCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div style={styles.upgradeIconWrap}><Zap size={20} color="#fff" /></div>
          <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>Upgrade to Premium!</h4>
          <p style={{ fontSize: '12px', opacity: 0.85, lineHeight: 1.5, marginBottom: '14px' }}>
            Unlock unlimited queries and advanced analytics.
          </p>
          <motion.button
            style={styles.upgradeBtn}
            whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.3)' }}
            whileTap={{ scale: 0.97 }}
          >
            Upgrade Now <ArrowUpRight size={14} />
          </motion.button>
        </motion.div>
      )}
    </motion.aside>
  );
};

const styles = {
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    background: 'var(--sidebar-bg)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    overflowX: 'hidden',
    overflowY: 'auto',
    transition: 'background 0.3s ease',
  },
  logoArea: { display: 'flex', alignItems: 'center', gap: '12px', padding: '24px 20px 20px' },
  logoIcon: {
    width: '40px', height: '40px', borderRadius: '12px',
    background: 'linear-gradient(135deg, #6C63FF 0%, #3B82F6 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    boxShadow: '0 4px 12px rgba(108,99,255,0.3)',
  },
  logoText: { fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em' },
  logoAI: {
    fontSize: '20px', fontWeight: 800, marginLeft: '4px',
    background: 'linear-gradient(135deg, #6C63FF, #3B82F6)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  newBtn: {
    margin: '4px 20px 8px', padding: '12px 20px',
    background: 'linear-gradient(135deg, #6C63FF 0%, #3B82F6 100%)',
    color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(108,99,255,0.3)', justifyContent: 'center',
  },
  newBtnSmall: {
    margin: '4px auto 8px', width: '44px', height: '44px',
    background: 'linear-gradient(135deg, #6C63FF 0%, #3B82F6 100%)',
    color: '#fff', border: 'none', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(108,99,255,0.3)',
  },
  nav: { flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '2px' },
  menuLabel: {
    fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)',
    letterSpacing: '0.08em', padding: '8px 8px 12px', textTransform: 'uppercase',
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    borderRadius: '10px', cursor: 'pointer', position: 'relative',
  },
  navItemActive: {
    background: 'linear-gradient(135deg, #6C63FF 0%, #3B82F6 100%)',
    boxShadow: '0 4px 16px rgba(108,99,255,0.3)',
  },
  activeDot: {
    position: 'absolute', right: '12px', width: '6px', height: '6px',
    borderRadius: '50%', background: 'rgba(255,255,255,0.7)',
  },
  upgradeCard: {
    margin: '12px 16px 20px', padding: '20px', borderRadius: '16px',
    background: 'linear-gradient(135deg, #6C63FF 0%, #A855F7 50%, #3B82F6 100%)',
    color: '#fff', overflow: 'hidden',
  },
  upgradeIconWrap: {
    width: '36px', height: '36px', borderRadius: '10px',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
  },
  upgradeBtn: {
    background: 'rgba(255,255,255,0.2)', color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px',
    padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '6px',
  },
};

export default Sidebar;
