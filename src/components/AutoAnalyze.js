import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, ScatterChart, Scatter,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Database, Sparkles, Loader2, Download, CheckCircle, AlertCircle,
  BarChart as BarChartIcon, TrendingUp, PieChart as PieChartIcon
} from 'lucide-react';
import html2canvas from 'html2canvas';

const COLORS = ['#6C63FF','#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6'];

const ANALYSIS_PROMPTS = [
  { label: 'Trend Over Time', prompt: 'Show the main trend over time as a line chart. Use date/time or sequential columns. Return ONLY {CHART_DATA: {type:"line", title:"...", description:"...", data:[...], xKey:"...", yKey:"...", colors:["#6C63FF","#3B82F6"]}}' },
  { label: 'Top Categories', prompt: 'Show the top 8 categories or groups ranked by total value as a bar chart. Return ONLY {CHART_DATA: {type:"bar", title:"...", description:"...", data:[...], xKey:"...", yKey:"...", colors:["#3B82F6","#6C63FF"]}}' },
  { label: 'Distribution', prompt: 'Show how values are distributed across categories as a pie chart with max 6 slices. Return ONLY {CHART_DATA: {type:"pie", title:"...", description:"...", data:[...], xKey:"...", yKey:"...", colors:["#6C63FF","#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6"]}}' },
  { label: 'Comparison', prompt: 'Compare two important numeric metrics over categories as a grouped bar chart. Return ONLY {CHART_DATA: {type:"bar", title:"...", description:"...", data:[...], xKey:"...", yKey:"...", colors:["#10B981","#F59E0B"]}}' },
  { label: 'Growth Pattern', prompt: 'Show growth or cumulative pattern as an area chart. Return ONLY {CHART_DATA: {type:"area", title:"...", description:"...", data:[...], xKey:"...", yKey:"...", colors:["#8B5CF6","#EC4899"]}}' },
];

const extractChartData = (text) => {
  if (!text) return null;
  const m = text.match(/\{\s*CHART_DATA\s*:\s*(\{[\s\S]*?\})\s*\}/);
  if (m) { try { return JSON.parse(m[1]); } catch(e) {} }
  const f = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (f) { try { const p = JSON.parse(f[1]); return p?.CHART_DATA || p; } catch(e) {} }
  try { const p = JSON.parse(text); if (p && typeof p === 'object') return p.CHART_DATA || p; } catch(e) {}
  return null;
};

