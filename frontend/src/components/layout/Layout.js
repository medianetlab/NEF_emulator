// components/layout/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarComponent from '../sidebar/SidebarComponent';
import TopbarComponent from '../topbar/TopbarComponent';
import CentralPanelComponent from '../central-panel/CentralPanelComponent';
import './Layout.css'

const Layout = () => {
  return (
    <div className="layout">
      <SidebarComponent />
      <div className="main">
        <TopbarComponent />
        <CentralPanelComponent> {/* Render CentralPanelComponent */}
          <Outlet /> {/* This will render the child routes */}
        </CentralPanelComponent>
      </div>
    </div>
  );
};

export default Layout;




