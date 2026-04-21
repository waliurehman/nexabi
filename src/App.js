import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Query from './pages/Query';
import Upload from './pages/Upload';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import ChartBuilder from './pages/ChartBuilder';

function App() {
  const location = useLocation();

  // Landing page renders without the dashboard layout
  if (location.pathname === '/') {
    return <Landing />;
  }

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/query" element={<Query />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/chart-builder" element={<ChartBuilder />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}

export default App;
