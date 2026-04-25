import React, { useState } from 'react';
import { usePowerBI } from './PowerBIContext';
import { 
  BarChart, LineChart, PieChart, ScatterChart, 
  Settings, Database, Paintbrush, Plus, Map, 
  Table2, LayoutTemplate, Layers
} from 'lucide-react';

export const RightPane = () => {
  const [tab, setTab] = useState('vis'); // 'vis' | 'format' | 'data'
  const { charts, setCharts, selectedChartId, columns, dataset, setDataset, setColumns, canvasSettings, setCanvasSettings } = usePowerBI();

  const selectedChart = charts.find(c => c.id === selectedChartId);

  const handleAddVisual = (type) => {
    const id = `chart-${Date.now()}`;
    const newChart = {
      id,
      type,
      title: `New ${type} chart`,
      xKey: '',
      yKey: '',
      style: { bg: '#ffffff', radius: 0 },
      layout: { x: 0, y: Infinity, w: 6, h: 8 }
    };
    setCharts(prev => [...prev, newChart]);
  };

  const handleUpdateChart = (updates) => {
    if (!selectedChartId) return;
    setCharts(prev => prev.map(c => c.id === selectedChartId ? { ...c, ...updates } : c));
  };

  const handleDrop = (e, slotType) => {
    e.preventDefault();
    const col = e.dataTransfer.getData('text/plain');
    if (col && selectedChartId) {
      handleUpdateChart({ [slotType]: col, title: `${selectedChart.yKey || col} by ${selectedChart.xKey || col}` });
    }
  };

  // MOCK Connect Data
  const handleConnectData = () => {
    // In reality, this would open the dataset selector and fetch from backend.
    // Simulating with dummy columns for the UI based on previous functionality.
    setColumns([{name: 'Category', type: 'text'}, {name: 'Value', type: 'number'}, {name: 'Date', type: 'date'}]);
    setDataset([
      {Category: 'A', Value: 100, Date: '2023-01'},
      {Category: 'B', Value: 200, Date: '2023-02'}
    ]);
    setTab('data');
  };

  return (
    <div style={{ width: '280px', background: '#fff', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
      {/* TABS */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
        <button style={{...tabBtn, borderBottom: tab==='vis' ? '2px solid #F2C811' : 'none'}} onClick={() => setTab('vis')}><BarChart size={16}/> Visualizations</button>
        <button style={{...tabBtn, borderBottom: tab==='format' ? '2px solid #F2C811' : 'none'}} onClick={() => setTab('format')}><Paintbrush size={16}/> Format</button>
        <button style={{...tabBtn, borderBottom: tab==='data' ? '2px solid #F2C811' : 'none'}} onClick={() => setTab('data')}><Database size={16}/> Data</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* VISUALIZATIONS TAB */}
        {tab === 'vis' && (
          <div style={{ padding: '12px' }}>
            <div style={sectionTitle}>Build visual</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', marginBottom: '24px' }}>
              <button style={visBtn} onClick={() => handleAddVisual('bar')} title="Bar Chart"><BarChart size={18}/></button>
              <button style={visBtn} onClick={() => handleAddVisual('line')} title="Line Chart"><LineChart size={18}/></button>
              <button style={visBtn} onClick={() => handleAddVisual('pie')} title="Pie Chart"><PieChart size={18}/></button>
              <button style={visBtn} onClick={() => handleAddVisual('donut')} title="Donut Chart"><PieChart size={18} strokeDasharray="2 2"/></button>
              <button style={visBtn} onClick={() => handleAddVisual('area')} title="Area Chart"><Layers size={18}/></button>
              <button style={visBtn} onClick={() => handleAddVisual('scatter')} title="Scatter Chart"><ScatterChart size={18}/></button>
              <button style={visBtn} onClick={() => handleAddVisual('table')} title="Table"><Table2 size={18}/></button>
              <button style={visBtn} onClick={() => handleAddVisual('kpi')} title="Card"><LayoutTemplate size={18}/></button>
              <button style={visBtn} onClick={() => handleAddVisual('map')} title="Map"><Map size={18}/></button>
            </div>

            <div style={sectionTitle}>Values</div>
            {!selectedChart ? (
              <div style={emptyMsg}>Select a visual to map data</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={slotWrap}>
                  <div style={slotLabel}>X-axis</div>
                  <div style={slotBox} onDragOver={e=>e.preventDefault()} onDrop={e=>handleDrop(e,'xKey')}>
                    {selectedChart.xKey || <span style={slotPlaceholder}>Add data fields here</span>}
                  </div>
                </div>
                <div style={slotWrap}>
                  <div style={slotLabel}>Y-axis</div>
                  <div style={slotBox} onDragOver={e=>e.preventDefault()} onDrop={e=>handleDrop(e,'yKey')}>
                    {selectedChart.yKey || <span style={slotPlaceholder}>Add data fields here</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FORMAT TAB */}
        {tab === 'format' && (
          <div style={{ padding: '12px' }}>
            {selectedChart ? (
              <>
                <div style={sectionTitle}>Visual Settings</div>
                <div style={settingRow}>
                  <label style={settingLabel}>Title</label>
                  <input type="text" value={selectedChart.title} onChange={e => handleUpdateChart({title: e.target.value})} style={inputStyle} />
                </div>
                <div style={settingRow}>
                  <label style={settingLabel}>Background</label>
                  <input type="color" value={selectedChart.style?.bg || '#ffffff'} onChange={e => handleUpdateChart({style: {...selectedChart.style, bg: e.target.value}})} style={colorPicker} />
                </div>
              </>
            ) : (
              <>
                <div style={sectionTitle}>Canvas Settings</div>
                <div style={settingRow}>
                  <label style={settingLabel}>Type</label>
                  <select value={canvasSettings.type} onChange={e => setCanvasSettings(p => ({...p, type: e.target.value}))} style={inputStyle}>
                    <option value="16:9">16:9</option>
                    <option value="4:3">4:3</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div style={settingRow}>
                  <label style={settingLabel}>Background</label>
                  <input type="color" value={canvasSettings.bg} onChange={e => setCanvasSettings(p => ({...p, bg: e.target.value}))} style={colorPicker} />
                </div>
                <div style={settingRow}>
                  <label style={settingLabel}>Wallpaper</label>
                  <input type="color" value={canvasSettings.wallpaper} onChange={e => setCanvasSettings(p => ({...p, wallpaper: e.target.value}))} style={colorPicker} />
                </div>
              </>
            )}
          </div>
        )}

        {/* DATA TAB */}
        {tab === 'data' && (
          <div style={{ padding: '12px' }}>
            {columns.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button style={{ padding: '8px 16px', background: '#F2C811', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }} onClick={handleConnectData}>
                  Connect Data
                </button>
              </div>
            ) : (
              <div>
                <div style={sectionTitle}>Dataset fields</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {columns.map(col => (
                    <div 
                      key={col.name}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', col.name)}
                      style={{ padding: '6px 8px', fontSize: '12px', border: '1px solid transparent', cursor: 'grab', display: 'flex', alignItems: 'center', gap: '6px' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {col.type === 'number' ? 'Σ' : col.type === 'date' ? '📅' : 'A'} {col.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const tabBtn = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 0', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#4b5563', fontWeight: 600 };
const sectionTitle = { fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '12px', paddingBottom: '4px', borderBottom: '1px solid #e5e7eb' };
const visBtn = { width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid transparent', background: 'transparent', cursor: 'pointer', color: '#4b5563' };
const emptyMsg = { fontSize: '12px', color: '#6b7280', textAlign: 'center', padding: '20px 0' };
const slotWrap = { border: '1px solid #e5e7eb', borderRadius: '4px' };
const slotLabel = { fontSize: '11px', color: '#6b7280', padding: '4px 8px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' };
const slotBox = { padding: '6px 8px', minHeight: '32px', fontSize: '12px', color: '#111827', fontWeight: 500 };
const slotPlaceholder = { color: '#9ca3af', fontStyle: 'italic' };
const settingRow = { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' };
const settingLabel = { fontSize: '12px', color: '#4b5563' };
const inputStyle = { padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px', outline: 'none' };
const colorPicker = { width: '100%', height: '30px', padding: 0, border: 'none', cursor: 'pointer' };
