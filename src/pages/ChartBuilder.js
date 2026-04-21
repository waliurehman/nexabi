import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, ScatterChart, Scatter, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Maximize2, Download, Image as ImageIcon, Plus, Trash2, Settings2, Database, Sparkles, Share2, LayoutDashboard, Copy, CheckCircle, BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react';
import html2canvas from 'html2canvas';

const pageV = { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.4 } }, exit: { opacity: 0 } };

const CHART_TYPES = [
  { id: 'bar', label: 'Bar', icon: BarChartIcon },
  { id: 'line', label: 'Line', icon: LineChartIcon },
  { id: 'area', label: 'Area', icon: LineChartIcon },
  { id: 'pie', label: 'Pie', icon: PieChartIcon },
  { id: 'donut', label: 'Donut', icon: PieChartIcon },
  { id: 'scatter', label: 'Scatter', icon: BarChartIcon },
];

const THEMES = [
  { id: 'purple', colors: ['#6C63FF', '#8B83FF', '#A39DFF', '#C2BEFF'] },
  { id: 'blue', colors: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'] },
  { id: 'green', colors: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'] },
  { id: 'orange', colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'] },
];

const INITIAL_DATA = [
  { name: 'Jan', value: 400, value2: 240 },
  { name: 'Feb', value: 300, value2: 139 },
  { name: 'Mar', value: 200, value2: 980 },
  { name: 'Apr', value: 278, value2: 390 },
  { name: 'May', value: 189, value2: 480 },
  { name: 'Jun', value: 239, value2: 380 },
];

const SYSTEM_PROMPT = `You are a data generater for a chart builder tool. The user will ask you to generate some sample data.
Return ONLY valid JSON in this format, and absolutely nothing else:
[{"name": "label1", "value": 10}, {"name": "label2", "value": 20}]
Ensure the data matches the user's prompt (e.g. 6 months, 4 categories, etc). Do NOT wrap the JSON in markdown code blocks, just raw JSON text.`;

const ChartBuilder = () => {
  const [chartType, setChartType] = useState('bar');
  const [theme, setTheme] = useState(THEMES[0]);
  const [title, setTitle] = useState('Sample Chart Overview');
  const [xAxisLabel, setXAxisLabel] = useState('Months');
  const [yAxisLabel, setYAxisLabel] = useState('Revenue ($)');
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [showTooltip, setShowTooltip] = useState(true);

  const [data, setData] = useState(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState('manual');
  
  const [csvInput, setCsvInput] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartRef = useRef(null);

  const handleDownloadPng = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current, { backgroundColor: '#0B0D17' }); // Dark mode fallback or transparent
      const link = document.createElement('a');
      link.download = 'chart.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const parseCsv = () => {
    try {
      const rows = csvInput.split('\\n').filter(r => r.trim());
      const headers = rows[0].split(',').map(h => h.trim());
      const parsedData = rows.slice(1).map(row => {
        const values = row.split(',').map(v => v.trim());
        let obj = {};
        headers.forEach((h, i) => {
          obj[h] = isNaN(values[i]) ? values[i] : Number(values[i]);
        });
        return obj;
      });
      if (parsedData.length > 0) setData(parsedData);
    } catch (e) {
      alert("Invalid CSV format. Please ensure header row and comma separation.");
    }
  };

  const handleAiGenerate = async () => {
    const apiKey = process.env.REACT_APP_GROQ_KEY;
    if (!apiKey) {
      setAiError("Groq API Key is not configured. Please add REACT_APP_GROQ_KEY to your .env file.");
      return;
    }
    if (!aiPrompt) return;

    setIsAiLoading(true);
    setAiError('');
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: aiPrompt }
          ],
          max_tokens: 1024,
        })
      });
      
      const resData = await response.json();
      let text = resData.choices[0]?.message?.content || '';
      
      // Clean up markdown quotes if model ignored instructions
      text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setData(parsed);
        setAiPrompt('');
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error(err);
      setAiError("Failed to generate data. Check your prompt or API key.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleUpdateManualData = (index, field, val) => {
    const newData = [...data];
    newData[index][field] = isNaN(val) ? val : Number(val);
    setData(newData);
  };

  const handleAddRow = () => {
    setData([...data, { name: `Item ${data.length + 1}`, value: 0, value2: 0 }]);
  };

  const handleDeleteRow = (index) => {
    setData(data.filter((_, i) => i !== index));
  };

  // Dynamically get data keys (excluding the first one which is usually string 'name')
  const dataKeys = Object.keys(data[0] || {}).filter(k => k !== 'name');

  const renderChart = () => {
    if (!data || !data.length) return <div>No data</div>;
    
    const commonProps = { data, margin: { top: 20, right: 30, left: 20, bottom: 20 } };
    
    const XAx = () => <XAxis dataKey="name" stroke="var(--chart-text)" tick={{fontSize:12,fill:'var(--chart-text)'}} label={{ value: xAxisLabel, position: 'insideBottom', offset: -10, fill: 'var(--text-secondary)', fontSize: 13 }} />;
    const YAx = () => <YAxis stroke="var(--chart-text)" tick={{fontSize:12,fill:'var(--chart-text)'}} label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', offset: 0, fill: 'var(--text-secondary)', fontSize: 13 }} />;
    const Tooltip = () => showTooltip ? <RechartsTooltip contentStyle={{background:'var(--tooltip-bg)', border:'1px solid var(--tooltip-border)', borderRadius:'8px', color: 'var(--text-primary)'}} /> : null;
    const Grid = () => showGrid ? <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} /> : null;
    const Lgnd = () => showLegend ? <Legend wrapperStyle={{paddingTop:'20px'}} /> : null;

    let chartEl = null;

    if (chartType === 'bar') {
      chartEl = (
        <BarChart {...commonProps}>
          <Grid /> <XAx /> <YAx /> <Tooltip /> <Lgnd />
          {dataKeys.map((k, i) => <Bar key={k} dataKey={k} fill={theme.colors[i % theme.colors.length]} radius={[4,4,0,0]} />)}
        </BarChart>
      );
    } else if (chartType === 'line') {
      chartEl = (
        <LineChart {...commonProps}>
          <Grid /> <XAx /> <YAx /> <Tooltip /> <Lgnd />
          {dataKeys.map((k, i) => <Line key={k} type="monotone" dataKey={k} stroke={theme.colors[i % theme.colors.length]} strokeWidth={3} dot={{r:4}} />)}
        </LineChart>
      );
    } else if (chartType === 'area') {
      chartEl = (
        <AreaChart {...commonProps}>
          <Grid /> <XAx /> <YAx /> <Tooltip /> <Lgnd />
          {dataKeys.map((k, i) => <Area key={k} type="monotone" dataKey={k} fill={theme.colors[i % theme.colors.length]} stroke={theme.colors[i % theme.colors.length]} strokeWidth={2} fillOpacity={0.3} />)}
        </AreaChart>
      );
    } else if (chartType === 'pie' || chartType === 'donut') {
      chartEl = (
        <PieChart>
          <Tooltip /> <Lgnd />
          <Pie data={data} cx="50%" cy="50%" innerRadius={chartType === 'donut' ? 60 : 0} outerRadius={100} dataKey={dataKeys[0]} nameKey="name" paddingAngle={chartType === 'donut' ? 5 : 0}>
            {data.map((_, index) => <Cell key={`cell-${index}`} fill={theme.colors[index % theme.colors.length]} />)}
          </Pie>
        </PieChart>
      );
    } else if (chartType === 'scatter') {
      chartEl = (
        <ScatterChart {...commonProps}>
          <Grid />
          <XAxis type="category" dataKey="name" name="Name" stroke="var(--chart-text)" />
          <YAxis type="number" dataKey={dataKeys[0]} name={yAxisLabel} stroke="var(--chart-text)" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} /> <Lgnd />
          {dataKeys.map((k, i) => <Scatter key={k} name={k} data={data} fill={theme.colors[i % theme.colors.length]} />)}
        </ScatterChart>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={isFullscreen ? "90%" : 350}>
        {chartEl}
      </ResponsiveContainer>
    );
  };

  return (
    <motion.div style={S.page} variants={pageV} initial="initial" animate="animate" exit="exit">
      
      <div style={S.header}>
        <div><h1 style={S.title}>Chart Builder</h1><p style={S.subtitle}>Design, customize, and export stunning visualizations</p></div>
        <div style={{display:'flex', gap:'10px'}}>
          <motion.button style={S.btnSecondary} whileHover={{scale:1.02}}><Share2 size={16}/> Share</motion.button>
          <motion.button style={S.btnPrimary} whileHover={{scale:1.02}}><LayoutDashboard size={16}/> Add to Dashboard</motion.button>
        </div>
      </div>

      <div style={S.workspace}>
        {/* LEFT PANEL */}
        <div style={S.panel}>
          <h3 style={S.panelTitle}><Settings2 size={18}/> Chart Settings</h3>
          
          <div style={S.section}>
            <label style={S.label}>Chart Type</label>
            <div style={S.typeGrid}>
              {CHART_TYPES.map(t => (
                <div key={t.id} style={{...S.typeCard, ...(chartType===t.id ? S.typeCardActive : {})}} onClick={() => setChartType(t.id)}>
                  <t.icon size={20}/>
                  <span>{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={S.section}>
            <label style={S.label}>Color Theme</label>
            <div style={{display:'flex', gap:'10px'}}>
              {THEMES.map(th => (
                <div key={th.id} onClick={() => setTheme(th)} style={{...S.themeSwatchWrap, ...(theme.id === th.id ? S.themeSwatchActive : {})}}>
                  <div style={{...S.themeSwatch, background: th.colors[0]}} />
                </div>
              ))}
            </div>
          </div>

          <div style={S.section}>
            <label style={S.label}>Chart Title</label>
            <input type="text" value={title} onChange={(e)=>setTitle(e.target.value)} style={S.input} />
          </div>

          <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
            <div style={{flex:1}}>
              <label style={S.label}>X-Axis Label</label>
              <input type="text" value={xAxisLabel} onChange={(e)=>setXAxisLabel(e.target.value)} style={S.input} />
            </div>
            <div style={{flex:1}}>
              <label style={S.label}>Y-Axis Label</label>
              <input type="text" value={yAxisLabel} onChange={(e)=>setYAxisLabel(e.target.value)} style={S.input} />
            </div>
          </div>

          <div style={S.section}>
            <label style={S.label}>Toggles</label>
            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
              {[{lbl: 'Show Grid', val: showGrid, set: setShowGrid}, {lbl: 'Show Legend', val: showLegend, set: setShowLegend}, {lbl: 'Show Tooltip', val: showTooltip, set: setShowTooltip}].map(tg => (
                <label key={tg.lbl} style={{display:'flex', alignItems:'center', gap:'10px', fontSize:'13px', color:'var(--text-secondary)', cursor:'pointer'}}>
                  <input type="checkbox" checked={tg.val} onChange={(e)=>tg.set(e.target.checked)} style={{cursor:'pointer'}} />
                  {tg.lbl}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER PANEL */}
        <div style={S.centerArea}>
          <div style={{...S.previewCard, ...(isFullscreen ? S.previewOverlay : {})}} ref={chartRef}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:'16px', borderBottom: isFullscreen ? 'none' : '1px solid var(--border)'}}>
              <h2 style={{fontSize: isFullscreen ? '28px' : '20px', fontWeight:700, color:'var(--text-primary)'}}>{title}</h2>
              <button style={S.iconBtn} onClick={() => setIsFullscreen(!isFullscreen)}>
                <Maximize2 size={18} color="var(--text-tertiary)" />
              </button>
            </div>
            <div style={{padding:'20px 0', height:'100%', minHeight:'350px'}}>
              {renderChart()}
            </div>
          </div>

          {!isFullscreen && (
            <div style={S.toolbar}>
              <button style={S.toolbarBtn} onClick={handleDownloadPng}><ImageIcon size={16}/> Download PNG</button>
              <button style={S.toolbarBtn} onClick={() => alert("SVG Download requires full Recharts DOM serialization setup.")}><Download size={16}/> Download SVG</button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div style={S.panel}>
          <h3 style={S.panelTitle}><Database size={18}/> Data Input</h3>
          <div style={S.tabs}>
            {['manual', 'csv', 'ai'].map(tb => (
              <button key={tb} style={{...S.tabBtn, ...(activeTab===tb ? S.tabBtnActive : {})}} onClick={()=>setActiveTab(tb)}>
                {tb==='manual'?'Manual':tb==='csv'?'CSV':'Ask AI'}
              </button>
            ))}
          </div>

          <div style={{flex:1, overflowY:'auto'}}>
            {activeTab === 'manual' && (
              <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:'8px', fontWeight:600, fontSize:'12px', color:'var(--text-tertiary)', padding:'0 5px'}}>
                  <span>Name (X)</span><span>Value 1 (Y)</span><span></span>
                </div>
                {data.map((row, i) => (
                  <div key={i} style={{display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:'8px'}}>
                    <input type="text" value={row.name} onChange={(e)=>handleUpdateManualData(i, 'name', e.target.value)} style={S.tableInput}/>
                    {dataKeys.slice(0,1).map(k => (
                      <input key={k} type="text" value={row[k]} onChange={(e)=>handleUpdateManualData(i, k, e.target.value)} style={S.tableInput}/>
                    ))}
                    <button style={S.iconBtn} onClick={()=>handleDeleteRow(i)}><Trash2 size={14} color="var(--danger)"/></button>
                  </div>
                ))}
                <button style={{...S.btnSecondary, marginTop:'10px', justifyContent:'center'}} onClick={handleAddRow}><Plus size={14}/> Add Row</button>
              </div>
            )}

            {activeTab === 'csv' && (
              <div style={{display:'flex', flexDirection:'column', gap:'10px', height:'100%'}}>
                <textarea 
                  placeholder="Paste CSV here...\\nname, value\\nJan, 120\\nFeb, 240" 
                  value={csvInput} onChange={(e)=>setCsvInput(e.target.value)} 
                  style={{...S.input, height:'200px', resize:'none', fontFamily:'monospace'}} 
                />
                <button style={{...S.btnPrimary, justifyContent:'center'}} onClick={parseCsv}>Parse CSV</button>
              </div>
            )}

            {activeTab === 'ai' && (
              <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                <div style={S.aiAlert}>
                  <Sparkles size={16} color="var(--primary)" />
                  Generate dummy data with Groq AI.
                </div>
                <textarea 
                  placeholder="e.g. Generate 5 months of marketing spend data" 
                  value={aiPrompt} onChange={(e)=>setAiPrompt(e.target.value)} 
                  style={{...S.input, height:'120px', resize:'none'}} 
                />
                {aiError && <span style={{fontSize:'12px', color:'var(--danger)'}}>{aiError}</span>}
                <button style={{...S.btnPrimary, justifyContent:'center'}} onClick={handleAiGenerate} disabled={isAiLoading || !aiPrompt}>
                  {isAiLoading ? "Generating..." : <><Sparkles size={16}/> Generate Data</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const S = {
  page: { height: 'calc(100vh - var(--topbar-height))', padding: '24px 32px', display:'flex', flexDirection:'column' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' },
  title: { fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' },
  subtitle: { fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' },
  btnPrimary: { background:'linear-gradient(135deg,#6C63FF,#3B82F6)', color:'#fff', border:'none', borderRadius:'10px', padding:'10px 18px', fontSize:'13px', fontWeight:600, display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', boxShadow:'0 4px 12px rgba(108,99,255,0.25)' },
  btnSecondary: { background:'var(--card)', color:'var(--text-primary)', border:'1px solid var(--border)', borderRadius:'10px', padding:'10px 18px', fontSize:'13px', fontWeight:600, display:'flex', alignItems:'center', gap:'8px', cursor:'pointer' },
  
  workspace: { display:'flex', gap:'20px', flex:1, overflow:'hidden', minHeight:0 },
  
  panel: { width:'320px', background:'var(--card)', borderRadius:'16px', border:'1px solid var(--border)', padding:'20px', display:'flex', flexDirection:'column', overflowY:'auto' },
  panelTitle: { fontSize:'16px', fontWeight:700, color:'var(--text-primary)', marginBottom:'20px', display:'flex', alignItems:'center', gap:'8px', borderBottom:'1px solid var(--border)', paddingBottom:'12px' },
  
  section: { marginBottom:'20px' },
  label: { display:'block', fontSize:'13px', fontWeight:600, color:'var(--text-secondary)', marginBottom:'8px' },
  
  typeGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' },
  typeCard: { display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', padding:'12px', borderRadius:'10px', background:'var(--input-bg)', border:'1px solid var(--border)', cursor:'pointer', color:'var(--text-secondary)', fontSize:'12px', fontWeight:600 },
  typeCardActive: { background:'rgba(108,99,255,0.1)', borderColor:'var(--primary)', color:'var(--primary)' },
  
  themeSwatchWrap: { width:'32px', height:'32px', borderRadius:'8px', padding:'3px', border:'2px solid transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  themeSwatchActive: { borderColor:'var(--primary)' },
  themeSwatch: { width:'100%', height:'100%', borderRadius:'6px' },
  
  input: { width:'100%', background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:'10px', padding:'10px 14px', fontSize:'14px', color:'var(--text-primary)', outline:'none' },
  
  tabs: { display:'flex', background:'var(--input-bg)', padding:'4px', borderRadius:'10px', marginBottom:'16px' },
  tabBtn: { flex:1, padding:'8px', border:'none', background:'transparent', borderRadius:'8px', fontSize:'13px', fontWeight:600, color:'var(--text-secondary)', cursor:'pointer' },
  tabBtnActive: { background:'var(--card)', color:'var(--text-primary)', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  
  tableInput: { width:'100%', background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:'6px', padding:'6px 10px', fontSize:'13px', color:'var(--text-primary)', outline:'none' },
  iconBtn: { padding:'6px', background:'transparent', border:'none', borderRadius:'6px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-tertiary)' },
  
  aiAlert: { background:'rgba(108,99,255,0.05)', border:'1px dashed var(--primary)', borderRadius:'10px', padding:'12px', fontSize:'12px', color:'var(--text-primary)', display:'flex', gap:'8px', alignItems:'flex-start', lineHeight:1.5 },
  
  centerArea: { flex:1, display:'flex', flexDirection:'column', gap:'16px', minWidth:0 },
  previewCard: { flex:1, background:'var(--card)', borderRadius:'16px', border:'1px solid var(--border)', padding:'24px', display:'flex', flexDirection:'column', boxShadow:'var(--shadow-card)', transition:'all 0.3s ease' },
  previewOverlay: { position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:1000, margin:0, borderRadius:0, padding:'40px' },
  
  toolbar: { display:'flex', gap:'10px', justifyContent:'center' },
  toolbarBtn: { display:'flex', alignItems:'center', gap:'8px', padding:'10px 20px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'10px', fontSize:'13px', fontWeight:600, color:'var(--text-secondary)', cursor:'pointer' },
};

export default ChartBuilder;