const RenderChart = ({ chart }) => {
  if (!chart?.data?.length) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'var(--text-tertiary)',fontSize:'13px'}}>No data</div>;
  const dataKeys = Object.keys(chart.data[0]).filter(k => k !== chart.xKey);
  const yKey = chart.yKey || dataKeys[0] || 'value';
  const colors = chart.colors?.length ? chart.colors : COLORS;
  const grid = <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />;
  const tooltip = <RechartsTooltip contentStyle={{ background:'var(--tooltip-bg)', border:'1px solid var(--tooltip-border)', borderRadius:'8px', color:'var(--text-primary)' }} />;

  if (chart.type === 'line') return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chart.data} margin={{top:10,right:20,left:0,bottom:10}}>
        {grid}<XAxis dataKey={chart.xKey} tick={{fontSize:11,fill:'var(--chart-text)'}} /><YAxis tick={{fontSize:11,fill:'var(--chart-text)'}} />{tooltip}<Legend />
        {dataKeys.map((k,i) => <Line key={k} type="monotone" dataKey={k} stroke={colors[i%colors.length]} strokeWidth={2.5} dot={{r:3}} />)}
      </LineChart>
    </ResponsiveContainer>
  );
  if (chart.type === 'bar') return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chart.data} margin={{top:10,right:20,left:0,bottom:10}}>
        {grid}<XAxis dataKey={chart.xKey} tick={{fontSize:11,fill:'var(--chart-text)'}} /><YAxis tick={{fontSize:11,fill:'var(--chart-text)'}} />{tooltip}<Legend />
        {dataKeys.map((k,i) => <Bar key={k} dataKey={k} fill={colors[i%colors.length]} radius={[6,6,0,0]} />)}
      </BarChart>
    </ResponsiveContainer>
  );
  if (chart.type === 'area') return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chart.data} margin={{top:10,right:20,left:0,bottom:10}}>
        {grid}<XAxis dataKey={chart.xKey} tick={{fontSize:11,fill:'var(--chart-text)'}} /><YAxis tick={{fontSize:11,fill:'var(--chart-text)'}} />{tooltip}<Legend />
        {dataKeys.map((k,i) => <Area key={k} type="monotone" dataKey={k} stroke={colors[i%colors.length]} fill={colors[i%colors.length]} fillOpacity={0.2} />)}
      </AreaChart>
    </ResponsiveContainer>
  );
  if (chart.type === 'pie' || chart.type === 'donut') return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart><RechartsTooltip /><Legend />
        <Pie data={chart.data} dataKey={yKey} nameKey={chart.xKey} cx="50%" cy="50%" innerRadius={chart.type==='donut'?50:0} outerRadius={80} paddingAngle={3}>
          {chart.data.map((_,i) => <Cell key={i} fill={colors[i%colors.length]} />)}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
  if (chart.type === 'scatter') return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{top:10,right:20,left:0,bottom:10}}>
        {grid}<XAxis type="category" dataKey={chart.xKey} /><YAxis type="number" dataKey={yKey} />{tooltip}
        <Scatter data={chart.data} fill={colors[0]} />
      </ScatterChart>
    </ResponsiveContainer>
  );
  return <div style={{textAlign:'center',color:'var(--text-tertiary)',padding:'20px'}}>Unsupported chart type</div>;
};

