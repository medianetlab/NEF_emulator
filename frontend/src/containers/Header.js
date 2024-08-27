import React from 'react';
import { CHeader, CHeaderBrand, CHeaderToggler } from '@coreui/react';
import { FaUserCircle } from 'react-icons/fa'; // Example import for the user icon

const Header = () => {
  return (
    <CHeader>
      <CHeaderBrand href="/">NEF</CHeaderBrand>
      <CHeaderToggler className="d-lg-none" />
      <div className="ml-auto">
        <FaUserCircle size={24} style={{ cursor: 'pointer' }} />
        {/* Implement your profile and logout popup functionality here */}
      </div>
    </CHeader>
  );
};

export default Header;
