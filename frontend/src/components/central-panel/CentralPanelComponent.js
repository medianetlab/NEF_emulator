// CentralPanelComponent.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MapPage from '../../pages/mapPage/MapPage';
import DashboardPage from '../../pages/dashboardPage/DashboardPage';

const CentralPanel = ({ token }) => {
  return (
      <Routes>
        <Route path="/map" element={<MapPage token={token} />} />
        <Route path="/dashboard" element={<DashboardPage token={token} />} />
      </Routes>
  );
};

export default CentralPanel;



