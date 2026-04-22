import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { askQuery, getHistory } from '../api/queries';
import { getDatasets, getDatasetById } from '../api/files';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis, ComposedChart, Treemap, FunnelChart, Funnel, LabelList, Legend,
  RadialBarChart, RadialBar
} from 'recharts';
import { Send, Paperclip, User, Database, FileSpreadsheet, Link2, CheckCircle, Sparkles, Copy, ThumbsUp, ThumbsDown, Settings, Download, Plus, LayoutDashboard, ChevronDown, Check, Trash2, X, Maximize2, RefreshCw, Edit3, Code, BarChart2, LineChart as LineChartIcon, PieChart as PieChartIcon, Activity, Radar as RadarIcon } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import html2canvas from 'html2canvas';

const pageV = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } }, exit: { opacity: 0, y: -10 } };
const DEFAULT_COLORS = ['#6C63FF', '#3B82F6'];

const THEMES = {
  Ocean: ['#0EA5E9', '#06B6D4', '#0284C7', '#38BDF8', '#7DD3FC'],
  Forest: ['#10B981', '#34D399', '#059669', '#6EE7B7', '#A7F3D0'],
  Sunset: ['#F59E0B', '#EF4444', '#F97316', '#FBBF24', '#FCA5A5'],
  Galaxy: ['#6C63FF', '#A78BFA', '#EC4899', '#8B5CF6', '#F472B6'],
  Monochrome: ['#1E1E2E', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB'],
  Candy: ['#EC4899', '#8B5CF6', '#06B6D4', '#F472B6', '#A78BFA']
};

const initialMessages = [
  { id: 1, type: 'ai', content: "Hello! I'm NexaBI. I can analyze your data, generate charts, build interactive mini-apps, and create custom UI components. What would you like me to build today?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
];

const getFileIcon = (name) => {
  if (!name) return FileSpreadsheet;
  const ext = name.split('.').pop().toLowerCase();
  if (['csv'].includes(ext)) return FileSpreadsheet;
  if (['xlsx', 'xls'].includes(ext)) return FileSpreadsheet;
  if (['json'].includes(ext)) return Database;
  return FileSpreadsheet;
};

const SYSTEM_PROMPT = `You are NexaBI — a live creative builder AI.
Your job is to BUILD exactly what the user asks.

GOLDEN RULE: User says it -> You build it EXACTLY.
- User says navy blue -> use navy blue
- User says dark red gradient -> use dark red gradient  
- User says glassmorphism -> use glassmorphism
- User says neon green -> use neon green
- User says ANY color/style/theme -> use it EXACTLY
- Never use default colors — always use what user asked

CHART TYPE SELECTION GUIDE:
- Ranking/comparison -> bar or bar-horizontal
- Multiple categories -> bar-grouped
- Part of 100% -> bar-stacked or area-stacked
- Trend over time -> line or area
- Multiple trends -> line-multi
- Proportion -> pie or donut
- Progress/score -> gauge or radialbar
- Positive/negative -> waterfall
- 3 variables -> bubble
- Density/intensity -> heatmap
- Stock data -> candlestick
- Project timeline -> gantt
- Flow/journey -> sankey
- Hierarchy -> pyramid or treemap
- Location data -> geographic map
- Quick trend -> sparkline
- Activity over year -> calendar heatmap
- Relationships -> network graph

Always pick the MOST APPROPRIATE chart type based on the data and question.

UNKNOWN CHART TYPE RULE:
If user asks for a chart type you don't recognize OR the chart type is unclear/ambiguous, respond with:
{CHART_SUGGEST: {
  "message": "I don't have that exact chart, but here are the best options for your data:",
  "suggestions": [
    {
      "type": "bar",
      "label": "Bar Chart",
      "reason": "Best for comparing values across categories",
      "preview_colors": ["#6C63FF", "#3B82F6"],
      "emoji": "📊"
    }
  ],
  "original_data": [{"name":"A","val":10}]
}}
Return 3-5 most relevant suggestions based on what data user mentioned and what they are trying to show.

OUTPUT FORMATS:

1. If user asks for chart/graph/visualization using Recharts:
{CHART_DATA: {
  "type": "bar"|"bar-horizontal"|"bar-stacked"|"bar-grouped"|"line"|"line-multi"|"area"|"area-stacked"|"pie"|"donut"|"radar"|"scatter"|"bubble"|"composed"|"treemap"|"funnel"|"radialbar"|"gauge"|"waterfall",
  "title": "title",
  "description": "insight",
  "colors": ["EXACT colors user asked for or smart defaults"],
  "data": [{"name":"A","val":10, "val2":20}],
  "xKey": "name",
  "yKey": "val",
  "additionalLines": ["val2"]
}}

2. For special visual charts (heatmap, candlestick, gantt, sankey, pyramid, map, bullet, sparkline, calendar heatmap, network) OR ANYTHING else (table, app, tool, animation, card, component, calculator, game, timer, quiz):
{HTML_OUTPUT: {
  "title": "what this is",
  "height": 450,
  "html": "COMPLETE self-contained HTML here"
}}

HTML RULES — VERY IMPORTANT:
- Use EXACTLY the colors/theme/style user asked for
- Complete HTML file with <style> and <script> inside
- Google Fonts CDN allowed
- For special charts, USE Chart.js CDN (https://cdn.jsdelivr.net/npm/chart.js) inside the HTML output!
- No broken layouts
- Smooth animations by default
- Professional and pixel-perfect
- If user said specific background -> use it

COLOR RULE:
Extract EXACT colors from user message. If none provided, use smart defaults.
Always honor the user's color request EXACTLY.

Whatever user asks -> build it EXACTLY that way.
No excuses, no defaults, just build it.`;

const defaultConfig = {
  theme: 'Ocean',
  customColors: [...THEMES.Ocean],
  bgOption: 'transparent',
  customBg: ['#ffffff', '#ffffff'],
  borderRadius: 4,
  barSize: 'medium',
  lineThickness: 3,
  dotSize: 4,
  strokeType: 'solid',
  showGrid: true,
  showX: true,
  showY: true,
  gridColor: 'var(--chart-grid)',
  gridStyle: 'dashed',
  showLegend: true,
  legendPos: 'bottom',
  showLabels: false,
  fontSize: 'Medium',
  showTooltips: true,
  height: 300,
  aspectRatio: '16:9'
};

const Query = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const apiKey = process.env.REACT_APP_GROQ_API_KEY || '';
  const endRef = useRef(null);
  
  const [chartConfigs, setChartConfigs] = useState({});
  const [activeChartConfigId, setActiveChartConfigId] = useState(null);
  const [presets, setPresets] = useState([]);
  const [presetName, setPresetName] = useState('');
  const [colorPickerTarget, setColorPickerTarget] = useState(null);

  const [fullscreenData, setFullscreenData] = useState(null);

  const chartRefs = useRef({});
  const { token } = useAuth();

  // Dataset selection state
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [datasetDetail, setDatasetDetail] = useState(null);
  const [loadingDataset, setLoadingDataset] = useState(false);

  useEffect(() => {
    const fetchDatasets = async () => {
      if (!token) return;
      try {
        const data = await getDatasets(token);
        setDatasets(data || []);
      } catch (err) {
        console.error('Failed to fetch datasets:', err);
      }
    };
    fetchDatasets();
  }, [token]);

  const handleSelectDataset = async (dataset) => {
    if (selectedDataset?.id === dataset.id) {
      // Deselect
      setSelectedDataset(null);
      setDatasetDetail(null);
      return;
    }
    setSelectedDataset(dataset);
    setLoadingDataset(true);
    try {
      const detail = await getDatasetById(dataset.id, token);
      setDatasetDetail(detail);
    } catch (err) {
      console.error('Failed to fetch dataset detail:', err);
      setDatasetDetail(null);
    } finally {
      setLoadingDataset(false);
    }
  };

  const clearDatasetSelection = () => {
    setSelectedDataset(null);
    setDatasetDetail(null);
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      try {
        const history = await getHistory(token);
        if (history && history.length > 0) {
          const loadedMessages = history.map(h => ({
            id: h.id,
            type: h.role === 'user' ? 'user' : 'ai',
            content: h.content,
            rawContent: h.raw_content || h.content,
            chart: h.chart_data ? JSON.parse(h.chart_data) : null,
            htmlOutput: h.html_data ? JSON.parse(h.html_data) : null,
            time: new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setMessages([...initialMessages, ...loadedMessages]);
        }
      } catch (error) {
        console.error("Failed to load query history:", error);
      }
    };
    fetchHistory();
  }, [token]);

  useEffect(() => { 
    if(!activeChartConfigId && !fullscreenData) endRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages, isTyping, activeChartConfigId, fullscreenData]);

  useEffect(() => {
    const saved = localStorage.getItem('nexabi_chart_presets');
    if (saved) setPresets(JSON.parse(saved));
  }, []);

  const savePreset = (config) => {
    if(!presetName) return;
    const newPresets = [...presets, { name: presetName, config }];
    setPresets(newPresets);
    localStorage.setItem('nexabi_chart_presets', JSON.stringify(newPresets));
    setPresetName('');
  };

  const handleSend = async (customPrompt = input) => {
    if (!customPrompt.trim()) return;
    
    // Fuzzy matching logic
    const processedPrompt = customPrompt
      .replace(/bar graph/gi, 'bar chart')
      .replace(/pie graph/gi, 'pie chart')
      .replace(/line graph/gi, 'line chart');

    const userMsg = customPrompt;
    const msgId = Date.now();
    const newMessages = [...messages, { id: msgId, type: 'user', content: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    if (!apiKey) {
      setTimeout(() => {
        setMessages(p => [...p, { id: Date.now(), type: 'ai', content: "Please enter your Groq API key at the top to enable AI responses.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setIsTyping(false);
      }, 500);
      return;
    }

    try {
      // Build system prompt with dataset context if selected
      let finalSystemPrompt = SYSTEM_PROMPT;
      if (datasetDetail && datasetDetail.preview && datasetDetail.columns) {
        const colNames = Object.keys(datasetDetail.columns);
        const sampleRows = (datasetDetail.preview || []).slice(0, 50);
        finalSystemPrompt = SYSTEM_PROMPT + `\n\nYou are a Senior Data Analyst with 15+ years of experience in business intelligence and statistical analysis.

You have been given this dataset:
Dataset Name: ${datasetDetail.name}
Total Records: ${datasetDetail.row_count}
Columns: ${JSON.stringify(colNames)}
Column Types: ${JSON.stringify(datasetDetail.columns)}
Data Sample (first ${sampleRows.length} rows):
${JSON.stringify(sampleRows, null, 1)}

Perform a REAL, DEEP professional analysis:

## 1. DATASET OVERVIEW
- What domain/industry is this data from?
- What business problem does it solve?
- Data completeness assessment

## 2. STATISTICAL SUMMARY
For each NUMERIC column calculate and show:
- Mean, Median, Mode
- Min, Max, Range
- Standard Deviation
- Identify outliers (values beyond 2 standard deviations)

For each CATEGORICAL column:
- Unique value count
- Most frequent values with counts
- Distribution pattern

## 3. KEY BUSINESS INSIGHTS
- What are the TOP 5 most important findings?
- What patterns exist in the data?
- What correlations exist between columns?
- What trends are visible?

## 4. ANOMALIES & DATA QUALITY
- Missing values per column (count + percentage)
- Duplicate records
- Outliers with specific values
- Data inconsistencies
- Recommendations to fix issues

## 5. ACTIONABLE RECOMMENDATIONS
Based on the data, what should the business DO?
Give 3-5 specific, actionable recommendations with reasoning from the actual data values.

## 6. VISUALIZATIONS
Generate exactly 3 charts that best tell the story of this data. Choose chart types wisely:
- Chart 1: Overview/distribution
- Chart 2: Key relationship or trend
- Chart 3: Most important insight

Use CHART_DATA format for each chart.
Use REAL values from the dataset - never make up numbers.

IMPORTANT:
- Base ALL insights on actual data values provided
- Quote specific numbers from the data
- No generic statements - be specific to THIS dataset
- Think like you are presenting to a CEO`;
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: finalSystemPrompt },
            ...newMessages.slice(1).map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.rawContent || m.content }))
          ],
          max_tokens: 3000,
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'No response generated.';
      
      let parsedContent = aiResponse;
      let chartData = null;
      let htmlData = null;
      let chartSuggest = null;

      const chartMatch = aiResponse.match(/\{CHART_DATA:\s*(\{[\s\S]*?\})\s*\}/);
      if (chartMatch) {
        try {
          chartData = JSON.parse(chartMatch[1]);
          parsedContent = aiResponse.replace(chartMatch[0], '').trim();
        } catch (e) { console.error("Failed to parse chart JSON", e); }
      }

      const htmlMatch = aiResponse.match(/\{HTML_OUTPUT:\s*(\{[\s\S]*?\})\s*\}/);
      if (htmlMatch && !chartData) {
        try {
          htmlData = JSON.parse(htmlMatch[1]);
          parsedContent = aiResponse.replace(htmlMatch[0], '').trim();
        } catch (e) { console.error("Failed to parse HTML JSON", e); }
      }

      const suggestMatch = aiResponse.match(/\{CHART_SUGGEST:\s*(\{[\s\S]*?\})\s*\}/);
      if (suggestMatch && !chartData && !htmlData) {
        try {
          chartSuggest = JSON.parse(suggestMatch[1]);
          parsedContent = aiResponse.replace(suggestMatch[0], '').trim();
        } catch (e) { console.error("Failed to parse suggest JSON", e); }
      }

      const aiMsgId = Date.now();
      
      if(chartData) {
        setChartConfigs(p => ({...p, [aiMsgId]: { ...defaultConfig, customColors: chartData.colors || THEMES.Ocean }}));
      }

      const aiMsgObj = { 
        id: aiMsgId, 
        type: 'ai', 
        content: parsedContent,
        rawContent: aiResponse, 
        chart: chartData,
        htmlOutput: htmlData,
        chartSuggest: chartSuggest,
        userPrompt: customPrompt,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };

      setMessages(p => [...p, aiMsgObj]);

      // Save to backend
      if (token) {
        try {
          await askQuery(customPrompt, apiKey, selectedDataset?.id || null, token);
        } catch (err) {
          console.error("Failed to save query history:", err);
        }
      }

    } catch (error) {
      console.error(error);
      setMessages(p => [...p, { id: Date.now(), type: 'ai', content: `Error: Could not fetch response. ${error.message} Check your API key or network.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleUseSuggestion = (msgId, suggestion, originalData) => {
    if (!originalData || !originalData.length) return;
    const keys = Object.keys(originalData[0]);
    const xKey = keys[0];
    const yKey = keys[1] || keys[0];
    
    const newChartData = {
      type: suggestion.type,
      title: suggestion.label,
      description: suggestion.reason,
      colors: suggestion.preview_colors || DEFAULT_COLORS,
      data: originalData,
      xKey,
      yKey
    };
    
    setChartConfigs(p => ({...p, [msgId]: { ...defaultConfig, customColors: newChartData.colors }}));
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, chart: newChartData, chartSuggest: null } : m));
  };

  const updateConfig = (id, updates) => {
    setChartConfigs(p => ({ ...p, [id]: { ...p[id], ...updates } }));
  };

  const updateChartType = (msgId, newType) => {
    setMessages(prev => prev.map(m => m.id === msgId && m.chart ? { ...m, chart: { ...m.chart, type: newType } } : m));
  };

  const downloadChart = async (id, chartTitle) => {
    const chartEl = chartRefs.current[id];
    if(!chartEl) return;
    try {
      const canvas = await html2canvas(chartEl, { scale: 2, backgroundColor: null });
      const link = document.createElement('a');
      link.download = `${chartTitle || 'chart'}-${id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch(e) {
      console.error("Download failed", e);
    }
  };

  const downloadHtml = (htmlContent, title) => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || 'output'}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderToolbar = (msg, type) => (
    <div style={S.toolbar}>
      <button onClick={() => navigator.clipboard.writeText(type === 'html' ? msg.htmlOutput.html : JSON.stringify(msg.chart))} style={S.toolbarBtn} title="Copy Code">
        <Code size={14} /> Copy
      </button>
      <button onClick={() => setFullscreenData({ type, content: type === 'html' ? msg.htmlOutput : msg.chart, msgId: msg.id })} style={S.toolbarBtn} title="Fullscreen">
        <Maximize2 size={14} /> Fullscreen
      </button>
      {type === 'html' ? (
        <button onClick={() => downloadHtml(msg.htmlOutput.html, msg.htmlOutput.title)} style={S.toolbarBtn} title="Download HTML">
          <Download size={14} /> Download HTML
        </button>
      ) : (
        <button onClick={() => downloadChart(msg.id, msg.chart.title)} style={S.toolbarBtn} title="Download PNG">
          <Download size={14} /> Download PNG
        </button>
      )}
      <button onClick={() => handleSend(msg.userPrompt)} style={S.toolbarBtn} title="Regenerate">
        <RefreshCw size={14} /> Regenerate
      </button>
      <button onClick={() => setInput(msg.userPrompt)} style={S.toolbarBtn} title="Edit Prompt">
        <Edit3 size={14} /> Edit
      </button>
    </div>
  );

  const renderChartSuggest = (suggestObj, msgId) => {
    if (!suggestObj || !suggestObj.suggestions) return null;
    return (
      <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} style={{ marginTop: '14px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Sparkles size={18} color="var(--primary)" />
          <p style={{fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)'}}>{suggestObj.message}</p>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
          {suggestObj.suggestions.map((sug, i) => (
            <motion.div key={i} whileHover={{ scale: 1.03, y: -2, borderColor: 'var(--primary)', boxShadow: '0 8px 24px rgba(108,99,255,0.15)' }} transition={{ type: 'spring', stiffness: 300 }} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '10px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontSize: '32px' }}>{sug.emoji}</div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{sug.label}</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>{sug.reason}</p>
              <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', marginTop: '6px' }}>
                 {(sug.preview_colors || ['#6C63FF', '#3B82F6']).map((c, idx) => <div key={idx} style={{flex: 1, background: c}}/>)}
              </div>
              <button onClick={() => handleUseSuggestion(msgId, sug, suggestObj.original_data)} style={{ marginTop: '12px', width: '100%', background: 'linear-gradient(135deg,#6C63FF,#3B82F6)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                Use This <span>▶</span>
              </button>
            </motion.div>
          ))}
        </div>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <p style={{fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap'}}>Or describe what you want:</p>
          <input type="text" placeholder="E.g., just make a normal bar chart instead..." onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value.trim()) { handleSend(e.target.value); e.target.value=''; } }} style={{...S.input, background: 'var(--input-bg)', padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--border)', flex: 1}} />
        </div>
      </motion.div>
    );
  };

  const renderHtmlOutput = (htmlObj, msgId) => {
    if (!htmlObj || !htmlObj.html) return null;
    return (
      <div style={{ marginTop: '14px', width: '100%' }}>
        {htmlObj.title && <h4 style={{fontSize:'14px', fontWeight:600, color:'var(--text-primary)', marginBottom:'8px'}}>{htmlObj.title}</h4>}
        <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: '#fff', position: 'relative' }}>
          <iframe
            srcDoc={htmlObj.html}
            style={{ width: '100%', height: htmlObj.height ? `${htmlObj.height}px` : '400px', border: 'none', display: 'block', background: 'transparent' }}
            sandbox="allow-scripts"
            title={htmlObj.title || 'App'}
          />
        </div>
      </div>
    );
  };

  const renderChartBody = (chart, msgId, isFullscreen = false) => {
    const config = chartConfigs[msgId] || defaultConfig;
    const cColors = config.customColors || DEFAULT_COLORS;
    
    const bgStyle = config.bgOption === 'transparent' ? 'transparent' 
      : config.bgOption === 'white' ? '#fff' 
      : config.bgOption === 'dark' ? '#1E1E2E'
      : config.bgOption === 'grad1' ? 'linear-gradient(135deg, #A78BFA, #3B82F6)'
      : config.bgOption === 'grad2' ? 'linear-gradient(135deg, #34D399, #06B6D4)'
      : config.bgOption === 'grad3' ? 'linear-gradient(135deg, #F97316, #EF4444)'
      : `linear-gradient(135deg, ${config.customBg[0]}, ${config.customBg[1]})`;
      
    const barW = config.barSize === 'thin' ? 10 : config.barSize === 'thick' ? 40 : 20;
    const strokeDash = config.strokeType === 'dashed' ? '5 5' : config.strokeType === 'dotted' ? '2 2' : '';
    const fSize = config.fontSize === 'Small' ? 10 : config.fontSize === 'Large' ? 14 : 12;

    const commonProps = { margin: { top: 20, right: 20, left: 0, bottom: 20 } };

    const renderGridAxis = () => (
      <>
        {config.showGrid && <CartesianGrid strokeDasharray={config.gridStyle === 'dashed' ? '3 3' : '0'} stroke={config.gridColor} vertical={false}/>}
        {config.showX && <XAxis dataKey={chart.xKey} axisLine={false} tickLine={false} tick={{fontSize:fSize,fill:'var(--chart-text)'}}/>}
        {config.showY && <YAxis axisLine={false} tickLine={false} tick={{fontSize:fSize,fill:'var(--chart-text)'}}/>}
        {config.showTooltips && <RechartsTooltip contentStyle={{background:'var(--tooltip-bg)',borderRadius:'10px',border:'1px solid var(--tooltip-border)', color: 'var(--text-primary)'}} itemStyle={{color: 'var(--text-primary)'}} />}
        {config.showLegend && <Legend verticalAlign={config.legendPos === 'top' || config.legendPos === 'bottom' ? config.legendPos : 'bottom'} align={config.legendPos === 'left' ? 'left' : config.legendPos === 'right' ? 'right' : 'center'} />}
      </>
    );

    return (
      <div 
        ref={el => { if(!isFullscreen) chartRefs.current[msgId] = el; }}
        style={{ padding: '20px', background: bgStyle, borderRadius: '12px', border: isFullscreen ? 'none' : '1px solid var(--border)', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {chart.title && <h4 style={{fontSize:'16px', fontWeight:700, color: (config.bgOption==='white'?'#000':config.bgOption==='transparent'?'var(--text-primary)':'#fff'), marginBottom:'16px', textAlign:'center'}}>{chart.title}</h4>}
        <ResponsiveContainer width="100%" height={isFullscreen ? "100%" : config.height} style={{flex: 1}}>
          {chart.type === 'bar' || chart.type === 'bar-grouped' ? (
            <BarChart data={chart.data} {...commonProps}>
              {renderGridAxis()}
              <Bar dataKey={chart.yKey} fill={cColors[0]} radius={[config.borderRadius,config.borderRadius,0,0]} barSize={barW}>
                {config.showLabels && <LabelList dataKey={chart.yKey} position="top" fill="var(--text-secondary)" fontSize={fSize}/>}
              </Bar>
              {chart.additionalLines?.map((k,i) => <Bar key={k} dataKey={k} fill={cColors[(i+1)%cColors.length]} radius={[config.borderRadius,config.borderRadius,0,0]} barSize={barW}/>)}
            </BarChart>
          ) : chart.type === 'bar-stacked' ? (
            <BarChart data={chart.data} {...commonProps}>
              {renderGridAxis()}
              <Bar dataKey={chart.yKey} stackId="a" fill={cColors[0]} barSize={barW} />
              {chart.additionalLines?.map((k,i) => <Bar key={k} dataKey={k} stackId="a" fill={cColors[(i+1)%cColors.length]} barSize={barW}/>)}
            </BarChart>
          ) : chart.type === 'waterfall' ? (
            <BarChart data={chart.data} {...commonProps}>
              {renderGridAxis()}
              <Bar dataKey={chart.yKey} barSize={barW}>
                {chart.data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry[chart.yKey] >= 0 ? '#10B981' : '#EF4444'} />)}
              </Bar>
            </BarChart>
          ) : chart.type === 'bar-horizontal' ? (
            <BarChart data={chart.data} layout="vertical" {...commonProps}>
              {config.showGrid && <CartesianGrid strokeDasharray={config.gridStyle === 'dashed' ? '3 3' : '0'} stroke={config.gridColor} horizontal={false}/>}
              {config.showX && <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize:fSize,fill:'var(--chart-text)'}}/>}
              {config.showY && <YAxis type="category" dataKey={chart.xKey} axisLine={false} tickLine={false} tick={{fontSize:fSize,fill:'var(--chart-text)'}} width={80}/>}
              {config.showTooltips && <RechartsTooltip contentStyle={{background:'var(--tooltip-bg)',borderRadius:'10px',border:'1px solid var(--tooltip-border)'}}/>}
              {config.showLegend && <Legend />}
              <Bar dataKey={chart.yKey} fill={cColors[0]} radius={[0,config.borderRadius,config.borderRadius,0]} barSize={barW}>
                {config.showLabels && <LabelList dataKey={chart.yKey} position="right" fill="var(--text-secondary)" fontSize={fSize}/>}
              </Bar>
            </BarChart>
          ) : chart.type === 'line' || chart.type === 'line-multi' ? (
            <LineChart data={chart.data} {...commonProps}>
              {renderGridAxis()}
              <Line type="monotone" dataKey={chart.yKey} stroke={cColors[0]} strokeWidth={config.lineThickness} strokeDasharray={strokeDash} dot={{r:config.dotSize,fill:cColors[0],strokeWidth:2}}>
                {config.showLabels && <LabelList dataKey={chart.yKey} position="top" fill="var(--text-secondary)" fontSize={fSize}/>}
              </Line>
              {chart.additionalLines?.map((k,i) => <Line key={k} type="monotone" dataKey={k} stroke={cColors[(i+1)%cColors.length]} strokeWidth={config.lineThickness} strokeDasharray={strokeDash} dot={{r:config.dotSize,fill:cColors[(i+1)%cColors.length]}}/>)}
            </LineChart>
          ) : chart.type === 'area' ? (
            <AreaChart data={chart.data} {...commonProps}>
              <defs>
                {cColors.map((c, i) => (
                  <linearGradient key={i} id={`color${i}${msgId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={c} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={c} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              {renderGridAxis()}
              <Area type="monotone" dataKey={chart.yKey} stroke={cColors[0]} fill={`url(#color0${msgId})`} strokeWidth={config.lineThickness}/>
              {chart.additionalLines?.map((k,i) => <Area key={k} type="monotone" dataKey={k} stroke={cColors[(i+1)%cColors.length]} fill={`url(#color${i+1}${msgId})`} strokeWidth={config.lineThickness}/>)}
            </AreaChart>
          ) : chart.type === 'area-stacked' ? (
            <AreaChart data={chart.data} {...commonProps}>
              {renderGridAxis()}
              <Area type="monotone" stackId="1" dataKey={chart.yKey} fill={cColors[0]} stroke={cColors[0]} strokeWidth={config.lineThickness}/>
              {chart.additionalLines?.map((k,i) => <Area key={k} stackId="1" type="monotone" dataKey={k} stroke={cColors[(i+1)%cColors.length]} fill={cColors[(i+1)%cColors.length]} strokeWidth={config.lineThickness}/>)}
            </AreaChart>
          ) : chart.type === 'pie' ? (
            <PieChart {...commonProps}>
              {config.showTooltips && <RechartsTooltip contentStyle={{background:'var(--tooltip-bg)',borderRadius:'10px',border:'1px solid var(--tooltip-border)'}}/>}
              {config.showLegend && <Legend />}
              <Pie data={chart.data} cx="50%" cy="50%" innerRadius={config.barSize==='thin'?60:config.barSize==='thick'?20:40} outerRadius={isFullscreen?150:80} dataKey={chart.yKey} nameKey={chart.xKey} label={config.showLabels ? {fontSize: fSize, fill:'var(--text-secondary)'} : false}>
                {chart.data.map((entry, index) => <Cell key={`cell-${index}`} fill={cColors[index % cColors.length]} />)}
              </Pie>
            </PieChart>
          ) : chart.type === 'donut' ? (
            <PieChart {...commonProps}>
              {config.showTooltips && <RechartsTooltip contentStyle={{background:'var(--tooltip-bg)',borderRadius:'10px',border:'1px solid var(--tooltip-border)'}}/>}
              {config.showLegend && <Legend />}
              <Pie data={chart.data} cx="50%" cy="50%" innerRadius={60} outerRadius={isFullscreen?150:100} dataKey={chart.yKey} nameKey={chart.xKey} label={config.showLabels ? {fontSize: fSize, fill:'var(--text-secondary)'} : false}>
                {chart.data.map((entry, index) => <Cell key={`cell-${index}`} fill={cColors[index % cColors.length]} />)}
                <LabelList position="center" fill="var(--text-primary)" fontSize={24} fontWeight="bold" value={chart.data.reduce((a,b)=>a+(b[chart.yKey]||0),0).toLocaleString()} />
              </Pie>
            </PieChart>
          ) : chart.type === 'radialbar' || chart.type === 'gauge' ? (
            <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={barW} data={chart.data} startAngle={chart.type==='gauge'?180:90} endAngle={chart.type==='gauge'?0:-270} {...commonProps}>
              <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff', fontSize: fSize }} background clockWise dataKey={chart.yKey}>
                {chart.data.map((entry, index) => <Cell key={`cell-${index}`} fill={cColors[index % cColors.length]} />)}
              </RadialBar>
              {config.showLegend && <Legend iconSize={10} width={120} height={140} layout="vertical" verticalAlign="middle" wrapperStyle={{top: 0, left: 350, lineHeight: '24px'}} />}
              {config.showTooltips && <RechartsTooltip contentStyle={{background:'var(--tooltip-bg)',borderRadius:'10px',border:'1px solid var(--tooltip-border)'}}/>}
            </RadialBarChart>
          ) : chart.type === 'radar' ? (
            <RadarChart data={chart.data} outerRadius={isFullscreen?150:90} {...commonProps}>
              {config.showTooltips && <RechartsTooltip contentStyle={{background:'var(--tooltip-bg)',borderRadius:'10px',border:'1px solid var(--tooltip-border)'}}/>}
              {config.showLegend && <Legend />}
              <PolarGrid stroke={config.gridColor} />
              <PolarAngleAxis dataKey={chart.xKey} tick={{fontSize: fSize, fill: 'var(--text-secondary)'}} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{fontSize: fSize}} />
              <Radar dataKey={chart.yKey} stroke={cColors[0]} fill={cColors[0]} fillOpacity={0.6} />
            </RadarChart>
          ) : chart.type === 'scatter' ? (
            <ScatterChart {...commonProps}>
              {config.showGrid && <CartesianGrid strokeDasharray={config.gridStyle === 'dashed' ? '3 3' : '0'} stroke={config.gridColor} />}
              {config.showX && <XAxis type="number" dataKey={chart.xKey} name={chart.xKey} tick={{fontSize:fSize,fill:'var(--chart-text)'}} />}
              {config.showY && <YAxis type="number" dataKey={chart.yKey} name={chart.yKey} tick={{fontSize:fSize,fill:'var(--chart-text)'}} />}
              {config.showTooltips && <RechartsTooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{background:'var(--tooltip-bg)',borderRadius:'10px',border:'1px solid var(--tooltip-border)'}}/>}
              <Scatter name={chart.title} data={chart.data} fill={cColors[0]}>
                {chart.data.map((entry, index) => <Cell key={`cell-${index}`} fill={cColors[index % cColors.length]} />)}
              </Scatter>
            </ScatterChart>
          ) : chart.type === 'bubble' ? (
            <ScatterChart {...commonProps}>
              {config.showGrid && <CartesianGrid strokeDasharray={config.gridStyle === 'dashed' ? '3 3' : '0'} stroke={config.gridColor} />}
              {config.showX && <XAxis type="category" dataKey={chart.xKey} name={chart.xKey} tick={{fontSize:fSize,fill:'var(--chart-text)'}} />}
              {config.showY && <YAxis type="number" dataKey={chart.yKey} name={chart.yKey} tick={{fontSize:fSize,fill:'var(--chart-text)'}} />}
              <ZAxis type="number" dataKey={chart.additionalLines?.[0] || chart.yKey} range={[10, 500]} name="Volume" />
              {config.showTooltips && <RechartsTooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{background:'var(--tooltip-bg)',borderRadius:'10px',border:'1px solid var(--tooltip-border)'}}/>}
              <Scatter name={chart.title} data={chart.data} fill={cColors[0]} fillOpacity={0.6}>
                {chart.data.map((entry, index) => <Cell key={`cell-${index}`} fill={cColors[index % cColors.length]} />)}
              </Scatter>
            </ScatterChart>
          ) : chart.type === 'composed' ? (
            <ComposedChart data={chart.data} {...commonProps}>
              {renderGridAxis()}
              <Bar dataKey={chart.yKey} fill={cColors[0]} barSize={barW} radius={[config.borderRadius,config.borderRadius,0,0]} />
              {chart.additionalLines && chart.additionalLines.length > 0 && <Line type="monotone" dataKey={chart.additionalLines[0]} stroke={cColors[1]} strokeWidth={config.lineThickness} dot={{r:config.dotSize}}/>}
            </ComposedChart>
          ) : chart.type === 'treemap' ? (
            <Treemap data={chart.data} dataKey={chart.yKey} ratio={4/3} stroke="#fff" fill={cColors[0]} content={
              <CustomizedTreemapContent colors={cColors} />
            }>
              {config.showTooltips && <RechartsTooltip contentStyle={{background:'var(--tooltip-bg)',borderRadius:'10px',border:'1px solid var(--tooltip-border)'}}/>}
            </Treemap>
          ) : chart.type === 'funnel' ? (
            <FunnelChart {...commonProps}>
              {config.showTooltips && <RechartsTooltip contentStyle={{background:'var(--tooltip-bg)',borderRadius:'10px',border:'1px solid var(--tooltip-border)'}}/>}
              <Funnel dataKey={chart.yKey} data={chart.data} isAnimationActive>
                {config.showLabels && <LabelList position="right" fill="var(--text-secondary)" stroke="none" dataKey={chart.xKey} fontSize={fSize} />}
                {chart.data.map((entry, index) => <Cell key={`cell-${index}`} fill={cColors[index % cColors.length]} />)}
              </Funnel>
            </FunnelChart>
          ) : <div style={{padding:'20px', textAlign:'center', color:'var(--text-tertiary)'}}>Unsupported chart type: {chart.type}</div>}
        </ResponsiveContainer>
        {chart.description && <p style={{fontSize: '13px', color: (config.bgOption==='white'?'#666':config.bgOption==='transparent'?'var(--text-secondary)':'#eee'), textAlign: 'center', marginTop: '12px'}}>{chart.description}</p>}
      </div>
    );
  };

  const renderChart = (chart, msg) => {
    if (!chart || !chart.data || !chart.data.length) return null;
    const msgId = msg.id;
    const config = chartConfigs[msgId] || defaultConfig;

    return (
      <div style={{ marginTop: '14px', width: '100%' }}>
        {renderChartBody(chart, msgId)}

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          <div style={{display:'flex', background:'var(--input-bg)', borderRadius:'8px', padding:'2px', border:'1px solid var(--border)'}}>
            {[
              {id:'bar', I:BarChart2}, {id:'line', I:LineChartIcon}, 
              {id:'pie', I:PieChartIcon}, {id:'area', I:Activity}, {id:'radar', I:RadarIcon}
            ].map(t => (
              <button key={t.id} onClick={()=>updateChartType(msgId, t.id)} style={{...S.actBtn, width:'26px', height:'26px', background: chart.type.startsWith(t.id) ? 'var(--card)' : 'transparent', color: chart.type.startsWith(t.id) ? 'var(--primary)' : 'var(--text-tertiary)', boxShadow: chart.type.startsWith(t.id) ? 'var(--shadow-card)' : 'none'}}>
                <t.I size={14}/>
              </button>
            ))}
          </div>
          
          <div style={{display:'flex', gap:'4px', alignItems:'center', background:'var(--input-bg)', borderRadius:'8px', padding:'4px 8px', border:'1px solid var(--border)'}}>
            {Object.entries(THEMES).map(([name, colors]) => (
              <button key={name} onClick={()=>updateConfig(msgId, { theme: name, customColors: [...colors] })} style={{width:'16px', height:'16px', borderRadius:'50%', border: config.theme === name ? '2px solid var(--text-primary)' : 'none', background:colors[0], cursor:'pointer', padding:0}} title={name} />
            ))}
          </div>

          <button style={S.chartActBtn}>
            <LayoutDashboard size={14} /> Add to Dashboard
          </button>
          <button onClick={() => setActiveChartConfigId(activeChartConfigId === msgId ? null : msgId)} style={{...S.chartActBtn, background: activeChartConfigId === msgId ? 'var(--primary)' : 'var(--card)', color: activeChartConfigId === msgId ? '#fff' : 'var(--text-secondary)'}}>
            <Settings size={14} /> Customize
          </button>
        </div>

        <AnimatePresence>
          {activeChartConfigId === msgId && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginTop: '12px' }}>
              <div style={S.customizerPanel}>
                <div style={S.cSection}>
                  <h5 style={S.cTitle}>Themes</h5>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {Object.entries(THEMES).map(([name, colors]) => (
                      <button key={name} onClick={() => updateConfig(msgId, { theme: name, customColors: [...colors] })} style={{...S.themeBtn, border: config.theme === name ? '2px solid var(--primary)' : '1px solid var(--border)'}}>
                        <div style={{display:'flex', height:'16px'}}>
                          {colors.slice(0,3).map(c => <div key={c} style={{flex:1, background:c}}/>)}
                        </div>
                        <span style={{fontSize:'11px', display:'block', padding:'4px'}}>{name}</span>
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: '12px' }}>
                     <h5 style={S.cTitle}>Custom Colors</h5>
                     <div style={{display:'flex', gap:'8px'}}>
                       {config.customColors.slice(0,4).map((c, i) => (
                         <div key={i} style={{position:'relative'}}>
                           <div onClick={() => setColorPickerTarget({id: msgId, index: i})} style={{width:'24px', height:'24px', borderRadius:'4px', background:c, cursor:'pointer', border:'1px solid var(--border)'}}/>
                           {colorPickerTarget?.id === msgId && colorPickerTarget?.index === i && (
                             <div style={{position:'absolute', zIndex:10, top:'30px', left:0, padding:'8px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'8px', boxShadow:'var(--shadow-md)'}}>
                               <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'4px'}}><X size={14} cursor="pointer" onClick={()=>setColorPickerTarget(null)}/></div>
                               <HexColorPicker color={c} onChange={(color) => {
                                 const newCols = [...config.customColors];
                                 newCols[i] = color;
                                 updateConfig(msgId, { customColors: newCols, theme: 'Custom' });
                               }} />
                             </div>
                           )}
                         </div>
                       ))}
                     </div>
                  </div>
                </div>

                <div style={S.cSection}>
                  <h5 style={S.cTitle}>Background</h5>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['transparent', 'white', 'dark', 'grad1', 'grad2', 'grad3'].map(bg => (
                      <button key={bg} onClick={() => updateConfig(msgId, { bgOption: bg })} style={{...S.bgBtn, background: bg==='transparent'?'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYNgGwEg9AMs1sZEYcgxMg/g0EhsbxKeR2NggPo3ExgbxaSQ2NohPIwEA148Q+U7wPdwAAAAASUVORK5CYII=")':bg==='white'?'#fff':bg==='dark'?'#1E1E2E':bg==='grad1'?'linear-gradient(135deg, #A78BFA, #3B82F6)':bg==='grad2'?'linear-gradient(135deg, #34D399, #06B6D4)':'linear-gradient(135deg, #F97316, #EF4444)', border: config.bgOption === bg ? '2px solid var(--primary)' : '1px solid var(--border)'}}>
                        {config.bgOption === bg && <Check size={14} color={bg==='white'||bg==='transparent'?'#000':'#fff'}/>}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={S.cSection}>
                  <h5 style={S.cTitle}>Style</h5>
                  <div style={S.sliderRow}>
                    <label style={S.cLabel}>Border Radius</label>
                    <input type="range" min="0" max="20" value={config.borderRadius} onChange={(e)=>updateConfig(msgId, {borderRadius: Number(e.target.value)})} style={{flex:1}}/>
                    <span style={S.cVal}>{config.borderRadius}px</span>
                  </div>
                  <div style={S.sliderRow}>
                    <label style={S.cLabel}>Line Thick</label>
                    <input type="range" min="1" max="5" value={config.lineThickness} onChange={(e)=>updateConfig(msgId, {lineThickness: Number(e.target.value)})} style={{flex:1}}/>
                    <span style={S.cVal}>{config.lineThickness}px</span>
                  </div>
                  <div style={S.sliderRow}>
                    <label style={S.cLabel}>Bar Size</label>
                    <select value={config.barSize} onChange={e=>updateConfig(msgId, {barSize: e.target.value})} style={S.cSelect}><option>thin</option><option>medium</option><option>thick</option></select>
                  </div>
                  <div style={S.sliderRow}>
                    <label style={S.cLabel}>Stroke Type</label>
                    <select value={config.strokeType} onChange={e=>updateConfig(msgId, {strokeType: e.target.value})} style={S.cSelect}><option>solid</option><option>dashed</option><option>dotted</option></select>
                  </div>
                </div>

                <div style={S.cSection}>
                  <h5 style={S.cTitle}>Grid & Axis</h5>
                  <label style={S.cCheckbox}><input type="checkbox" checked={config.showGrid} onChange={e=>updateConfig(msgId, {showGrid: e.target.checked})} /> Show Grid</label>
                  <label style={S.cCheckbox}><input type="checkbox" checked={config.showX} onChange={e=>updateConfig(msgId, {showX: e.target.checked})} /> Show X Axis</label>
                  <label style={S.cCheckbox}><input type="checkbox" checked={config.showY} onChange={e=>updateConfig(msgId, {showY: e.target.checked})} /> Show Y Axis</label>
                  <div style={S.sliderRow}>
                    <label style={S.cLabel}>Grid Style</label>
                    <select value={config.gridStyle} onChange={e=>updateConfig(msgId, {gridStyle: e.target.value})} style={S.cSelect}><option>solid</option><option>dashed</option></select>
                  </div>
                </div>

                <div style={S.cSection}>
                  <h5 style={S.cTitle}>Labels</h5>
                  <label style={S.cCheckbox}><input type="checkbox" checked={config.showLegend} onChange={e=>updateConfig(msgId, {showLegend: e.target.checked})} /> Show Legend</label>
                  <label style={S.cCheckbox}><input type="checkbox" checked={config.showLabels} onChange={e=>updateConfig(msgId, {showLabels: e.target.checked})} /> Data Labels</label>
                  <label style={S.cCheckbox}><input type="checkbox" checked={config.showTooltips} onChange={e=>updateConfig(msgId, {showTooltips: e.target.checked})} /> Tooltips</label>
                  <div style={S.sliderRow}>
                    <label style={S.cLabel}>Legend Pos</label>
                    <select value={config.legendPos} onChange={e=>updateConfig(msgId, {legendPos: e.target.value})} style={S.cSelect}><option>bottom</option><option>top</option><option>left</option><option>right</option></select>
                  </div>
                  <div style={S.sliderRow}>
                    <label style={S.cLabel}>Font Size</label>
                    <select value={config.fontSize} onChange={e=>updateConfig(msgId, {fontSize: e.target.value})} style={S.cSelect}><option>Small</option><option>Medium</option><option>Large</option></select>
                  </div>
                </div>

                <div style={S.cSection}>
                  <h5 style={S.cTitle}>Dimensions</h5>
                  <div style={S.sliderRow}>
                    <label style={S.cLabel}>Height</label>
                    <input type="range" min="200" max="600" step="50" value={config.height} onChange={(e)=>updateConfig(msgId, {height: Number(e.target.value)})} style={{flex:1}}/>
                    <span style={S.cVal}>{config.height}px</span>
                  </div>
                  
                  <div style={{marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '12px'}}>
                    <h5 style={S.cTitle}>Presets</h5>
                    <div style={{display:'flex', gap:'8px', marginBottom: '12px'}}>
                      <input type="text" placeholder="Preset name" value={presetName} onChange={e=>setPresetName(e.target.value)} style={{...S.cSelect, flex:1}} />
                      <button onClick={()=>savePreset(config)} style={{background:'var(--primary)', color:'#fff', border:'none', borderRadius:'6px', padding:'0 12px', cursor:'pointer', fontSize:'12px'}}>Save</button>
                    </div>
                    <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                      {presets.map((p, i) => (
                        <button key={i} onClick={()=>updateConfig(msgId, p.config)} style={{...S.themeBtn, padding:'4px 8px', width:'auto', background:'var(--input-bg)'}}>{p.name}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{display:'flex', gap:'8px', marginTop: '16px'}}>
                    <button onClick={()=>updateConfig(msgId, defaultConfig)} style={{...S.chartActBtn, flex:1}}>Reset</button>
                    <button onClick={()=>{
                      const conf = {...chartConfigs[msgId]};
                      setChartConfigs(prev => {
                        const next = {...prev};
                        Object.keys(next).forEach(k => next[k] = conf);
                        return next;
                      });
                    }} style={{...S.chartActBtn, flex:1}}>Apply to All</button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div style={S.page} variants={pageV} initial="initial" animate="animate" exit="exit">
      
      <AnimatePresence>
        {fullscreenData && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}
          >
            <div style={{ background: 'var(--card)', width: '100%', maxWidth: '1200px', height: '90%', borderRadius: '16px', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>{fullscreenData.content.title || 'Preview'}</h3>
                <button onClick={() => setFullscreenData(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={24} /></button>
              </div>
              <div style={{ flex: 1, padding: '24px', overflow: 'auto', background: 'var(--bg)' }}>
                {fullscreenData.type === 'html' ? (
                  <iframe srcDoc={fullscreenData.content.html} style={{ width: '100%', height: '100%', border: 'none', background: '#fff', borderRadius: '8px' }} sandbox="allow-scripts" title={fullscreenData.content.title} />
                ) : (
                  renderChartBody(fullscreenData.content, fullscreenData.msgId, true)
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={S.container}>
        <div style={S.chatArea}>
          <div style={S.messagesArea}>
            <AnimatePresence>
              {messages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '12px', justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start' }}>
                  {msg.type === 'ai' && <div style={S.aiAvatar}><Sparkles size={16} color="#fff" /></div>}
                  <div style={{ ...S.bubble, ...(msg.type === 'user' ? S.userBubble : S.aiBubble) }}>
                    {msg.content && <p style={{ fontSize: '14px', lineHeight: 1.6, color: msg.type === 'user' ? '#fff' : 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{msg.content}</p>}
                    
                    {msg.htmlOutput && (
                      <>
                        {renderHtmlOutput(msg.htmlOutput, msg.id)}
                        {renderToolbar(msg, 'html')}
                      </>
                    )}
                    
                    {msg.chartSuggest && renderChartSuggest(msg.chartSuggest, msg.id)}
                    
                    {msg.chart && (
                      <>
                        {renderChart(msg.chart, msg)}
                        {renderToolbar(msg, 'chart')}
                      </>
                    )}

                  </div>
                  {msg.type === 'user' && <div style={S.userAvatar}><User size={16} color="#fff" /></div>}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={S.aiAvatar}><Sparkles size={16} color="#fff" /></div>
                <div style={S.aiBubble}><div style={{ display: 'flex', gap: '4px' }}>
                  {[0, 1, 2].map(i => <span key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', animation: 'typing 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }} />)}
                </div></div>
              </motion.div>
            )}
            <div ref={endRef} />
          </div>
          <div style={S.inputArea}>
            <div style={S.inputWrap}>
              <motion.button style={S.attachBtn} whileHover={{ backgroundColor: 'var(--hover-bg)' }}><Paperclip size={18} color="var(--text-tertiary)" /></motion.button>
              <input type="text" placeholder="Ask NexaBI to build a chart, an animated component, or an interactive tool..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} style={S.input} />
              <motion.button style={{ ...S.sendBtn, opacity: input.trim() ? 1 : 0.5 }} onClick={() => handleSend(input)} whileHover={input.trim() ? { scale: 1.05 } : {}} whileTap={input.trim() ? { scale: 0.95 } : {}}>
                <Send size={18} color="#fff" />
              </motion.button>
            </div>
          </div>
        </div>
        <div style={S.panel}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Select Dataset</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px', marginBottom: '16px' }}>Connect your uploaded data to AI</p>

          {/* Dataset selection status */}
          {selectedDataset ? (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={15} color="var(--success)" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--success)', flex: 1 }}>✓ {selectedDataset.name} selected</span>
              <motion.button onClick={clearDatasetSelection} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }} whileHover={{ scale: 1.1 }}>
                <X size={14} color="var(--text-tertiary)" />
              </motion.button>
            </motion.div>
          ) : (
            <div style={{ background: 'var(--input-bg)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={14} /> No dataset selected — AI will use general knowledge
            </div>
          )}

          {/* Dataset info card when selected */}
          <AnimatePresence>
            {selectedDataset && datasetDetail && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ background: 'var(--input-bg)', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(108,99,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileSpreadsheet size={18} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{datasetDetail.name}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{datasetDetail.row_count} rows · {datasetDetail.file_type?.toUpperCase()}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {Object.keys(datasetDetail.columns || {}).map((col, i) => (
                    <span key={i} style={{ padding: '3px 8px', borderRadius: '6px', background: 'var(--card)', border: '1px solid var(--border)', fontSize: '10px', fontWeight: 500, color: 'var(--text-secondary)' }}>{col}</span>
                  ))}
                </div>
                <motion.button onClick={clearDatasetSelection} style={{ marginTop: '12px', width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', fontSize: '12px', fontWeight: 500, color: 'var(--text-tertiary)', cursor: 'pointer' }} whileHover={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                  Clear selection
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {loadingDataset && (
            <div style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: 'var(--text-tertiary)' }}>Loading dataset...</div>
          )}

          {/* Dataset list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '28px' }}>
            {datasets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', fontSize: '13px', color: 'var(--text-tertiary)' }}>No datasets uploaded yet.<br/>Go to Upload page to add data.</div>
            ) : datasets.map((ds, i) => {
              const Icon = getFileIcon(ds.name);
              const isSelected = selectedDataset?.id === ds.id;
              return (
                <motion.div key={ds.id} style={{ ...S.sourceItem, background: isSelected ? 'rgba(108,99,255,0.06)' : 'transparent', border: isSelected ? '1px solid rgba(108,99,255,0.2)' : '1px solid transparent', borderRadius: '12px' }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ backgroundColor: isSelected ? 'rgba(108,99,255,0.1)' : 'var(--hover-bg)' }} onClick={() => handleSelectDataset(ds)} >
                  <div style={S.sourceIcon}><Icon size={18} color={isSelected ? 'var(--primary)' : 'var(--text-secondary)'} /></div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>{ds.name}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '1px' }}>{ds.file_size} · {ds.row_count} rows</p>
                  </div>
                  {isSelected && <CheckCircle size={14} color="var(--success)" />}
                </motion.div>
              );
            })}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suggested Builds</h4>
            {[
              'Show me a bar chart of the top 10 values',
              'Create a pie chart breakdown by category',
              'Show monthly trends as a line chart',
              'Build a heatmap of correlations'
            ].map((q, i) => (
              <motion.button key={i} style={S.sugBtn} whileHover={{ borderColor: 'var(--primary)', color: 'var(--primary)' }} onClick={() => setInput(q)}>
                <Sparkles size={14} />{q}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes typing{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style>
    </motion.div>
  );
};

const CustomizedTreemapContent = ({ root, depth, x, y, width, height, index, payload, colors, rank, name }) => {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} style={{ fill: depth < 2 ? colors[Math.floor((index / root.children?.length || 1) * colors.length) % colors.length] : 'none', stroke: '#fff', strokeWidth: 2 / (depth + 1e-10), strokeOpacity: 1 / (depth + 1e-10) }} />
      {width > 30 && height > 30 && (
        <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={12}>{name}</text>
      )}
    </g>
  );
};

const S = {
  page: { height: 'calc(100vh - var(--topbar-height))', padding: 0 },
  container: { display: 'flex', height: '100%' },
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' },

  messagesArea: { flex: 1, padding: '24px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' },
  aiAvatar: { width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#6C63FF,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(108,99,255,0.25)' },
  userAvatar: { width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#3B82F6,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bubble: { maxWidth: '85%', borderRadius: '16px', padding: '14px 18px', width: '100%' },
  userBubble: { background: 'linear-gradient(135deg,#6C63FF,#3B82F6)', borderBottomRightRadius: '4px', boxShadow: '0 2px 12px rgba(108,99,255,0.2)', maxWidth: '75%', width: 'auto' },
  aiBubble: { background: 'var(--card)', border: '1px solid var(--border)', borderBottomLeftRadius: '4px', boxShadow: 'var(--shadow-card)' },
  actBtn: { width: '28px', height: '28px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' },
  inputArea: { padding: '16px 24px 20px', borderTop: '1px solid var(--border)', background: 'var(--card)' },
  inputWrap: { display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--input-bg)', borderRadius: '14px', padding: '6px 8px 6px 6px', border: '1px solid var(--border)' },
  attachBtn: { width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, background: 'transparent', fontSize: '14px', color: 'var(--text-primary)', padding: '8px 0', border: 'none', outline: 'none' },
  sendBtn: { width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#6C63FF,#3B82F6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(108,99,255,0.25)' },
  panel: { width: '300px', padding: '24px', background: 'var(--card)', overflowY: 'auto', flexShrink: 0 },
  sourceItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', cursor: 'pointer' },
  sourceIcon: { width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(108,99,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sugBtn: { display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 14px', marginBottom: '6px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', textAlign: 'left', lineHeight: 1.4 },

  chartActBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, cursor: 'pointer' },
  customizerPanel: { background: 'var(--input-bg)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  cSection: { display: 'flex', flexDirection: 'column', gap: '10px' },
  cTitle: { fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' },
  themeBtn: { width: '70px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', overflow: 'hidden', cursor: 'pointer', padding: 0 },
  bgBtn: { width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  sliderRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  cLabel: { fontSize: '12px', color: 'var(--text-secondary)', width: '70px' },
  cVal: { fontSize: '12px', color: 'var(--text-primary)', width: '30px', textAlign: 'right' },
  cSelect: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', color: 'var(--text-primary)', outline: 'none' },
  cCheckbox: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' },

  toolbar: { display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '12px' },
  toolbarBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }
};

export default Query;
