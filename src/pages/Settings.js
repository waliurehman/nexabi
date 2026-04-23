import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Key, Link2, CreditCard, Camera, Eye, EyeOff, Copy, CheckCircle, Plus, Shield, Zap, Crown, ArrowUpRight, Database, BarChart2, Settings as SettingsIcon, Globe, Bell, Lock, Palette } from 'lucide-react';
import API_URL from '../api/config';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const pageV = { initial:{opacity:0,y:16}, animate:{opacity:1,y:0,transition:{duration:0.4}}, exit:{opacity:0,y:-10} };
const tabs = [
  {id:'profile',label:'Profile',icon:User},{id:'api-keys',label:'API Keys',icon:Key},
  {id:'integrations',label:'Integrations',icon:Link2},{id:'billing',label:'Billing',icon:CreditCard},
];

const Settings = () => {
  const { token } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [activeTab,setActiveTab] = useState('profile');
  const [showApiKey,setShowApiKey] = useState(false);
  const [showPBKey,setShowPBKey] = useState(false);
  const [copied,setCopied] = useState(false);
  const copyKey = (t) => { navigator.clipboard?.writeText(t); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const [toggles,setToggles] = useState({notifications:true,autoProcess:true,darkMode:false,twoFactor:false,analytics:true,marketing:false});
  const [profileForm, setProfileForm] = useState({ name: '', email: '', role: '', company: '' });
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
      if (!token) return;
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Failed to load profile');
        }
        const data = await response.json();
        setProfileForm({
          name: data?.name || '',
          email: data?.email || '',
          role: data?.role || '',
          company: data?.company || ''
        });
      } catch (err) {
        setProfileStatus({ type: 'error', message: 'Unable to load profile data.' });
      }
    };
    fetchProfile();
  }, [token]);

  const handleProfileSave = async () => {
    if (!token) return;
    setProfileStatus({ type: '', message: '' });
    try {
      const response = await fetch(`${API_URL}/auth/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileForm.name,
          email: profileForm.email,
          role: profileForm.role,
          company: profileForm.company
        })
      });
      if (!response.ok) {
        throw new Error('Failed to save profile');
      }
      setProfileStatus({ type: 'success', message: 'Profile updated successfully.' });
    } catch (err) {
      setProfileStatus({ type: 'error', message: 'Failed to update profile.' });
    }
  };

  const handleKeysSave = async () => {
    if (!token) return;
    setKeyStatus({ type: '', message: '' });
    try {
      const response = await fetch(`${API_URL}/auth/update-keys`, {
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
                <h3 style={S.cardTitle}>Personal Information</h3>
                <div style={S.avatarSection}>
                  <div style={S.avatarLg}><span style={S.avatarLgText}>WU</span></div>
                  <div>
                    <motion.button style={S.avatarUpBtn} whileHover={{scale:1.03}} whileTap={{scale:0.97}}><Camera size={15}/>Change Photo</motion.button>
                    <p style={{fontSize:'11px',color:'var(--text-tertiary)'}}>JPG, PNG or GIF. Max 2MB</p>
                  </div>
                </div>
                <div className="form-grid">
                  <div style={S.formGroup}><label style={S.label}>Full Name</label><input type="text" value={profileForm.name} onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))} style={S.input}/></div>
                  <div style={S.formGroup}><label style={S.label}>Email Address</label><input type="email" value={profileForm.email} onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))} style={S.input}/></div>
                  <div style={S.formGroup}><label style={S.label}>Role</label><input type="text" value={profileForm.role} onChange={(e) => setProfileForm(p => ({ ...p, role: e.target.value }))} style={S.input}/></div>
                  <div style={S.formGroup}><label style={S.label}>Company</label><input type="text" value={profileForm.company} onChange={(e) => setProfileForm(p => ({ ...p, company: e.target.value }))} style={S.input}/></div>
                </div>
                {profileStatus.message && (
                  <div style={{ fontSize: '12px', color: profileStatus.type === 'success' ? 'var(--success)' : 'var(--danger)', marginTop: '10px' }}>
                    {profileStatus.message}
                  </div>
                )}
                <div style={S.formActions}>
                  <motion.button style={S.saveBtn} whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={handleProfileSave}>Save Changes</motion.button>
                  <button style={S.cancelBtn}>Cancel</button>
                </div>
              </div>
              <div style={S.card}>
                <h3 style={S.cardTitle}>Preferences</h3>
                <div style={S.toggleList}>
                  {[
                    {key:'notifications',label:'Email Notifications',desc:'Receive email alerts for important updates',icon:Bell},
                    {key:'autoProcess',label:'Auto-process Uploads',desc:'Automatically process documents on upload',icon:Zap},
                    {key:'darkMode',label:'Dark Mode',desc:'Enable dark theme across the application',icon:Palette},
                    {key:'twoFactor',label:'Two-Factor Authentication',desc:'Add extra security to your account',icon:Lock},
                  ].map(item=>{const I=item.icon;return(
                    <div key={item.key} style={S.toggleItem}>
                      <div style={S.toggleIcon}><I size={18} color="var(--primary)"/></div>
                      <div style={{flex:1}}><p style={S.toggleLabel}>{item.label}</p><p style={S.toggleDesc}>{item.desc}</p></div>
                      <Toggle checked={toggles[item.key]} onChange={()=>toggleSwitch(item.key)}/>
                    </div>
                  );})}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab==='api-keys'&&(
            <motion.div key="api-keys" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.3}}>
              <div style={S.card}>
                <h3 style={S.cardTitle}>OpenAI API Key</h3>
                <p style={S.cardDesc}>Required for AI-powered queries and document analysis</p>
                <div style={S.apiKeyWrap}>
                  <Key size={16} color="var(--text-tertiary)"/>
                  <input type={showApiKey?'text':'password'} defaultValue="sk-proj-abc123def456ghi789jkl012mno345pqr678" style={S.apiInput}/>
                  <motion.button style={S.apiBtn} onClick={()=>setShowApiKey(!showApiKey)} whileTap={{scale:0.9}}>
                    {showApiKey?<EyeOff size={16}/>:<Eye size={16}/>}
                  </motion.button>
                  <motion.button style={S.apiBtn} onClick={()=>copyKey('sk-proj-abc123...')} whileTap={{scale:0.9}}>
                    {copied?<CheckCircle size={16} color="var(--success)"/>:<Copy size={16}/>}
                  </motion.button>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'12px',color:'var(--text-tertiary)',marginTop:'12px'}}><Shield size={14} color="var(--success)"/>Your API key is encrypted and stored securely</div>
              </div>
              <div style={S.card}>
                <h3 style={S.cardTitle}>Power BI Credentials</h3>
                <p style={S.cardDesc}>Connect your Power BI workspace to import reports</p>
                <div className="form-grid">
                  <div style={S.formGroup}><label style={S.label}>Client ID</label><input type="text" placeholder="Enter Power BI Client ID" style={S.input}/></div>
                  <div style={S.formGroup}><label style={S.label}>Client Secret</label>
                    <div style={S.apiKeyWrap}><input type={showPBKey?'text':'password'} placeholder="Enter Client Secret" style={{...S.apiInput,padding:0}}/><motion.button style={S.apiBtn} onClick={()=>setShowPBKey(!showPBKey)} whileTap={{scale:0.9}}>{showPBKey?<EyeOff size={16}/>:<Eye size={16}/>}</motion.button></div>
                  </div>
                  <div style={S.formGroup}><label style={S.label}>Tenant ID</label><input type="text" placeholder="Enter Tenant ID" style={S.input}/></div>
                  <div style={S.formGroup}><label style={S.label}>Workspace ID</label><input type="text" placeholder="Enter Workspace ID" style={S.input}/></div>
                </div>
                <div style={S.formActions}>
                  <motion.button style={S.saveBtn} whileHover={{scale:1.03}} whileTap={{scale:0.97}}>Save Credentials</motion.button>
                  <button style={S.cancelBtn}>Test Connection</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab==='integrations'&&(
            <motion.div key="integrations" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.3}}>
              <div className="int-grid">
                <h3 style={S.cardTitle}>Groq API Key</h3>
                <p style={S.cardDesc}>Required for AI-powered queries and document analysis</p>
                <div style={S.apiKeyWrap}>
                  <Key size={16} color="var(--text-tertiary)"/>
                  <input type={showApiKey?'text':'password'} value={keyForm.groq_key} onChange={(e) => setKeyForm(p => ({ ...p, groq_key: e.target.value }))} style={S.apiInput}/>
                  <motion.button style={S.apiBtn} onClick={()=>setShowApiKey(!showApiKey)} whileTap={{scale:0.9}}>
                    {showApiKey?<EyeOff size={16}/>:<Eye size={16}/>}
                  </motion.button>
                  <motion.button style={S.apiBtn} onClick={()=>copyKey(keyForm.groq_key)} whileTap={{scale:0.9}}>
                    {copied?<CheckCircle size={16} color="var(--success)"/>:<Copy size={16}/>}
                  </motion.button>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'12px',color:'var(--text-tertiary)',marginTop:'12px'}}><Shield size={14} color="var(--success)"/>Your API key is encrypted and stored securely</div>
                    </div>
                    <h4 style={{fontSize:'16px',fontWeight:700,color:'var(--text-primary)',marginBottom:'4px'}}>{int.name}</h4>
                <h3 style={S.cardTitle}>Gemini API Key</h3>
                <p style={S.cardDesc}>Optional backup model for AI responses</p>
                      background:c?'var(--input-bg)':'linear-gradient(135deg,#6C63FF,#3B82F6)',color:c?'var(--text-secondary)':'#fff',boxShadow:c?'none':'0 4px 12px rgba(108,99,255,0.25)'}} whileHover={{scale:1.02}}>
                  <div style={S.formGroup}><label style={S.label}>Gemini API Key</label>
                    <div style={S.apiKeyWrap}><input type={showPBKey?'text':'password'} value={keyForm.gemini_key} onChange={(e) => setKeyForm(p => ({ ...p, gemini_key: e.target.value }))} style={{...S.apiInput,padding:0}}/><motion.button style={S.apiBtn} onClick={()=>setShowPBKey(!showPBKey)} whileTap={{scale:0.9}}>{showPBKey?<EyeOff size={16}/>:<Eye size={16}/>}</motion.button></div>
                  </div>
                <h3 style={S.cardTitle}>Feature Toggles</h3>
                {keyStatus.message && (
                  <div style={{ fontSize: '12px', color: keyStatus.type === 'success' ? 'var(--success)' : 'var(--danger)', marginTop: '10px' }}>
                    {keyStatus.message}
                  </div>
                )}
                <div style={S.toggleList}>
                  <motion.button style={S.saveBtn} whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={handleKeysSave}>Save Credentials</motion.button>
                  <button style={S.cancelBtn}>Test Connection</button>
                      <div style={{flex:1}}><p style={S.toggleLabel}>{item.label}</p><p style={S.toggleDesc}>{item.desc}</p></div>
                      <Toggle checked={toggles[item.key]} onChange={()=>toggleSwitch(item.key)}/>
                    </div>
                  ))}
                </div>
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
