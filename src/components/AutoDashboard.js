import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  UploadCloud, Database, PlayCircle, Loader2, Download, Save, RefreshCw, X, 
  BarChart2, PieChart as PieChartIcon, TrendingUp, DollarSign, Activity, Settings, Sparkles
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getDatasets } from '../api/files';

const THEME = {
  bg: '#0B1120',
  cardBg: '#1a2035',
  text: '#ffffff',
  textDim: '#94a3b8',
  border: '#2d3555',
  accent: '#0078D4',
  purple: '#6C63FF',
  chartColors: ['#0078D4', '#6C63FF', '#10B981', '#F59E0B', '#EF4444', '#06B6D4']
};

const SAMPLE_DATA = [
  { Machine_ID: 'M-101', Defect_Rate_Pct: 2.4, Efficiency_Pct: 94, Downtime_Minutes: 45, Units_Produced: 1250, Defect_Type: 'Scratch', Factory: 'North', Shift: 'Morning', Month: 'Jan', Year: 2023, Production_Cost: 15000, Scrap_Cost: 350 },
  { Machine_ID: 'M-102', Defect_Rate_Pct: 1.8, Efficiency_Pct: 96, Downtime_Minutes: 30, Units_Produced: 1400, Defect_Type: 'Dent', Factory: 'North', Shift: 'Morning', Month: 'Jan', Year: 2023, Production_Cost: 16500, Scrap_Cost: 280 },
  { Machine_ID: 'M-103', Defect_Rate_Pct: 3.5, Efficiency_Pct: 88, Downtime_Minutes: 120, Units_Produced: 950, Defect_Type: 'Alignment', Factory: 'South', Shift: 'Night', Month: 'Jan', Year: 2023, Production_Cost: 12000, Scrap_Cost: 800 },
  { Machine_ID: 'M-104', Defect_Rate_Pct: 0.9, Efficiency_Pct: 98, Downtime_Minutes: 15, Units_Produced: 1600, Defect_Type: 'None', Factory: 'East', Shift: 'Afternoon', Month: 'Feb', Year: 2023, Production_Cost: 18000, Scrap_Cost: 100 },
  { Machine_ID: 'M-101', Defect_Rate_Pct: 2.1, Efficiency_Pct: 95, Downtime_Minutes: 40, Units_Produced: 1300, Defect_Type: 'Scratch', Factory: 'North', Shift: 'Morning', Month: 'Feb', Year: 2023, Production_Cost: 15500, Scrap_Cost: 320 },
  { Machine_ID: 'M-102', Defect_Rate_Pct: 1.5, Efficiency_Pct: 97, Downtime_Minutes: 25, Units_Produced: 1450, Defect_Type: 'Dent', Factory: 'North', Shift: 'Afternoon', Month: 'Feb', Year: 2023, Production_Cost: 17000, Scrap_Cost: 250 },
  { Machine_ID: 'M-105', Defect_Rate_Pct: 4.2, Efficiency_Pct: 85, Downtime_Minutes: 150, Units_Produced: 850, Defect_Type: 'Color', Factory: 'West', Shift: 'Night', Month: 'Mar', Year: 2023, Production_Cost: 11000, Scrap_Cost: 950 },
  { Machine_ID: 'M-103', Defect_Rate_Pct: 3.1, Efficiency_Pct: 90, Downtime_Minutes: 90, Units_Produced: 1050, Defect_Type: 'Alignment', Factory: 'South', Shift: 'Morning', Month: 'Mar', Year: 2023, Production_Cost: 12500, Scrap_Cost: 700 },
  { Machine_ID: 'M-104', Defect_Rate_Pct: 1.1, Efficiency_Pct: 97, Downtime_Minutes: 20, Units_Produced: 1550, Defect_Type: 'None', Factory: 'East', Shift: 'Night', Month: 'Apr', Year: 2023, Production_Cost: 17500, Scrap_Cost: 120 },
  { Machine_ID: 'M-101', Defect_Rate_Pct: 2.6, Efficiency_Pct: 93, Downtime_Minutes: 55, Units_Produced: 1200, Defect_Type: 'Scratch', Factory: 'North', Shift: 'Afternoon', Month: 'Apr', Year: 2023, Production_Cost: 14500, Scrap_Cost: 400 },
  { Machine_ID: 'M-106', Defect_Rate_Pct: 1.4, Efficiency_Pct: 96, Downtime_Minutes: 35, Units_Produced: 1350, Defect_Type: 'Scratch', Factory: 'West', Shift: 'Morning', Month: 'May', Year: 2023, Production_Cost: 16000, Scrap_Cost: 200 },
  { Machine_ID: 'M-105', Defect_Rate_Pct: 3.8, Efficiency_Pct: 87, Downtime_Minutes: 130, Units_Produced: 900, Defect_Type: 'Color', Factory: 'West', Shift: 'Afternoon', Month: 'May', Year: 2023, Production_Cost: 11500, Scrap_Cost: 850 },
  { Machine_ID: 'M-102', Defect_Rate_Pct: 1.9, Efficiency_Pct: 95, Downtime_Minutes: 35, Units_Produced: 1380, Defect_Type: 'Dent', Factory: 'North', Shift: 'Night', Month: 'Jun', Year: 2023, Production_Cost: 16200, Scrap_Cost: 300 },
  { Machine_ID: 'M-103', Defect_Rate_Pct: 2.8, Efficiency_Pct: 92, Downtime_Minutes: 75, Units_Produced: 1100, Defect_Type: 'Alignment', Factory: 'South', Shift: 'Afternoon', Month: 'Jun', Year: 2023, Production_Cost: 13000, Scrap_Cost: 600 },
  { Machine_ID: 'M-106', Defect_Rate_Pct: 1.2, Efficiency_Pct: 97, Downtime_Minutes: 25, Units_Produced: 1420, Defect_Type: 'None', Factory: 'West', Shift: 'Night', Month: 'Jul', Year: 2023, Production_Cost: 16800, Scrap_Cost: 150 },
  { Machine_ID: 'M-104', Defect_Rate_Pct: 0.8, Efficiency_Pct: 99, Downtime_Minutes: 10, Units_Produced: 1650, Defect_Type: 'None', Factory: 'East', Shift: 'Morning', Month: 'Jul', Year: 2023, Production_Cost: 18500, Scrap_Cost: 80 },
  { Machine_ID: 'M-101', Defect_Rate_Pct: 2.2, Efficiency_Pct: 94, Downtime_Minutes: 45, Units_Produced: 1280, Defect_Type: 'Scratch', Factory: 'North', Shift: 'Night', Month: 'Aug', Year: 2023, Production_Cost: 15200, Scrap_Cost: 330 },
  { Machine_ID: 'M-105', Defect_Rate_Pct: 3.5, Efficiency_Pct: 89, Downtime_Minutes: 110, Units_Produced: 980, Defect_Type: 'Color', Factory: 'West', Shift: 'Morning', Month: 'Aug', Year: 2023, Production_Cost: 12200, Scrap_Cost: 750 },
  { Machine_ID: 'M-102', Defect_Rate_Pct: 1.6, Efficiency_Pct: 96, Downtime_Minutes: 28, Units_Produced: 1430, Defect_Type: 'Dent', Factory: 'North', Shift: 'Morning', Month: 'Sep', Year: 2023, Production_Cost: 16800, Scrap_Cost: 260 },
  { Machine_ID: 'M-103', Defect_Rate_Pct: 3.0, Efficiency_Pct: 91, Downtime_Minutes: 85, Units_Produced: 1080, Defect_Type: 'Alignment', Factory: 'South', Shift: 'Night', Month: 'Sep', Year: 2023, Production_Cost: 12800, Scrap_Cost: 650 },
];

