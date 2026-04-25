import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  ShoppingCart, DollarSign, Settings, Target, Users, Heart, Package, Crown,
  ArrowLeft, Database, Loader2, Download, ChevronRight, Sparkles, AlertCircle, RefreshCw
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const COLORS = ['#6C63FF','#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6'];

const TEMPLATES = [
  { id:'sales', name:'Sales Dashboard', desc:'Revenue, orders & product performance', icon: ShoppingCart, gradient:['#6C63FF','#3B82F6'],
    slots:[
      {key:'kpis', prompt:'Calculate 4 key sales KPIs from the data (total revenue, total orders, avg order value, top product). Return ONLY JSON: [{"title":"...","value":"...","trend":"+5%","up":true},...]. No other text.'},
      {key:'line', prompt:'Show revenue/sales trend over time as a line chart.'},
      {key:'bar', prompt:'Show top 6 products or categories ranked by sales.'},
      {key:'pie', prompt:'Show sales distribution across top 5 regions or segments as a pie chart.'},
    ]},
  { id:'finance', name:'Financial Report', desc:'Income, expenses & profit margins', icon: DollarSign, gradient:['#10B981','#059669'],
    slots:[
      {key:'kpis', prompt:'Calculate 4 financial KPIs (total income, total expenses, profit margin %, net profit). Return ONLY JSON: [{"title":"...","value":"...","trend":"+5%","up":true},...]. No other text.'},
      {key:'bar', prompt:'Show income vs expenses comparison by month/category as a grouped bar chart.'},
      {key:'line', prompt:'Show profit trend over time as a line chart.'},
      {key:'pie', prompt:'Show expense breakdown by category as a pie chart.'},
    ]},
  { id:'operations', name:'Operations Monitor', desc:'Efficiency, throughput & KPIs', icon: Settings, gradient:['#F59E0B','#D97706'],
    slots:[
      {key:'kpis', prompt:'Calculate 4 operations KPIs (total output, avg efficiency %, defect rate, throughput). Return ONLY JSON: [{"title":"...","value":"...","trend":"+5%","up":true},...]. No other text.'},
      {key:'area', prompt:'Show throughput or output volume over time as an area chart.'},
      {key:'bar', prompt:'Show performance by department or unit as a bar chart.'},
      {key:'line', prompt:'Show efficiency metrics trend as a line chart.'},
    ]},
  { id:'marketing', name:'Marketing Analytics', desc:'Campaigns, channels & conversions', icon: Target, gradient:['#EC4899','#DB2777'],
    slots:[
      {key:'kpis', prompt:'Calculate 4 marketing KPIs (total leads, conversion rate, cost per lead, ROI). Return ONLY JSON: [{"title":"...","value":"...","trend":"+5%","up":true},...]. No other text.'},
      {key:'bar', prompt:'Show performance by marketing channel as a bar chart.'},
      {key:'pie', prompt:'Show budget allocation or lead sources as a pie chart.'},
      {key:'area', prompt:'Show campaign performance trend over time as an area chart.'},
    ]},
  { id:'hr', name:'HR Dashboard', desc:'Headcount, departments & tenure', icon: Users, gradient:['#8B5CF6','#7C3AED'],
    slots:[
      {key:'kpis', prompt:'Calculate 4 HR KPIs (total employees, avg tenure, turnover rate, new hires). Return ONLY JSON: [{"title":"...","value":"...","trend":"+5%","up":true},...]. No other text.'},
      {key:'bar', prompt:'Show employee count by department as a bar chart.'},
      {key:'pie', prompt:'Show workforce composition (gender, role type, etc.) as a pie chart.'},
      {key:'line', prompt:'Show hiring or headcount trend over time as a line chart.'},
    ]},
  { id:'customer', name:'Customer Analytics', desc:'Satisfaction, segments & retention', icon: Heart, gradient:['#EF4444','#DC2626'],
    slots:[
      {key:'kpis', prompt:'Calculate 4 customer KPIs (total customers, satisfaction score, retention rate, churn rate). Return ONLY JSON: [{"title":"...","value":"...","trend":"+5%","up":true},...]. No other text.'},
      {key:'line', prompt:'Show customer satisfaction or NPS trend over time as a line chart.'},
      {key:'pie', prompt:'Show customer segments distribution as a pie chart.'},
      {key:'bar', prompt:'Show top customer categories by revenue or count as a bar chart.'},
    ]},
  { id:'inventory', name:'Inventory Report', desc:'Stock levels, turnover & alerts', icon: Package, gradient:['#14B8A6','#0D9488'],
    slots:[
      {key:'kpis', prompt:'Calculate 4 inventory KPIs (total items, total value, turnover rate, low stock count). Return ONLY JSON: [{"title":"...","value":"...","trend":"+5%","up":true},...]. No other text.'},
      {key:'bar', prompt:'Show stock levels by category or product as a bar chart.'},
      {key:'area', prompt:'Show inventory value trend over time as an area chart.'},
      {key:'pie', prompt:'Show inventory distribution by warehouse or category as a pie chart.'},
    ]},
  { id:'executive', name:'Executive Summary', desc:'All KPIs with mini charts & insights', icon: Crown, gradient:['#6C63FF','#A855F7'],
    slots:[
      {key:'kpis', prompt:'Calculate 5 key business KPIs (the most important metrics in this dataset). Return ONLY JSON: [{"title":"...","value":"...","trend":"+5%","up":true},...]. No other text.'},
      {key:'line', prompt:'Show the most important business trend over time as a line chart.'},
      {key:'bar', prompt:'Show top performers or categories as a bar chart.'},
      {key:'pie', prompt:'Show the main distribution or composition as a pie chart.'},
    ]},
];

