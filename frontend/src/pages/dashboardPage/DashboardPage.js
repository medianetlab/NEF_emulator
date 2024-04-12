// DashboardPage.js
import React, { useState, useEffect } from 'react';
import DashboardComponent from '../../components/dashboard/DashboardComponent';

const DashboardPage = ({ token }) => {

  return (
    <div className="dashboard-page">
      
      <DashboardComponent token={token}/> {}
    </div>
  );
};

export default DashboardPage;




