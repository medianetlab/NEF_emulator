import React, { useState, useEffect } from 'react';
import { getUsers, getCells, getNotifications, getPaths, getGnbs } from '../../utils/api';

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
    <div className="dashboard">
      <h1>Dashboard</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div>
            <h2>Paths:</h2>
            <ul>
              {gnbs.length > 0 ? (
                gnbs.map(gnb => (
                  <li key={gnb.id}>{gnb.name}</li>
                ))
              ) : (
                <p>No gnbs found</p>
              )}
            </ul>
          </div>
          <div>
            <h2>Cells:</h2>
            <ul>
              {cells.length > 0 ? (
                cells.map(cell => (
                  <li key={cell.id}>{cell.name}</li>
                ))
              ) : (
                <p>No cells found</p>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardComponent;

