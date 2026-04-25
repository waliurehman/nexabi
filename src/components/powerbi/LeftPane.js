import React, { useState } from 'react';
import { usePowerBI } from './PowerBIContext';
import { Filter, ChevronDown, ChevronRight, X } from 'lucide-react';

export const LeftPane = () => {
  const { activeFilters, setActiveFilters, columns } = usePowerBI();
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');

  if (collapsed) {
    return (
      <div style={{ width: '40px', background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0' }}>
        <button onClick={() => setCollapsed(false)} style={iconBtn}><ChevronRight size={16} /></button>
        <div style={{ transform: 'rotate(-90deg)', marginTop: '40px', fontWeight: 600, color: '#4b5563', whiteSpace: 'nowrap' }}>Filters</div>
      </div>
    );
  }

  const handleClearFilter = (col) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      delete next[col];
      return next;
    });
  };

  return (
    <div style={{ width: '240px', background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#111827' }}>
          <Filter size={16} color="#005A9E" /> Filters
        </div>
        <button onClick={() => setCollapsed(true)} style={iconBtn}><ChevronDown size={16} /></button>
      </div>

      <div style={{ padding: '12px' }}>
        <input 
          type="text" 
          placeholder="Search" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px 12px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151', padding: '8px 0', borderBottom: '1px solid #e5e7eb', marginBottom: '8px' }}>
          Filters on this page
        </div>
        
        {/* Active Filters */}
        {Object.keys(activeFilters).length === 0 && (
          <div style={{ fontSize: '12px', color: '#6b7280', padding: '8px 0', fontStyle: 'italic' }}>
            Drag data fields here or click chart elements to add filters
          </div>
        )}

        {Object.entries(activeFilters).map(([col, values]) => {
          if (!values || values.length === 0) return null;
          return (
            <div key={col} style={{ border: '1px solid #e5e7eb', borderRadius: '4px', marginBottom: '8px', overflow: 'hidden' }}>
              <div style={{ background: '#f9fafb', padding: '6px 10px', fontSize: '12px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{col}</span>
                <button onClick={() => handleClearFilter(col)} style={iconBtn}><X size={14}/></button>
              </div>
              <div style={{ padding: '8px 10px', fontSize: '12px', color: '#4b5563' }}>
                {values.join(', ')}
              </div>
            </div>
          );
        })}

        {/* Drop zone for new filters */}
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const col = e.dataTransfer.getData('text/plain');
            if (col && !activeFilters[col]) {
              setActiveFilters(prev => ({ ...prev, [col]: [] }));
            }
          }}
          style={{ border: '1px dashed #d1d5db', borderRadius: '4px', padding: '16px', textAlign: 'center', fontSize: '12px', color: '#6b7280', marginTop: '12px' }}
        >
          Add data fields here
        </div>
      </div>
    </div>
  );
};

const iconBtn = { background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', color: '#6b7280' };
