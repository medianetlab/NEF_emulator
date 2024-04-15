import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import MapPage from './pages/mapPage/MapPage';
import DashboardPage from './pages/dashboardPage/DashboardPage';
import { getToken } from './utils/api'; 
import './App.css';

const App = () => {
  const [token, setToken] = useState('');

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await getToken('admin@my-email.com', 'pass'); 
        setToken(token);
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };
    fetchToken();
  }, []);

  return (
    <Router>
      <Routes>
        <Route element={<Layout token={token} />}>
          <Route path="/map" element={<MapPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;













