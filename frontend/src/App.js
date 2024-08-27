import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {
  CContainer,
  CHeader,
  CHeaderBrand,
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CNavItem,
  CNavLink,
  CNavTitle
} from '@coreui/react';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import ImportView from './components/ImportView';
import ExportView from './components/ExportView';
import RedocView from './components/RedocView';
import { getToken } from './utils/api';
import './App.css';
import Header from './containers/Header';

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

  const handleSwaggerClick = () => {
    window.open(process.env.REACT_APP_SWAGGER_URL, '_blank');
  };

  return (
    <Router>
      <div className="app-container">
        <div className="sidebar">
          <CSidebarBrand className="d-md-down-none" to="/">
            <img src="/home/gerpapa/NEF_emulator/backend/app/app/static/NEF_logo_400x160.svg" alt="NEF Logo" className="sidebar-logo"/>
          </CSidebarBrand>
          <CSidebarNav>
            <CNavTitle>Dashboard</CNavTitle>
            <CNavItem>
              <CNavLink href="/dashboard">Dashboard</CNavLink>
            </CNavItem>
            <CNavTitle>Map</CNavTitle>
            <CNavItem>
              <CNavLink href="/map">Map</CNavLink>
            </CNavItem>
            <CNavTitle>Import/Export</CNavTitle>
            <CNavItem>
              <CNavLink href="/import">Import</CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink href="/export">Export</CNavLink>
            </CNavItem>
            <CNavTitle>Docs</CNavTitle>
            <CNavItem>
              <CNavLink href="/swagger" onClick={handleSwaggerClick}>Swagger UI</CNavLink>
            </CNavItem>
          </CSidebarNav>
        </div>
        <div className="main-content">
          <Header />
          <CContainer lg>
            <Routes>
              <Route path="/dashboard" element={<Dashboard token={token} />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/import" element={<ImportView />} />
              <Route path="/export" element={<ExportView />} />
              <Route path="/redoc" element={<RedocView />} />
            </Routes>
          </CContainer>
        </div>
      </div>
    </Router>
  );
};

export default App;
