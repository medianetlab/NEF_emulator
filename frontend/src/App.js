// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { CContainer } from '@coreui/react';
import Dashboard from './components/dashboard/Dashboard';
import MapView from './components/map/MapView';
import ImportView from './components/ImportView';
import ExportView from './components/ExportView';
import LoginPage from './components/login/LoginPage';
import Header from './containers/Header';
import Sidebar from './containers/Sidebar';
import './App.css';
import 'maplibre-gl/dist/maplibre-gl.css';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const handleSwaggerClick = (url) => {
    window.open(url, '_blank');
  };

  const handleRedocClick = (url) => {
    window.open(url, '_blank');
  };

  return (
    <Router>
      <div className="app-container">
        {token ? (
          <>
            <Sidebar handleSwaggerClick={handleSwaggerClick} handleRedocClick={handleRedocClick} />
            <div className="main-content">
              <Header onLogout={handleLogout} />
              <CContainer lg className="main-container">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard token={token} />} />
                  <Route path="/map" element={<MapView token={token} />} />
                  <Route path="/import" element={<ImportView token={token} />} />
                  <Route path="/export" element={<ExportView token={token} />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </CContainer>
            </div>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
};

export default App;
