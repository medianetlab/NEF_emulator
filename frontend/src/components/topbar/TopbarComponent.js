import React from 'react';
import { CNavbar, CContainer, CNavbarBrand, CNavbarToggler, CCollapse, CNavbarNav, CNavItem, CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem } from '@coreui/react';
import './TopbarComponent.css';

const Topbar = () => {
  return (
    <CNavbar expandable="sm" color="info" className="topbar">
      <CContainer fluid>
        <CNavbarToggler />
        <CNavbarBrand href="#">NEF</CNavbarBrand>
        <CCollapse className="navbar-collapse">
          <CNavbarNav className="ml-auto">
            <CNavItem>
              <CDropdown inNav>
                <CDropdownToggle color="secondary">
                  <i className="cil-user"></i>
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem>Settings</CDropdownItem>
                  <CDropdownItem>Logout</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </CNavItem>
          </CNavbarNav>
        </CCollapse>
      </CContainer>
    </CNavbar>
  );
};

export default Topbar;

