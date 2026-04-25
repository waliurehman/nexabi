import React, { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, ScatterChart, Scatter,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { usePowerBI } from './PowerBIContext';

const THEMES = {
  default: ['#01B8AA', '#374649', '#FD625E', '#F2C80F', '#5F6B6D', '#8AD4EB', '#FE9666', '#A66999'],
  dark: ['#118DFF', '#12239E', '#E66C37', '#6B007B', '#E044A7', '#744EC2', '#D9B300', '#D64550'],
  executive: ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', '#f95d6a', '#ff7c43', '#ffa600'],
  citypark: ['#1A5E44', '#4D8269', '#80A68E', '#B3CAB3', '#D6A680', '#C28259', '#AD5E33', '#993A0D'],
  classroom: ['#F25757', '#F2E863', '#F2B705', '#F29F05', '#F27405', '#048ABF', '#03658C', '#024059'],
  accessible: ['#000000', '#004488', '#DDAA33', '#BB5566', '#FFFFFF']
};

export const ChartRenderer = ({ chart }) => {
  const { dataset, activeFilters, setActiveFilters, theme } = usePowerBI();

  // Apply cross-filtering
  const filteredData = useMemo(() => {
    if (!dataset || dataset.length === 0) return chart.data || [];
    let data = dataset;
    Object.entries(activeFilters).forEach(([col, values]) => {
      if (values.length > 0) {
        data = data.filter(row => values.includes(row[col]));
      }
    });
    
    // Simple aggregation if we have xKey and yKey
    if (chart.xKey && chart.yKey) {
      const agg = {};
      data.forEach(row => {
        const x = row[chart.xKey];
        const y = Number(row[chart.yKey]) || 0;
        if (x !== undefined) {
          if (!agg[x]) agg[x] = { [chart.xKey]: x, [chart.yKey]: 0 };
          agg[x][chart.yKey] += y;
        }
      });
      return Object.values(agg);
    }
    return data;
  }, [dataset, activeFilters, chart]);

  const handleChartClick = (data) => {
    if (!chart.xKey || !data) return;
    let clickedVal = data[chart.xKey];
    if (data.activePayload && data.activePayload[0]) {
      clickedVal = data.activePayload[0].payload[chart.xKey];
    }
    if (!clickedVal) return;

    setActiveFilters(prev => {
      const colFilters = prev[chart.xKey] || [];
      if (colFilters.includes(clickedVal)) {
        return { ...prev, [chart.xKey]: colFilters.filter(v => v !== clickedVal) };
      }
      return { ...prev, [chart.xKey]: [...colFilters, clickedVal] };
    });
  };

  const colors = THEMES[theme] || THEMES.default;
  const commonProps = { data: filteredData, margin: { top: 10, right: 20, left: 0, bottom: 10 }, onClick: handleChartClick };
  const grid = chart.style?.showGrid !== false ? <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} /> : null;
  const tooltip = chart.style?.showTooltip !== false ? <RechartsTooltip cursor={{fill: 'transparent'}} /> : null;
  const legend = chart.style?.showLegend !== false ? <Legend verticalAlign={chart.style?.legendPos || 'bottom'} /> : null;

  if (filteredData.length === 0) {
    return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'#9ca3af',fontSize:'13px'}}>No data</div>;
  }

  if (chart.type === 'line') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart {...commonProps}>
          {grid}
          <XAxis dataKey={chart.xKey} />
          <YAxis />
          {tooltip}{legend}
          <Line type="monotone" dataKey={chart.yKey} stroke={colors[0]} strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (chart.type === 'area') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart {...commonProps}>
          {grid}
          <XAxis dataKey={chart.xKey} />
          <YAxis />
          {tooltip}{legend}
          <Area type="monotone" dataKey={chart.yKey} stroke={colors[0]} fill={colors[0]} fillOpacity={0.3} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (chart.type === 'pie' || chart.type === 'donut') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {tooltip}{legend}
          <Pie data={filteredData} dataKey={chart.yKey} nameKey={chart.xKey} cx="50%" cy="50%" innerRadius={chart.type === 'donut' ? 50 : 0} outerRadius={80} paddingAngle={2} onClick={(data) => handleChartClick(data.payload)}>
            {filteredData.map((_, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // Default to Bar
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart {...commonProps}>
        {grid}
        <XAxis dataKey={chart.xKey} />
        <YAxis />
        {tooltip}{legend}
        <Bar dataKey={chart.yKey} fill={colors[0]}>
          {filteredData.map((entry, index) => {
            const isSelected = activeFilters[chart.xKey]?.includes(entry[chart.xKey]);
            const opacity = (activeFilters[chart.xKey]?.length > 0 && !isSelected) ? 0.3 : 1;
            return <Cell key={`cell-${index}`} fill={colors[0]} opacity={opacity} cursor="pointer" />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
