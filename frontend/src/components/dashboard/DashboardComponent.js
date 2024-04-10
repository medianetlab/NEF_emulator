import React, { useState, useEffect } from 'react';
import { getUsers } from '../../utils/api';

const Dashboard = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [token]); // Trigger fetchData when token changes

  const fetchData = async () => {
    try {
      const userData = await getUsers(token);
      setUsers(userData);
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
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
