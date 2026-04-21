import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Download, Calendar, Filter, TrendingUp, ChevronDown } from 'lucide-react';

const pageV = { initial:{opacity:0,y:16}, animate:{opacity:1,y:0,transition:{duration:0.4}}, exit:{opacity:0,y:-10,transition:{duration:0.2}} };
const cardV = { initial:{opacity:0,y:20,scale:0.97}, animate:(i)=>({opacity:1,y:0,scale:1,transition:{delay:i*0.1,duration:0.4}}) };

const monthlyData = [
  {month:'Jan',queries:3200,docs:1800},{month:'Feb',queries:4100,docs:2200},{month:'Mar',queries:3800,docs:2000},
  {month:'Apr',queries:5200,docs:2800},{month:'May',queries:6100,docs:3200},{month:'Jun',queries:5800,docs:3000},
  {month:'Jul',queries:6800,docs:3600},{month:'Aug',queries:7200,docs:3900},
];
const pieData = [
  {name:'CSV Files',value:35,color:'#6C63FF'},{name:'Databases',value:28,color:'#3B82F6'},
  {name:'Documents',value:22,color:'#06B6D4'},{name:'APIs',value:15,color:'#10B981'},
];
const usageData = [
  {day:'Mon',tokens:2400,requests:180},{day:'Tue',tokens:3200,requests:240},{day:'Wed',tokens:2800,requests:210},
  {day:'Thu',tokens:4100,requests:310},{day:'Fri',tokens:3800,requests:285},{day:'Sat',tokens:1600,requests:120},{day:'Sun',tokens:1200,requests:90},
];
const performanceData = [
  {time:'00:00',latency:120,throughput:450},{time:'04:00',latency:95,throughput:380},{time:'08:00',latency:180,throughput:620},
  {time:'12:00',latency:250,throughput:780},{time:'16:00',latency:200,throughput:710},{time:'20:00',latency:140,throughput:520},
];

const CT = ({active,payload,label}) => {
  if(!active||!payload) return null;
  return (
    <div style={{background:'var(--tooltip-bg)',borderRadius:'12px',padding:'14px 18px',boxShadow:'var(--shadow-md)',border:'1px solid var(--tooltip-border)'}}>
      <p style={{fontSize:'12px',fontWeight:600,color:'var(--text-primary)',marginBottom:'6px'}}>{label}</p>
      {payload.map((p,i)=>(<p key={i} style={{fontSize:'12px',color:p.color,marginTop:'3px'}}>{p.name}: <b>{p.value.toLocaleString()}</b></p>))}
    </div>
  );
};

