import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { PowerBIProvider } from '../components/powerbi/PowerBIContext';
import { Ribbon } from '../components/powerbi/Ribbon';
import { LeftPane } from '../components/powerbi/LeftPane';
import { PowerBICanvas } from '../components/powerbi/PowerBICanvas';
import { RightPane } from '../components/powerbi/RightPane';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const pageV = { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.4 } }, exit: { opacity: 0 } };

const ChartBuilderLayout = () => {
  return (
    <motion.div 
      variants={pageV} 
      initial="initial" 
      animate="animate" 
      exit="exit"
      style={{ height: 'calc(100vh - var(--topbar-height))', display: 'flex', flexDirection: 'column', background: '#eaeaea', fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif' }}
    >
      <Ribbon />
      
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <LeftPane />
        <PowerBICanvas />
        <RightPane />
      </div>

      <style>{`
        /* Power BI Specific Overrides */
        .react-grid-item > .react-resizable-handle { width: 16px; height: 16px; z-index: 10; opacity: 0; transition: opacity 0.2s; }
        .react-grid-item:hover > .react-resizable-handle { opacity: 1; }
        .react-grid-item > .react-resizable-handle::after { border-right: 2px solid #005A9E; border-bottom: 2px solid #005A9E; width: 8px; height: 8px; }
      `}</style>
    </motion.div>
  );
};

const ChartBuilder = () => {
  return (
    <PowerBIProvider>
      <ChartBuilderLayout />
    </PowerBIProvider>
  );
};

export default ChartBuilder;