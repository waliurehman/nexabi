import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Sparkles, Download, RefreshCw, X, Lightbulb, PlayCircle, Loader2 } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { getDatasets } from '../api/files';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const SAMPLE_DATA = [
  { Machine_ID: 'M-101', Defect_Rate_Pct: 2.4, Efficiency_Pct: 94, Downtime_Minutes: 45, Units_Produced: 1250, Defect_Type: 'Scratch', Factory: 'North', Shift: 'Morning', Month: 'Jan', Year: 2023, Production_Cost: 15000, Scrap_Cost: 350 },
  { Machine_ID: 'M-102', Defect_Rate_Pct: 1.8, Efficiency_Pct: 96, Downtime_Minutes: 30, Units_Produced: 1400, Defect_Type: 'Dent', Factory: 'North', Shift: 'Morning', Month: 'Jan', Year: 2023, Production_Cost: 16500, Scrap_Cost: 280 },
  { Machine_ID: 'M-103', Defect_Rate_Pct: 3.5, Efficiency_Pct: 88, Downtime_Minutes: 120, Units_Produced: 950, Defect_Type: 'Alignment', Factory: 'South', Shift: 'Night', Month: 'Jan', Year: 2023, Production_Cost: 12000, Scrap_Cost: 800 },
  { Machine_ID: 'M-104', Defect_Rate_Pct: 0.9, Efficiency_Pct: 98, Downtime_Minutes: 15, Units_Produced: 1600, Defect_Type: 'None', Factory: 'East', Shift: 'Afternoon', Month: 'Feb', Year: 2023, Production_Cost: 18000, Scrap_Cost: 100 },
  { Machine_ID: 'M-101', Defect_Rate_Pct: 2.1, Efficiency_Pct: 95, Downtime_Minutes: 40, Units_Produced: 1300, Defect_Type: 'Scratch', Factory: 'North', Shift: 'Morning', Month: 'Feb', Year: 2023, Production_Cost: 15500, Scrap_Cost: 320 },
  { Machine_ID: 'M-102', Defect_Rate_Pct: 1.5, Efficiency_Pct: 97, Downtime_Minutes: 25, Units_Produced: 1450, Defect_Type: 'Dent', Factory: 'North', Shift: 'Afternoon', Month: 'Feb', Year: 2023, Production_Cost: 17000, Scrap_Cost: 250 },
];

