import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveGridLayout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Download, RefreshCw, Wand2, ArrowUpRight, TrendingUp, TrendingDown,
  MessageSquare, Database, FileText, Zap, ChevronDown
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const pageV = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0 }
};

const COLORS = ['#6C63FF', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const Dashboard = () => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState('');
  const [datasetData, setDatasetData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [globalStats, setGlobalStats] = useState({ queries: 0, datasets: 0, documents: 0, respTime: '1.2s' });
  const dashboardRef = useRef(null);

  // Layout definition for grid
  const layout = [
    { i: 'kpi', x: 0, y: 0, w: 12, h: 2, static: true },
    { i: 'timeseries', x: 0, y: 2, w: 6, h: 4 },
    { i: 'category', x: 6, y: 2, w: 6, h: 4 },
    { i: 'pie', x: 0, y: 6, w: 4, h: 4 },
    { i: 'gauge', x: 4, y: 6, w: 4, h: 4 },
    { i: 'insights', x: 8, y: 6, w: 4, h: 4 },
    { i: 'table', x: 0, y: 10, w: 12, h: 4 }
  ];

  useEffect(() => {
    fetchDatasets();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDatasets = async () => {
    const token = localStorage.getItem('nexabi_token');
    try {
      const res = await fetch('https://nexabi-backend-production.up.railway.app/api/files/datasets', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setDatasets(data);
        if (data.length > 0) handleSelectDataset(data[0].id);
      }
    } catch (e) {}
  };

  const fetchStats = async () => {
    const token = localStorage.getItem('nexabi_token');
    try {
      const [dsRes, docRes] = await Promise.all([
        fetch('https://nexabi-backend-production.up.railway.app/api/files/datasets', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('https://nexabi-backend-production.up.railway.app/api/files/documents', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const ds = dsRes.ok ? await dsRes.json() : [];
      const docs = docRes.ok ? await docRes.json() : [];
      setGlobalStats(p => ({ ...p, datasets: ds.length, documents: docs.length, queries: 1250 }));
    } catch (e) {}
  };

  const handleSelectDataset = async (id) => {
    setSelectedDatasetId(id);
    const token = localStorage.getItem('nexabi_token');
    try {
      const res = await fetch(`https://nexabi-backend-production.up.railway.app/api/files/datasets/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setDatasetData(data);
        setAnalysis(null); 
      }
    } catch (e) {}
  };

  const handleAutoAnalyze = async () => {
    if (!selectedDatasetId) return;
    setIsAnalyzing(true);
    const token = localStorage.getItem('nexabi_token');
    try {
      const res = await fetch('https://nexabi-backend-production.up.railway.app/api/queries/analyze-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dataset_id: selectedDatasetId, model: 'groq' })
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      }
    } catch (e) {
      console.error(e);
    }
    setIsAnalyzing(false);
  };

  const exportPDF = async () => {
    if (!dashboardRef.current) return;
    const canvas = await html2canvas(dashboardRef.current, { backgroundColor: '#111827' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('dashboard.pdf');
  };

  if (!datasets.length) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>No Datasets Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>Upload data to see your dashboard.</p>
      </div>
    );
  }

  const chartData = datasetData?.preview || [];

  return (
    <motion.div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }} variants={pageV} initial="initial" animate="animate" exit="exit">
      <style>{`
        .react-grid-item { background: var(--card); border-radius: 12px; border: 1px solid var(--border); overflow: hidden; display: flex; flex-direction: column; }
        .react-grid-item:hover { border-color: rgba(108,99,255,0.4); }
        .chart-title { padding: 12px 16px; font-size: 14px; font-weight: 600; color: var(--text-primary); border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .chart-body { flex: 1; padding: 16px; min-height: 0; }
        .kpi-card { flex: 1; padding: 16px; background: var(--input-bg); border-radius: 10px; border: 1px solid var(--border); }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 10px; border-bottom: 1px solid var(--border); font-size: 13px; color: var(--text-secondary); }
        th { font-weight: 600; color: var(--text-primary); position: sticky; top: 0; background: var(--card); }
      `}</style>

      {/* Top Bar Stats */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
        {[
          { icon: MessageSquare, label: 'Total Queries', value: globalStats.queries },
          { icon: Database, label: 'Datasets Connected', value: globalStats.datasets },
          { icon: FileText, label: 'Docs Processed', value: globalStats.documents },
          { icon: Zap, label: 'Avg Response', value: globalStats.respTime }
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, background: 'var(--card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={20} color="var(--primary)" />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</p>
              <h3 style={{ fontSize: '20px', color: 'var(--text-primary)', fontWeight: 700, marginTop: '2px' }}>{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'var(--card)', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <select value={selectedDatasetId} onChange={e => handleSelectDataset(e.target.value)} style={{ padding: '8px 12px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}>
            {datasets.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <button style={{ padding: '8px 16px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}>Date Range <ChevronDown size={14} style={{display:'inline', marginLeft:'4px'}}/></button>
          <button style={{ padding: '8px 16px', background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '13px', cursor: 'pointer' }}>Reset Filters</button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <motion.button onClick={handleAutoAnalyze} disabled={isAnalyzing} style={{ background: 'linear-gradient(135deg,#6C63FF,#3B82F6)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: isAnalyzing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {isAnalyzing ? <RefreshCw size={14} className="spin" /> : <Wand2 size={14} />} Auto Analyze
          </motion.button>
          <motion.button onClick={exportPDF} style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} whileHover={{ scale: 1.02 }}>
            <Download size={14} /> Export PDF
          </motion.button>
        </div>
      </div>

      {/* Grid Dashboard */}
      <div ref={dashboardRef} style={{ background: 'transparent', padding: '10px 0' }}>
        {!analysis && !isAnalyzing ? (
          <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)', borderRadius: '16px' }}>
            <Wand2 size={40} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '16px' }} />
            <h3 style={{ color: 'var(--text-primary)' }}>AI Dashboard Ready</h3>
            <p style={{ color: 'var(--text-tertiary)', marginTop: '8px' }}>Click "Auto Analyze" to generate insights for {datasetData?.name}</p>
          </div>
        ) : isAnalyzing ? (
          <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw size={40} color="var(--primary)" className="spin" style={{ marginBottom: '16px' }} />
            <h3 style={{ color: 'var(--text-primary)' }}>Analyzing Dataset...</h3>
            <p style={{ color: 'var(--text-tertiary)', marginTop: '8px' }}>Finding the best metrics and visualizations.</p>
          </div>
        ) : (
          <ResponsiveGridLayout className="layout" layouts={{ lg: layout }} breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }} cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }} rowHeight={60} isDraggable isResizable margin={[20, 20]}>
            {/* KPI ROW */}
            <div key="kpi" style={{ background: 'transparent', border: 'none', display: 'flex', gap: '20px' }}>
              {analysis.kpis?.map((kpi, i) => (
                <div key={i} className="kpi-card">
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>{kpi.title}</p>
                  <h3 style={{ fontSize: '24px', color: 'var(--text-primary)', margin: '8px 0' }}>{kpi.value}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: kpi.up ? 'var(--success)' : 'var(--danger)' }}>
                    {kpi.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {kpi.trend}
                  </div>
                </div>
              ))}
            </div>

            {/* TIME SERIES */}
            <div key="timeseries">
              <div className="chart-title">{analysis.timeSeriesConfig?.title || 'Trend Over Time'} <ArrowUpRight size={14} color="var(--text-tertiary)"/></div>
              <div className="chart-body">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                    <XAxis dataKey={analysis.timeSeriesConfig?.xKey} stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false}/>
                    <YAxis stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false}/>
                    <Tooltip contentStyle={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}/>
                    <Area type="monotone" dataKey={analysis.timeSeriesConfig?.yKey} stroke="#6C63FF" fillOpacity={1} fill="url(#colorArea)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CATEGORY BAR */}
            <div key="category">
              <div className="chart-title">{analysis.categoryConfig?.title || 'Category Comparison'} <ArrowUpRight size={14} color="var(--text-tertiary)"/></div>
              <div className="chart-body">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                    <XAxis dataKey={analysis.categoryConfig?.xKey} stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false}/>
                    <YAxis stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false}/>
                    <Tooltip contentStyle={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}} cursor={{fill: 'rgba(255,255,255,0.05)'}}/>
                    <Bar dataKey={analysis.categoryConfig?.yKey} fill="#3B82F6" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* PIE/DONUT */}
            <div key="pie">
              <div className="chart-title">{analysis.distributionConfig?.title || 'Distribution'} <ArrowUpRight size={14} color="var(--text-tertiary)"/></div>
              <div className="chart-body">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey={analysis.distributionConfig?.dataKey} nameKey={analysis.distributionConfig?.nameKey} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}/>
                    <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GAUGE/SUMMARY */}
            <div key="gauge">
              <div className="chart-title">Performance Score <ArrowUpRight size={14} color="var(--text-tertiary)"/></div>
              <div className="chart-body" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{position: 'relative', width: '150px', height: '150px'}}>
                  <svg viewBox="0 0 100 50">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--input-bg)" strokeWidth="15" strokeLinecap="round"/>
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--primary)" strokeWidth="15" strokeLinecap="round" strokeDasharray={`${(analysis.gaugeConfig?.value || 85) * 1.25}, 200`}/>
                  </svg>
                  <div style={{position: 'absolute', bottom: '0', width: '100%', textAlign: 'center'}}>
                    <h2 style={{fontSize: '36px', color: 'var(--text-primary)', margin: 0}}>{analysis.gaugeConfig?.value || 85}%</h2>
                  </div>
                </div>
              </div>
            </div>

            {/* INSIGHTS */}
            <div key="insights">
              <div className="chart-title">Key Insights <ArrowUpRight size={14} color="var(--text-tertiary)"/></div>
              <div className="chart-body" style={{overflowY: 'auto'}}>
                <ul style={{paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6'}}>
                  {analysis.insights?.map((insight, i) => (
                    <li key={i} style={{marginBottom: '12px'}}>{insight}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* DATA TABLE */}
            <div key="table">
              <div className="chart-title">Raw Data <ArrowUpRight size={14} color="var(--text-tertiary)"/></div>
              <div className="chart-body" style={{overflowY: 'auto', padding: 0}}>
                {chartData.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        {Object.keys(chartData[0]).map(k => <th key={k}>{k}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.slice(0, 10).map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((v, j) => <td key={j}>{typeof v === 'object' ? JSON.stringify(v) : v}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{padding: '20px', color: 'var(--text-tertiary)'}}>No data available.</p>
                )}
              </div>
            </div>
          </ResponsiveGridLayout>
        )}
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
};

export default Dashboard;
