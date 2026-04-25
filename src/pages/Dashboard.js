import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Database, FileText, Upload, PieChart,
  Clock, Activity, ArrowRight, Cpu, Calendar, FileJson, FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const pageV = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -10 }
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({ queries: 0, datasets: 0, documents: 0 });
  const [recentQueries, setRecentQueries] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('nexabi_token');
      if (!token) return;

      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        const [queriesRes, datasetsRes, docsRes, allQueriesRes] = await Promise.all([
          fetch('https://nexabi-backend-production.up.railway.app/api/queries/history?page=1&limit=5', { headers }),
          fetch('https://nexabi-backend-production.up.railway.app/api/files/datasets', { headers }),
          fetch('https://nexabi-backend-production.up.railway.app/api/files/documents', { headers }),
          fetch('https://nexabi-backend-production.up.railway.app/api/queries/history?limit=1000', { headers })
        ]);

        const queries = queriesRes.ok ? await queriesRes.json() : [];
        const datasets = datasetsRes.ok ? await datasetsRes.json() : [];
        const docs = docsRes.ok ? await docsRes.json() : [];
        const allQueries = allQueriesRes.ok ? await allQueriesRes.json() : [];

        setStats({
          queries: allQueries.length,
          datasets: datasets.length,
          documents: docs.length
        });
        
        setRecentQueries(queries.slice(0, 5));
        
        const combinedFiles = [
          ...datasets.map(d => ({ ...d, typeLabel: 'Dataset', icon: Database })),
          ...docs.map(d => ({ ...d, typeLabel: 'Document', icon: FileText }))
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        setRecentFiles(combinedFiles.slice(0, 6));

      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getFileIcon = (ext) => {
    if (ext === 'csv') return <FileSpreadsheet size={16} color="#10B981" />;
    if (ext === 'json') return <FileJson size={16} color="#F59E0B" />;
    return <FileText size={16} color="#3B82F6" />;
  };

  return (
    <motion.div style={S.page} variants={pageV} initial="initial" animate="animate" exit="exit">
      <style>{`
        .dash-container { padding: 32px; max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 32px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
        .actions-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .content-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .dash-container { padding: 20px 16px; }
          .stats-grid { grid-template-columns: 1fr; }
          .actions-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dash-container">
        {/* WELCOME BANNER */}
        <div style={S.banner}>
          <div>
            <h1 style={S.bannerTitle}>Welcome back, {user?.name || 'User'}!</h1>
            <p style={S.bannerDate}><Calendar size={14} /> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div style={S.insightBadge}>
            <Activity size={16} color="var(--primary)" />
            <span><strong>Tip:</strong> Use the Chart Builder to visually explore your latest datasets.</span>
          </div>
        </div>

        {/* TOP STATS ROW */}
        <div className="stats-grid">
          {[
            { label: 'Total Queries', value: stats.queries, icon: MessageSquare, color: '#6C63FF', bg: 'rgba(108,99,255,0.1)' },
            { label: 'Datasets Uploaded', value: stats.datasets, icon: Database, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
            { label: 'Documents', value: stats.documents, icon: FileText, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
            { label: 'AI Models Active', value: '2', icon: Cpu, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', sub: 'Groq + Gemini' }
          ].map((stat, i) => (
            <motion.div key={i} style={S.statCard} whileHover={{ y: -4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={S.statLabel}>{stat.label}</p>
                  <h3 style={S.statValue}>{isLoading ? '-' : stat.value}</h3>
                  {stat.sub && <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{stat.sub}</p>}
                </div>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <stat.icon size={20} color={stat.color} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="content-grid">
          {/* LEFT COL: QUICK ACTIONS & RECENT FILES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={S.card}>
              <h3 style={S.cardTitle}>Quick Actions</h3>
              <div className="actions-grid">
                {[
                  { title: 'Ask AI', desc: 'Query your data with natural language', icon: MessageSquare, color: '#6C63FF', path: '/query' },
                  { title: 'Upload Data', desc: 'Add new datasets or documents', icon: Upload, color: '#10B981', path: '/upload' },
                  { title: 'Build Chart', desc: 'Create AI-driven visual dashboards', icon: PieChart, color: '#F59E0B', path: '/chart-builder' },
                  { title: 'View Documents', desc: 'Manage your uploaded files', icon: FileText, color: '#3B82F6', path: '/documents' }
                ].map((action, i) => (
                  <motion.div key={i} style={S.actionBtn} onClick={() => navigate(action.path)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `var(--input-bg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', border: '1px solid var(--border)' }}>
                      <action.icon size={24} color={action.color} />
                    </div>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{action.title}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{action.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div style={S.card}>
              <h3 style={S.cardTitle}>Recent Files</h3>
              {isLoading ? (
                <div style={S.loadingState}>Loading files...</div>
              ) : recentFiles.length === 0 ? (
                <div style={S.emptyState}>No files uploaded yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recentFiles.map((file, i) => (
                    <div key={i} style={S.fileRow}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={S.fileIconWrap}>
                          {getFileIcon(file.file_type)}
                        </div>
                        <div>
                          <p style={S.fileName}>{file.name}</p>
                          <p style={S.fileMeta}>{file.typeLabel} • {file.file_size} • {formatDate(file.created_at)}</p>
                        </div>
                      </div>
                      <button style={S.analyzeBtn} onClick={() => navigate(file.typeLabel === 'Dataset' ? '/chart-builder' : '/query')}>
                        Analyze
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COL: RECENT ACTIVITY */}
          <div>
            <div style={{ ...S.card, height: '100%' }}>
              <h3 style={S.cardTitle}>Recent Activity</h3>
              {isLoading ? (
                <div style={S.loadingState}>Loading activity...</div>
              ) : recentQueries.length === 0 ? (
                <div style={S.emptyState}>No recent activity.</div>
              ) : (
                <div style={S.timeline}>
                  {recentQueries.map((q, i) => (
                    <div key={i} style={S.timelineItem} onClick={() => navigate('/query')}>
                      <div style={S.timelineDot} />
                      <div style={S.timelineContent}>
                        <p style={S.timelineText}>"{q.question.length > 50 ? q.question.substring(0, 50) + '...' : q.question}"</p>
                        <p style={S.timelineTime}><Clock size={12} /> {formatDate(q.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!isLoading && recentQueries.length > 0 && (
                <button style={S.viewAllBtn} onClick={() => navigate('/query')}>
                  View All History <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

const S = {
  page: { minHeight: 'calc(100vh - var(--topbar-height))' },
  banner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
  bannerTitle: { fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '6px' },
  bannerDate: { fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' },
  insightBadge: { background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--primary)' },
  
  statCard: { background: 'var(--card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' },
  statLabel: { fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' },
  statValue: { fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' },
  
  card: { background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--shadow-sm)' },
  cardTitle: { fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' },
  
  actionBtn: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'border-color 0.2s' },
  
  fileRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid transparent', transition: 'border 0.2s' },
  fileIconWrap: { width: '36px', height: '36px', borderRadius: '10px', background: 'var(--card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  fileName: { fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' },
  fileMeta: { fontSize: '12px', color: 'var(--text-tertiary)' },
  analyzeBtn: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' },
  
  timeline: { display: 'flex', flexDirection: 'column', gap: '0', marginLeft: '8px', borderLeft: '2px solid var(--border)', paddingLeft: '20px' },
  timelineItem: { position: 'relative', paddingBottom: '24px', cursor: 'pointer' },
  timelineDot: { position: 'absolute', left: '-25px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--card)', border: '2px solid var(--primary)' },
  timelineContent: { background: 'var(--input-bg)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', transition: 'border-color 0.2s' },
  timelineText: { fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '6px' },
  timelineTime: { fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' },
  viewAllBtn: { width: '100%', padding: '12px', background: 'transparent', border: 'none', borderTop: '1px solid var(--border)', color: 'var(--primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px' },
  
  emptyState: { padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '14px' },
  loadingState: { padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '14px' }
};

export default Dashboard;
