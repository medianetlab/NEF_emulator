import React from 'react';
import { CSidebarNav, CNavItem, CNavLink } from '@coreui/react';

const Sidebar = () => {
  return (
    <CSidebarNav>
      <CNavItem>
        <CNavLink href="/dashboard">Dashboard</CNavLink>
      </CNavItem>
      <CNavItem>
        <CNavLink href="/map">Map</CNavLink>
      </CNavItem>
    </CSidebarNav>
  );
};

export default Sidebar;
