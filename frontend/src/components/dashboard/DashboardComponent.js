import React, { useState, useEffect } from 'react';
import './DashboardComponent.css';
import RowContainer from './RowContainer';

const DashboardComponent = ({ token }) => {
  return (
    <div className="dashboard-component">
      <RowContainer token={token}/> {}
    </div>
  );
};

export default DashboardComponent;


