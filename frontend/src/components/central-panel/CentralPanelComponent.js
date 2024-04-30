// CentralPanel.js
import React from 'react';
import MapComponent from '../map/MapComponent';
import DashboardComponent from '../dashboard/DashboardComponent';

const CentralPanelComponent = ({ page }) => {
  return (
    <div className="central-panel">
      {page === 'map' ? <MapComponent /> : <DashboardComponent />}
    </div>
  );
};

export default CentralPanelComponent;






