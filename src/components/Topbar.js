import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Sun, Moon, Menu, ChevronDown, User, Settings, Key, LogOut, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ onToggleSidebar, isMobile }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, text: 'Dataset "Sales Q4" processed successfully', time: '2 min ago', type: 'success' },
    { id: 2, text: 'New AI model update available', time: '1 hour ago', type: 'info' },
    { id: 3, text: 'API usage at 80% of limit', time: '3 hours ago', type: 'warning' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userName = user?.name || 'User';
  const userEmail = user?.email || 'user@example.com';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div style={{...styles.topbar, padding: isMobile ? '0 16px' : '0 28px'}}>
      <div style={styles.left}>
        <motion.button
          style={styles.menuBtn}
          onClick={onToggleSidebar}
          whileHover={{ backgroundColor: 'var(--hover-bg)' }}
          whileTap={{ scale: 0.93 }}
        >
          <Menu size={20} color="var(--text-secondary)" />
        </motion.button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <div style={styles.logoIconTop}>
            <Sparkles size={18} color="#fff" />
          </div>
          {!isMobile && (
            <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              Nexa<span style={{ fontWeight: 800, background: 'linear-gradient(135deg, #6C63FF, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BI</span>
            </div>
          )}
        </div>
      </div>

      <div style={styles.center}>
        <div style={{...styles.searchWrap, width: isMobile ? '100%' : '380px', maxWidth: '380px'}}>
          <Search size={18} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />
          <input type="text" placeholder={isMobile ? "Search..." : "Search or ask anything..."} style={styles.searchInput} />
          {!isMobile && <kbd style={styles.kbd}>⌘K</kbd>}
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

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                style={{...styles.notifDropdown, right: isMobile ? '-40px' : 0, width: isMobile ? '300px' : '340px'}}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
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
          </AnimatePresence>
        </div>

        {!isMobile && <div style={styles.divider} />}

        <div style={{ position: 'relative' }} ref={profileRef}>
          <motion.div 
            style={{...styles.userArea, padding: isMobile ? '4px' : '6px 12px 6px 6px'}} 
            whileHover={{ backgroundColor: 'var(--hover-bg)' }}
            onClick={() => setShowProfile(!showProfile)}
          >
            <div style={styles.avatar}>
              {user?.avatar_url ? (
                <img src={`https://nexabi-backend-production.up.railway.app${user.avatar_url}`} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px'}} />
              ) : (
                <span style={styles.avatarText}>{userInitial}</span>
              )}
            </div>
            {!isMobile && (
              <>
                <div style={styles.userInfo}>
                  <span style={styles.userName}>{userName}</span>
                  <span style={styles.userPlan}>Free Plan</span>
                </div>
                <ChevronDown size={16} color="var(--text-tertiary)" />
              </>
            )}
          </motion.div>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                style={{...styles.profileDropdown, right: isMobile ? '-10px' : 0}}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <div style={styles.profileHeader}>
                  <div style={{...styles.avatar, width: '48px', height: '48px', borderRadius: '14px', marginBottom: '12px'}}>
                    {user?.avatar_url ? (
                      <img src={`https://nexabi-backend-production.up.railway.app${user.avatar_url}`} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px'}} />
                    ) : (
                      <span style={{...styles.avatarText, fontSize: '18px'}}>{userInitial}</span>
                    )}
                  </div>
                  <h4 style={{fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px'}}>{userName}</h4>
                  <p style={{fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px'}}>{userEmail}</p>
                  <span style={{padding: '4px 10px', background: 'rgba(108,99,255,0.1)', color: 'var(--primary)', borderRadius: '6px', fontSize: '11px', fontWeight: 600}}>Free Plan</span>
                </div>
                
                <div style={styles.dropdownDivider} />
                
                <div style={styles.menuList}>
                  <button style={styles.menuItem} onClick={() => { setShowProfile(false); navigate('/settings'); }}>
                    <User size={16} color="var(--text-secondary)" /> Profile
                  </button>
                  <button style={styles.menuItem} onClick={() => { setShowProfile(false); navigate('/settings'); }}>
                    <Settings size={16} color="var(--text-secondary)" /> Settings
                  </button>
                  <button style={styles.menuItem} onClick={() => { setShowProfile(false); navigate('/settings'); }}>
                    <Key size={16} color="var(--text-secondary)" /> API Keys
                  </button>
                </div>
                
                <div style={styles.dropdownDivider} />
                
                <div style={{padding: '8px'}}>
                  <button style={styles.logoutBtn} onClick={handleLogout}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const styles = {
  topbar: {
    position: 'fixed', top: 0, right: 0, left: 0, width: '100%',
    height: 'var(--topbar-height)', background: 'var(--topbar-bg)',
    backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 28px', zIndex: 110, transition: 'background 0.3s ease',
  },
  left: { display: 'flex', alignItems: 'center', gap: '16px', flex: '0 0 auto' },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '1 1 auto', padding: '0 16px', minWidth: 0 },
  right: { display: 'flex', alignItems: 'center', gap: '8px', flex: '0 0 auto', justifyContent: 'flex-end' },
  menuBtn: {
    width: '38px', height: '38px', borderRadius: '10px', border: 'none',
    background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  logoIconTop: {
    width: '32px', height: '32px', borderRadius: '8px',
    background: 'linear-gradient(135deg, #6C63FF 0%, #3B82F6 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    boxShadow: '0 2px 8px rgba(108,99,255,0.3)',
  },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'var(--input-bg)', borderRadius: '12px', padding: '10px 16px',
    border: '1px solid var(--border)',
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
  profileDropdown: {
    position: 'absolute', top: '56px', right: 0, width: '240px',
    background: 'var(--card)', borderRadius: '16px',
    boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', overflow: 'hidden', zIndex: 200,
  },
  profileHeader: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px 16px',
  },
  dropdownDivider: {
    height: '1px', background: 'var(--border)', width: '100%',
  },
  menuList: {
    padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px',
  },
  menuItem: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
    width: '100%', border: 'none', background: 'transparent',
    fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500,
    borderRadius: '8px', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
    width: '100%', border: 'none', background: 'rgba(239, 68, 68, 0.08)',
    fontSize: '14px', color: '#EF4444', fontWeight: 600,
    borderRadius: '8px', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s',
  }
};

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  button[style*="menuItem"]:hover { background: var(--hover-bg); }
  button[style*="logoutBtn"]:hover { background: rgba(239, 68, 68, 0.15); }
`;
document.head.appendChild(styleSheet);

export default Topbar;
