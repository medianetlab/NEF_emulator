// DashboardPage.js

import React from 'react';
import DashboardComponent from '../../components/dashboard/DashboardComponent'; // Import DashboardComponent
import { CContainer } from '@coreui/react'; // Import necessary CoreUI components

export const DashboardPage = ({ token }) => {
  return (
    <CContainer>
      <DashboardComponent token={token} />
    </CContainer>
  );
};

//export default DashboardPage;





