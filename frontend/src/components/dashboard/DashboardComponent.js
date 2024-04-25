import React from 'react';
import './DashboardComponent.css';
import RowContainer from './RowContainer';
import UsersContainer from './UEContainer';
import CellsContainer from './CellsContainer';
import PathsContainer from './PathsContainer';
import GnbsContainer from './GnbsContainer';

const DashboardComponent = ({ token }) => {
  return (
    <div className="dashboard-component">
      <RowContainer token={token} />
      <div className="aspect-containers">
        <UsersContainer token={token} />
        <CellsContainer token={token} />
        <PathsContainer token={token} />
        <GnbsContainer token={token} />
      </div>
    </div>
  );
};

export default DashboardComponent;