const Analytics = () => {
  return (
    <motion.div style={S.page} variants={pageV} initial="initial" animate="animate" exit="exit">
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Analytics</h1>
          <p style={S.subtitle}>Detailed insights across all your data sources and queries</p>
        </div>
        <div style={S.headerActions}>
          <button style={S.filterDrop}><Filter size={15}/><span>All Sources</span><ChevronDown size={14}/></button>
          <button style={S.filterDrop}><Calendar size={15}/><span>Last 30 Days</span><ChevronDown size={14}/></button>
          <motion.button style={S.exportBtn} whileHover={{scale:1.03}} whileTap={{scale:0.97}}>
            <Download size={16}/>Export
          </motion.button>
        </div>
      </div>

      <div style={S.summaryRow}>
        {[
          {label:'Total Queries',value:'42,380',change:'+18.2%'},
          {label:'Avg Response Time',value:'1.2s',change:'-0.3s'},
          {label:'Data Processed',value:'2.4 TB',change:'+540 GB'},
          {label:'Accuracy Score',value:'96.8%',change:'+1.2%'},
        ].map((s,i)=>(
          <motion.div key={s.label} style={S.summaryCard} variants={cardV} initial="initial" animate="animate" custom={i} whileHover={{y:-2}}>
            <p style={S.summaryLabel}>{s.label}</p>
            <h3 style={S.summaryValue}>{s.value}</h3>
            <span style={{display:'inline-flex',alignItems:'center',gap:'4px',fontSize:'12px',fontWeight:600,color:'var(--success)',marginTop:'6px'}}>
              <TrendingUp size={12}/>{s.change}
            </span>
          </motion.div>
        ))}
      </div>

      <div style={S.chartGrid}>
        <motion.div style={S.card} variants={cardV} initial="initial" animate="animate" custom={4}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
            <h3 style={S.cardTitle}>Monthly Overview</h3>
            <div style={{display:'flex',gap:'16px'}}>
              <span style={S.legend}><span style={{...S.dot,background:'#6C63FF'}}/>Queries</span>
              <span style={S.legend}><span style={{...S.dot,background:'#06B6D4'}}/>Documents</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false}/>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:12,fill:'var(--chart-text)'}}/>
              <YAxis axisLine={false} tickLine={false} tick={{fontSize:12,fill:'var(--chart-text)'}}/>
              <Tooltip content={<CT/>}/>
              <Bar dataKey="queries" fill="#6C63FF" radius={[6,6,0,0]} name="Queries"/>
              <Bar dataKey="docs" fill="#06B6D4" radius={[6,6,0,0]} name="Documents"/>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div style={S.card} variants={cardV} initial="initial" animate="animate" custom={5}>
          <h3 style={S.cardTitle}>Data Source Distribution</h3>
          <div style={{display:'flex',alignItems:'center',gap:'24px'}}>
            <ResponsiveContainer width="55%" height={280}>
              <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                {pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie><Tooltip content={<CT/>}/></PieChart>
            </ResponsiveContainer>
            <div style={{display:'flex',flexDirection:'column',gap:'14px',flex:1}}>
              {pieData.map(e=>(
                <div key={e.name} style={{display:'flex',alignItems:'center',gap:'10px'}}>
                  <div style={{width:'10px',height:'10px',borderRadius:'3px',background:e.color,flexShrink:0}}/>
                  <div>
                    <p style={{fontSize:'13px',fontWeight:500,color:'var(--text-secondary)'}}>{e.name}</p>
                    <p style={{fontSize:'16px',fontWeight:700,color:'var(--text-primary)'}}>{e.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div style={S.card} variants={cardV} initial="initial" animate="animate" custom={6}>
          <h3 style={S.cardTitle}>Weekly Usage</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={usageData}>
              <defs>
                <linearGradient id="tG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6C63FF" stopOpacity={0.2}/><stop offset="100%" stopColor="#6C63FF" stopOpacity={0}/></linearGradient>
                <linearGradient id="rG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={0.15}/><stop offset="100%" stopColor="#3B82F6" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false}/>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize:12,fill:'var(--chart-text)'}}/>
              <YAxis axisLine={false} tickLine={false} tick={{fontSize:12,fill:'var(--chart-text)'}}/>
              <Tooltip content={<CT/>}/>
              <Area type="monotone" dataKey="tokens" stroke="#6C63FF" strokeWidth={2} fill="url(#tG)" name="Tokens"/>
              <Area type="monotone" dataKey="requests" stroke="#3B82F6" strokeWidth={2} fill="url(#rG)" name="Requests"/>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div style={S.card} variants={cardV} initial="initial" animate="animate" custom={7}>
          <h3 style={S.cardTitle}>Performance Metrics</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false}/>
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize:12,fill:'var(--chart-text)'}}/>
              <YAxis axisLine={false} tickLine={false} tick={{fontSize:12,fill:'var(--chart-text)'}}/>
              <Tooltip content={<CT/>}/>
              <Line type="monotone" dataKey="latency" stroke="#F59E0B" strokeWidth={2.5} dot={false} activeDot={{r:5,fill:'#F59E0B',stroke:'var(--card)',strokeWidth:2}} name="Latency (ms)"/>
              <Line type="monotone" dataKey="throughput" stroke="#10B981" strokeWidth={2.5} dot={false} activeDot={{r:5,fill:'#10B981',stroke:'var(--card)',strokeWidth:2}} name="Throughput"/>
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
};

const S = {
  page:{padding:'28px 32px',maxWidth:'1400px'},
  header:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'24px',flexWrap:'wrap',gap:'16px'},
  title:{fontSize:'26px',fontWeight:700,color:'var(--text-primary)',letterSpacing:'-0.02em'},
  subtitle:{fontSize:'14px',color:'var(--text-secondary)',marginTop:'6px'},
  headerActions:{display:'flex',gap:'10px',alignItems:'center',flexWrap:'wrap'},
  filterDrop:{display:'flex',alignItems:'center',gap:'8px',padding:'10px 16px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--card)',fontSize:'13px',fontWeight:500,color:'var(--text-secondary)',cursor:'pointer'},
  exportBtn:{background:'linear-gradient(135deg,#6C63FF,#3B82F6)',color:'#fff',border:'none',borderRadius:'10px',padding:'10px 20px',fontSize:'13px',fontWeight:600,display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',boxShadow:'0 4px 12px rgba(108,99,255,0.25)'},
  summaryRow:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'24px'},
  summaryCard:{background:'var(--card)',borderRadius:'14px',padding:'20px',boxShadow:'var(--shadow-card)',border:'1px solid var(--border)',transition:'all 0.25s ease'},
  summaryLabel:{fontSize:'12px',fontWeight:600,color:'var(--text-tertiary)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'8px'},
  summaryValue:{fontSize:'24px',fontWeight:700,color:'var(--text-primary)',letterSpacing:'-0.02em'},
  chartGrid:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'},
  card:{background:'var(--card)',borderRadius:'16px',padding:'24px',boxShadow:'var(--shadow-card)',border:'1px solid var(--border)'},
  cardTitle:{fontSize:'16px',fontWeight:700,color:'var(--text-primary)',marginBottom:'16px'},
  legend:{display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',color:'var(--text-secondary)',fontWeight:500},
  dot:{width:'8px',height:'8px',borderRadius:'50%',display:'inline-block'},
};

export default Analytics;
