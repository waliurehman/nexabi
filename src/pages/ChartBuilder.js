import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, ScatterChart, Scatter,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Download, Image as ImageIcon, Trash2, Settings2, Database,
  Sparkles, LayoutDashboard, Copy, CheckCircle, BarChart as BarChartIcon,
  LineChart as LineChartIcon, PieChart as PieChartIcon, SquarePlus,
  Loader2, X, Wand2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ResponsiveGridLayout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useAuth } from '../context/AuthContext';
import { getDatasets } from '../api/files';
import { askQuery } from '../api/queries';
import AutoAnalyze from '../components/AutoAnalyze';
import PowerBITemplates from '../components/PowerBITemplates';

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

const DEFAULT_DATA = [
  { name: 'Jan', value: 400, value2: 240 },
  { name: 'Feb', value: 300, value2: 139 },
  { name: 'Mar', value: 200, value2: 980 },
  { name: 'Apr', value: 278, value2: 390 },
  { name: 'May', value: 189, value2: 480 },
  { name: 'Jun', value: 239, value2: 380 },
];

const DEFAULT_STYLE = {
  bg: 'white',
  radius: 12,
  fontSize: 'medium',
  legendPos: 'bottom',
  showLegend: true,
  showGrid: true,
  showTooltip: true,
  animate: true,
};

const STORAGE_KEYS = { autosave: 'nexabi_canvas_autosave', saved: 'nexabi_saved_dashboards' };

const SYSTEM_PROMPT = `You are NexaBI AI Chart Builder.
Return ONLY CHART_DATA in this exact format:
{CHART_DATA: {
  "type": "bar"|"line"|"area"|"pie"|"donut"|"scatter",
  "title": "title",
  "description": "insight",
  "colors": ["#6C63FF"],
  "data": [{"name":"A","value":10}],
  "xKey": "name",
  "yKey": "value"
}}
No extra text, no markdown.`;

const quickPrompts = [
  'Revenue trend',
  'Top categories',
  'Compare months',
  'Distribution breakdown',
];