const THEMES = {
  dark: { bg: '#0B1120', cardBg: '#1a2035', text: '#ffffff', colors: ['#0078D4', '#6C63FF', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'] },
  blue: { bg: '#0a1628', cardBg: '#0d2137', text: '#ffffff', colors: ['#4299E1', '#63B3ED', '#3182CE', '#2B6CB0', '#2C5282'] },
  green: { bg: '#0a1a0a', cardBg: '#0d2010', text: '#ffffff', colors: ['#48BB78', '#68D391', '#38A169', '#2F855A', '#276749'] },
  red: { bg: '#1a0a0a', cardBg: '#2d1515', text: '#ffffff', colors: ['#F56565', '#FC8181', '#E53E3E', '#C53030', '#9B2C2C'] },
  purple: { bg: '#12051a', cardBg: '#1e0a2d', text: '#ffffff', colors: ['#9F7AEA', '#B794F4', '#805AD5', '#6B46C1', '#553C9A'] }
};

const formatNumber = (num) => {
  if (isNaN(num)) return num;
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return Number.isInteger(num) ? num.toString() : num.toFixed(2);
};

const detectColumns = (data) => {
  if (!data || data.length === 0) return { numeric: [], text: [], date: [] };
  const cols = Object.keys(data[0]);
  return {
    numeric: cols.filter(c => !isNaN(parseFloat(data[0][c]))),
    text: cols.filter(c => isNaN(data[0][c])),
    date: cols.filter(c => c.toLowerCase().includes('date') || c.toLowerCase().includes('month') || c.toLowerCase().includes('year'))
  };
};

const ChartBuilder = () => {
  const { token } = useAuth();
  
  // App State
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [datasets, setDatasets] = useState([]);
  
  // Data State
  const [rawData, setRawData] = useState([]);
  const [filename, setFilename] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  
  // AI Config State
  const [aiConfig, setAiConfig] = useState(null);
  
  // Dashboard Interaction State
  const [filters, setFilters] = useState({});

  useEffect(() => {
    if (token) getDatasets(token).then(data => setDatasets(data || [])).catch(() => {});
  }, [token]);

  const handleDatasetSelect = async (id) => {
    if (!id) return;
    try {
      const res = await fetch(`https://nexabi-backend-production.up.railway.app/api/files/datasets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.preview) {
        setRawData(data.preview);
        setFilename(data.filename || 'Dataset');
      }
    } catch (e) {
      alert('Failed to load dataset');
    }
  };

  const loadSampleData = () => {
    setRawData(SAMPLE_DATA);
    setFilename('Manufacturing QC (Sample)');
  };

  const handleGenerate = async () => {
    if (!rawData.length) return alert('Please load data first.');
    if (!userPrompt) return alert('Please enter a prompt.');
    
    setLoading(true);
    setFilters({});
    
    const colTypes = detectColumns(rawData);
    const sampleRows = rawData.slice(0, 5);
    
    const aiPrompt = `
      User request: "${userPrompt}"
      
      Dataset columns and types:
      Numeric: ${colTypes.numeric.join(', ')}
      Text/Category: ${colTypes.text.join(', ')}
      Date: ${colTypes.date.join(', ')}
      
      Sample data (first 5 rows):
      ${JSON.stringify(sampleRows)}
      
      Based on the user request and data, return ONLY this JSON format (no markdown, no backticks, just raw valid JSON):
      {
        "dashboard_title": "title here",
        "theme": "dark",
        "kpi_columns": ["col1", "col2"],
        "slicer_columns": ["col1", "col2"],
        "charts": [
          {
            "type": "bar",
            "title": "chart title",
            "x_column": "column_name",
            "y_column": "column_name",
            "size": "medium"
          }
        ],
        "insights": ["insight 1"]
      }
      Allowed chart types: bar, horizontal_bar, line, pie, donut, area, scatter.
      Allowed sizes: small (25%), medium (50%), large (75%), full (100%).
      Allowed themes: dark, blue, green, red, purple.
    `;

    try {
      const res = await fetch(`https://nexabi-backend-production.up.railway.app/api/queries/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question: aiPrompt })
      });
      const data = await res.json();
      
      // Clean possible markdown code blocks from LLM
      let jsonStr = data.answer || data.response || data;
      if (typeof jsonStr !== 'string') jsonStr = JSON.stringify(jsonStr);
      jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const config = JSON.parse(jsonStr);
      setAiConfig(config);
      setStep(2);
    } catch (e) {
      console.error(e);
      alert('AI failed to generate dashboard format. Please try again.');
    }
    setLoading(false);
  };

  const toggleFilter = (col, val) => {
    setFilters(prev => {
      const active = prev[col] || [];
      if (active.includes(val)) {
        const next = active.filter(v => v !== val);
        if (next.length === 0) {
          const newFilters = { ...prev };
          delete newFilters[col];
          return newFilters;
        }
        return { ...prev, [col]: next };
      }
      return { ...prev, [col]: [...active, val] };
    });
  };

  const exportPdf = async () => {
    const el = document.getElementById('ai-dashboard-content');
    if (!el) return;
    const canvas = await html2canvas(el, { backgroundColor: THEMES[aiConfig?.theme || 'dark'].bg, scale: 2 });
    const pdf = new jsPDF('l', 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), (canvas.height * pdf.internal.pageSize.getWidth()) / canvas.width);
    pdf.save(`${aiConfig?.dashboard_title || 'Dashboard'}.pdf`);
  };

  // FILTER LOGIC
  const filteredData = useMemo(() => {
    if (Object.keys(filters).length === 0) return rawData;
    return rawData.filter(row => Object.entries(filters).every(([col, activeVals]) => activeVals.includes(row[col])));
  }, [rawData, filters]);

  // AGGREGATOR
  const aggregate = (data, groupCol, valCol) => {
    if (!groupCol || !valCol) return [];
    const res = {};
    data.forEach(row => {
      const k = row[groupCol];
      if (!res[k]) res[k] = 0;
      res[k] += Number(row[valCol]) || 0;
    });
    return Object.entries(res).map(([k, v]) => ({ name: k, value: v })).sort((a, b) => b.value - a.value);
  };

  // -----------------------------------------------------
  // RENDER SETUP
  // -----------------------------------------------------
  if (step === 1 || loading) {
    return (
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: '"Segoe UI", sans-serif' }}>
        <h1 style={{ fontSize: '28px', color: '#1f2937', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Sparkles color="#6C63FF" /> AI Dashboard Builder
        </h1>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', color: '#374151', marginBottom: '16px' }}>1. Select Dataset</h2>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <select 
              onChange={e => handleDatasetSelect(e.target.value)}
              style={{ flex: 1, padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none' }}
              disabled={loading}
            >
              <option value="">Select from my datasets...</option>
              {datasets.map(d => <option key={d.id} value={d.id}>{d.filename}</option>)}
            </select>
            <button onClick={loadSampleData} style={{ padding: '12px 24px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlayCircle size={18} /> Try Sample
            </button>
          </div>
          {filename && <div style={{ marginTop: '12px', fontSize: '14px', color: '#10B981', fontWeight: 600 }}>✓ Dataset loaded: {filename} ({rawData.length} rows)</div>}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', color: '#374151', marginBottom: '16px' }}>2. Tell AI what to build</h2>
          <textarea
            value={userPrompt}
            onChange={e => setUserPrompt(e.target.value)}
            disabled={loading}
            placeholder="Examples:&#10;• Show me manufacturing quality analysis&#10;• Build sales dashboard with monthly trends&#10;• Create HR dashboard with department breakdown"
            style={{ width: '100%', height: '150px', padding: '16px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', marginBottom: '20px' }}
          />
          <button 
            onClick={handleGenerate}
            disabled={loading || !rawData.length || !userPrompt}
            style={{ width: '100%', padding: '16px', background: '#6C63FF', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: (loading || !rawData.length || !userPrompt) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', opacity: (loading || !rawData.length || !userPrompt) ? 0.7 : 1 }}
          >
            {loading ? <><Loader2 className="spin" size={20} /> AI is analyzing your data...</> : <><Sparkles size={20} /> Generate Dashboard</>}
          </button>
        </div>
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // -----------------------------------------------------
  // RENDER DASHBOARD
  // -----------------------------------------------------
  const theme = THEMES[aiConfig.theme] || THEMES.dark;

  return (
    <div style={{ flex: 1, overflow: 'auto', background: theme.bg, color: theme.text, fontFamily: '"Segoe UI", sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ padding: '20px 32px', background: theme.cardBg, borderBottom: `1px solid rgba(255,255,255,0.1)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>{aiConfig.dashboard_title || 'AI Dashboard'}</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{...btn, color: theme.text, borderColor: 'rgba(255,255,255,0.2)'}} onClick={() => setStep(1)}><RefreshCw size={16}/> Change Data</button>
          <button style={{...btn, color: theme.text, borderColor: 'rgba(255,255,255,0.2)'}} onClick={exportPdf}><Download size={16}/> Export PDF</button>
        </div>
      </div>

      <div id="ai-dashboard-content" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* SLICERS */}
        {aiConfig.slicer_columns?.length > 0 && (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {aiConfig.slicer_columns.map(col => {
              const uniqueVals = [...new Set(rawData.map(r => r[col]))].filter(v => v).sort();
              return (
                <div key={col} style={{ background: theme.cardBg, padding: '16px', borderRadius: '12px', minWidth: '240px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: '12px', fontWeight: 600 }}>{col}</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {uniqueVals.map(val => {
                      const isActive = filters[col]?.includes(val);
                      return (
                        <button key={val} onClick={() => toggleFilter(col, val)} style={{ padding: '6px 12px', borderRadius: '16px', border: `1px solid ${isActive ? theme.colors[0] : 'rgba(255,255,255,0.2)'}`, background: isActive ? theme.colors[0] : 'transparent', color: isActive ? '#fff' : theme.text, fontSize: '13px', cursor: 'pointer' }}>
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {Object.keys(filters).length > 0 && (
              <button onClick={() => setFilters({})} style={{ ...btn, borderColor: '#ef4444', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
                <X size={16}/> Clear Filters
              </button>
            )}
          </div>
        )}

        {/* KPIs */}
        {aiConfig.kpi_columns?.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`, gap: '16px' }}>
            {aiConfig.kpi_columns.map((col, idx) => {
              const sum = filteredData.reduce((acc, row) => acc + (Number(row[col]) || 0), 0);
              return (
                <div key={col} style={{ background: theme.cardBg, padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontWeight: 600 }}>{col.replace(/_/g, ' ')}</div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: theme.colors[idx % theme.colors.length] }}>{formatNumber(sum)}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* CHARTS */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          {aiConfig.charts?.map((chart, idx) => {
            const wMap = { small: 'calc(25% - 18px)', medium: 'calc(50% - 12px)', large: 'calc(75% - 6px)', full: '100%' };
            const width = wMap[chart.size] || 'calc(50% - 12px)';
            const data = aggregate(filteredData, chart.x_column, chart.y_column);

            return (
              <div key={idx} style={{ width, minWidth: '300px', background: theme.cardBg, padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 20px 0', fontWeight: 600 }}>{chart.title}</h3>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {(() => {
                      if (chart.type === 'line') return (
                        <LineChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                          <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fontSize: 12}} />
                          <YAxis stroke="rgba(255,255,255,0.5)" tick={{fontSize: 12}} />
                          <RechartsTooltip contentStyle={{ background: theme.bg, borderColor: 'rgba(255,255,255,0.1)' }} />
                          <Line type="monotone" dataKey="value" stroke={theme.colors[idx % theme.colors.length]} strokeWidth={3} />
                        </LineChart>
                      );
                      if (chart.type === 'horizontal_bar') return (
                        <BarChart data={data} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
                          <XAxis type="number" stroke="rgba(255,255,255,0.5)" tick={{fontSize: 12}} />
                          <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" tick={{fontSize: 12}} width={100} />
                          <RechartsTooltip contentStyle={{ background: theme.bg, borderColor: 'rgba(255,255,255,0.1)' }} />
                          <Bar dataKey="value" fill={theme.colors[idx % theme.colors.length]} radius={[0, 4, 4, 0]} onClick={(d) => toggleFilter(chart.x_column, d.name)} cursor="pointer" />
                        </BarChart>
                      );
                      if (chart.type === 'pie' || chart.type === 'donut') return (
                        <PieChart>
                          <RechartsTooltip contentStyle={{ background: theme.bg, borderColor: 'rgba(255,255,255,0.1)' }} />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={chart.type === 'donut' ? 60 : 0} outerRadius={90} onClick={(d) => toggleFilter(chart.x_column, d.name)} cursor="pointer">
                            {data.map((e, i) => <Cell key={i} fill={theme.colors[i % theme.colors.length]} />)}
                          </Pie>
                        </PieChart>
                      );
                      // default Bar
                      return (
                        <BarChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                          <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fontSize: 12}} />
                          <YAxis stroke="rgba(255,255,255,0.5)" tick={{fontSize: 12}} />
                          <RechartsTooltip contentStyle={{ background: theme.bg, borderColor: 'rgba(255,255,255,0.1)' }} />
                          <Bar dataKey="value" fill={theme.colors[idx % theme.colors.length]} radius={[4, 4, 0, 0]} onClick={(d) => toggleFilter(chart.x_column, d.name)} cursor="pointer" />
                        </BarChart>
                      );
                    })()}
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>

        {/* INSIGHTS & TABLE ROW */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          
          {aiConfig.insights?.length > 0 && (
            <div style={{ flex: '1', minWidth: '300px', background: theme.cardBg, padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><Lightbulb size={18} color="#F59E0B" /> AI Insights</h3>
              <ul style={{ margin: 0, padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {aiConfig.insights.map((insight, i) => (
                  <li key={i} style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: 1.5 }}>{insight}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ flex: '2', minWidth: '400px', background: theme.cardBg, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 600 }}>Raw Data (First 10 Rows)</div>
            <div style={{ overflowX: 'auto', padding: '10px 24px 24px 24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {Object.keys(rawData[0] || {}).map(col => <th key={col} style={{ padding: '12px 16px', fontWeight: 600 }}>{col}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, 10).map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {Object.keys(row).map(col => <td key={col} style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.9)' }}>{row[col]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const btn = { display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid #d1d5db', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 };

export default ChartBuilder;