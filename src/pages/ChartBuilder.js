import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Maximize2,
  Download,
  Image as ImageIcon,
  Plus,
  Trash2,
  Settings2,
  Database,
  Sparkles,
  Share2,
  LayoutDashboard,
  Copy,
  CheckCircle,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Move,
  Pencil,
  SquarePlus,
  Loader2,
  X
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { ResponsiveGridLayout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useAuth } from '../context/AuthContext';
import { getDatasets } from '../api/files';
import { askQuery } from '../api/queries';
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
  bg: 'transparent',
  radius: 10,
  fontSize: 'medium',
  legendPos: 'bottom',
  showLegend: true,
  showGrid: true,
  showTooltip: true,
  animate: true,
};

const STORAGE_KEYS = {
  autosave: 'nexabi_canvas_autosave',
  saved: 'nexabi_saved_dashboards',
};

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
  'Make it dark theme',
  'Add gradient',
  'Change to pie',
  'Make bars rounded',
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

const ChartBuilder = () => {
  const { token } = useAuth();
  const canvasRef = useRef(null);

  const [canvasName, setCanvasName] = useState('My Dashboard');
  const [charts, setCharts] = useState([]);
  const [selectedChartId, setSelectedChartId] = useState(null);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [showEmbed, setShowEmbed] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedDashboards, setSavedDashboards] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState('');

  useEffect(() => {
    const autosaved = localStorage.getItem(STORAGE_KEYS.autosave);
    if (autosaved) {
      try {
        const parsed = JSON.parse(autosaved);
        setCanvasName(parsed.canvasName || 'My Dashboard');
        setCharts(parsed.charts || []);
        setSelectedChartId(parsed.selectedChartId || null);
      } catch (err) {
        console.error('Failed to parse autosave', err);
      }
    } else {
      setCharts([]);
    }

    const saved = localStorage.getItem(STORAGE_KEYS.saved);
    if (saved) {
      try {
        setSavedDashboards(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse saved dashboards', err);
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const payload = { canvasName, charts, selectedChartId };
      localStorage.setItem(STORAGE_KEYS.autosave, JSON.stringify(payload));
    }, 30000);
    return () => clearInterval(interval);
  }, [canvasName, charts, selectedChartId]);

  useEffect(() => {
    const fetchDatasets = async () => {
      if (!token) return;
      try {
        const dataSets = await getDatasets(token);
        setDatasets(dataSets || []);
      } catch (err) {
        console.error('Failed to fetch datasets:', err);
      }
    };
    fetchDatasets();
  }, [token]);

  const selectedChart = charts.find(c => c.id === selectedChartId);

  const layout = useMemo(
    () => charts.map(chart => ({
      i: chart.id,
      x: chart.layout?.x ?? 0,
      y: chart.layout?.y ?? Infinity,
      w: chart.layout?.w ?? 6,
      h: chart.layout?.h ?? 8,
      minW: 3,
      minH: 6,
    })),
    [charts]
  );

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
      const normalized = trimmed
        .replace(/'/g, '"')
        .replace(/\b([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '"$1":');
      try {
        const parsed = JSON.parse(normalized);
        return parsed && typeof parsed === 'object' ? parsed : null;
      } catch (innerErr) {
        return null;
      }
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
    setCharts(prev => prev.map(chart => {
      if (chart.id !== selectedChartId) return chart;
      return {
        ...chart,
        title: chartData?.title || chart.title,
        description: chartData?.description || chart.description,
        type: chartData?.type || chart.type,
        data: Array.isArray(chartData?.data) ? chartData.data : chart.data,
        xKey: chartData?.xKey || chart.xKey,
        yKey: chartData?.yKey || chart.yKey,
        colors: chartData?.colors?.length ? chartData.colors : chart.colors,
      };
    }));
  };

  const handleAiSend = async () => {
    if (!aiInput.trim()) return;
    if (!token) {
      setAiError('Please sign in to use AI.');
      return;
    }
    setIsAiLoading(true);
    setAiError('');

    const nextMessage = {
      id: `msg-${Date.now()}`,
      prompt: aiInput.trim(),
      response: '',
      chartData: null,
      createdAt: new Date().toISOString(),
    };
    setAiMessages(prev => [nextMessage, ...prev]);

    const apiKey = localStorage.getItem('groq_key') || process.env.REACT_APP_GROQ_API_KEY;
    const conversationHistory = aiMessages
      .map(m => ([
        { role: 'user', content: m.prompt },
        { role: 'assistant', content: m.response || '' }
      ]))
      .flat();

    try {
      const result = await askQuery(
        `${aiInput}\n\n${SYSTEM_PROMPT}`,
        apiKey || null,
        selectedDatasetId || null,
        token,
        'groq',
        conversationHistory
      );
      const aiResponse = result?.response || '';
      const chartData = extractChartData(aiResponse);

      setAiMessages(prev => prev.map(m => m.id === nextMessage.id
        ? { ...m, response: aiResponse, chartData }
        : m
      ));

      if (chartData) {
        if (shouldApplyToSelected(aiInput)) {
          handleUpdateSelected(chartData);
        } else {
          handleAddChart(chartData);
        }
      }

      setAiInput('');
    } catch (err) {
      console.error(err);
      setAiError('Failed to generate chart. Try a different prompt.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDuplicateChart = (chart) => {
    const clone = {
      ...chart,
      id: `chart-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      layout: { ...chart.layout, y: Infinity },
    };
    setCharts(prev => [...prev, clone]);
    setSelectedChartId(clone.id);
  };

  const handleDeleteChart = (chartId) => {
    setCharts(prev => prev.filter(c => c.id !== chartId));
    if (selectedChartId === chartId) {
      setSelectedChartId(null);
    }
  };

  const handleResizePreset = (size) => {
    if (!selectedChartId) return;
    const widthMap = { small: 4, medium: 6, large: 12 };
    const nextW = widthMap[size] || 6;
    setCharts(prev => prev.map(chart => chart.id === selectedChartId
      ? { ...chart, layout: { ...chart.layout, w: nextW } }
      : chart
    ));
  };

  const updateSelectedStyle = (updates) => {
    if (!selectedChartId) return;
    setCharts(prev => prev.map(chart => chart.id === selectedChartId
      ? { ...chart, style: { ...chart.style, ...updates } }
      : chart
    ));
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

  const handleDownloadCanvasPng = async () => {
    if (!canvasRef.current) return;
    const canvas = await html2canvas(canvasRef.current, { backgroundColor: null, scale: 2 });
    const link = document.createElement('a');
    link.download = `${canvasName || 'dashboard'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleDownloadCanvasPdf = async () => {
    if (!canvasRef.current) return;
    const canvas = await html2canvas(canvasRef.current, { backgroundColor: '#ffffff', scale: 2 });
    const imgUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<img src="${imgUrl}" style="width:100%;" />`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleShare = async () => {
    const link = window.location.href;
    await navigator.clipboard.writeText(link);
  };

  const handleEmbedCopy = async () => {
    const embed = `<iframe src="${window.location.href}" width="1200" height="800" frameborder="0"></iframe>`;
    await navigator.clipboard.writeText(embed);
  };

  const handleSaveDashboard = () => {
    const name = window.prompt('Dashboard name', canvasName);
    if (!name) return;
    const payload = {
      id: `dash-${Date.now()}`,
      name,
      canvasName,
      charts,
      savedAt: new Date().toISOString(),
    };
    const next = [payload, ...savedDashboards];
    setSavedDashboards(next);
    localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(next));
  };

  const handleLoadDashboard = (dashboard) => {
    if (!dashboard) return;
    setCanvasName(dashboard.canvasName || dashboard.name || 'My Dashboard');
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
    const grid = chart.style.showGrid ? <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} /> : null;
    const tooltip = chart.style.showTooltip ? <RechartsTooltip contentStyle={{ background: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)', borderRadius: '8px' }} /> : null;
    const legend = chart.style.showLegend ? <Legend verticalAlign={chart.style.legendPos} /> : null;

    if (chart.type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart {...commonProps}>
            {grid}
            <XAxis dataKey={chart.xKey} tick={{ fontSize, fill: 'var(--chart-text)' }} />
            <YAxis tick={{ fontSize, fill: 'var(--chart-text)' }} />
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
            <XAxis dataKey={chart.xKey} tick={{ fontSize, fill: 'var(--chart-text)' }} />
            <YAxis tick={{ fontSize, fill: 'var(--chart-text)' }} />
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
            <XAxis dataKey={chart.xKey} tick={{ fontSize, fill: 'var(--chart-text)' }} />
            <YAxis tick={{ fontSize, fill: 'var(--chart-text)' }} />
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
            <XAxis type="category" dataKey={chart.xKey} name={chart.xKey} stroke="var(--chart-text)" />
            <YAxis type="number" dataKey={primaryYKey} name={chart.yKey} stroke="var(--chart-text)" />
            {tooltip}
            {legend}
            <Scatter name={chart.title} data={chart.data} fill={chart.colors[0]} />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    return <div style={S.emptyChart}>Unsupported chart</div>;
  };

  return (
    <motion.div style={S.page} variants={pageV} initial="initial" animate="animate" exit="exit">
      <div style={S.toolbar}>
        <input
          value={canvasName}
          onChange={(e) => setCanvasName(e.target.value)}
          style={S.canvasNameInput}
        />
        <div style={S.toolbarActions}>
          <button style={S.toolbarBtn} onClick={() => handleAddChart({})}><Plus size={16} /> Add Chart</button>
          <button style={S.toolbarBtn} onClick={() => setCharts([])}><Trash2 size={16} /> Clear Canvas</button>
          <button style={S.toolbarBtn} onClick={handleDownloadCanvasPng}><ImageIcon size={16} /> Download PNG</button>
          <button style={S.toolbarBtn} onClick={handleDownloadCanvasPdf}><Download size={16} /> Download PDF</button>
          <button style={S.toolbarBtn} onClick={handleShare}><Share2 size={16} /> Share Link</button>
          <button style={S.toolbarBtn} onClick={() => setShowEmbed(true)}><Copy size={16} /> Embed Code</button>
          <button style={S.toolbarBtn} onClick={handleSaveDashboard}><CheckCircle size={16} /> Save</button>
          <button style={S.toolbarBtn} onClick={() => setShowLoadModal(true)}><LayoutDashboard size={16} /> Load</button>
        </div>
      </div>

      <div style={S.layout}>
        {/* LEFT PANEL: AI CHAT */}
        <div style={S.leftPanel}>
          <div style={S.panelHeader}><Sparkles size={18} /> AI Chart Builder</div>
          <div style={S.datasetRow}>
            <Database size={16} color="var(--text-tertiary)" />
            <select value={selectedDatasetId} onChange={(e) => setSelectedDatasetId(e.target.value)} style={S.selectInput}>
              <option value="">Use dataset (optional)</option>
              {datasets.map(ds => (
                <option key={ds.id} value={ds.id}>{ds.name || ds.filename || 'Dataset'}</option>
              ))}
            </select>
          </div>

          <div style={S.chatInputWrap}>
            <textarea
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Create a red bar chart of monthly sales"
              style={S.chatInput}
            />
            <button style={S.primaryBtn} onClick={handleAiSend} disabled={isAiLoading}>
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
                    {selectedChartId && (
                      <button style={S.chatActionGhost} onClick={() => handleUpdateSelected(msg.chartData)}><Pencil size={14} /> Apply to Selected</button>
                    )}
                  </div>
                ) : (
                  <div style={S.chatHint}>No chart data found.</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CENTER PANEL: CANVAS */}
        <div style={S.centerPanel}>
          <div style={S.canvasWrap} ref={canvasRef}>
            {charts.length === 0 && (
              <div style={S.canvasEmpty}>
                <Sparkles size={24} color="var(--primary)" />
                <p>Ask AI to create a chart</p>
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
              >
                {charts.map(chart => (
                  <div key={chart.id} className={`chart-card ${selectedChartId === chart.id ? 'selected' : ''}`}>
                    <div style={S.chartCard} onClick={() => setSelectedChartId(chart.id)}>
                      <div style={S.chartHeader}>
                        <div className="chart-drag-handle" style={S.dragHandle}><Move size={14} /></div>
                        <div style={S.chartTitleWrap}>
                          <h4 style={S.chartTitle}>{chart.title}</h4>
                          {chart.description && <p style={S.chartDesc}>{chart.description}</p>}
                        </div>
                        <div style={S.chartActions}>
                          <button style={S.iconBtn} onClick={() => setSelectedChartId(chart.id)}><Settings2 size={14} /></button>
                          <button style={S.iconBtn} onClick={() => handleDuplicateChart(chart)}><Copy size={14} /></button>
                          <button style={S.iconBtn} onClick={async () => {
                            const canvas = await html2canvas(document.getElementById(chart.id), { backgroundColor: null, scale: 2 });
                            const link = document.createElement('a');
                            link.download = `${chart.title || 'chart'}.png`;
                            link.href = canvas.toDataURL('image/png');
                            link.click();
                          }}><Download size={14} /></button>
                          <button style={S.iconBtn} onClick={() => handleDeleteChart(chart.id)}><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <div id={chart.id} style={{ ...S.chartBody, background: chart.style.bg === 'dark' ? '#0B0D17' : chart.style.bg === 'white' ? '#fff' : chart.style.bg === 'gradient' ? 'linear-gradient(135deg,#6C63FF33,#3B82F633)' : 'transparent', borderRadius: chart.style.radius }}>
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
          <div style={S.panelHeader}><Settings2 size={18} /> Style Editor</div>
          {!selectedChart && <div style={S.emptyEditor}>Select a chart to edit</div>}
          {selectedChart && (
            <div style={S.editorBody}>
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
                  {['transparent', 'white', 'dark', 'gradient'].map(opt => (
                    <button key={opt} style={{ ...S.optionBtn, ...(selectedChart.style.bg === opt ? S.optionBtnActive : {}) }} onClick={() => updateSelectedStyle({ bg: opt })}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div style={S.section}>
                <label style={S.label}>Border Radius</label>
                <input type="range" min="0" max="24" value={selectedChart.style.radius} onChange={(e) => updateSelectedStyle({ radius: Number(e.target.value) })} />
              </div>

              <div style={S.section}>
                <label style={S.label}>Font Size</label>
                <select value={selectedChart.style.fontSize} onChange={(e) => updateSelectedStyle({ fontSize: e.target.value })} style={S.selectInput}>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div style={S.section}>
                <label style={S.label}>Legend Position</label>
                <select value={selectedChart.style.legendPos} onChange={(e) => updateSelectedStyle({ legendPos: e.target.value })} style={S.selectInput}>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>

              <div style={S.section}>
                <label style={S.label}>Animation</label>
                <label style={S.toggleRow}>
                  <input type="checkbox" checked={selectedChart.style.animate} onChange={(e) => updateSelectedStyle({ animate: e.target.checked })} />
                  Enable animations
                </label>
              </div>

              <div style={S.section}>
                <label style={S.label}>Size</label>
                <div style={S.optionRow}>
                  <button style={S.optionBtn} onClick={() => handleResizePreset('small')}>Small</button>
                  <button style={S.optionBtn} onClick={() => handleResizePreset('medium')}>Medium</button>
                  <button style={S.optionBtn} onClick={() => handleResizePreset('large')}>Large</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showEmbed && (
          <motion.div style={S.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div style={S.modal} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}>
              <div style={S.modalHeader}>
                <h4 style={S.modalTitle}>Embed Code</h4>
                <button style={S.iconBtn} onClick={() => setShowEmbed(false)}><X size={16} /></button>
              </div>
              <textarea readOnly value={`<iframe src="${window.location.href}" width="1200" height="800" frameborder="0"></iframe>`} style={S.embedBox} />
              <button style={S.primaryBtn} onClick={handleEmbedCopy}><Copy size={16} /> Copy Embed Code</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoadModal && (
          <motion.div style={S.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div style={S.modal} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}>
              <div style={S.modalHeader}>
                <h4 style={S.modalTitle}>Load Dashboard</h4>
                <button style={S.iconBtn} onClick={() => setShowLoadModal(false)}><X size={16} /></button>
              </div>
              <div style={S.loadList}>
                {savedDashboards.length === 0 && <div style={S.emptyChat}>No saved dashboards yet.</div>}
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

      <style>{`
        .layout { min-height: 100%; }
        .chart-card.selected { border: 2px solid #6C63FF; border-radius: 14px; }
        .react-grid-item > .react-resizable-handle { width: 18px; height: 18px; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
};

const S = {
  page: { height: 'calc(100vh - var(--topbar-height))', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' },
  canvasNameInput: { fontSize: '18px', fontWeight: 700, border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px', background: 'var(--card)', color: 'var(--text-primary)' },
  toolbarActions: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  toolbarBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' },

  layout: { display: 'grid', gridTemplateColumns: '320px 1fr 320px', gap: '16px', flex: 1, minHeight: 0 },
  leftPanel: { background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', minHeight: 0 },
  centerPanel: { background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '12px', minHeight: 0, display: 'flex', flexDirection: 'column' },
  rightPanel: { background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 },

  panelHeader: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' },
  datasetRow: { display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 10px' },
  selectInput: { width: '100%', border: 'none', background: 'transparent', fontSize: '12px', color: 'var(--text-primary)' },

  chatInputWrap: { display: 'flex', flexDirection: 'column', gap: '8px' },
  chatInput: { minHeight: '90px', borderRadius: '12px', border: '1px solid var(--border)', padding: '10px', fontSize: '13px', background: 'var(--input-bg)', color: 'var(--text-primary)', resize: 'vertical' },
  primaryBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '10px', background: 'linear-gradient(135deg,#6C63FF,#3B82F6)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer' },
  errorText: { fontSize: '12px', color: 'var(--danger)' },
  chipsRow: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  chip: { background: 'var(--input-bg)', border: '1px dashed var(--border)', borderRadius: '999px', padding: '6px 10px', fontSize: '11px', color: 'var(--text-secondary)', cursor: 'pointer' },
  chatHistory: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
  chatCard: { background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' },
  chatPrompt: { fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' },
  chatActions: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  chatActionBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', borderRadius: '8px', border: '1px solid rgba(108,99,255,0.3)', background: 'rgba(108,99,255,0.08)', fontSize: '11px', color: 'var(--primary)', cursor: 'pointer' },
  chatActionGhost: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', fontSize: '11px', color: 'var(--text-secondary)', cursor: 'pointer' },
  chatHint: { fontSize: '11px', color: 'var(--text-tertiary)' },
  emptyChat: { fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px 0' },

  canvasWrap: { flex: 1, background: 'var(--bg)', borderRadius: '14px', padding: '12px', overflow: 'auto', position: 'relative' },
  canvasEmpty: { display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', height: '100%' },
  chartCard: { background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', height: '100%', display: 'flex', flexDirection: 'column' },
  chartHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '8px 10px', borderBottom: '1px solid var(--border)' },
  dragHandle: { width: '26px', height: '26px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', cursor: 'grab' },
  chartTitleWrap: { flex: 1 },
  chartTitle: { fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' },
  chartDesc: { fontSize: '11px', color: 'var(--text-tertiary)' },
  chartActions: { display: 'flex', gap: '6px' },
  chartBody: { flex: 1, padding: '10px', minHeight: 240 },
  emptyChart: { fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center', paddingTop: '40px' },
  iconBtn: { background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  emptyEditor: { fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px 0' },
  editorBody: { display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' },
  section: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' },
  input: { border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', background: 'var(--input-bg)', color: 'var(--text-primary)' },
  typeGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' },
  typeCard: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', fontSize: '11px', color: 'var(--text-secondary)', cursor: 'pointer' },
  typeCardActive: { borderColor: 'var(--primary)', color: 'var(--primary)', background: 'rgba(108,99,255,0.1)' },
  colorRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  colorPicker: { width: '34px', height: '34px', border: 'none', background: 'transparent', cursor: 'pointer' },
  optionRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  optionBtn: { padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', fontSize: '11px', color: 'var(--text-secondary)', cursor: 'pointer' },
  optionBtnActive: { borderColor: 'var(--primary)', color: 'var(--primary)', background: 'rgba(108,99,255,0.08)' },
  toggleRow: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' },

  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { width: '480px', background: 'var(--card)', borderRadius: '16px', padding: '18px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' },
  embedBox: { width: '100%', minHeight: '120px', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', fontSize: '12px', background: 'var(--input-bg)', color: 'var(--text-primary)' },
  loadList: { display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' },
  loadItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--input-bg)', cursor: 'pointer' },
  loadName: { fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' },
  loadMeta: { fontSize: '11px', color: 'var(--text-tertiary)' },
};

export default ChartBuilder;