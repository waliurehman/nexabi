import React, { useState } from 'react';
import { usePowerBI } from './PowerBIContext';
import { 
  BarChart, Type, Image as ImageIcon, Undo2, Redo2, 
  Save, Download, Settings2, Grid, Sparkles 
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const Ribbon = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const { charts, setCharts, theme, setTheme } = usePowerBI();

  const handleExportPDF = async () => {
    const el = document.getElementById('powerbi-canvas');
    if (!el) return;
    const canvas = await html2canvas(el, { backgroundColor: '#ffffff', scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, w, h);
    pdf.save('NexaBI_Report.pdf');
  };

  const handleSave = () => {
    localStorage.setItem('nexabi_powerbi_save', JSON.stringify({ charts }));
    alert('Report saved locally!');
  };

  const handleAutoGenerate = () => {
    alert('AI Auto Generate: Analyzing dataset and building dashboard...');
    // Mocking an auto-generation
    const mockCharts = [
      { id: `chart-${Date.now()}-1`, type: 'kpi', title: 'Total Revenue', xKey: 'Category', yKey: 'Value', style: { bg: '#fff' }, layout: { x: 0, y: 0, w: 3, h: 4 } },
      { id: `chart-${Date.now()}-2`, type: 'bar', title: 'Revenue by Category', xKey: 'Category', yKey: 'Value', style: { bg: '#fff' }, layout: { x: 3, y: 0, w: 5, h: 8 } },
      { id: `chart-${Date.now()}-3`, type: 'donut', title: 'Share by Category', xKey: 'Category', yKey: 'Value', style: { bg: '#fff' }, layout: { x: 8, y: 0, w: 4, h: 8 } },
    ];
    setCharts(mockCharts);
  };

  return (
    <div style={{ background: '#f3f2f1', borderBottom: '1px solid #e1dfdd', display: 'flex', flexDirection: 'column' }}>
      {/* TABS */}
      <div style={{ display: 'flex', padding: '0 12px' }}>
        {['Home', 'Insert', 'Modeling', 'View', 'Format'].map(t => (
          <button 
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === t ? '2px solid #005A9E' : '2px solid transparent',
              padding: '6px 16px',
              fontSize: '13px',
              color: activeTab === t ? '#005A9E' : '#323130',
              fontWeight: activeTab === t ? 600 : 400,
              cursor: 'pointer'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* RIBBON CONTENT */}
      <div style={{ padding: '8px 16px', display: 'flex', gap: '24px', alignItems: 'center', minHeight: '64px' }}>
        
        {activeTab === 'Home' && (
          <>
            <div style={ribbonGroup}>
              <button style={ribbonBtn} onClick={() => setCharts(p => [...p, { id: `c-${Date.now()}`, type:'bar', layout:{x:0,y:Infinity,w:6,h:8}, style:{bg:'#fff'} }])}>
                <BarChart size={24} color="#005A9E" />
                <span>New visual</span>
              </button>
              <button style={ribbonBtn}>
                <Type size={24} color="#005A9E" />
                <span>Text box</span>
              </button>
            </div>
            <div style={ribbonDivider} />
            <div style={ribbonGroup}>
              <button style={ribbonBtn} onClick={handleAutoGenerate}>
                <Sparkles size={24} color="#107C41" />
                <span>Auto Generate</span>
              </button>
            </div>
            <div style={ribbonDivider} />
            <div style={ribbonGroup}>
              <button style={ribbonBtn} onClick={handleSave}>
                <Save size={24} color="#323130" />
                <span>Save</span>
              </button>
              <button style={ribbonBtn} onClick={handleExportPDF}>
                <Download size={24} color="#323130" />
                <span>Export PDF</span>
              </button>
            </div>
          </>
        )}

        {activeTab === 'View' && (
          <>
            <div style={ribbonGroup}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" defaultChecked /> Gridlines</label>
                <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" defaultChecked /> Snap to grid</label>
              </div>
            </div>
            <div style={ribbonDivider} />
            <div style={ribbonGroup}>
              <span style={{ fontSize: '12px', color: '#605e5c', marginBottom: '4px' }}>Themes</span>
              <select value={theme} onChange={e => setTheme(e.target.value)} style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid #8a8886' }}>
                <option value="default">Default</option>
                <option value="dark">Dark</option>
                <option value="executive">Executive</option>
                <option value="citypark">City Park</option>
                <option value="classroom">Classroom</option>
                <option value="accessible">Accessible</option>
              </select>
            </div>
          </>
        )}

        {['Insert', 'Modeling', 'Format'].includes(activeTab) && (
          <div style={{ fontSize: '12px', color: '#605e5c', fontStyle: 'italic' }}>More features coming soon...</div>
        )}

      </div>
    </div>
  );
};

const ribbonGroup = { display: 'flex', gap: '8px', alignItems: 'center' };
const ribbonBtn = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'transparent', border: '1px solid transparent', padding: '4px 8px', cursor: 'pointer', fontSize: '11px', color: '#323130' };
const ribbonDivider = { width: '1px', height: '40px', background: '#c8c6c4' };
