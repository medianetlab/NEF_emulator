// Sidebar.js
import React from 'react';
import {CSidebar, CSidebarNav, CSidebarNavItem} from '@coreui/react';

const SidebarComponent = ({ setPage }) => {
  return (
    <CSidebar>
      <CSidebarNav>
        <CSidebarNavItem onClick={() => setPage('map')}>Map</CSidebarNavItem>
        <CSidebarNavItem onClick={() => setPage('dashboard')}>Dashboard</CSidebarNavItem>
      </CSidebarNav>
    </CSidebar>
  );
};

export default SidebarComponent;



