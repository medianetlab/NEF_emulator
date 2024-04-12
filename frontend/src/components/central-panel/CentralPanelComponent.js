import React from 'react';
import './CentralPanelComponent.css';

const CentralPanelComponent = ({ children }) => {
  return (
    <div className="central-panel">
      {children}
    </div>
  );
};

export default CentralPanelComponent;
