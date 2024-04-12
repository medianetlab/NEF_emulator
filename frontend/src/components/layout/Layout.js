// components/layout/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarComponent from '../sidebar/SidebarComponent';
import TopbarComponent from '../topbar/TopbarComponent';

const Layout = () => {
  return (
    <div className="layout">
      <SidebarComponent />
      <div className="main">
        <TopbarComponent />
        <Outlet /> {/* This will render the child routes */}
      </div>
    </div>
  );
};

export default Layout;



