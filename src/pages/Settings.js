import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Key, Link2, CreditCard, Camera, Eye, EyeOff, Copy, CheckCircle, Plus, Shield, Zap, Crown, ArrowUpRight, Database, BarChart2, Settings as SettingsIcon, Globe, Bell, Lock, Palette, Edit2, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const pageV = { initial:{opacity:0,y:16}, animate:{opacity:1,y:0,transition:{duration:0.4}}, exit:{opacity:0,y:-10} };
const tabs = [
  {id:'profile',label:'Profile',icon:User},
  {id:'billing',label:'Billing',icon:CreditCard},
];

const Settings = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [activeTab,setActiveTab] = useState('profile');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showApiKey,setShowApiKey] = useState(false);
  const [showPBKey,setShowPBKey] = useState(false);
  const [copied,setCopied] = useState(false);
  const copyKey = (t) => { navigator.clipboard?.writeText(t); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const [toggles,setToggles] = useState({notifications:true,autoProcess:true,darkMode:false,twoFactor:false,analytics:true,marketing:false});
  const [profileForm, setProfileForm] = useState({ name: '', email: '', role: '', company: '', avatar_url: '' });
  const [profileStatus, setProfileStatus] = useState({ type: '', message: '' });
  const [keyForm, setKeyForm] = useState({ groq_key: '', gemini_key: '' });
  const [keyStatus, setKeyStatus] = useState({ type: '', message: '' });
  const toggleSwitch = k => {
    if (k === 'darkMode') {
      toggleDarkMode();
      setToggles(p => ({...p, darkMode: !p.darkMode}));
      return;
    }
    setToggles(p => ({...p,[k]:!p[k]}));
  };

  useEffect(() => {
    setToggles(p => ({ ...p, darkMode }));
  }, [darkMode]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('nexabi_token');
      if (!token) return;
      try {
        const response = await fetch(
          'https://nexabi-backend-production.up.railway.app/api/auth/me',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) {
          throw new Error('Failed to load profile');
        }
        const data = await response.json();
        setProfileForm({
          name: data?.name || '',
          email: data?.email || '',
          role: data?.role || '',
          company: data?.company || '',
          avatar_url: data?.avatar_url || ''
        });
      } catch (err) {
        setProfileStatus({ type: 'error', message: 'Unable to load profile data.' });
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSave = async () => {
    const token = localStorage.getItem('nexabi_token');
    if (!token) return;
    setProfileStatus({ type: '', message: '' });
    try {
      const response = await fetch(
        'https://nexabi-backend-production.up.railway.app/api/auth/update',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: profileForm.name,
            role: profileForm.role,
            company: profileForm.company
          })
        }
      );
      if (!response.ok) {
        throw new Error('Failed to save profile');
      }
      if (setUser) setUser(prev => ({ ...prev, name: profileForm.name, role: profileForm.role, company: profileForm.company }));
      setProfileStatus({ type: 'success', message: 'Profile saved!' });
      setIsEditMode(false);
    } catch (err) {
      setProfileStatus({ type: 'error', message: 'Failed to save profile.' });
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setProfileStatus({ type: 'error', message: 'Only JPG, PNG or GIF are allowed.' });
      return;
    }
    
    if (file.size > 15 * 1024 * 1024) {
      setProfileStatus({ type: 'error', message: 'File size must be under 15MB.' });
      return;
    }
    
    const token = localStorage.getItem('nexabi_token');
    if (!token) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('https://nexabi-backend-production.up.railway.app/api/auth/upload-avatar', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      setProfileForm(p => ({ ...p, avatar_url: data.avatar_url }));
      if (setUser) setUser(prev => ({ ...prev, avatar_url: data.avatar_url }));
      setProfileStatus({ type: 'success', message: 'Photo updated!' });
    } catch (err) {
      setProfileStatus({ type: 'error', message: 'Failed to upload photo.' });
    }
  };

  const handleKeysSave = async () => {
    const token = localStorage.getItem('nexabi_token');
    if (!token) return;
    setKeyStatus({ type: '', message: '' });
    try {
      const response = await fetch('https://nexabi-backend-production.up.railway.app/api/auth/update-keys', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          groq_key: keyForm.groq_key,
          gemini_key: keyForm.gemini_key
        })
      });
      if (!response.ok) {
        throw new Error('Failed to save keys');
      }
      setKeyStatus({ type: 'success', message: 'Saved!' });
    } catch (err) {
      setKeyStatus({ type: 'error', message: 'Failed to save API keys.' });
    }
  };

  const Toggle = ({checked,onChange}) => (
    <motion.div style={{...S.toggle,background:checked?'linear-gradient(135deg,#6C63FF,#3B82F6)':'var(--border)'}} onClick={onChange} whileTap={{scale:0.95}}>
      <motion.div style={S.toggleDot} animate={{x:checked?20:2}} transition={{type:'spring',stiffness:500,damping:30}}/>
    </motion.div>
  );

  return (
    <motion.div style={S.page} variants={pageV} initial="initial" animate="animate" exit="exit">
      <style>{`
        .settings-page { padding: 28px 32px; max-width: 900px; margin: 0 auto; }
        .tabs-row { display: flex; gap: 6px; margin-bottom: 28px; background: var(--card); padding: 6px; border-radius: 14px; box-shadow: var(--shadow-card); border: 1px solid var(--border); overflow-x: auto; white-space: nowrap; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        .int-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .usage-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; margin-top: 16px; }
        
        @media (max-width: 768px) {
          .settings-page { padding: 20px 16px; }
          .form-grid { grid-template-columns: 1fr; }
          .int-grid { grid-template-columns: 1fr; }
          .usage-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="settings-page">
        <div style={{marginBottom:'24px'}}><h1 style={S.title}>Settings</h1><p style={S.subtitle}>Manage your account, integrations, and preferences</p></div>

        <div className="tabs-row">
          {tabs.map(tab=>{const I=tab.icon;const a=activeTab===tab.id;return(
            <motion.button key={tab.id} style={{...S.tabBtn,...(a?S.tabBtnActive:{})}} onClick={()=>setActiveTab(tab.id)} whileHover={!a?{backgroundColor:'var(--hover-bg)'}:{}} whileTap={{scale:0.97}}>
              <I size={16}/>{tab.label}
            </motion.button>
          );})}
        </div>

        <AnimatePresence mode="wait">
          {activeTab==='profile'&&(
            <motion.div key="profile" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.3}}>
              <div style={S.card}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                  <h3 style={{...S.cardTitle, marginBottom: 0}}>Personal Information</h3>
                  {!isEditMode && (
                    <motion.button 
                      style={{display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', borderRadius:'10px', background:'rgba(108,99,255,0.1)', color:'var(--primary)', border:'none', fontSize:'13px', fontWeight:600, cursor:'pointer'}}
                      whileHover={{backgroundColor:'rgba(108,99,255,0.15)'}}
                      whileTap={{scale:0.97}}
                      onClick={() => setIsEditMode(true)}
                    >
                      <Edit2 size={14}/>Edit Profile
                    </motion.button>
                  )}
                </div>
                <div style={S.avatarSection}>
                  <div style={{...S.avatarLg, borderRadius: '50%', overflow: 'hidden'}}>
                    {profileForm.avatar_url ? (
                      <img src={`https://nexabi-backend-production.up.railway.app${profileForm.avatar_url}`} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    ) : (
                      <span style={S.avatarLgText}>{profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  {isEditMode ? (
                    <div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept="image/jpeg, image/png, image/gif" 
                        onChange={handlePhotoUpload} 
                      />
                      <motion.button 
                        style={S.avatarUpBtn} 
                        whileHover={{scale:1.03}} 
                        whileTap={{scale:0.97}}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera size={15}/>Change Photo
                      </motion.button>
                      <p style={{fontSize:'11px',color:'var(--text-tertiary)'}}>JPG, PNG or GIF. Max 15MB</p>
                    </div>
                  ) : (
                    <div>
                      <motion.button 
                        style={S.avatarUpBtn} 
                        whileHover={{scale:1.03}} 
                        whileTap={{scale:0.97}}
                        onClick={() => setShowPhotoModal(true)}
                      >
                        <Eye size={15}/>View Photo
                      </motion.button>
                    </div>
                  )}
                </div>
                <div className="form-grid">
                  <div style={S.formGroup}>
                    <label style={S.label}>Full Name</label>
                    {isEditMode ? (
                      <input type="text" value={profileForm.name} onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))} style={S.input}/>
                    ) : (
                      <div style={S.viewField}>{profileForm.name || '-'}</div>
                    )}
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.label}>Email Address</label>
                    {isEditMode ? (
                      <input type="email" value={profileForm.email} onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))} style={S.input}/>
                    ) : (
                      <div style={S.viewField}>{profileForm.email || '-'}</div>
                    )}
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.label}>Role</label>
                    {isEditMode ? (
                      <input type="text" value={profileForm.role} onChange={(e) => setProfileForm(p => ({ ...p, role: e.target.value }))} style={S.input}/>
                    ) : (
                      <div style={S.viewField}>{profileForm.role || '-'}</div>
                    )}
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.label}>Company</label>
                    {isEditMode ? (
                      <input type="text" value={profileForm.company} onChange={(e) => setProfileForm(p => ({ ...p, company: e.target.value }))} style={S.input}/>
                    ) : (
                      <div style={S.viewField}>{profileForm.company || '-'}</div>
                    )}
                  </div>
                </div>
                {profileStatus.message && (
                  <div style={{ fontSize: '12px', color: profileStatus.type === 'success' ? 'var(--success)' : 'var(--danger)', marginTop: '10px' }}>
                    {profileStatus.message}
                  </div>
                )}
                {isEditMode && (
                  <div style={S.formActions}>
                    <motion.button style={S.saveBtn} whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={handleProfileSave}>Save Changes</motion.button>
                    <button style={S.cancelBtn} onClick={() => { setIsEditMode(false); setProfileStatus({type:'', message:''}); }}>Cancel</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab==='billing'&&(
            <motion.div key="billing" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.3}}>
              <div style={S.planCard}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}><Crown size={20} color="#F59E0B"/><span style={{fontSize:'12px',fontWeight:700,color:'#F59E0B',letterSpacing:'0.08em',textTransform:'uppercase'}}>PRO PLAN</span></div>
                <h2 style={{fontSize:'36px',fontWeight:800,color:'var(--text-primary)',letterSpacing:'-0.03em'}}>$49<span style={{fontSize:'16px',fontWeight:500,color:'var(--text-tertiary)'}}>/month</span></h2>
                <p style={{fontSize:'14px',color:'var(--text-tertiary)',marginBottom:'20px'}}>Unlimited queries, 50GB storage, priority support</p>
                <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'24px'}}>
                  {['Unlimited AI Queries','50GB Document Storage','Priority Support','5 Database Connections','Power BI Integration','Team Sharing (up to 5)'].map(f=>(
                    <div key={f} style={{display:'flex',alignItems:'center',gap:'10px',fontSize:'14px',color:'var(--text-secondary)'}}><CheckCircle size={16} color="var(--success)"/>{f}</div>
                  ))}
                </div>
                <motion.button style={{background:'linear-gradient(135deg,#6C63FF,#3B82F6)',color:'#fff',border:'none',borderRadius:'10px',padding:'12px 24px',fontSize:'14px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'8px',boxShadow:'0 4px 16px rgba(108,99,255,0.3)'}} whileHover={{scale:1.03}} whileTap={{scale:0.97}}>
                  <Zap size={16}/>Upgrade to Enterprise<ArrowUpRight size={14}/>
                </motion.button>
              </div>
              <div style={S.card}>
                <h3 style={S.cardTitle}>Current Usage</h3>
                <div className="usage-grid">
                  {[
                    {label:'Queries Used',current:'18,420',max:'Unlimited',pct:100},
                    {label:'Storage Used',current:'32.4 GB',max:'50 GB',pct:65},
                    {label:'API Calls',current:'8,240',max:'10,000',pct:82},
                    {label:'Team Members',current:'3',max:'5',pct:60},
                  ].map((u,i)=>(
                    <motion.div key={u.label} style={{padding:'16px',background:'var(--input-bg)',borderRadius:'12px',border:'1px solid var(--border)'}} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'10px'}}>
                        <span style={{fontSize:'13px',fontWeight:600,color:'var(--text-secondary)'}}>{u.label}</span>
                        <span style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)'}}>{u.current} <span style={{fontWeight:400,color:'var(--text-tertiary)'}}>/ {u.max}</span></span>
                      </div>
                      <div style={{height:'6px',background:'var(--border)',borderRadius:'3px',overflow:'hidden'}}>
                        <motion.div style={{height:'100%',borderRadius:'3px',background:u.pct>80?'linear-gradient(135deg,#F59E0B,#EF4444)':'linear-gradient(135deg,#6C63FF,#3B82F6)'}} initial={{width:0}} animate={{width:`${Math.min(u.pct,100)}%`}} transition={{delay:0.3+i*0.1,duration:0.6}}/>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photo View Modal */}
        <AnimatePresence>
          {showPhotoModal && (
            <motion.div 
              style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              onClick={() => setShowPhotoModal(false)}
            >
              <motion.div 
                style={{position: 'relative', width: '90%', maxWidth: '500px', aspectRatio: '1/1', background: 'var(--card)', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}}
                initial={{scale: 0.9, y: 20}}
                animate={{scale: 1, y: 0}}
                exit={{scale: 0.9, y: 20}}
                onClick={e => e.stopPropagation()}
              >
                <button 
                  style={{position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10}}
                  onClick={() => setShowPhotoModal(false)}
                >
                  <X size={20} />
                </button>
                {profileForm.avatar_url ? (
                  <img src={`https://nexabi-backend-production.up.railway.app${profileForm.avatar_url}`} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                  <div style={{width: '100%', height: '100%', background: 'linear-gradient(135deg,#6C63FF,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '100px', fontWeight: 800}}>
                    {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const S = {
  page:{},
  title:{fontSize:'26px',fontWeight:700,color:'var(--text-primary)',letterSpacing:'-0.02em'},
  subtitle:{fontSize:'14px',color:'var(--text-secondary)',marginTop:'6px'},
  tabBtn:{display:'flex',alignItems:'center',gap:'8px',padding:'10px 20px',borderRadius:'10px',border:'none',background:'transparent',fontSize:'13px',fontWeight:500,color:'var(--text-secondary)',cursor:'pointer'},
  tabBtnActive:{background:'linear-gradient(135deg,#6C63FF,#3B82F6)',color:'#fff',boxShadow:'0 2px 10px rgba(108,99,255,0.3)'},
  card:{background:'var(--card)',borderRadius:'16px',padding:'28px',boxShadow:'var(--shadow-card)',border:'1px solid var(--border)',marginBottom:'20px'},
  cardTitle:{fontSize:'17px',fontWeight:700,color:'var(--text-primary)',marginBottom:'4px'},
  cardDesc:{fontSize:'13px',color:'var(--text-tertiary)',marginBottom:'20px'},
  avatarSection:{display:'flex',alignItems:'center',gap:'20px',marginTop:'20px',marginBottom:'28px'},
  avatarLg:{width:'72px',height:'72px',borderRadius:'18px',background:'linear-gradient(135deg,#6C63FF,#3B82F6)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(108,99,255,0.3)'},
  avatarLgText:{color:'#fff',fontSize:'24px',fontWeight:700},
  avatarUpBtn:{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'10px',padding:'8px 16px',fontSize:'13px',fontWeight:600,color:'var(--text-primary)',display:'flex',alignItems:'center',gap:'6px',cursor:'pointer',marginBottom:'6px'},
  formGroup:{display:'flex',flexDirection:'column',gap:'6px'},
  label:{fontSize:'13px',fontWeight:600,color:'var(--text-secondary)'},
  input:{padding:'11px 14px',borderRadius:'10px',border:'1px solid var(--border)',fontSize:'14px',color:'var(--text-primary)',background:'var(--input-bg)'},
  viewField:{padding:'11px 0',fontSize:'15px',color:'var(--text-primary)',fontWeight:500},
  formActions:{display:'flex',gap:'12px',marginTop:'24px'},
  saveBtn:{background:'linear-gradient(135deg,#6C63FF,#3B82F6)',color:'#fff',border:'none',borderRadius:'10px',padding:'11px 24px',fontSize:'14px',fontWeight:600,cursor:'pointer',boxShadow:'0 4px 12px rgba(108,99,255,0.25)'},
  cancelBtn:{background:'transparent',border:'1px solid var(--border)',borderRadius:'10px',padding:'11px 24px',fontSize:'14px',fontWeight:500,color:'var(--text-secondary)',cursor:'pointer'},
  apiKeyWrap:{display:'flex',alignItems:'center',gap:'10px',background:'var(--input-bg)',borderRadius:'10px',padding:'11px 14px',border:'1px solid var(--border)'},
  apiInput:{flex:1,background:'transparent',fontSize:'14px',color:'var(--text-primary)',fontFamily:'monospace', outline: 'none', border: 'none'},
  apiBtn:{width:'32px',height:'32px',borderRadius:'8px',border:'none',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-tertiary)'},
  toggleList:{display:'flex',flexDirection:'column',gap:'4px',marginTop:'16px'},
  toggleItem:{display:'flex',alignItems:'center',gap:'14px',padding:'14px 12px',borderRadius:'12px'},
  toggleIcon:{width:'38px',height:'38px',borderRadius:'10px',background:'rgba(108,99,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
  toggleLabel:{fontSize:'14px',fontWeight:600,color:'var(--text-primary)'},
  toggleDesc:{fontSize:'12px',color:'var(--text-tertiary)',marginTop:'2px'},
  toggle:{width:'44px',height:'24px',borderRadius:'12px',cursor:'pointer',position:'relative',flexShrink:0},
  toggleDot:{width:'20px',height:'20px',borderRadius:'50%',background:'#fff',position:'absolute',top:'2px',boxShadow:'0 1px 4px rgba(0,0,0,0.15)'},
  intCard:{background:'var(--card)',borderRadius:'16px',padding:'24px',boxShadow:'var(--shadow-card)',border:'1px solid var(--border)',transition:'all 0.25s ease',cursor:'pointer'},
  planCard:{background:'var(--card)',borderRadius:'20px',padding:'32px',border:'2px solid rgba(108,99,255,0.15)',boxShadow:'var(--shadow-card)',marginBottom:'20px',position:'relative',overflow:'hidden'},
};

export default Settings;
