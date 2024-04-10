// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/dashboardPage/DashboardPage';
import MapPage from './pages/mapPage/MapPage';
import Sidebar from './components/sidebar/SidebarComponent';
import { getToken } from './utils/api'; // Import getToken function from your api.js file

const App = () => {
  const [token, setToken] = useState('');

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const accessToken = await getToken('admin@my-email.com', 'pass'); // Provide your username and password
        setToken(accessToken);
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };
    fetchToken();
  }, []);

  return (
    <Router>
      <div className="app">
        <Sidebar />
        <Routes>
          <Route
            exact
            path="/dashboard"
            element={<DashboardPage token={token} />} // Pass the token as a prop
          />
          <Route
            path="/map"
            element={<MapPage token={token} />} // Pass the token as a prop
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;