const chartPromptSuffix = ' Return ONLY {CHART_DATA: {type:"...", title:"...", description:"...", data:[...], xKey:"...", yKey:"...", colors:["#6C63FF","#3B82F6","#10B981","#F59E0B","#EF4444"]}}';

const extractChartData = (text) => {
  if (!text) return null;
  const m = text.match(/\{\s*CHART_DATA\s*:\s*(\{[\s\S]*?\})\s*\}/);
  if (m) { try { return JSON.parse(m[1]); } catch(e) {} }
  const f = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (f) { try { const p = JSON.parse(f[1]); return p?.CHART_DATA || p; } catch(e) {} }
  return null;
};

const extractKpis = (text) => {
  if (!text) return null;
  try {
    const m = text.match(/\[[\s\S]*\]/);
    if (m) return JSON.parse(m[0]);
  } catch(e) {}
  return null;
};

const RenderChart = ({ chart }) => {
  if (!chart?.data?.length) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'var(--text-tertiary)'}}>No data</div>;
  const dk = Object.keys(chart.data[0]).filter(k => k !== chart.xKey);
  const colors = chart.colors?.length ? chart.colors : COLORS;
  const grid = <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />;
  const tt = <RTooltip contentStyle={{background:'var(--tooltip-bg)',border:'1px solid var(--tooltip-border)',borderRadius:'8px',color:'var(--text-primary)'}} />;
  const ax = (xk) => <><XAxis dataKey={xk} tick={{fontSize:11,fill:'var(--chart-text)'}} /><YAxis tick={{fontSize:11,fill:'var(--chart-text)'}} /></>;
  if (chart.type==='line') return <ResponsiveContainer width="100%" height="100%"><LineChart data={chart.data} margin={{top:10,right:20,left:0,bottom:10}}>{grid}{ax(chart.xKey)}{tt}<Legend />{dk.map((k,i) => <Line key={k} type="monotone" dataKey={k} stroke={colors[i%colors.length]} strokeWidth={2.5} dot={{r:3}} />)}</LineChart></ResponsiveContainer>;
  if (chart.type==='bar') return <ResponsiveContainer width="100%" height="100%"><BarChart data={chart.data} margin={{top:10,right:20,left:0,bottom:10}}>{grid}{ax(chart.xKey)}{tt}<Legend />{dk.map((k,i) => <Bar key={k} dataKey={k} fill={colors[i%colors.length]} radius={[6,6,0,0]} />)}</BarChart></ResponsiveContainer>;
  if (chart.type==='area') return <ResponsiveContainer width="100%" height="100%"><AreaChart data={chart.data} margin={{top:10,right:20,left:0,bottom:10}}>{grid}{ax(chart.xKey)}{tt}<Legend />{dk.map((k,i) => <Area key={k} type="monotone" dataKey={k} stroke={colors[i%colors.length]} fill={colors[i%colors.length]} fillOpacity={0.2} />)}</AreaChart></ResponsiveContainer>;
  if (chart.type==='pie'||chart.type==='donut') { const yk=chart.yKey||dk[0]||'value'; return <ResponsiveContainer width="100%" height="100%"><PieChart><RTooltip /><Legend /><Pie data={chart.data} dataKey={yk} nameKey={chart.xKey} cx="50%" cy="50%" innerRadius={chart.type==='donut'?45:0} outerRadius={75} paddingAngle={3}>{chart.data.map((_,i)=><Cell key={i} fill={colors[i%colors.length]} />)}</Pie></PieChart></ResponsiveContainer>; }
  return null;
};

