import React from 'react';
import {
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CNavItem,
  CNavLink,
  CNavTitle,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem
} from '@coreui/react';
import './Sidebar.css';

const Sidebar = ({ handleSwaggerClick, handleRedocClick }) => {
  return (
    <CSidebar className="sidebar">
      <CSidebarBrand className="d-md-down-none" to="/">
        <img
          src="../../../backend/app/app/static/NEF_logo_400x160.svg"
          alt="NEF Logo"
          className="sidebar-logo"
        />
      </CSidebarBrand>
      <CSidebarNav>
        <CNavTitle>Dashboard</CNavTitle>
        <CNavItem>
          <CNavLink href="/dashboard">Dashboard</CNavLink>
        </CNavItem>
        <CNavTitle>Map</CNavTitle>
        <CNavItem>
          <CNavLink href="/map">Map</CNavLink>
        </CNavItem>
        <CNavTitle>Import/Export</CNavTitle>
        <CNavItem>
          <CNavLink href="/import">Import</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink href="/export">Export</CNavLink>
        </CNavItem>
        <CNavTitle>Documentation</CNavTitle>
        <CNavItem>
          <CDropdown>
            <CDropdownToggle>Swagger UI</CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem onClick={() => handleSwaggerClick(process.env.REACT_APP_SWAGGER_NORTHBOUND_URL)}>
                Northbound APIs
              </CDropdownItem>
              <CDropdownItem onClick={() => handleSwaggerClick(process.env.REACT_APP_SWAGGER_NEF_EMULATOR_URL)}>
                NEF Emulator
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CNavItem>
        <CNavItem>
          <CDropdown>
            <CDropdownToggle>Redoc</CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem onClick={() => handleRedocClick(process.env.REACT_APP_REDOC_NORTHBOUND_URL)}>
                Northbound APIs
              </CDropdownItem>
              <CDropdownItem onClick={() => handleRedocClick(process.env.REACT_APP_REDOC_NEF_EMULATOR_URL)}>
                NEF Emulator
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CNavItem>
      </CSidebarNav>
    </CSidebar>
  );
};

export default Sidebar;
