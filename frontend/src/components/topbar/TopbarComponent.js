// Topbar.js
import React from 'react';
import { CButton } from '@coreui/react';

const TopbarComponent = ({ toggleSidebar }) => {
  return (
    <div className="topbar">
      <CButton onClick={toggleSidebar}>Toggle Sidebar</CButton>
    </div>
  );
};

export default TopbarComponent;




