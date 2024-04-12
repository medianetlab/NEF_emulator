import React from 'react';
import { Link } from 'react-router-dom';
import './SidebarComponent.css'; // Import CSS file for styling

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Sidebar</h2>
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/map">Map</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