const TemplateSVG = ({ template }) => {
  const [c1,c2] = template.gradient;
  return (
    <svg width="100%" height="120" viewBox="0 0 240 120" fill="none" style={{borderRadius:'8px'}}>
      <rect width="240" height="120" rx="8" fill="var(--input-bg)" />
      <rect x="10" y="8" width="50" height="24" rx="4" fill={c1} opacity="0.3" />
      <rect x="66" y="8" width="50" height="24" rx="4" fill={c2} opacity="0.3" />
      <rect x="122" y="8" width="50" height="24" rx="4" fill={c1} opacity="0.2" />
      <rect x="178" y="8" width="50" height="24" rx="4" fill={c2} opacity="0.2" />
      <rect x="10" y="40" width="140" height="70" rx="6" fill={c1} opacity="0.08" />
      <polyline points="20,95 45,75 70,85 95,60 120,70 140,55" stroke={c1} strokeWidth="2" fill="none" opacity="0.6" />
      <rect x="158" y="40" width="70" height="70" rx="6" fill={c2} opacity="0.08" />
      <rect x="165" y="90" width="10" height="15" rx="2" fill={c2} opacity="0.5" />
      <rect x="180" y="75" width="10" height="30" rx="2" fill={c1} opacity="0.5" />
      <rect x="195" y="60" width="10" height="45" rx="2" fill={c2} opacity="0.5" />
      <rect x="210" y="70" width="10" height="35" rx="2" fill={c1} opacity="0.4" />
    </svg>
  );
};