function detectColumns(data) {
  if (!data || data.length === 0) return { numeric: [], category: [], date: [] };
  const cols = Object.keys(data[0]);
  return {
    numeric: cols.filter(c => !isNaN(parseFloat(data[0][c])) && typeof data[0][c] === 'number'),
    category: cols.filter(c => {
      const unique = [...new Set(data.map(r => r[c]))];
      return isNaN(data[0][c]) && unique.length < 15;
    }),
    date: cols.filter(c => 
      c.toLowerCase().includes('date') || c.toLowerCase().includes('month') || c.toLowerCase().includes('year')
    )
  };
}

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return Number.isInteger(num) ? num.toString() : num.toFixed(2);
};

export const AutoDashboard = ({ token }) => {
  const [step, setStep] = useState(1);
  const [rawData, setRawData] = useState([]);
  const [columns, setColumns] = useState({ numeric: [], category: [], date: [] });
  const [filters, setFilters] = useState({});
  const [dashboardTitle, setDashboardTitle] = useState('Executive Overview');
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      getDatasets(token).then(data => setDatasets(data || [])).catch(() => {});
    }
  }, [token]);

  const loadSampleData = () => {
    setLoading(true);
    setTimeout(() => {
      setRawData(SAMPLE_DATA);
      setColumns(detectColumns(SAMPLE_DATA));
      setFilters({});
      setDashboardTitle('Manufacturing QC Overview');
      setStep(2);
      setLoading(false);
    }, 800);
  };

  const handleDatasetSelect = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`https://nexabi-backend-production.up.railway.app/api/files/datasets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.preview) {
        setRawData(data.preview);
        setColumns(detectColumns(data.preview));
        setFilters({});
        setDashboardTitle(`${data.filename || 'Dataset'} Dashboard`);
        setStep(2);
      }
    } catch (e) {
      alert('Failed to load dataset');
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
    const el = document.getElementById('auto-dashboard-canvas');
    if (!el) return;
    const canvas = await html2canvas(el, { backgroundColor: THEME.bg, scale: 2 });
    const pdf = new jsPDF('l', 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), (canvas.height * pdf.internal.pageSize.getWidth()) / canvas.width);
    pdf.save(`${dashboardTitle}.pdf`);
  };

  // Filter Data
  const filteredData = React.useMemo(() => {
    if (Object.keys(filters).length === 0) return rawData;
    return rawData.filter(row => {
      return Object.entries(filters).every(([col, activeVals]) => activeVals.includes(row[col]));
    });
  }, [rawData, filters]);

  // Calculations for KPIs
  const kpis = React.useMemo(() => {
    return columns.numeric.slice(0, 5).map(col => {
      const sum = filteredData.reduce((acc, row) => acc + (Number(row[col]) || 0), 0);
      return { name: col, value: sum };
    });
  }, [columns, filteredData]);

  // Aggregation helper
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

  if (step === 1) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: THEME.bg, color: THEME.text }}>
        <div style={{ width: '500px', background: THEME.cardBg, border: `1px solid ${THEME.border}`, borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
          <Sparkles size={48} color={THEME.accent} style={{ marginBottom: '20px' }} />
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>Auto Dashboard Generator</h2>
          <p style={{ color: THEME.textDim, fontSize: '14px', marginBottom: '30px' }}>Instantly transform your raw CSV data into a fully interactive Power BI style dashboard with cross-filtering.</p>
          
          <div style={{ border: `2px dashed ${THEME.border}`, borderRadius: '12px', padding: '30px', marginBottom: '20px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
            <UploadCloud size={32} color={THEME.textDim} style={{ marginBottom: '10px' }} />
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Drag & drop CSV file</div>
            <div style={{ fontSize: '12px', color: THEME.textDim }}>or click to browse</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: THEME.border }} />
            <span style={{ fontSize: '12px', color: THEME.textDim }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: THEME.border }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <select 
              value={selectedDatasetId} 
              onChange={e => handleDatasetSelect(e.target.value)}
              style={{ width: '100%', padding: '12px', background: THEME.bg, border: `1px solid ${THEME.border}`, borderRadius: '8px', color: THEME.text, outline: 'none' }}
              disabled={loading}
            >
              <option value="">Select from my datasets...</option>
              {datasets.map(d => <option key={d.id} value={d.id}>{d.filename}</option>)}
            </select>
            
            <button 
              onClick={loadSampleData}
              disabled={loading}
              style={{ width: '100%', padding: '12px', background: THEME.accent, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
            >
              {loading ? <Loader2 size={18} className="spin" /> : <PlayCircle size={18} />} Try Sample Data
            </button>
          </div>
        </div>
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: THEME.bg, color: THEME.text, overflow: 'auto' }}>
      {/* TOP BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: THEME.cardBg, borderBottom: `1px solid ${THEME.border}` }}>
        <input 
          value={dashboardTitle} 
          onChange={e => setDashboardTitle(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '20px', fontWeight: 600, outline: 'none', width: '400px' }}
        />
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={topBtn} onClick={() => setStep(1)}><RefreshCw size={14} /> Change Data</button>
          <button style={topBtn} onClick={exportPdf}><Download size={14} /> Export PDF</button>
          <button style={{ ...topBtn, background: THEME.accent, color: '#fff', borderColor: THEME.accent }}><Save size={14} /> Save to Dashboard</button>
        </div>
      </div>

      <div id="auto-dashboard-canvas" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* SLICERS ROW */}
        {columns.category.length > 0 && (
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
            {columns.category.slice(0, 4).map(col => {
              const uniqueVals = [...new Set(rawData.map(r => r[col]))].sort();
              return (
                <div key={col} style={{ background: THEME.cardBg, border: `1px solid ${THEME.border}`, borderRadius: '8px', padding: '12px', flexShrink: 0, minWidth: '240px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: THEME.textDim, marginBottom: '8px', textTransform: 'uppercase' }}>{col}</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {uniqueVals.map(val => {
                      const isActive = filters[col]?.includes(val);
                      return (
                        <button 
                          key={val} 
                          onClick={() => toggleFilter(col, val)}
                          style={{
                            padding: '4px 10px', fontSize: '12px', borderRadius: '12px', cursor: 'pointer',
                            background: isActive ? THEME.accent : 'transparent',
                            color: isActive ? '#fff' : THEME.textDim,
                            border: `1px solid ${isActive ? THEME.accent : THEME.border}`
                          }}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {Object.keys(filters).length > 0 && (
              <button 
                onClick={() => setFilters({})}
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '0 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <X size={14} /> Clear Filters
              </button>
            )}
          </div>
        )}

        {/* KPI ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${kpis.length}, 1fr)`, gap: '16px' }}>
          {kpis.map((kpi, idx) => (
            <div key={idx} style={{ background: THEME.cardBg, border: `1px solid ${THEME.border}`, borderRadius: '12px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>{kpi.name.replace(/_/g, ' ')}</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: THEME.text }}>{formatNumber(kpi.value)}</div>
              <Activity size={48} color={THEME.chartColors[idx % THEME.chartColors.length]} style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }} />
            </div>
          ))}
        </div>

        {/* CHARTS GRID 2x2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* Chart 1: Horizontal Bar */}
          {columns.category[0] && columns.numeric[0] && (
            <div style={chartCard}>
              <div style={chartTitle}>{columns.numeric[0]} by {columns.category[0]}</div>
              <div style={{ height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={aggregate(filteredData, columns.category[0], columns.numeric[0])} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} horizontal={true} vertical={false} />
                    <XAxis type="number" stroke={THEME.textDim} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" stroke={THEME.textDim} tick={{ fontSize: 11 }} width={80} />
                    <RechartsTooltip contentStyle={{ background: THEME.bg, border: `1px solid ${THEME.border}` }} />
                    <Bar dataKey="value" fill={THEME.purple} radius={[0, 4, 4, 0]} onClick={(d) => toggleFilter(columns.category[0], d.name)}>
                      {aggregate(filteredData, columns.category[0], columns.numeric[0]).map((entry, index) => (
                        <Cell key={`cell-${index}`} cursor="pointer" opacity={(!filters[columns.category[0]] || filters[columns.category[0]].includes(entry.name)) ? 1 : 0.3} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 2: Vertical Bar */}
          {columns.category[1] && columns.numeric[0] && (
            <div style={chartCard}>
              <div style={chartTitle}>{columns.numeric[0]} by {columns.category[1]}</div>
              <div style={{ height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={aggregate(filteredData, columns.category[1], columns.numeric[0])} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} vertical={false} />
                    <XAxis dataKey="name" stroke={THEME.textDim} tick={{ fontSize: 11 }} />
                    <YAxis stroke={THEME.textDim} tick={{ fontSize: 11 }} />
                    <RechartsTooltip contentStyle={{ background: THEME.bg, border: `1px solid ${THEME.border}` }} />
                    <Bar dataKey="value" fill={THEME.accent} radius={[4, 4, 0, 0]} onClick={(d) => toggleFilter(columns.category[1], d.name)}>
                      {aggregate(filteredData, columns.category[1], columns.numeric[0]).map((entry, index) => (
                        <Cell key={`cell-${index}`} cursor="pointer" opacity={(!filters[columns.category[1]] || filters[columns.category[1]].includes(entry.name)) ? 1 : 0.3} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 3: Donut */}
          {columns.category[0] && columns.numeric[1] && (
            <div style={chartCard}>
              <div style={chartTitle}>{columns.numeric[1]} Share by {columns.category[0]}</div>
              <div style={{ height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <RechartsTooltip contentStyle={{ background: THEME.bg, border: `1px solid ${THEME.border}` }} />
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', color: THEME.textDim }} />
                    <Pie data={aggregate(filteredData, columns.category[0], columns.numeric[1])} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} onClick={(d) => toggleFilter(columns.category[0], d.name)}>
                      {aggregate(filteredData, columns.category[0], columns.numeric[1]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={THEME.chartColors[index % THEME.chartColors.length]} cursor="pointer" opacity={(!filters[columns.category[0]] || filters[columns.category[0]].includes(entry.name)) ? 1 : 0.3} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 4: Line Chart */}
          {(columns.date[0] || columns.category[2] || columns.category[0]) && columns.numeric[0] && (
            <div style={chartCard}>
              <div style={chartTitle}>{columns.numeric[0]} Trend</div>
              <div style={{ height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={aggregate(filteredData, columns.date[0] || columns.category[2] || columns.category[0], columns.numeric[0])} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} vertical={false} />
                    <XAxis dataKey="name" stroke={THEME.textDim} tick={{ fontSize: 11 }} />
                    <YAxis stroke={THEME.textDim} tick={{ fontSize: 11 }} />
                    <RechartsTooltip contentStyle={{ background: THEME.bg, border: `1px solid ${THEME.border}` }} />
                    <Line type="monotone" dataKey="value" stroke={THEME.chartColors[2]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* DATA TABLE */}
        <div style={{ background: THEME.cardBg, border: `1px solid ${THEME.border}`, borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${THEME.border}`, fontSize: '14px', fontWeight: 600 }}>Raw Data (First 15 Rows)</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {Object.keys(rawData[0] || {}).map(col => (
                    <th key={col} style={{ padding: '10px 16px', color: THEME.textDim, fontWeight: 600 }}>{col.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 15).map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${THEME.border}`, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                    {Object.keys(row).map(col => (
                      <td key={col} style={{ padding: '10px 16px', color: THEME.text }}>{row[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

const topBtn = { display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: `1px solid ${THEME.border}`, color: THEME.textDim, padding: '6px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 600 };
const chartCard = { background: THEME.cardBg, border: `1px solid ${THEME.border}`, borderRadius: '12px', padding: '20px' };
const chartTitle = { fontSize: '14px', fontWeight: 600, color: THEME.text, marginBottom: '16px' };
