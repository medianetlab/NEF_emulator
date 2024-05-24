// src/components/MainContent.js
import React from 'react';
import MapComponent from '../map/MapComponent';
import Dashboard from '../dashboard/DashboardComponent';
import './CentralPanelComponent.css';

const MainContent = ({ content }) => {
  return (
    <div className="p-4" style={{ height: 'calc(100vh - 56px)' }}>
      <h1>{content === 'map' ? 'Map' : 'Dashboard'}</h1>
      <div style={{ height: '100%' }}>
        {content === 'map' ? <MapComponent /> : <Dashboard />}
      </div>
    </div>
  );
};

export default MainContent;
