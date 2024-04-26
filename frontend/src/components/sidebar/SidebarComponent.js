// SidebarComponent.js
import React from 'react';
import { CSidebar, CSidebarNav, CSidebarNavItem } from '@coreui/react';
import { Link } from 'react-router-dom';

const SidebarComponent = () => {
  return (
    <CSidebar>
      <CSidebarNav>
        <CSidebarNavItem>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
        </CSidebarNavItem>
        <CSidebarNavItem>
          <Link to="/map" className="nav-link">Map</Link>
        </CSidebarNavItem>
      </CSidebarNav>
    </CSidebar>
  );
};

export default SidebarComponent; // Make sure to export SidebarComponent