const PowerBITemplates = ({ datasets, token, onAddToCanvas, onSwitchToManual }) => {
  const [step, setStep] = useState('select');
  const [selected, setSelected] = useState(null);
  const [datasetId, setDatasetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [kpis, setKpis] = useState([]);
  const [charts, setCharts] = useState([]);
  const [error, setError] = useState('');

  const handleUseTemplate = (t) => { setSelected(t); setStep('dataset'); setError(''); };
  const handleBack = () => { if (step==='dataset'){setStep('select');setSelected(null);} else if(step==='view'){setStep('dataset');setCharts([]);setKpis([]);} };

  const handleLoadTemplate = async () => {
    if (!datasetId) { setError('Please select a dataset'); return; }
    if (!token) { setError('Please sign in'); return; }
    setLoading(true); setError(''); setProgress(0); setKpis([]); setCharts([]);
    const total = selected.slots.length;
    const chartResults = [];

    try {
      const promises = selected.slots.map(async (slot, idx) => {
        try {
          const question = slot.key === 'kpis' ? slot.prompt : slot.prompt + chartPromptSuffix;
          const res = await fetch('https://nexabi-backend-production.up.railway.app/api/queries/ask', {
            method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
            body: JSON.stringify({question, dataset_id:datasetId, model:'groq', conversation_history:[]})
          });
          const data = await res.json();
          if (slot.key === 'kpis') {
            const k = extractKpis(data.response);
            if (k) setKpis(k);
          } else {
            let cd = data.chart_data || extractChartData(data.response);
            if (cd) chartResults[idx] = { id:`tmpl-${Date.now()}-${idx}`, ...cd };
          }
        } catch(e) { console.error(`Slot ${idx} failed:`, e); }
        setProgress(p => p + 1);
      });
      await Promise.all(promises);
      setCharts(chartResults.filter(Boolean));
      setStep('view');
    } catch(e) { setError('Failed to load template'); }
    finally { setLoading(false); }
  };

  const handleExportPdf = async () => {
    const el = document.getElementById('template-dashboard');
    if (!el) return;
    const canvas = await html2canvas(el, { backgroundColor:'#111827', scale:2 });
    const img = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l','mm','a4');
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(img,'PNG',0,0,w,h);
    pdf.save(`${selected.name}.pdf`);
  };

  const handleSaveAll = () => {
    charts.forEach(c => {
      if (onAddToCanvas) onAddToCanvas({ type:c.type||'bar', title:c.title||'', description:c.description||'', data:c.data||[], xKey:c.xKey||'name', yKey:c.yKey||'value', colors:c.colors||COLORS.slice(0,4) });
    });
    if (onSwitchToManual) onSwitchToManual();
  };

  // STEP 1: Template Selection
  if (step === 'select') return (
    <motion.div key="tpl-select" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.3}} style={{flex:1,overflow:'auto',padding:'4px 0'}}>
      <div style={{marginBottom:'24px'}}>
        <h2 style={{fontSize:'22px',fontWeight:700,color:'var(--text-primary)',margin:0}}>Power BI Templates</h2>
        <p style={{fontSize:'14px',color:'var(--text-secondary)',marginTop:'6px'}}>Choose a pre-built dashboard template, connect your dataset, and get instant insights</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'20px'}}>
        {TEMPLATES.map((t,i) => {
          const Icon = t.icon;
          return (
            <motion.div key={t.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} style={T.card} onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--primary)';e.currentTarget.style.transform='translateY(-4px)';}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform='translateY(0)';}}>
              <TemplateSVG template={t} />
              <div style={{padding:'16px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
                  <div style={{width:'32px',height:'32px',borderRadius:'8px',background:`linear-gradient(135deg,${t.gradient[0]},${t.gradient[1]})`,display:'flex',alignItems:'center',justifyContent:'center'}}><Icon size={16} color="#fff" /></div>
                  <h3 style={{fontSize:'15px',fontWeight:700,color:'var(--text-primary)',margin:0}}>{t.name}</h3>
                </div>
                <p style={{fontSize:'12px',color:'var(--text-tertiary)',lineHeight:1.5,marginBottom:'14px',minHeight:'36px'}}>{t.desc}</p>
                <button style={T.useBtn} onClick={() => handleUseTemplate(t)}>Use Template <ChevronRight size={14} /></button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );

  // STEP 2: Dataset Selection
  if (step === 'dataset') return (
    <motion.div key="tpl-dataset" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.3}} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={T.datasetCard}>
        <button style={T.backBtn} onClick={handleBack}><ArrowLeft size={16} /> Back to templates</button>
        <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'24px'}}>
          <div style={{width:'52px',height:'52px',borderRadius:'14px',background:`linear-gradient(135deg,${selected.gradient[0]},${selected.gradient[1]})`,display:'flex',alignItems:'center',justifyContent:'center'}}><selected.icon size={24} color="#fff" /></div>
          <div><h3 style={{fontSize:'20px',fontWeight:700,color:'var(--text-primary)',margin:0}}>{selected.name}</h3><p style={{fontSize:'13px',color:'var(--text-secondary)',margin:'4px 0 0'}}>{selected.desc}</p></div>
        </div>
        <div style={{marginBottom:'20px'}}>
          <label style={{fontSize:'14px',fontWeight:600,color:'var(--text-secondary)',display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px'}}><Database size={16} /> Select your dataset</label>
          <select value={datasetId} onChange={e=>setDatasetId(e.target.value)} style={T.select}>
            <option value="">Choose a dataset...</option>
            {datasets.map(ds => <option key={ds.id} value={ds.id}>{ds.name || ds.filename}</option>)}
          </select>
        </div>
        <button style={T.loadBtn} onClick={handleLoadTemplate} disabled={loading}>
          {loading ? <><Loader2 size={18} className="spin" /> Loading... ({progress}/{selected.slots.length})</> : <><Sparkles size={18} /> Load Template</>}
        </button>
        {error && <div style={{color:'#EF4444',fontSize:'13px',marginTop:'12px',display:'flex',alignItems:'center',gap:'6px'}}><AlertCircle size={14} />{error}</div>}
        {loading && <div style={{marginTop:'16px'}}><div style={{height:'6px',background:'var(--input-bg)',borderRadius:'3px',overflow:'hidden'}}><div style={{height:'100%',background:`linear-gradient(90deg,${selected.gradient[0]},${selected.gradient[1]})`,borderRadius:'3px',transition:'width 0.5s',width:`${(progress/selected.slots.length)*100}%`}} /></div></div>}
      </div>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </motion.div>
  );

  // STEP 3: Template View
  return (
    <motion.div key="tpl-view" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.3}} style={{flex:1,overflow:'auto',padding:'4px 0'}}>
      {/* Top bar */}
      <div style={T.viewBar}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{width:'36px',height:'36px',borderRadius:'10px',background:`linear-gradient(135deg,${selected.gradient[0]},${selected.gradient[1]})`,display:'flex',alignItems:'center',justifyContent:'center'}}><selected.icon size={18} color="#fff" /></div>
          <h3 style={{fontSize:'18px',fontWeight:700,color:'var(--text-primary)',margin:0}}>{selected.name}</h3>
        </div>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
          <button style={T.actionBtn} onClick={handleBack}><RefreshCw size={14} /> Change Dataset</button>
          <button style={T.actionBtn} onClick={()=>{setStep('select');setSelected(null);setCharts([]);setKpis([]);}}><ArrowLeft size={14} /> Change Template</button>
          <button style={T.actionBtn} onClick={handleExportPdf}><Download size={14} /> Export PDF</button>
          <button style={{...T.actionBtn,background:'var(--primary)',color:'#fff',borderColor:'var(--primary)'}} onClick={handleSaveAll}>Save to Canvas</button>
        </div>
      </div>

      <div id="template-dashboard" style={{display:'flex',flexDirection:'column',gap:'20px'}}>
        {/* KPI Row */}
        {kpis.length > 0 && (
          <div style={{display:'grid',gridTemplateColumns:`repeat(${Math.min(kpis.length,5)},1fr)`,gap:'16px'}}>
            {kpis.map((kpi,i) => (
              <motion.div key={i} style={T.kpiCard} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}>
                <p style={{fontSize:'12px',fontWeight:600,color:'var(--text-tertiary)',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'0.05em'}}>{kpi.title}</p>
                <h3 style={{fontSize:'26px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 6px',letterSpacing:'-0.02em'}}>{kpi.value}</h3>
                {kpi.trend && <span style={{fontSize:'12px',fontWeight:600,color:kpi.up?'#10B981':'#EF4444',background:kpi.up?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',padding:'3px 8px',borderRadius:'6px'}}>{kpi.trend}</span>}
              </motion.div>
            ))}
          </div>
        )}
        {/* Charts Grid */}
        <div style={{display:'grid',gridTemplateColumns:charts.length>=3?'2fr 1fr':'1fr 1fr',gap:'20px'}}>
          {charts.map((chart,i) => (
            <motion.div key={chart.id} style={{...T.chartCard,gridColumn:i===0&&charts.length>=3?'span 1':'span 1'}} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2+i*0.1}}>
              <div style={T.chartHeader}>
                <h4 style={{fontSize:'14px',fontWeight:600,color:'var(--text-primary)',margin:0}}>{chart.title}</h4>
                {chart.description && <p style={{fontSize:'11px',color:'var(--text-tertiary)',margin:'2px 0 0'}}>{chart.description}</p>}
              </div>
              <div style={{height:'260px',padding:'12px'}}><RenderChart chart={chart} /></div>
            </motion.div>
          ))}
        </div>
        {charts.length===0 && !loading && <div style={{textAlign:'center',padding:'40px',color:'var(--text-tertiary)'}}>No chart data was generated. Try a different dataset.</div>}
      </div>
    </motion.div>
  );
};

