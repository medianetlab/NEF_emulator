import React from 'react';
import { CHeader, CHeaderNav, CButton, CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem } from '@coreui/react';
import { cilMenu, cilUser } from '@coreui/icons';
import CIcon from '@coreui/icons-react';

const Header = ({ onToggleSidebar }) => {
  return (
    <CHeader className="bg-light d-flex justify-content-between">
      <CHeaderNav>
        <CButton onClick={onToggleSidebar}>
          <CIcon icon={cilMenu} size="lg" />
        </CButton>
      </CHeaderNav>

      <CHeaderNav className="ms-auto">
        <CDropdown variant="nav-item">
          <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
            <CIcon icon={cilUser} size="lg" />
          </CDropdownToggle>
          <CDropdownMenu className="pt-0" placement="bottom-end">
            <CDropdownItem href="#">
              Profile
            </CDropdownItem>
            <CDropdownItem href="#">
              Settings
            </CDropdownItem>
            <CDropdownItem href="#">
              Logout
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </CHeaderNav>
    </CHeader>
  );
};

export default Header;
