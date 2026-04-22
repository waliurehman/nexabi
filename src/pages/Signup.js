import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const success = await signup(name, email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Signup failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.container}>
      <div style={S.bgGlow1} />
      <div style={S.bgGlow2} />
      
      <motion.div style={S.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={S.header}>
          <div style={S.logoBox}>
            <div style={S.logoIcon} />
          </div>
          <h2 style={S.title}>Create an account</h2>
          <p style={S.subtitle}>Join NexaBI and start building</p>
        </div>

        {error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={S.errorMsg}>{error}</motion.div>}

        <form onSubmit={handleSubmit} style={S.form}>
          <div style={S.inputGroup}>
            <label style={S.label}>Full Name</label>
            <div style={S.inputWrapper}>
              <User size={18} color="var(--text-tertiary)" style={S.inputIcon} />
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Jane Doe" style={S.input} />
            </div>
          </div>

          <div style={S.inputGroup}>
            <label style={S.label}>Email Address</label>
            <div style={S.inputWrapper}>
              <Mail size={18} color="var(--text-tertiary)" style={S.inputIcon} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" style={S.input} />
            </div>
          </div>

          <div style={S.inputGroup}>
            <label style={S.label}>Password</label>
            <div style={S.inputWrapper}>
              <Lock size={18} color="var(--text-tertiary)" style={S.inputIcon} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={S.input} />
            </div>
          </div>

          <motion.button type="submit" disabled={loading} style={S.submitBtn} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {loading ? <Loader2 size={20} style={S.spinner} /> : <>Create Account <ArrowRight size={18} /></>}
          </motion.button>
        </form>

        <p style={S.footerText}>
          Already have an account? <Link to="/login" style={S.loginLink}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

const S = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', position: 'relative', overflow: 'hidden' },
  bgGlow1: { position: 'absolute', width: '500px', height: '500px', background: 'var(--secondary)', filter: 'blur(150px)', opacity: 0.15, top: '-10%', right: '-10%', borderRadius: '50%' },
  bgGlow2: { position: 'absolute', width: '400px', height: '400px', background: 'var(--primary)', filter: 'blur(120px)', opacity: 0.15, bottom: '-5%', left: '-5%', borderRadius: '50%' },
  card: { background: 'var(--card)', padding: '48px', borderRadius: '24px', width: '100%', maxWidth: '440px', zIndex: 10, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' },
  header: { textAlign: 'center', marginBottom: '32px' },
  logoBox: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '16px', background: 'var(--hover-bg)', marginBottom: '24px' },
  logoIcon: { width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' },
  title: { fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' },
  subtitle: { fontSize: '15px', color: 'var(--text-secondary)' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '16px' },
  input: { width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border)', fontSize: '15px', color: 'var(--text-primary)', transition: 'all 0.2s', outline: 'none' },
  submitBtn: { width: '100%', padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, #6C63FF, #3B82F6)', color: '#fff', fontSize: '16px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px', boxShadow: '0 4px 16px rgba(108,99,255,0.25)' },
  spinner: { animation: 'spin 1s linear infinite' },
  footerText: { textAlign: 'center', marginTop: '32px', fontSize: '14px', color: 'var(--text-secondary)' },
  loginLink: { color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' },
  errorMsg: { padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', borderRadius: '10px', fontSize: '14px', fontWeight: 500, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }
};

export default Signup;
