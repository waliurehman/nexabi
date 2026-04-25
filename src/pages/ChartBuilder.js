import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChartIcon, Sparkles, LayoutDashboard, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDatasets } from '../api/files';

// Tab Components
import { PowerBIProvider } from '../components/powerbi/PowerBIContext';
import { Ribbon } from '../components/powerbi/Ribbon';
import { LeftPane } from '../components/powerbi/LeftPane';
import { PowerBICanvas } from '../components/powerbi/PowerBICanvas';
import { RightPane } from '../components/powerbi/RightPane';
import AutoAnalyze from '../components/AutoAnalyze';
import PowerBITemplates from '../components/PowerBITemplates';
import { AutoDashboard } from '../components/AutoDashboard';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const TAB_ITEMS = [
  { id: 'manual', label: 'Power BI Desktop', icon: PieChartIcon },
  { id: 'auto', label: 'AI Auto Analyze', icon: Sparkles },
  { id: 'templates', label: 'Power BI Templates', icon: LayoutDashboard },
  { id: 'autodashboard', label: 'Auto Dashboard', icon: Database },
];

const PowerBIDesktopTab = () => {
  return (
    <PowerBIProvider>
      <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', background: '#eaeaea', fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif' }}>
        <Ribbon />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <LeftPane />
          <PowerBICanvas />
          <RightPane />
        </div>
        <style>{`
          .react-grid-item > .react-resizable-handle { width: 16px; height: 16px; z-index: 10; opacity: 0; transition: opacity 0.2s; }
          .react-grid-item:hover > .react-resizable-handle { opacity: 1; }
          .react-grid-item > .react-resizable-handle::after { border-right: 2px solid #005A9E; border-bottom: 2px solid #005A9E; width: 8px; height: 8px; }
        `}</style>
      </div>
    </PowerBIProvider>
  );
};

const pageV = { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.4 } }, exit: { opacity: 0 } };

const ChartBuilder = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('autodashboard');
  const [datasets, setDatasets] = useState([]);

  useEffect(() => {
    if (token) {
      getDatasets(token).then(data => setDatasets(data || [])).catch(() => {});
    }
  }, [token]);

  return (
    <motion.div style={S.page} variants={pageV} initial="initial" animate="animate" exit="exit">
      
      {/* TAB SWITCHER */}
      <div style={S.tabBar}>
        {TAB_ITEMS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              style={{...S.tabBtn, ...(isActive ? S.tabBtnActive : {})}}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon size={16} />
              {tab.label}
              {isActive && <motion.div layoutId="tabIndicator" style={S.tabIndicator} />}
            </motion.button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        {activeTab === 'manual' && (
          <motion.div key="manual" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} transition={{duration:0.3}} style={{flex: 1}}>
            <PowerBIDesktopTab />
          </motion.div>
        )}
        {activeTab === 'auto' && (
          <AutoAnalyze key="auto" datasets={datasets} token={token} />
        )}
        {activeTab === 'templates' && (
          <PowerBITemplates key="templates" datasets={datasets} token={token} />
        )}
        {activeTab === 'autodashboard' && (
          <motion.div key="autodashboard" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} transition={{duration:0.3}} style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <AutoDashboard token={token} />
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

const S = {
  page: { height: 'calc(100vh - var(--topbar-height))', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' },
  tabBar: { display: 'flex', gap: '6px', background: 'var(--card)', padding: '6px', borderRadius: '14px', border: '1px solid var(--border)', flexShrink: 0 },
  tabBtn: { position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'transparent', border: 'none', borderRadius: '10px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s', flex: 1, justifyContent: 'center' },
  tabBtnActive: { color: '#fff', background: 'linear-gradient(135deg, #6C63FF 0%, #3B82F6 100%)', boxShadow: '0 4px 16px rgba(108,99,255,0.3)' },
  tabIndicator: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: '#fff', borderRadius: '2px' },
};

export default ChartBuilder;