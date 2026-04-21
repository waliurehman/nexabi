import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import {
  MessageSquare, Database, FileText, DollarSign,
  TrendingUp, ArrowUpRight, Zap, CheckCircle,
  AlertTriangle, BarChart2,
} from 'lucide-react';

const pageV = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};
const cardV = {
  initial: { opacity: 0, y: 20, scale: 0.97 },
  animate: (i) => ({ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const chartData = [
  { time: '00:00', queries: 120, documents: 45 },
  { time: '03:00', queries: 80, documents: 30 },
  { time: '06:00', queries: 150, documents: 55 },
  { time: '09:00', queries: 280, documents: 120 },
  { time: '12:00', queries: 420, documents: 180 },
  { time: '15:00', queries: 380, documents: 160 },
  { time: '18:00', queries: 350, documents: 140 },
  { time: '21:00', queries: 200, documents: 80 },
];
const miniBarData = [{ v: 30 }, { v: 55 }, { v: 40 }, { v: 70 }, { v: 60 }, { v: 85 }, { v: 75 }];

const activityItems = [
  { icon: CheckCircle, color: '#10B981', title: 'Synapse-4 Optimized', desc: 'Refined weights for latent space mapping in Project Orion.', time: '3m ago' },
  { icon: Zap, color: '#6C63FF', title: 'New Deployment', desc: 'Edge Node Cluster "Zephyr" is now operational in EU-West.', time: '15m ago' },
  { icon: Database, color: '#3B82F6', title: 'Batch Processing', desc: 'Successfully processed 1.2M records for sentiment analysis.', time: '1h ago' },
  { icon: AlertTriangle, color: '#EF4444', title: 'Gateway Timeout', desc: 'API Node-04 experienced latency issues. Auto-rerouted.', time: '3h ago' },
];

const stats = [
  { title: 'TOTAL QUERIES', value: '24,847', change: '+12%', up: true, icon: MessageSquare,
    iconBg: 'linear-gradient(135deg, #6C63FF 0%, #8B83FF 100%)',
    bars: ['#c4b5fd','#a78bfa','#8b5cf6','#7c3aed','#6d28d9','#5b21b6','#6C63FF'] },
  { title: 'TOKEN USAGE', value: '12.8M', change: '+8.2%', up: true, icon: Database,
    iconBg: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
    bars: ['#93c5fd','#60a5fa','#3b82f6','#2563eb','#1d4ed8','#60a5fa','#3B82F6'] },
  { title: 'PROJECT COST', value: '$2,450.00', change: '-$142', up: false, icon: DollarSign,
    iconBg: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    bars: ['#6ee7b7','#34d399','#10b981','#059669','#047857','#34d399','#10B981'] },
  { title: 'DOCUMENTS', value: '1,284', change: '+24', up: true, icon: FileText,
    iconBg: 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
    bars: ['#67e8f9','#22d3ee','#06b6d4','#0891b2','#0e7490','#22d3ee','#06B6D4'] },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div style={{ background:'var(--tooltip-bg)', borderRadius:'12px', border:'1px solid var(--tooltip-border)', boxShadow:'var(--shadow-md)', padding:'12px 16px' }}>
      <p style={{ fontSize:'12px', fontWeight:600, color:'var(--text-primary)', marginBottom:'4px' }}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{ fontSize:'12px', color:p.color }}>{p.name}: <b>{p.value}</b></p>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const [timeFilter, setTimeFilter] = useState('24H');

  return (
    <motion.div style={S.page} variants={pageV} initial="initial" animate="animate" exit="exit">
      <div style={S.header}>
        <h1 style={S.title}>Systems Overview</h1>
        <p style={S.subtitle}>
          Neural network throughput is currently operating at{' '}
          <span style={{ color:'var(--success)', fontWeight:600 }}>98.4% efficiency</span>. All clusters are stable.
        </p>
      </div>

      <div style={S.statsGrid}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.title} style={S.statCard} variants={cardV} initial="initial" animate="animate" custom={i}
              whileHover={{ y:-3, boxShadow:'var(--shadow-md)' }}>
              <div style={S.statTop}>
                <div>
                  <p style={S.statLabel}>{s.title}</p>
                  <h3 style={S.statValue}>{s.value}</h3>
                </div>
                <div style={{ ...S.statIcon, background: s.iconBg }}><Icon size={20} color="#fff" /></div>
              </div>
              <span style={{
                display:'inline-flex', alignItems:'center', gap:'4px', fontSize:'12px', fontWeight:600,
                padding:'3px 8px', borderRadius:'6px', marginTop:'6px', marginBottom:'8px',
                color: s.up ? 'var(--success)' : 'var(--danger)',
                background: s.up ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              }}>
                {s.up && <TrendingUp size={12} />}{s.change}
              </span>
              <div style={{ marginLeft:'-8px', marginRight:'-8px' }}>
                <ResponsiveContainer width="100%" height={50}>
                  <BarChart data={miniBarData} barCategoryGap="20%">
                    <Bar dataKey="v" radius={[3,3,0,0]}>
                      {miniBarData.map((_, idx) => <rect key={idx} fill={s.bars[idx]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div style={S.mainGrid}>
        <motion.div style={S.card} variants={cardV} initial="initial" animate="animate" custom={4}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <h3 style={S.cardTitle}>Intelligence Growth</h3>
              <p style={{ fontSize:'13px', color:'var(--text-tertiary)' }}>Neural processing speed across global nodes</p>
            </div>
            <div style={S.timeFilters}>
              {['9H','24H','7D'].map(f => (
                <button key={f} onClick={() => setTimeFilter(f)} style={{
                  ...S.timeBtn, ...(timeFilter === f ? S.timeBtnActive : {}),
                }}>{f}</button>
              ))}
            </div>
          </div>
          <div style={{ height:'300px', marginTop:'16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="qG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#6C63FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill:'var(--chart-text)', fontSize:12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill:'var(--chart-text)', fontSize:12 }} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="queries" stroke="#6C63FF" strokeWidth={2.5} fill="url(#qG)" dot={false}
                  activeDot={{ r:6, fill:'#6C63FF', stroke:'var(--card)', strokeWidth:2 }} name="Queries" />
                <Line type="monotone" dataKey="documents" stroke="#06B6D4" strokeWidth={2} strokeDasharray="6 4" dot={false}
                  activeDot={{ r:5, fill:'#06B6D4', stroke:'var(--card)', strokeWidth:2 }} name="Documents" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div style={S.card} variants={cardV} initial="initial" animate="animate" custom={5}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
            <h3 style={S.cardTitle}>Neural Activity</h3>
            <button style={{ background:'none', border:'none', color:'var(--text-tertiary)', fontSize:'18px', cursor:'pointer' }}>•••</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'4px', flex:1 }}>
            {activityItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} style={S.activityItem}
                  initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.4+i*0.1 }}
                  whileHover={{ backgroundColor:'var(--hover-bg)' }}>
                  <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:`${item.color}15`,
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon size={16} color={item.color} />
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:'13px', fontWeight:600, color:'var(--text-primary)', marginBottom:'3px' }}>{item.title}</p>
                    <p style={{ fontSize:'12px', color:'var(--text-tertiary)', lineHeight:1.4 }}>{item.desc}</p>
                  </div>
                  <span style={{ fontSize:'11px', color:'var(--text-tertiary)', whiteSpace:'nowrap' }}>{item.time}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <motion.div style={{ ...S.card, display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}
        variants={cardV} initial="initial" animate="animate" custom={6}
        whileHover={{ boxShadow:'0 12px 40px rgba(108,99,255,0.15)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'18px' }}>
          <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:'linear-gradient(135deg,#6C63FF,#3B82F6)',
            display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(108,99,255,0.3)' }}>
            <Zap size={24} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize:'16px', fontWeight:700, color:'var(--text-primary)' }}>Instant Model Launch</h3>
            <p style={{ fontSize:'13px', color:'var(--text-tertiary)', marginTop:'2px' }}>Initialize a pre-trained instance in 4.2 seconds</p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <div style={{ display:'flex', gap:'8px' }}>
            {['GPT','SQL'].map(t => (
              <span key={t} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 12px', borderRadius:'8px',
                fontSize:'12px', fontWeight:600, background:'var(--input-bg)', color:'var(--text-secondary)', border:'1px solid var(--border)' }}>
                {t === 'GPT' ? <BarChart2 size={14} /> : <Database size={14} />} {t}
              </span>
            ))}
          </div>
          <motion.button style={S.ctaBtn} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
            Launch Dashboard <ArrowUpRight size={16} />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const S = {
  page: { padding:'28px 32px', maxWidth:'1400px' },
  header: { marginBottom:'28px' },
  title: { fontSize:'26px', fontWeight:700, color:'var(--text-primary)', letterSpacing:'-0.02em' },
  subtitle: { fontSize:'14px', color:'var(--text-secondary)', marginTop:'6px', lineHeight:1.5 },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'20px', marginBottom:'24px' },
  statCard: {
    background:'var(--card)', borderRadius:'16px', padding:'22px',
    boxShadow:'var(--shadow-card)', border:'1px solid var(--border)',
    cursor:'pointer', transition:'all 0.25s ease',
  },
  statTop: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'4px' },
  statLabel: { fontSize:'11px', fontWeight:600, color:'var(--text-tertiary)', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:'8px' },
  statValue: { fontSize:'28px', fontWeight:700, color:'var(--text-primary)', letterSpacing:'-0.02em', lineHeight:1.1 },
  statIcon: { width:'42px', height:'42px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(0,0,0,0.1)' },
  mainGrid: { display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:'20px', marginBottom:'24px' },
  card: {
    background:'var(--card)', borderRadius:'16px', padding:'24px',
    boxShadow:'var(--shadow-card)', border:'1px solid var(--border)',
  },
  cardTitle: { fontSize:'16px', fontWeight:700, color:'var(--text-primary)' },
  timeFilters: { display:'flex', gap:'4px', background:'var(--input-bg)', padding:'4px', borderRadius:'10px', border:'1px solid var(--border)' },
  timeBtn: { padding:'6px 16px', borderRadius:'8px', fontSize:'12px', fontWeight:600, background:'transparent', color:'var(--text-secondary)', border:'none', cursor:'pointer' },
  timeBtnActive: { background:'linear-gradient(135deg,#6C63FF,#3B82F6)', color:'#fff', boxShadow:'0 2px 8px rgba(108,99,255,0.3)' },
  activityItem: { display:'flex', gap:'14px', padding:'14px 12px', borderRadius:'12px', cursor:'pointer', alignItems:'flex-start', transition:'background 0.15s ease' },
  ctaBtn: {
    background:'linear-gradient(135deg,#6C63FF,#3B82F6)', color:'#fff', border:'none',
    borderRadius:'10px', padding:'12px 24px', fontSize:'14px', fontWeight:600, cursor:'pointer',
    display:'flex', alignItems:'center', gap:'8px', boxShadow:'0 4px 16px rgba(108,99,255,0.3)',
  },
};

export default Dashboard;
