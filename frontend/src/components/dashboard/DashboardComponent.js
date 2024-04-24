import React from 'react';
import './DashboardComponent.css';
import RowContainer from './RowContainer';
import AspectContainer from './AspectContainer';

const DashboardComponent = ({ token }) => {
  return (
    <div className="dashboard-component">
      <RowContainer token={token} />
      <div className="aspect-containers">
        <AspectContainer token={token} aspectName="Users" />
        <AspectContainer token={token} aspectName="Cells" />
        <AspectContainer token={token} aspectName="Paths" />
        <AspectContainer token={token} aspectName="GNBS" />
      </div>
    </div>
  );
};

export default DashboardComponent;



