import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveGridLayout } from 'react-grid-layout';
import { motion } from 'framer-motion';
import {
  BarChart2, Type, Hash, ListFilter, Minus, Trash2, 
  Settings2, Download, Save, Grid, LayoutTemplate,
  TrendingUp, TrendingDown, MinusCircle, Move
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const THEMES = {
  dark: { bg: '#0B1120', cardBg: '#1a2035', text: '#ffffff', border: '#2d3555', accent: '#6C63FF', toolbar: '#0d1526' },
  light: { bg: '#f3f4f6', cardBg: '#ffffff', text: '#111827', border: '#e5e7eb', accent: '#6C63FF', toolbar: '#ffffff' },
  blue: { bg: '#0a1628', cardBg: '#0d2137', text: '#ffffff', border: '#1e3a5f', accent: '#3b82f6', toolbar: '#07101d' },
  green: { bg: '#0a1a0a', cardBg: '#0d2010', text: '#ffffff', border: '#1e3f20', accent: '#10b981', toolbar: '#061106' },
  purple: { bg: '#12051a', cardBg: '#1e0a2d', text: '#ffffff', border: '#3b185f', accent: '#a855f7', toolbar: '#0d0313' }
};

const MOCK_CHART_DATA = [
  { name: 'Jan', value: 400 }, { name: 'Feb', value: 300 }, { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 }, { name: 'May', value: 500 }
];

export const DashboardCanvas = () => {
  const [widgets, setWidgets] = useState([]);
  const [theme, setTheme] = useState('dark');
  const [editMode, setEditMode] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [showAiBanner, setShowAiBanner] = useState(false);
  
  const T = THEMES[theme] || THEMES.dark;

  // Load Initial Data
  useEffect(() => {
    try {
      const savedLayout = localStorage.getItem('canvas_layout');
      if (savedLayout) {
        const parsed = JSON.parse(savedLayout);
        setWidgets(parsed.widgets || []);
        if (parsed.theme) setTheme(parsed.theme);
      } else {
        const aiWidgets = localStorage.getItem('dashboard_widgets');
        if (aiWidgets) {
          const parsed = JSON.parse(aiWidgets);
          setWidgets(parsed);
          setShowAiBanner(true);
          setTimeout(() => setShowAiBanner(false), 5000);
        }
      }
    } catch (e) {
      console.error('Failed to load canvas layout');
    }
  }, []);

  // Auto Save every 30s
  useEffect(() => {
    const interval = setInterval(() => handleSave(), 30000);
    return () => clearInterval(interval);
  }, [widgets, theme]);

  const handleSave = () => {
    localStorage.setItem('canvas_layout', JSON.stringify({ widgets, theme }));
    const now = new Date();
    setLastSaved(now.toLocaleTimeString());
  };

  const addWidget = (type) => {
    const id = `${type}-${Date.now()}`;
    const newWidget = {
      i: id, type,
      x: 0, y: Infinity, w: 6, h: type === 'divider' ? 1 : (type === 'kpi' ? 3 : 6),
      data: {}
    };
    if (type === 'text') newWidget.data = { text: 'Double click to edit text', fontSize: 'M', bold: false, italic: false, color: T.text, bg: 'transparent' };
    if (type === 'kpi') newWidget.data = { number: '1.2M', label: 'Total Revenue', trend: 'up', bg: T.cardBg };
    if (type === 'slicer') newWidget.data = { title: 'Filter By Category', options: ['Option 1', 'Option 2'], style: 'pills' };
    if (type === 'divider') newWidget.data = { color: T.border, thickness: 'medium' };
    if (type === 'chart') newWidget.data = { title: 'New Chart', chartType: 'bar', color: T.accent };
    
    setWidgets(prev => [...prev, newWidget]);
  };

  const updateWidgetData = (id, dataUpdates) => {
    setWidgets(prev => prev.map(w => w.i === id ? { ...w, data: { ...w.data, ...dataUpdates } } : w));
  };

  const removeWidget = (id) => {
    setWidgets(prev => prev.filter(w => w.i !== id));
  };

  const clearAll = () => {
    if (window.confirm('Clear all widgets from canvas?')) {
      setWidgets([]);
      localStorage.removeItem('canvas_layout');
    }
  };

  const exportPdf = async () => {
    setEditMode(false);
    setTimeout(async () => {
      const el = document.getElementById('dashboard-canvas-area');
      if (!el) return;
      const canvas = await html2canvas(el, { backgroundColor: T.bg, scale: 2 });
      const pdf = new jsPDF('l', 'mm', 'a4');
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), (canvas.height * pdf.internal.pageSize.getWidth()) / canvas.width);
      pdf.save(`Dashboard_${new Date().toISOString().slice(0,10)}.pdf`);
    }, 500);
  };

  const renderWidgetContent = (w) => {
    if (w.type === 'chart') {
      return (
        <div style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {editMode ? (
            <input 
              value={w.data.title} 
              onChange={e => updateWidgetData(w.i, { title: e.target.value })}
              style={{ background: 'transparent', border: 'none', color: T.text, fontSize: '16px', fontWeight: 600, outline: 'none', marginBottom: '16px', borderBottom: `1px solid ${T.border}` }}
            />
          ) : (
            <div style={{ fontSize: '16px', fontWeight: 600, color: T.text, marginBottom: '16px' }}>{w.data.title}</div>
          )}
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                <XAxis dataKey="name" stroke={T.text} opacity={0.5} tick={{fontSize: 12}} />
                <YAxis stroke={T.text} opacity={0.5} tick={{fontSize: 12}} />
                <Tooltip contentStyle={{ background: T.cardBg, border: `1px solid ${T.border}`, color: T.text }} />
                <Bar dataKey="value" fill={w.data.color || T.accent} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }
    
    if (w.type === 'text') {
      const sizes = { S: '14px', M: '18px', L: '24px', XL: '32px' };
      return (
        <div style={{ padding: '16px', height: '100%', background: w.data.bg }}>
          {editMode ? (
            <textarea
              value={w.data.text}
              onChange={e => updateWidgetData(w.i, { text: e.target.value })}
              style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', color: w.data.color || T.text, fontSize: sizes[w.data.fontSize], fontWeight: w.data.bold ? 700 : 400, fontStyle: w.data.italic ? 'italic' : 'normal', resize: 'none', outline: 'none' }}
            />
          ) : (
            <div style={{ color: w.data.color || T.text, fontSize: sizes[w.data.fontSize], fontWeight: w.data.bold ? 700 : 400, fontStyle: w.data.italic ? 'italic' : 'normal', whiteSpace: 'pre-wrap' }}>
              {w.data.text}
            </div>
          )}
        </div>
      );
    }

    if (w.type === 'kpi') {
      return (
        <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: w.data.bg }}>
          {editMode ? (
            <input value={w.data.label} onChange={e => updateWidgetData(w.i, { label: e.target.value })} style={{ background: 'transparent', border: 'none', color: T.text, opacity: 0.7, fontSize: '14px', outline: 'none', textTransform: 'uppercase', fontWeight: 600 }} />
          ) : (
            <div style={{ fontSize: '14px', color: T.text, opacity: 0.7, textTransform: 'uppercase', fontWeight: 600 }}>{w.data.label}</div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            {editMode ? (
              <input value={w.data.number} onChange={e => updateWidgetData(w.i, { number: e.target.value })} style={{ background: 'transparent', border: 'none', color: T.text, fontSize: '36px', fontWeight: 700, outline: 'none', width: '100px' }} />
            ) : (
              <div style={{ fontSize: '36px', fontWeight: 700, color: T.text }}>{w.data.number}</div>
            )}
            
            {editMode ? (
              <select value={w.data.trend} onChange={e => updateWidgetData(w.i, { trend: e.target.value })} style={{ background: T.cardBg, color: T.text, border: `1px solid ${T.border}`, padding: '4px' }}>
                <option value="up">Up</option>
                <option value="down">Down</option>
                <option value="neutral">Neutral</option>
              </select>
            ) : (
              <div>
                {w.data.trend === 'up' && <TrendingUp color="#10b981" size={24} />}
                {w.data.trend === 'down' && <TrendingDown color="#ef4444" size={24} />}
                {w.data.trend === 'neutral' && <MinusCircle color="#9ca3af" size={24} />}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (w.type === 'slicer') {
      return (
        <div style={{ padding: '16px', height: '100%' }}>
          {editMode ? (
            <input value={w.data.title} onChange={e => updateWidgetData(w.i, { title: e.target.value })} style={{ background: 'transparent', border: 'none', color: T.text, fontSize: '14px', fontWeight: 600, outline: 'none', marginBottom: '12px', width: '100%' }} />
          ) : (
            <div style={{ fontSize: '14px', fontWeight: 600, color: T.text, marginBottom: '12px' }}>{w.data.title}</div>
          )}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {w.data.options.map((opt, i) => (
              <div key={i} style={{ padding: '6px 16px', borderRadius: '20px', background: i === 0 ? T.accent : 'transparent', color: i === 0 ? '#fff' : T.text, border: `1px solid ${i === 0 ? T.accent : T.border}`, fontSize: '13px', cursor: 'pointer' }}>
                {opt}
              </div>
            ))}
            {editMode && (
              <button onClick={() => updateWidgetData(w.i, { options: [...w.data.options, 'New Option'] })} style={{ background: 'transparent', border: `1px dashed ${T.text}`, color: T.text, padding: '4px 12px', borderRadius: '20px', cursor: 'pointer', opacity: 0.6 }}>+ Add</button>
            )}
          </div>
        </div>
      );
    }

    if (w.type === 'divider') {
      const thickMap = { thin: '1px', medium: '3px', thick: '6px' };
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
          <div style={{ width: '100%', height: thickMap[w.data.thickness || 'medium'], background: w.data.color || T.border, borderRadius: '4px' }} />
          {editMode && (
            <select value={w.data.thickness} onChange={e => updateWidgetData(w.i, { thickness: e.target.value })} style={{ marginLeft: '12px', background: T.cardBg, color: T.text, border: `1px solid ${T.border}` }}>
              <option value="thin">Thin</option><option value="medium">Med</option><option value="thick">Thick</option>
            </select>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', fontFamily: '"Segoe UI", sans-serif' }}>
      
      {/* TOP TOOLBAR */}
      <div style={{ background: T.toolbar, borderBottom: `1px solid ${T.border}`, padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <select 
              onChange={e => { if (e.target.value) { addWidget(e.target.value); e.target.value = ''; } }}
              style={{ ...btnStyle, background: T.accent, color: '#fff', border: 'none', appearance: 'none', paddingRight: '30px' }}
            >
              <option value="">+ Add Widget</option>
              <option value="chart">📊 Chart</option>
              <option value="text">📝 Text Box</option>
              <option value="kpi">🔢 KPI Card</option>
              <option value="slicer">🔽 Slicer</option>
              <option value="divider">━━ Divider</option>
            </select>
          </div>
          <div style={{ width: '1px', height: '24px', background: T.border }} />
          <select value={theme} onChange={e => setTheme(e.target.value)} style={{ ...btnStyle, background: 'transparent', color: T.text, border: `1px solid ${T.border}` }}>
            <option value="dark">Dark Theme</option>
            <option value="light">Light Theme</option>
            <option value="blue">Blue Theme</option>
            <option value="green">Green Theme</option>
            <option value="purple">Purple Theme</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {lastSaved && <span style={{ fontSize: '12px', color: T.text, opacity: 0.6 }}>Saved {lastSaved}</span>}
          <button style={{ ...btnStyle, background: 'transparent', color: T.text, border: `1px solid ${T.border}` }} onClick={handleSave}>
            <Save size={16} /> Save
          </button>
          <button style={{ ...btnStyle, background: 'transparent', color: T.text, border: `1px solid ${T.border}` }} onClick={exportPdf}>
            <Download size={16} /> Export PDF
          </button>
          <button style={{ ...btnStyle, background: editMode ? T.accent : 'transparent', color: editMode ? '#fff' : T.text, border: `1px solid ${editMode ? T.accent : T.border}` }} onClick={() => setEditMode(!editMode)}>
            <Settings2 size={16} /> Edit Layout
          </button>
          <button style={{ ...btnStyle, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }} onClick={clearAll}>
            <Trash2 size={16} /> Clear All
          </button>
        </div>
      </div>

      {/* AI BANNER */}
      {showAiBanner && (
        <motion.div initial={{y:-50, opacity:0}} animate={{y:0, opacity:1}} style={{ background: '#10b981', color: '#fff', padding: '12px', textAlign: 'center', fontWeight: 600 }}>
          ✓ Widgets successfully loaded from AI Query!
        </motion.div>
      )}

      {/* CANVAS */}
      <div id="dashboard-canvas-area" style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        {widgets.length === 0 ? (
          <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: T.text, opacity: 0.5 }}>
            <LayoutTemplate size={64} style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '24px', margin: '0 0 24px 0' }}>Canvas is empty</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => addWidget('chart')} style={emptyBtnStyle}><BarChart2 size={18}/> Add Chart</button>
              <button onClick={() => addWidget('text')} style={emptyBtnStyle}><Type size={18}/> Add Text</button>
              <button onClick={() => addWidget('kpi')} style={emptyBtnStyle}><Hash size={18}/> Add KPI</button>
              <button onClick={() => addWidget('slicer')} style={emptyBtnStyle}><ListFilter size={18}/> Add Slicer</button>
            </div>
          </div>
        ) : (
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: widgets.map(w => ({ i: w.i, x: w.x, y: w.y, w: w.w, h: w.h, minW: 3, minH: w.type === 'divider' ? 1 : 2 })) }}
            onLayoutChange={(l) => {
              if (editMode) {
                setWidgets(prev => prev.map(w => {
                  const updated = l.find(item => item.i === w.i);
                  return updated ? { ...w, x: updated.x, y: updated.y, w: updated.w, h: updated.h } : w;
                }));
              }
            }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={40}
            isDraggable={editMode}
            isResizable={editMode}
            draggableHandle=".drag-handle"
            margin={[16, 16]}
          >
            {widgets.map(w => (
              <div 
                key={w.i} 
                style={{
                  background: T.cardBg,
                  borderRadius: '12px',
                  border: `1px solid ${T.border}`,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: editMode ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                  transition: 'box-shadow 0.2s',
                  position: 'relative'
                }}
              >
                {editMode && (
                  <div className="drag-handle" style={{ height: '24px', background: 'rgba(255,255,255,0.05)', cursor: 'grab', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${T.border}` }}>
                    <Move size={14} color={T.text} opacity={0.5} />
                  </div>
                )}
                
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  {renderWidgetContent(w)}
                </div>

                {editMode && (
                  <div style={{ height: '36px', background: 'rgba(0,0,0,0.2)', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => updateWidgetData(w.i, { fontSize: 'S' })} style={toolbarBtn(T)}>S</button>
                      <button onClick={() => updateWidgetData(w.i, { fontSize: 'M' })} style={toolbarBtn(T)}>M</button>
                      <button onClick={() => updateWidgetData(w.i, { fontSize: 'L' })} style={toolbarBtn(T)}>L</button>
                      <button onClick={() => updateWidgetData(w.i, { fontSize: 'XL' })} style={toolbarBtn(T)}>XL</button>
                    </div>
                    <button onClick={() => removeWidget(w.i)} style={{ ...toolbarBtn(T), color: '#ef4444' }}><Trash2 size={14}/></button>
                  </div>
                )}
              </div>
            ))}
          </ResponsiveGridLayout>
        )}
      </div>
      <style>{`.react-grid-item > .react-resizable-handle { z-index: 10; opacity: ${editMode ? 1 : 0}; }`}</style>
    </div>
  );
};

const btnStyle = { padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', outline: 'none' };
const emptyBtnStyle = { ...btnStyle, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' };
const toolbarBtn = (T) => ({ background: 'transparent', border: 'none', color: T.text, fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: '4px', opacity: 0.7 });
