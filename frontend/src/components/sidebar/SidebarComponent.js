import React from 'react';
import { CSidebar, CSidebarNav, CNavItem, CNavTitle } from '@coreui/react';
import './SidebarComponent.css';

const Sidebar = ({ onSelect }) => {
  return (
    <CSidebar unfoldable className="sidebar">
      <CSidebarNav>
        <CNavTitle>Navigation</CNavTitle>
        <CNavItem href="#" onClick={() => onSelect('map')}>
          Map
        </CNavItem>
        <CNavItem href="#" onClick={() => onSelect('dashboard')}>
          Dashboard
        </CNavItem>
      </CSidebarNav>
    </CSidebar>
  );
};

export default Sidebar;




