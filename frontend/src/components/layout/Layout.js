import React from 'react';
import SidebarComponent from '../sidebar/SidebarComponent';
import TopbarComponent from '../topbar/TopbarComponent';
import CentralPanel from '../central-panel/CentralPanelComponent';
//import LogoContainerComponent from '../logo-container/LogoContainerComponent'; // Import LogoContainer
//import './Layout.css'; 

// Import CoreUI components
import {
  CContainer,
  CRow,
  CCol,
} from '@coreui/react';

const Layout = ({ token }) => {
  return (
    <div className="layout">
      <CContainer fluid>
        <CRow>
          <CCol sm={3} md={2} className="sidebar-column">
            <div className="sidebar">
              <SidebarComponent />
            </div>
          </CCol>
          <CCol>
            <div className="main-column">
              <div className="topbar">
                <TopbarComponent />
              </div>
              <div className="central-panel">
                <CentralPanel token={token} />
              </div>
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Layout;








