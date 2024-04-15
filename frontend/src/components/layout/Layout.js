import React from 'react';
import SidebarComponent from '../sidebar/SidebarComponent';
import TopbarComponent from '../topbar/TopbarComponent';
import CentralPanel from '../central-panel/CentralPanelComponent';
import './Layout.css'; // Import CSS file

const Layout = ({ token }) => {
  return (
    <div className="layout">
      <SidebarComponent />
      <div className="content">
        <TopbarComponent />
        <CentralPanel token={token} />
      </div>
    </div>
  );
};

export default Layout;







