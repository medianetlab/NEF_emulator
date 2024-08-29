// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {
  CContainer,
} from '@coreui/react';
import Dashboard from './components/dashboard/Dashboard';
import MapView from './components/map/MapView';
import ImportView from './components/ImportView';
import ExportView from './components/ExportView';
import { getToken } from './utils/api';
import './App.css';
import Header from './containers/Header';
import Sidebar from './containers/Sidebar';

const App = () => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await getToken('admin@my-email.com', 'pass');
        setToken(token);
      } catch (error) {
        setError('Error fetching token. Please check your credentials.');
        console.error('Error fetching token:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchToken();
  }, []);

  const handleSwaggerClick = (url) => {
    window.open(url, '_blank');
  };

  const handleRedocClick = (url) => {
    window.open(url, '_blank');
  };

  return (
    <Router>
      <div className="app-container">
        <Sidebar
          handleSwaggerClick={handleSwaggerClick}
          handleRedocClick={handleRedocClick}
        />
        <div className="main-content">
          <Header />
          <CContainer lg className="main-container">
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <Routes>
                <Route path="/dashboard" element={<Dashboard token={token} />} />
                <Route path="/map" element={<MapView token={token} />} />
                <Route path="/import" element={<ImportView token={token} />} />
                <Route path="/export" element={<ExportView token={token} />} />
              </Routes>
            )}
          </CContainer>
        </div>
      </div>
    </Router>
  );
};

export default App;
