import React, { useState, useEffect } from 'react';
import DashboardComponent from '../../components/dashboard/DashboardComponent';
import { getUsers } from '../../utils/api'; // Import getUsers from the API utils

const DashboardPage = ({ token }) => {
  const [users, setUsers] = useState([]); // Change 'data' to 'users'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const usersData = await getUsers(token); // Call getUsers instead of fetchDataFromBackend
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <DashboardComponent users={users} loading={loading} token={token} /> {/* Pass 'users' instead of 'data' */}
    </div>
  );
};

export default DashboardPage;