const buildChartFromData = (chartData) => {
  const id = `chart-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const type = chartData?.type || 'bar';
  return {
    id,
    title: chartData?.title || 'Untitled Chart',
    description: chartData?.description || '',
    type,
    data: Array.isArray(chartData?.data) ? chartData.data : DEFAULT_DATA,
    xKey: chartData?.xKey || 'name',
    yKey: chartData?.yKey || 'value',
    colors: chartData?.colors?.length ? chartData.colors : THEMES[0].colors,
    style: { ...DEFAULT_STYLE },
    layout: { x: 0, y: Infinity, w: 6, h: 8 },
  };
};

const TAB_ITEMS = [
  { id: 'manual', label: 'Manual Builder', icon: PieChartIcon },
  { id: 'auto', label: 'AI Auto Analyze', icon: Sparkles },
  { id: 'templates', label: 'Power BI Templates', icon: LayoutDashboard },
];

const ChartBuilder = () => {
  const { token } = useAuth();
  const canvasRef = useRef(null);

  const [activeTab, setActiveTab] = useState('manual');
  const [canvasName, setCanvasName] = useState('My Canvas');
  const [charts, setCharts] = useState([]);
  const [selectedChartId, setSelectedChartId] = useState(null);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedDashboards, setSavedDashboards] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState('');

  useEffect(() => {
    const autosaved = localStorage.getItem(STORAGE_KEYS.autosave);
    if (autosaved) {
      try {
        const parsed = JSON.parse(autosaved);
        setCanvasName(parsed.canvasName || 'My Canvas');
        setCharts(parsed.charts || []);
        setSelectedChartId(parsed.selectedChartId || null);
      } catch (err) {}
    }

    const saved = localStorage.getItem(STORAGE_KEYS.saved);
    if (saved) {
      try { setSavedDashboards(JSON.parse(saved)); } catch (err) {}
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem(STORAGE_KEYS.autosave, JSON.stringify({ canvasName, charts, selectedChartId }));
    }, 30000);
    return () => clearInterval(interval);
  }, [canvasName, charts, selectedChartId]);

  useEffect(() => {
    const fetchDatasets = async () => {
      if (!token) return;
      try {
        const dataSets = await getDatasets(token);
        setDatasets(dataSets || []);
      } catch (err) {}
    };
    fetchDatasets();
  }, [token]);

  const selectedChart = charts.find(c => c.id === selectedChartId);

  const layout = useMemo(() => charts.map(chart => ({
    i: chart.id,
    x: chart.layout?.x ?? 0,
    y: chart.layout?.y ?? Infinity,
    w: chart.layout?.w ?? 6,
    h: chart.layout?.h ?? 8,
    minW: 3,
    minH: 6,
  })), [charts]);

  const updateLayout = (nextLayout) => {
    setCharts(prev => prev.map(chart => {
      const updated = nextLayout.find(l => l.i === chart.id);
      if (!updated) return chart;
      return { ...chart, layout: { ...chart.layout, x: updated.x, y: updated.y, w: updated.w, h: updated.h } };
    }));
  };

  const parseJsonLike = (raw) => {
    if (!raw || typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    try {
      const parsed = JSON.parse(trimmed);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (err) {
      const normalized = trimmed.replace(/'/g, '"').replace(/\b([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '"$1":');
      try { return JSON.parse(normalized); } catch (e) { return null; }
    }
  };

  const extractChartData = (text) => {
    if (!text) return null;
    const match = text.match(/\{\s*CHART_DATA\s*:\s*(\{[\s\S]*?\})\s*\}/);
    if (match) return parseJsonLike(match[1]);
    const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
    if (fenced) {
      const parsed = parseJsonLike(fenced[1]);
      if (parsed?.CHART_DATA) return parsed.CHART_DATA;
      return parsed;
    }
    return null;
  };

  const shouldApplyToSelected = (prompt) => {
    if (!selectedChartId) return false;
    return /(this chart|selected chart|this one|update it|change it|make it)/i.test(prompt);
  };

  const handleAddChart = (chartData) => {
    const newChart = buildChartFromData(chartData || {});
    setCharts(prev => [...prev, newChart]);
    setSelectedChartId(newChart.id);
  };

  const handleUpdateSelected = (chartData) => {
    if (!selectedChartId) return;
    setCharts(prev => prev.map(chart => chart.id === selectedChartId ? {
      ...chart,
      title: chartData?.title || chart.title,
      description: chartData?.description || chart.description,
      type: chartData?.type || chart.type,
      data: Array.isArray(chartData?.data) ? chartData.data : chart.data,
      xKey: chartData?.xKey || chart.xKey,
      yKey: chartData?.yKey || chart.yKey,
      colors: chartData?.colors?.length ? chartData.colors : chart.colors,
    } : chart));
  };

  const handleAiSend = async () => {
    if (!aiInput.trim()) return;
    if (!token) { setAiError('Please sign in to use AI.'); return; }
    setIsAiLoading(true); setAiError('');

    const nextMessage = { id: `msg-${Date.now()}`, prompt: aiInput.trim(), response: '', chartData: null, createdAt: new Date().toISOString() };
    setAiMessages(prev => [nextMessage, ...prev]);

    const apiKey = localStorage.getItem('groq_key') || process.env.REACT_APP_GROQ_API_KEY;
    const conversationHistory = aiMessages.map(m => ([{ role: 'user', content: m.prompt }, { role: 'assistant', content: m.response || '' }])).flat();

    try {
      const result = await askQuery(`${aiInput}\n\n${SYSTEM_PROMPT}`, apiKey || null, selectedDatasetId || null, token, 'groq', conversationHistory);
      const aiResponse = result?.response || '';
      const chartData = extractChartData(aiResponse);

      setAiMessages(prev => prev.map(m => m.id === nextMessage.id ? { ...m, response: aiResponse, chartData } : m));
      if (chartData) {
        if (shouldApplyToSelected(aiInput)) handleUpdateSelected(chartData);
        else handleAddChart(chartData);
      }
      setAiInput('');
    } catch (err) {
      setAiError('Failed to generate chart. Try a different prompt.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDuplicateChart = (chart) => {
    const clone = { ...chart, id: `chart-${Date.now()}`, layout: { ...chart.layout, y: Infinity } };
    setCharts(prev => [...prev, clone]);
    setSelectedChartId(clone.id);
  };

  const handleDeleteChart = (chartId) => {
    setCharts(prev => prev.filter(c => c.id !== chartId));
    if (selectedChartId === chartId) setSelectedChartId(null);
  };

  const updateSelectedStyle = (updates) => {
    if (!selectedChartId) return;
    setCharts(prev => prev.map(chart => chart.id === selectedChartId ? { ...chart, style: { ...chart.style, ...updates } } : chart));
  };

  const updateSelectedColors = (index, color) => {
    if (!selectedChartId) return;
    setCharts(prev => prev.map(chart => {
      if (chart.id !== selectedChartId) return chart;
      const nextColors = [...chart.colors];
      nextColors[index] = color;
      return { ...chart, colors: nextColors };
    }));
  };

  const handleDownloadChartPng = async (chartId, title) => {
    const el = document.getElementById(chartId);
    if (!el) return;
    const canvas = await html2canvas(el, { backgroundColor: '#ffffff', scale: 2 });
    const link = document.createElement('a');
    link.download = `${title || 'chart'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleExportAllPdf = async () => {
    if (!canvasRef.current) return;
    const canvas = await html2canvas(canvasRef.current, { backgroundColor: '#111827', scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${canvasName}.pdf`);
  };

  const handleSaveDashboard = () => {
    const payload = { id: `dash-${Date.now()}`, name: canvasName, canvasName, charts, savedAt: new Date().toISOString() };
    const next = [payload, ...savedDashboards];
    setSavedDashboards(next);
    localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(next));
    alert('Layout saved successfully!');
  };

  const handleLoadDashboard = (dashboard) => {
    if (!dashboard) return;
    setCanvasName(dashboard.canvasName || dashboard.name || 'My Canvas');
    setCharts(dashboard.charts || []);
    setSelectedChartId(null);
    setShowLoadModal(false);
  };

  const renderChart = (chart) => {
    if (!chart.data || !chart.data.length) return <div style={S.emptyChart}>No data</div>;
    const dataKeys = Object.keys(chart.data[0] || {}).filter(k => k !== chart.xKey);
    const primaryYKey = chart.yKey || dataKeys[0] || 'value';
    const fontSize = chart.style.fontSize === 'small' ? 11 : chart.style.fontSize === 'large' ? 14 : 12;
    const commonProps = { data: chart.data, margin: { top: 10, right: 20, left: 0, bottom: 10 } };
    const grid = chart.style.showGrid ? <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} /> : null;
    const tooltip = chart.style.showTooltip ? <RechartsTooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827' }} /> : null;
    const legend = chart.style.showLegend ? <Legend verticalAlign={chart.style.legendPos} /> : null;
    const fontColor = '#4b5563';

    if (chart.type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart {...commonProps}>
            {grid}
            <XAxis dataKey={chart.xKey} tick={{ fontSize, fill: fontColor }} />
            <YAxis tick={{ fontSize, fill: fontColor }} />
            {tooltip}
            {legend}
            {dataKeys.map((k, i) => (
              <Bar key={k} dataKey={k} fill={chart.colors[i % chart.colors.length]} radius={[chart.style.radius, chart.style.radius, 0, 0]} isAnimationActive={chart.style.animate} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }
    if (chart.type === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart {...commonProps}>
            {grid}
            <XAxis dataKey={chart.xKey} tick={{ fontSize, fill: fontColor }} />
            <YAxis tick={{ fontSize, fill: fontColor }} />
            {tooltip}
            {legend}
            {dataKeys.map((k, i) => (
              <Line key={k} type="monotone" dataKey={k} stroke={chart.colors[i % chart.colors.length]} strokeWidth={3} dot={{ r: 4 }} isAnimationActive={chart.style.animate} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }
    if (chart.type === 'area') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart {...commonProps}>
            {grid}
            <XAxis dataKey={chart.xKey} tick={{ fontSize, fill: fontColor }} />
            <YAxis tick={{ fontSize, fill: fontColor }} />
            {tooltip}
            {legend}
            {dataKeys.map((k, i) => (
              <Area key={k} type="monotone" dataKey={k} stroke={chart.colors[i % chart.colors.length]} fill={chart.colors[i % chart.colors.length]} fillOpacity={0.25} isAnimationActive={chart.style.animate} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      );
    }
    if (chart.type === 'pie' || chart.type === 'donut') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {tooltip}
            {legend}
            <Pie data={chart.data} dataKey={primaryYKey} nameKey={chart.xKey} cx="50%" cy="50%" innerRadius={chart.type === 'donut' ? 55 : 0} outerRadius={90} paddingAngle={4} isAnimationActive={chart.style.animate}>
              {chart.data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={chart.colors[index % chart.colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );
    }
    if (chart.type === 'scatter') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart {...commonProps}>
            {grid}
            <XAxis type="category" dataKey={chart.xKey} name={chart.xKey} stroke={fontColor} />
            <YAxis type="number" dataKey={primaryYKey} name={chart.yKey} stroke={fontColor} />
            {tooltip}
            {legend}
            <Scatter name={chart.title} data={chart.data} fill={chart.colors[0]} />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }
    return <div style={S.emptyChart}>Unsupported chart</div>;
  };

  const handleAddFromExternal = (chartData) => {
    const id = `chart-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newChart = {
      id,
      title: chartData.title || 'Untitled Chart',
      description: chartData.description || '',
      type: chartData.type || 'bar',
      data: Array.isArray(chartData.data) ? chartData.data : [],
      xKey: chartData.xKey || 'name',
      yKey: chartData.yKey || 'value',
      colors: chartData.colors?.length ? chartData.colors : ['#6C63FF','#3B82F6','#10B981','#F59E0B'],
      style: { bg:'white', radius:12, fontSize:'medium', legendPos:'bottom', showLegend:true, showGrid:true, showTooltip:true, animate:true },
      layout: { x: 0, y: Infinity, w: 6, h: 8 },
    };
    setCharts(prev => [...prev, newChart]);
    setSelectedChartId(newChart.id);
    setActiveTab('manual');
  };

  return (
    <motion.div style={S.page} variants={pageV} initial="initial" animate="animate" exit="exit">
      {/* TAB SWITCHER */}
      <div style={S.tabBar}>
        {TAB_ITEMS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              style={{...S.tabBtn, ...(isActive ? S.tabBtnActive : {})}}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon size={16} />
              {tab.label}
              {isActive && <motion.div layoutId="tabIndicator" style={S.tabIndicator} />}
            </motion.button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
      {activeTab === 'auto' && (
        <AutoAnalyze key="auto" datasets={datasets} token={token} onAddToCanvas={handleAddFromExternal} />
      )}
      {activeTab === 'templates' && (
        <PowerBITemplates key="templates" datasets={datasets} token={token} onAddToCanvas={handleAddFromExternal} onSwitchToManual={() => setActiveTab('manual')} />
      )}
      {activeTab === 'manual' && (
      <motion.div key="manual" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} transition={{duration:0.3}} style={{flex:1,display:'flex',flexDirection:'column',gap:'16px',minHeight:0}}>
      <div style={S.toolbar}>
        <input
          value={canvasName}
          onChange={(e) => setCanvasName(e.target.value)}
          style={S.canvasNameInput}
        />
        <div style={S.toolbarActions}>
          <button style={S.toolbarBtn} onClick={handleExportAllPdf}><Download size={16} /> Export All PDF</button>
          <button style={S.toolbarBtn} onClick={() => setShowLoadModal(true)}><LayoutDashboard size={16} /> Load Layout</button>
          <button style={S.primaryBtn} onClick={handleSaveDashboard}><CheckCircle size={16} /> Save Layout</button>
          <button style={S.dangerBtn} onClick={() => setCharts([])}><Trash2 size={16} /> Clear Canvas</button>
        </div>
      </div>

      <div style={S.layout}>
        {/* LEFT PANEL: AI CHAT */}
        <div style={S.leftPanel}>
          <div style={S.panelHeader}><Sparkles size={18} color="var(--primary)"/> AI Chart Studio</div>
          <div style={S.datasetRow}>
            <Database size={16} color="var(--text-tertiary)" />
            <select value={selectedDatasetId} onChange={(e) => setSelectedDatasetId(e.target.value)} style={S.selectInput}>
              <option value="">Use dataset (optional)</option>
              {datasets.map(ds => (
                <option key={ds.id} value={ds.id}>{ds.name || ds.filename}</option>
              ))}
            </select>
          </div>

          <div style={S.chatInputWrap}>
            <textarea
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Describe the chart you want..."
              style={S.chatInput}
            />
            <button style={S.primaryBtnFull} onClick={handleAiSend} disabled={isAiLoading}>
              {isAiLoading ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} Generate
            </button>
            {aiError && <div style={S.errorText}>{aiError}</div>}
          </div>

          <div style={S.chipsRow}>
            {quickPrompts.map((chip) => (
              <button key={chip} style={S.chip} onClick={() => setAiInput(chip)}>{chip}</button>
            ))}
          </div>

          <div style={S.chatHistory}>
            {aiMessages.length === 0 && (
              <div style={S.emptyChat}>Ask AI to create a chart</div>
            )}
            {aiMessages.map(msg => (
              <div key={msg.id} style={S.chatCard}>
                <div style={S.chatPrompt}>{msg.prompt}</div>
                {msg.chartData ? (
                  <div style={S.chatActions}>
                    <button style={S.chatActionBtn} onClick={() => handleAddChart(msg.chartData)}><SquarePlus size={14} /> Add to Canvas</button>
                  </div>
                ) : (
                  <div style={S.chatHint}>No chart data found.</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CENTER PANEL: CANVAS */}
        <div style={S.centerPanel} onClick={(e) => { if (e.target === e.currentTarget) setSelectedChartId(null); }}>
          <div style={S.canvasHeader}><PieChartIcon size={18} /> Chart Canvas</div>
          <div style={S.canvasWrap} ref={canvasRef} onClick={(e) => { if (e.target === e.currentTarget) setSelectedChartId(null); }}>
            {charts.length === 0 && (
              <div style={S.canvasEmpty}>
                <PieChartIcon size={32} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '16px' }} />
                <h3 style={{ color: '#fff' }}>Generate a chart to get started</h3>
                <p style={{ color: '#9ca3af', marginTop: '8px' }}>Use the AI Chart Studio on the left to build visuals.</p>
              </div>
            )}
            {charts.length > 0 && (
              <ResponsiveGridLayout
                className="layout"
                layouts={{ lg: layout }}
                onLayoutChange={updateLayout}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={40}
                draggableHandle=".chart-drag-handle"
                isResizable
                margin={[20, 20]}
              >
                {charts.map(chart => (
                  <div key={chart.id} className={`chart-card ${selectedChartId === chart.id ? 'selected' : ''}`} style={S.chartWrapper}>
                    <div style={S.chartInner} onClick={(e) => { e.stopPropagation(); setSelectedChartId(chart.id); }}>
                      <div className="chart-drag-handle" style={S.chartHeader}>
                        <div style={S.chartTitleWrap}>
                          <h4 style={S.chartTitleText}>{chart.title}</h4>
                          {chart.description && <p style={S.chartDescText}>{chart.description}</p>}
                        </div>
                        <div style={S.chartActionsBar}>
                          <button style={S.iconBtn} onClick={(e) => { e.stopPropagation(); handleDuplicateChart(chart); }}><Copy size={14} /></button>
                          <button style={S.iconBtn} onClick={(e) => { e.stopPropagation(); handleDeleteChart(chart.id); }}><Trash2 size={14} color="#ef4444" /></button>
                        </div>
                      </div>
                      <div id={chart.id} style={{ ...S.chartBody, background: chart.style.bg, borderRadius: chart.style.radius }}>
                        {renderChart(chart)}
                      </div>
                    </div>
                  </div>
                ))}
              </ResponsiveGridLayout>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: STYLE EDITOR */}
        <div style={S.rightPanel}>
          <div style={S.panelHeader}><Settings2 size={18} color="var(--text-primary)" /> Customize</div>
          {!selectedChart && <div style={S.emptyEditor}>Select a chart on the canvas to customize it</div>}
          {selectedChart && (
            <div style={S.editorBody}>
              <button style={S.primaryBtnFull} onClick={() => handleDownloadChartPng(selectedChart.id, selectedChart.title)}>
                <ImageIcon size={16} /> Download PNG
              </button>

              <div style={S.section}>
                <label style={S.label}>Chart Title</label>
                <input value={selectedChart.title} onChange={(e) => handleUpdateSelected({ title: e.target.value })} style={S.input} />
              </div>

              <div style={S.section}>
                <label style={S.label}>Chart Type</label>
                <div style={S.typeGrid}>
                  {CHART_TYPES.map(t => (
                    <button key={t.id} style={{ ...S.typeCard, ...(selectedChart.type === t.id ? S.typeCardActive : {}) }} onClick={() => handleUpdateSelected({ type: t.id })}>
                      <t.icon size={16} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={S.section}>
                <label style={S.label}>Series Colors</label>
                <div style={S.colorRow}>
                  {selectedChart.colors.map((color, idx) => (
                    <input key={`${color}-${idx}`} type="color" value={color} onChange={(e) => updateSelectedColors(idx, e.target.value)} style={S.colorPicker} />
                  ))}
                </div>
              </div>

              <div style={S.section}>
                <label style={S.label}>Background</label>
                <div style={S.optionRow}>
                  {['white', '#f9fafb', '#f3f4f6'].map(opt => (
                    <button key={opt} style={{ ...S.optionBtn, ...(selectedChart.style.bg === opt ? S.optionBtnActive : {}) }} onClick={() => updateSelectedStyle({ bg: opt })}>
                      {opt === 'white' ? 'White' : opt === '#f9fafb' ? 'Light 1' : 'Light 2'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={S.section}>
                <label style={S.label}>Border Radius</label>
                <input type="range" min="0" max="24" value={selectedChart.style.radius} onChange={(e) => updateSelectedStyle({ radius: Number(e.target.value) })} style={{width: '100%'}}/>
              </div>

            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showLoadModal && (
          <motion.div style={S.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div style={S.modal} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}>
              <div style={S.modalHeader}>
                <h4 style={S.modalTitle}>Load Layout</h4>
                <button style={S.iconBtnTop} onClick={() => setShowLoadModal(false)}><X size={16} /></button>
              </div>
              <div style={S.loadList}>
                {savedDashboards.length === 0 && <div style={S.emptyChat}>No saved layouts yet.</div>}
                {savedDashboards.map(dash => (
                  <button key={dash.id} style={S.loadItem} onClick={() => handleLoadDashboard(dash)}>
                    <div>
                      <p style={S.loadName}>{dash.name}</p>
                      <span style={S.loadMeta}>{new Date(dash.savedAt).toLocaleString()}</span>
                    </div>
                    <span style={S.loadMeta}>{dash.charts?.length || 0} charts</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </motion.div>
      )}
      </AnimatePresence>

      <style>{`
        .layout { min-height: 100%; }
        .chart-card.selected > div { box-shadow: 0 0 0 3px #6C63FF; }
        .react-grid-item > .react-resizable-handle { width: 18px; height: 18px; z-index: 10; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .chart-drag-handle:active { cursor: grabbing !important; }
        .chart-drag-handle { cursor: grab; }
      `}</style>
    </motion.div>
  );
};

const S = {
  page: { height: 'calc(100vh - var(--topbar-height))', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' },
  tabBar: { display: 'flex', gap: '6px', background: 'var(--card)', padding: '6px', borderRadius: '14px', border: '1px solid var(--border)', flexShrink: 0 },
  tabBtn: { position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'transparent', border: 'none', borderRadius: '10px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s', flex: 1, justifyContent: 'center' },
  tabBtnActive: { color: '#fff', background: 'linear-gradient(135deg, #6C63FF 0%, #3B82F6 100%)', boxShadow: '0 4px 16px rgba(108,99,255,0.3)' },
  tabIndicator: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: '#fff', borderRadius: '2px' },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', background: 'var(--card)', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border)' },
  canvasNameInput: { fontSize: '18px', fontWeight: 700, border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none' },
  toolbarActions: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  toolbarBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
  primaryBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
  dangerBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#ef4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
  
  layout: { display: 'flex', gap: '16px', flex: 1, minHeight: 0 },
  
  leftPanel: { width: '320px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  panelHeader: { padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' },
  datasetRow: { padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)' },
  selectInput: { flex: 1, padding: '8px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' },
  
  chatInputWrap: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--border)' },
  chatInput: { width: '100%', minHeight: '80px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text-primary)', fontSize: '13px', resize: 'vertical', outline: 'none' },
  primaryBtnFull: { width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px', background: 'var(--primary)', color: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer' },
  
  chipsRow: { display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '16px 20px', borderBottom: '1px solid var(--border)' },
  chip: { padding: '6px 12px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '20px', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer' },
  
  chatHistory: { flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' },
  chatCard: { background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' },
  chatPrompt: { fontSize: '13px', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 500 },
  chatActions: { display: 'flex', gap: '8px' },
  chatActionBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary)', color: '#fff', padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '12px', cursor: 'pointer' },
  chatHint: { fontSize: '12px', color: 'var(--text-tertiary)' },
  
  centerPanel: { flex: 1, background: '#111827', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  canvasHeader: { padding: '16px 20px', borderBottom: '1px solid #1f2937', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', background: '#1f2937' },
  canvasWrap: { flex: 1, overflowY: 'auto', position: 'relative' },
  canvasEmpty: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  
  chartWrapper: { display: 'flex', flexDirection: 'column' },
  chartInner: { flex: 1, background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s' },
  chartHeader: { padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb' },
  chartTitleWrap: { display: 'flex', flexDirection: 'column' },
  chartTitleText: { fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 },
  chartDescText: { fontSize: '12px', color: '#6b7280', margin: 0 },
  chartActionsBar: { display: 'flex', gap: '4px' },
  iconBtn: { background: 'transparent', border: 'none', color: '#6b7280', padding: '4px', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  iconBtnTop: { background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '4px', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  chartBody: { flex: 1, padding: '16px', minHeight: 0 },
  emptyChart: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: '13px' },
  
  rightPanel: { width: '300px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  emptyEditor: { padding: '32px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' },
  editorBody: { padding: '20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' },
  section: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' },
  input: { width: '100%', padding: '8px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' },
  typeGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' },
  typeCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' },
  typeCardActive: { background: 'rgba(108,99,255,0.1)', borderColor: 'var(--primary)', color: 'var(--primary)' },
  colorRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  colorPicker: { width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '6px', cursor: 'pointer' },
  optionRow: { display: 'flex', gap: '8px' },
  optionBtn: { flex: 1, padding: '8px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer' },
  optionBtnActive: { background: 'rgba(108,99,255,0.1)', borderColor: 'var(--primary)', color: 'var(--primary)' },
  errorText: { fontSize: '12px', color: '#ef4444' },
  
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--card)', width: '400px', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' },
  modalHeader: { padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 },
  loadList: { maxHeight: '300px', overflowY: 'auto', padding: '12px' },
  loadItem: { width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: '8px' },
  loadName: { fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0', textAlign: 'left' },
  loadMeta: { fontSize: '12px', color: 'var(--text-tertiary)' },
  emptyChat: { padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }
};

export default ChartBuilder;