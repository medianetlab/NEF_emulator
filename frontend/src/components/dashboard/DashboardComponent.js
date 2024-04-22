// DashboardComponent.js

import React, { useState, useEffect } from 'react';
import { getUsers, getCells, getNotifications, getPaths, getGnbs } from '../../utils/api';
import './DashboardComponent.css';

// Define the RowContainer component outside of the DashboardComponent
const RowContainer = () => {
  const numbersFromBackend = [1, 2, 3, 4];
  
  return (
    <div className="row-container">
      {numbersFromBackend.map((number, index) => (
        <div key={index} className="box">
          {number}
        </div>
      ))}
    </div>
  );
};

const DashboardComponent = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [cells, setCells] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [paths, setPaths] = useState([]);
  const [gnbs, setGnbs] = useState([]);
  const [loading, setLoading] = useState(true);

  // get token from dashboard page
  useEffect(() => {
    fetchData();
  }, [token]);

  // fetch data from api.js
  const fetchData = async () => {
    try {
      const userData = await getUsers(token);
      setUsers(userData);

      const cellsData = await getCells(token);
      setCells(cellsData);

      const notificationsData = await getNotifications(token);
      setNotifications(notificationsData);

      const pathsData = await getPaths(token);
      setPaths(pathsData);

      const gnbsData = await getGnbs(token);
      setGnbs(gnbsData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-component">
      {/* Render the row container */}
      <RowContainer />
    </div>
  );
};

export default DashboardComponent;

