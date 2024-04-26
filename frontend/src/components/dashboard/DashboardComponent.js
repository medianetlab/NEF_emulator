import React from 'react';
//import './DashboardComponent.css';
import { CCard, CCardBody, CCardTitle, CCardText, CImg } from '@coreui/react'; // Import necessary CoreUI components

const DashboardComponent = ({ token }) => {
  return (
    <div className="dashboard-component">
      <div className="card-container">
        {/* First Card */}
        <CCard className="dashboard-card">
          <CCardBody>
            <CImg src="assets/UE.png" alt="Cell Image" className="card-logo" />
            <CCardTitle>Cells</CCardTitle>
            <CCardText>Card content</CCardText>
          </CCardBody>
        </CCard>
        
        {/* Second Card */}
        <CCard className="dashboard-card">
          <CCardBody>
            <CImg src="assets/UE.png" alt="UE Image" className="card-logo" />
            <CCardTitle>UEs</CCardTitle>
            <CCardText>Card content</CCardText>
          </CCardBody>
        </CCard>
        
        {/* Third Card */}
        <CCard className="dashboard-card">
          <CCardBody>
            <CImg src="assets/UE.png" alt="GNB Image" className="card-logo" />
            <CCardTitle>GNBs</CCardTitle>
            <CCardText>Card content</CCardText>
          </CCardBody>
        </CCard>
        
        {/* Fourth Card */}
        <CCard className="dashboard-card">
          <CCardBody>
            <CImg src="assets/UE.png" alt="Path Image" className="card-logo" />
            <CCardTitle>Paths</CCardTitle>
            <CCardText>Card content</CCardText>
          </CCardBody>
        </CCard>
      </div>
    </div>
  );
};

export default DashboardComponent;





