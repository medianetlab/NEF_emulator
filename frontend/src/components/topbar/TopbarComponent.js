import React from 'react';
import { CButton } from '@coreui/react';
//import './TopbarComponent.css'; // Import CSS file for styling

const TopbarComponent = ({ toggleSidebar }) => {
  return (
    <div className="topbar">
      <CButton onClick={toggleSidebar} className="topbar-button">
        Collapse Sidebar
      </CButton>
      <CButton className="topbar-button">Another Button</CButton>
    </div>
  );
};

export default TopbarComponent;



