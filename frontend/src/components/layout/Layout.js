import React from 'react';
import SidebarComponent from '../sidebar/SidebarComponent';
import TopbarComponent from '../topbar/TopbarComponent';
import CentralPanelComponent from '../central-panel/CentralPanelComponent';
//import LogoContainerComponent from '../logo-container/LogoContainerComponent'; // Import LogoContainer
import './Layout.css'; 

const Layout = ({ token }) => {
  return (
    <div className="layout">
      <div className="sidebar-column">
        <div className="logo-container">
          {}
        </div>
        <div className="sidebar">
          <SidebarComponent />
        </div>
      </div>
      <div className="main-column">
        <div className="topbar">
          <TopbarComponent />
        </div>
        <div className="central-panel">
          <CentralPanelComponent token={token} />
        </div>
      </div>
    </div>
  );
};




export default Layout;







