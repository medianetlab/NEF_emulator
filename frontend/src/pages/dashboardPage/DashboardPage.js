// DashboardPage.js

import React, { useState, useEffect } from 'react';
import { getUsers } from '../../utils/api';
import DashboardComponent from '../../components/dashboard/DashboardComponent'; // Import DashboardComponent

const DashboardPage = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [token]); // Include token in the dependency array

  const fetchData = async () => {
    try {
      const userData = await getUsers(token); // Pass token to getUsers
      setUsers(userData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <h1>Dashboard Page</h1>
      <DashboardComponent users={users} loading={loading} token={token}/> {/* Pass users and loading as props */}
    </div>
  );
};

export default DashboardPage;




