import React, { useState, useEffect } from 'react';
import { getUsers, getCells } from '../../utils/api';

const DashboardComponent = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [cells, setCells] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const userData = await getUsers(token);
      setUsers(userData);

      const cellsData = await getCells(token);
      setCells(cellsData);

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
            <h2>Users:</h2>
            <ul>
              {users.length > 0 ? (
                users.map(user => (
                  <li key={user.id}>{user.name}</li>
                ))
              ) : (
                <p>No users found</p>
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

