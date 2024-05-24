// src/layout/Layout.js
import React, { useState } from 'react';
import Sidebar from '../sidebar/SidebarComponent';
import Topbar from '../topbar/TopbarComponent';
import MainContent from '../central-panel/CentralPanelComponent';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Topbar />
      <div className="content-wrapper">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;











