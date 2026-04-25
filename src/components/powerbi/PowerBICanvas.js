import React from 'react';
import { ResponsiveGridLayout } from 'react-grid-layout';
import { usePowerBI } from './PowerBIContext';
import { ChartRenderer } from './ChartRenderer';
import { Trash2, Copy } from 'lucide-react';

export const PowerBICanvas = () => {
  const { charts, setCharts, selectedChartId, setSelectedChartId, canvasSettings } = usePowerBI();

  const layout = charts.map(chart => ({
    i: chart.id,
    x: chart.layout?.x ?? 0,
    y: chart.layout?.y ?? Infinity,
    w: chart.layout?.w ?? 6,
    h: chart.layout?.h ?? 8,
    minW: 3,
    minH: 6,
  }));

  const updateLayout = (nextLayout) => {
    setCharts(prev => prev.map(chart => {
      const updated = nextLayout.find(l => l.i === chart.id);
      if (!updated) return chart;
      return { ...chart, layout: { ...chart.layout, x: updated.x, y: updated.y, w: updated.w, h: updated.h } };
    }));
  };

  const handleDuplicate = (chart) => {
    const clone = { ...chart, id: `chart-${Date.now()}`, layout: { ...chart.layout, y: Infinity } };
    setCharts(prev => [...prev, clone]);
    setSelectedChartId(clone.id);
  };

  const handleDelete = (id) => {
    setCharts(prev => prev.filter(c => c.id !== id));
    if (selectedChartId === id) setSelectedChartId(null);
  };

  const getCanvasStyle = () => {
    const base = { background: canvasSettings.bg, position: 'relative', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
    if (canvasSettings.type === '16:9') {
      base.width = '100%';
      base.aspectRatio = '16/9';
    } else if (canvasSettings.type === '4:3') {
      base.width = '100%';
      base.aspectRatio = '4/3';
    } else {
      base.width = canvasSettings.width;
      base.minHeight = canvasSettings.height;
    }
    return base;
  };

  return (
    <div 
      style={{ flex: 1, overflow: 'auto', background: canvasSettings.wallpaper, padding: '20px' }} 
      onClick={(e) => { if (e.target === e.currentTarget) setSelectedChartId(null); }}
    >
      <div id="powerbi-canvas" style={getCanvasStyle()} onClick={(e) => { if (e.target === e.currentTarget) setSelectedChartId(null); }}>
        {charts.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
            Drag fields here to build visuals
          </div>
        )}
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          onLayoutChange={updateLayout}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={40}
          draggableHandle=".drag-handle"
          isResizable
          margin={[16, 16]}
        >
          {charts.map(chart => (
            <div 
              key={chart.id} 
              style={{
                background: chart.style?.bg || '#fff',
                border: selectedChartId === chart.id ? '2px solid #005A9E' : '1px solid transparent',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
              }}
              onClick={(e) => { e.stopPropagation(); setSelectedChartId(chart.id); }}
            >
              <div className="drag-handle" style={{ padding: '8px 12px', cursor: 'grab', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#333' }}>{chart.title}</h4>
                {selectedChartId === chart.id && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button style={btnStyle} onClick={() => handleDuplicate(chart)}><Copy size={14}/></button>
                    <button style={{...btnStyle, color: '#ef4444'}} onClick={() => handleDelete(chart.id)}><Trash2 size={14}/></button>
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minHeight: 0, padding: '0 8px 8px 8px' }}>
                <ChartRenderer chart={chart} />
              </div>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
};

const btnStyle = { background: 'transparent', border: 'none', cursor: 'pointer', color: '#666', padding: '2px', display: 'flex' };
