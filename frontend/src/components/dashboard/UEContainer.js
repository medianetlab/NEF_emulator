import React, { useState, useEffect } from 'react';
import AspectContainer from './AspectContainer'; // Import the AspectContainer component
import { getUsers } from '../../utils/api'; // Import the API function to fetch user data

const UΕContainer = ({ token }) => {
  const [usersData, setUsersData] = useState([]); // State to store user data

  useEffect(() => {
    fetchData(); // Fetch user data when the component mounts
  }, [token]); // Re-fetch data when the token changes

  const fetchData = async () => {
    try {
      const users = await getUsers(token); // Fetch user data using the token
      setUsersData(users); // Store the fetched user data in state
    } catch (error) {
      console.error('Error fetching users data:', error);
    }
  };

  return (
    <div>
      <h2>UΕ Container</h2>
      {/* Render the AspectContainer component and pass the user data */}
      <AspectContainer aspectData={usersData} />
    </div>
  );
};

export default UΕContainer;
