import React from 'react';
import { CHeader, CHeaderNav, CButton, CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem } from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import { cilMenu, cilUser } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import './Header.css';

const Header = ({ onToggleSidebar, onLogout }) => {
  const navigate = useNavigate();

  // actions when logout
  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <CHeader className="bg-light d-flex justify-content-between align-items-center px-3">
      {/* Left side: Menu button */}
      <CHeaderNav>
        <CButton onClick={onToggleSidebar}>
          <CIcon icon={cilMenu} size="lg" />
        </CButton>
      </CHeaderNav>

      {/* Center: Title */}
      <div className="header-title mx-auto">
        <h1 className="mb-0">NEF Emulator</h1>
      </div>

      {/* Right side: User menu */}
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
            <CDropdownItem href="#" onClick={handleLogout} color="danger">
              Logout
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </CHeaderNav>
    </CHeader>
  );
};

export default Header;
