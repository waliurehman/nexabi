import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Sun, Moon, Menu, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Topbar = ({ onToggleSidebar }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: 'Dataset "Sales Q4" processed successfully', time: '2 min ago', type: 'success' },
    { id: 2, text: 'New AI model update available', time: '1 hour ago', type: 'info' },
    { id: 3, text: 'API usage at 80% of limit', time: '3 hours ago', type: 'warning' },
  ];

  return (
    <div style={styles.topbar}>
      <div style={styles.left}>
        <motion.button
          style={styles.menuBtn}
          onClick={onToggleSidebar}
          whileHover={{ backgroundColor: 'var(--hover-bg)' }}
          whileTap={{ scale: 0.93 }}
        >
          <Menu size={20} color="var(--text-secondary)" />
        </motion.button>
        <div style={styles.searchWrap}>
          <Search size={18} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />
          <input type="text" placeholder="Search or ask anything..." style={styles.searchInput} />
          <kbd style={styles.kbd}>⌘K</kbd>
        </div>
      </div>

      <div style={styles.right}>
        <motion.button
          style={styles.iconBtn}
          onClick={toggleDarkMode}
          whileHover={{ backgroundColor: 'var(--hover-bg)' }}
          whileTap={{ scale: 0.9 }}
        >
          {darkMode ? <Sun size={19} color="#F59E0B" /> : <Moon size={19} color="var(--text-secondary)" />}
        </motion.button>

        <div style={{ position: 'relative' }}>
          <motion.button
            style={styles.iconBtn}
            onClick={() => setShowNotifications(!showNotifications)}
            whileHover={{ backgroundColor: 'var(--hover-bg)' }}
            whileTap={{ scale: 0.9 }}
          >
            <Bell size={19} color="var(--text-secondary)" />
            <span style={styles.notifDot} />
          </motion.button>

          {showNotifications && (
            <motion.div
              style={styles.notifDropdown}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.15 }}
            >
              <div style={styles.notifHeader}>
                <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Notifications</span>
                <span style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }}>Mark all read</span>
              </div>
              {notifications.map((n) => (
                <div key={n.id} style={styles.notifItem}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%', marginTop: '6px', flexShrink: 0,
                    background: n.type === 'success' ? 'var(--success)' : n.type === 'warning' ? 'var(--warning)' : 'var(--secondary)',
                  }} />
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.4 }}>{n.text}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{n.time}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        <div style={styles.divider} />

        <motion.div style={styles.userArea} whileHover={{ backgroundColor: 'var(--hover-bg)' }}>
          <div style={styles.avatar}><span style={styles.avatarText}>WU</span></div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>WUR</span>
            <span style={styles.userPlan}>Pro Plan</span>
          </div>
          <ChevronDown size={16} color="var(--text-tertiary)" />
        </motion.div>
      </div>
    </div>
  );
};

const styles = {
  topbar: {
    position: 'fixed', top: 0, right: 0, left: 'var(--sidebar-width)',
    height: 'var(--topbar-height)', background: 'var(--topbar-bg)',
    backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 28px', zIndex: 90, transition: 'left 0.3s ease, background 0.3s ease',
  },
  left: { display: 'flex', alignItems: 'center', gap: '16px' },
  menuBtn: {
    width: '38px', height: '38px', borderRadius: '10px', border: 'none',
    background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'var(--input-bg)', borderRadius: '12px', padding: '10px 16px',
    width: '380px', border: '1px solid var(--border)',
  },
  searchInput: { flex: 1, background: 'transparent', fontSize: '14px', color: 'var(--text-primary)' },
  kbd: {
    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '6px',
    padding: '2px 8px', fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'monospace', fontWeight: 500,
  },
  right: { display: 'flex', alignItems: 'center', gap: '8px' },
  iconBtn: {
    width: '40px', height: '40px', borderRadius: '10px', border: 'none',
    background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', position: 'relative',
  },
  notifDot: {
    position: 'absolute', top: '9px', right: '10px', width: '8px', height: '8px',
    borderRadius: '50%', background: 'var(--danger)', border: '2px solid var(--card)',
  },
  notifDropdown: {
    position: 'absolute', top: '48px', right: 0, width: '340px',
    background: 'var(--card)', borderRadius: '16px',
    boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', overflow: 'hidden', zIndex: 200,
  },
  notifHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 18px', borderBottom: '1px solid var(--border)',
  },
  notifItem: {
    display: 'flex', gap: '12px', padding: '14px 18px',
    borderBottom: '1px solid var(--border)', cursor: 'pointer', alignItems: 'flex-start',
  },
  divider: { width: '1px', height: '32px', background: 'var(--border)', margin: '0 8px' },
  userArea: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '6px 12px 6px 6px', borderRadius: '12px', cursor: 'pointer',
  },
  avatar: {
    width: '36px', height: '36px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #6C63FF 0%, #3B82F6 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(108,99,255,0.25)',
  },
  avatarText: { color: '#fff', fontSize: '13px', fontWeight: 700 },
  userInfo: { display: 'flex', flexDirection: 'column' },
  userName: { fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 },
  userPlan: { fontSize: '11px', color: 'var(--primary)', fontWeight: 500 },
};

export default Topbar;