const T = {
  card: { background:'var(--card)', border:'1px solid var(--border)', borderRadius:'16px', overflow:'hidden', cursor:'pointer', transition:'all 0.2s ease', boxShadow:'var(--shadow-card)' },
  useBtn: { width:'100%', padding:'10px', background:'linear-gradient(135deg,#6C63FF,#3B82F6)', color:'#fff', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' },
  datasetCard: { width:'100%', maxWidth:'520px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'20px', padding:'32px', boxShadow:'var(--shadow-card)' },
  backBtn: { display:'flex', alignItems:'center', gap:'6px', background:'transparent', border:'none', color:'var(--text-secondary)', fontSize:'13px', cursor:'pointer', marginBottom:'20px', padding:0 },
  select: { width:'100%', padding:'12px 14px', background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:'12px', color:'var(--text-primary)', fontSize:'14px', outline:'none' },
  loadBtn: { width:'100%', padding:'14px', background:'linear-gradient(135deg,#6C63FF,#3B82F6)', color:'#fff', border:'none', borderRadius:'12px', fontSize:'15px', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', boxShadow:'0 4px 16px rgba(108,99,255,0.3)' },
  viewBar: { display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px', marginBottom:'24px', padding:'16px 20px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px' },
  actionBtn: { display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--text-secondary)', fontSize:'12px', fontWeight:600, cursor:'pointer' },
  kpiCard: { background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'20px', boxShadow:'var(--shadow-card)' },
  chartCard: { background:'var(--card)', border:'1px solid var(--border)', borderRadius:'16px', overflow:'hidden', boxShadow:'var(--shadow-card)' },
  chartHeader: { padding:'14px 18px', borderBottom:'1px solid var(--border)' },
};

export default PowerBITemplates;
