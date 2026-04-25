import React from 'react';
import { DashboardCanvas } from '../components/DashboardCanvas';

const ChartBuilder = () => {
  return (
    <div style={{ height: 'calc(100vh - var(--topbar-height, 60px))', width: '100%', overflow: 'hidden' }}>
      <DashboardCanvas />
    </div>
  );
};

export default ChartBuilder;