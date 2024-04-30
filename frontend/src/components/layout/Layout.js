// Layout.js
import React, {useState} from 'react';
import {CContainer, CRow, CCol}  from '@coreui/react';
import SidebarComponent from '../sidebar/SidebarComponent';
import TopbarComponent from '../topbar/TopbarComponent';
import CentralPanelComponent from '../central-panel/CentralPanelComponent';

const Layout = () => {
  const [page, setPage] = useState('map');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <CContainer fluid className={`layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <CRow>
        <CCol sm={3} md={2} className="sidebar-column">
          <SidebarComponent setPage={setPage} />
        </CCol>
        <CCol>
          <div className="main-content">
            <TopbarComponent toggleSidebar={toggleSidebar} />
            <CentralPanelComponent page={page} />
          </div>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default Layout;