const AutoAnalyze = ({ datasets, token, onAddToCanvas }) => {
  const [selectedDatasetId, setSelectedDatasetId] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [savedIds, setSavedIds] = useState(new Set());

  const handleGenerate = async () => {
    if (!selectedDatasetId) { setError('Please select a dataset first'); return; }
    if (!token) { setError('Please sign in'); return; }
    setLoading(true); setError(''); setCharts([]); setProgress(0); setSavedIds(new Set());

    const results = [];
    const contextPrefix = userPrompt.trim() ? `The user wants to analyze: "${userPrompt}". Based on this context, ` : '';

    try {
      const promises = ANALYSIS_PROMPTS.map(async (ap, idx) => {
        try {
          const res = await fetch('https://nexabi-backend-production.up.railway.app/api/queries/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ question: contextPrefix + ap.prompt, dataset_id: selectedDatasetId, model: 'groq', conversation_history: [] })
          });
          const data = await res.json();
          let chartData = data.chart_data;
          if (!chartData) chartData = extractChartData(data.response);
          if (chartData) {
            results[idx] = { id: `auto-${Date.now()}-${idx}`, ...chartData, slotLabel: ap.label };
          }
        } catch(e) { console.error(`Chart ${idx} failed:`, e); }
        setProgress(p => p + 1);
      });
      await Promise.all(promises);
      setCharts(results.filter(Boolean));
      if (results.filter(Boolean).length === 0) setError('AI could not generate charts from this dataset. Try a different dataset or prompt.');
    } catch(e) { setError('Failed to analyze dataset'); }
    finally { setLoading(false); }
  };

  const handleSaveChart = (chart) => {
    if (onAddToCanvas) {
      onAddToCanvas({
        type: chart.type || 'bar',
        title: chart.title || 'Untitled',
        description: chart.description || '',
        data: chart.data || [],
        xKey: chart.xKey || 'name',
        yKey: chart.yKey || 'value',
        colors: chart.colors || COLORS.slice(0,4),
      });
      setSavedIds(prev => new Set([...prev, chart.id]));
    }
  };

  const handleDownloadPng = async (chartId, title) => {
    const el = document.getElementById(chartId);
    if (!el) return;
    const canvas = await html2canvas(el, { backgroundColor: '#ffffff', scale: 2 });
    const link = document.createElement('a');
    link.download = `${title || 'chart'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <motion.div key="auto" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} transition={{duration:0.3}} style={{flex:1,display:'flex',flexDirection:'column',gap:'20px',overflow:'auto',padding:'4px 0'}}>
      {/* CONTROLS */}
      <div style={S.controlCard}>
        <div style={S.controlHeader}>
          <div style={S.controlIcon}><Sparkles size={22} color="#6C63FF" /></div>
          <div>
            <h3 style={S.controlTitle}>AI Auto Analyze</h3>
            <p style={S.controlDesc}>Select a dataset and let AI generate insightful charts automatically</p>
          </div>
        </div>
        <div style={S.controlGrid}>
          <div style={S.fieldGroup}>
            <label style={S.fieldLabel}><Database size={14} /> Dataset</label>
            <select value={selectedDatasetId} onChange={e => setSelectedDatasetId(e.target.value)} style={S.select}>
              <option value="">Choose a dataset...</option>
              {datasets.map(ds => <option key={ds.id} value={ds.id}>{ds.name || ds.filename}</option>)}
            </select>
          </div>
          <div style={S.fieldGroup}>
            <label style={S.fieldLabel}><TrendingUp size={14} /> Focus (optional)</label>
            <input value={userPrompt} onChange={e => setUserPrompt(e.target.value)} placeholder="e.g. Analyze sales performance..." style={S.input} />
          </div>
        </div>
        <button style={S.generateBtn} onClick={handleGenerate} disabled={loading}>
          {loading ? <><Loader2 size={18} className="spin" /> Analyzing... ({progress}/{ANALYSIS_PROMPTS.length})</> : <><Sparkles size={18} /> Generate Dashboard</>}
        </button>
        {error && <div style={S.errorMsg}><AlertCircle size={14} /> {error}</div>}
      </div>

      {/* LOADING */}
      {loading && (
        <div style={S.loadingWrap}>
          <div style={S.progressBar}><div style={{...S.progressFill, width:`${(progress/ANALYSIS_PROMPTS.length)*100}%`}} /></div>
          <p style={S.loadingText}>AI is analyzing your dataset... ({progress}/{ANALYSIS_PROMPTS.length} charts)</p>
        </div>
      )}

      {/* RESULTS GRID */}
      {charts.length > 0 && (
        <div style={S.resultsGrid}>
          {charts.map((chart, i) => (
            <motion.div key={chart.id} style={S.chartCard} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}}>
              <div style={S.chartCardHeader}>
                <div>
                  <span style={S.chartBadge}>{chart.slotLabel}</span>
                  <h4 style={S.chartCardTitle}>{chart.title}</h4>
                  {chart.description && <p style={S.chartCardDesc}>{chart.description}</p>}
                </div>
                <div style={S.chartCardActions}>
                  <button style={S.iconBtn} onClick={() => handleDownloadPng(`auto-chart-${i}`, chart.title)} title="Download PNG"><Download size={14} /></button>
                  <button style={{...S.saveBtn, ...(savedIds.has(chart.id) ? S.saveBtnDone : {})}} onClick={() => handleSaveChart(chart)} disabled={savedIds.has(chart.id)}>
                    {savedIds.has(chart.id) ? <><CheckCircle size={14} /> Saved</> : <><BarChartIcon size={14} /> Save to Canvas</>}
                  </button>
                </div>
              </div>
              <div id={`auto-chart-${i}`} style={S.chartCardBody}>
                <RenderChart chart={chart} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && charts.length === 0 && (
        <div style={S.emptyState}>
          <PieChartIcon size={48} color="var(--primary)" style={{opacity:0.3,marginBottom:'16px'}} />
          <h3 style={{color:'var(--text-primary)',fontSize:'18px',fontWeight:600,marginBottom:'8px'}}>Ready to Analyze</h3>
          <p style={{color:'var(--text-tertiary)',fontSize:'14px',maxWidth:'400px',lineHeight:1.6}}>Select a dataset and click "Generate Dashboard" to let AI create beautiful visualizations from your data.</p>
        </div>
      )}

      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </motion.div>
  );
};

const S = {
  controlCard: { background:'var(--card)', border:'1px solid var(--border)', borderRadius:'16px', padding:'28px', boxShadow:'var(--shadow-card)' },
  controlHeader: { display:'flex', alignItems:'center', gap:'16px', marginBottom:'24px' },
  controlIcon: { width:'48px', height:'48px', borderRadius:'14px', background:'rgba(108,99,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  controlTitle: { fontSize:'18px', fontWeight:700, color:'var(--text-primary)', margin:0 },
  controlDesc: { fontSize:'13px', color:'var(--text-secondary)', margin:'4px 0 0' },
  controlGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'20px' },
  fieldGroup: { display:'flex', flexDirection:'column', gap:'8px' },
  fieldLabel: { fontSize:'13px', fontWeight:600, color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:'6px' },
  select: { padding:'10px 14px', background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text-primary)', fontSize:'14px', outline:'none', width:'100%' },
  input: { padding:'10px 14px', background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text-primary)', fontSize:'14px', outline:'none', width:'100%' },
  generateBtn: { width:'100%', padding:'12px', background:'linear-gradient(135deg,#6C63FF,#3B82F6)', color:'#fff', border:'none', borderRadius:'12px', fontSize:'15px', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', boxShadow:'0 4px 16px rgba(108,99,255,0.3)' },
  errorMsg: { display:'flex', alignItems:'center', gap:'8px', color:'#EF4444', fontSize:'13px', marginTop:'12px', padding:'10px 14px', background:'rgba(239,68,68,0.08)', borderRadius:'10px', border:'1px solid rgba(239,68,68,0.15)' },
  loadingWrap: { padding:'32px', textAlign:'center' },
  progressBar: { height:'6px', background:'var(--input-bg)', borderRadius:'3px', overflow:'hidden', marginBottom:'12px' },
  progressFill: { height:'100%', background:'linear-gradient(90deg,#6C63FF,#3B82F6)', borderRadius:'3px', transition:'width 0.5s ease' },
  loadingText: { fontSize:'14px', color:'var(--text-secondary)' },
  resultsGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(480px,1fr))', gap:'20px' },
  chartCard: { background:'var(--card)', border:'1px solid var(--border)', borderRadius:'16px', overflow:'hidden', boxShadow:'var(--shadow-card)' },
  chartCardHeader: { padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px' },
  chartBadge: { fontSize:'11px', fontWeight:600, color:'var(--primary)', background:'rgba(108,99,255,0.1)', padding:'3px 10px', borderRadius:'20px', display:'inline-block', marginBottom:'6px' },
  chartCardTitle: { fontSize:'15px', fontWeight:600, color:'var(--text-primary)', margin:0 },
  chartCardDesc: { fontSize:'12px', color:'var(--text-tertiary)', margin:'4px 0 0', lineHeight:1.4 },
  chartCardActions: { display:'flex', alignItems:'center', gap:'8px', flexShrink:0 },
  iconBtn: { background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:'8px', padding:'7px', cursor:'pointer', color:'var(--text-secondary)', display:'flex', alignItems:'center', justifyContent:'center' },
  saveBtn: { display:'flex', alignItems:'center', gap:'6px', padding:'6px 14px', background:'rgba(108,99,255,0.1)', border:'1px solid rgba(108,99,255,0.2)', borderRadius:'8px', color:'var(--primary)', fontSize:'12px', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' },
  saveBtnDone: { background:'rgba(16,185,129,0.1)', borderColor:'rgba(16,185,129,0.2)', color:'#10B981', cursor:'default' },
  chartCardBody: { height:'280px', padding:'16px' },
  emptyState: { flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 20px', textAlign:'center' },
};

export default AutoAnalyze;
