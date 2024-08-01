import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {
  CContainer,
  CHeader,
  CHeaderBrand,
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CSidebarToggler,
  CNavItem,
  CNavLink,
  CNavTitle
} from '@coreui/react';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
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
      <div className="app">
        <CSidebar unfoldable className="sidebar">
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
          </CSidebarNav>
          <CSidebarToggler className="d-lg-down-none" />
        </CSidebar>
        <div className="wrapper d-flex flex-column min-vh-100 bg-light">
          <CHeader>
            <CHeaderBrand href="/">NEF</CHeaderBrand>
          </CHeader>
          <CContainer lg>
            <Routes>
              <Route path="/dashboard" element={<Dashboard token={token} />} />
              <Route path="/map" element={<MapView />} />
            </Routes>
          </CContainer>
        </div>
      </div>
    </Router>
  );
};

export default App;













