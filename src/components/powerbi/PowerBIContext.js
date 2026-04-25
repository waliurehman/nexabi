import React, { createContext, useContext, useState, useEffect } from 'react';

const PowerBIContext = createContext();

export const usePowerBI = () => useContext(PowerBIContext);

export const PowerBIProvider = ({ children }) => {
  const [charts, setCharts] = useState([]);
  const [selectedChartId, setSelectedChartId] = useState(null);
  const [dataset, setDataset] = useState([]);
  const [columns, setColumns] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [theme, setTheme] = useState('default');
  const [canvasSettings, setCanvasSettings] = useState({
    type: '16:9',
    width: 1280,
    height: 720,
    bg: '#ffffff',
    wallpaper: '#f3f4f6',
    transparency: 0
  });

  const value = {
    charts, setCharts,
    selectedChartId, setSelectedChartId,
    dataset, setDataset,
    columns, setColumns,
    activeFilters, setActiveFilters,
    theme, setTheme,
    canvasSettings, setCanvasSettings
  };

  return <PowerBIContext.Provider value={value}>{children}</PowerBIContext.Provider>;
};
