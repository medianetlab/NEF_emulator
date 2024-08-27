import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {
  CContainer,
  CHeaderBrand,
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CNavItem,
  CNavLink,
  CNavTitle,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem
} from '@coreui/react';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import ImportView from './components/ImportView';
import ExportView from './components/ExportView';
import { getToken } from './utils/api';
import './App.css';
import Header from './containers/Header';

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
        <CSidebar className="sidebar">
          <CSidebarBrand className="d-md-down-none" to="/">
            <img src="/home/gerpapa/NEF_emulator/backend/app/app/static/NEF_logo_400x160.svg" alt="NEF Logo" className="sidebar-logo" />
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
              <CDropdown>
                <CDropdownToggle color="link">Swagger UI</CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem onClick={() => handleSwaggerClick(process.env.REACT_APP_SWAGGER_NORTHBOUND_URL)}>
                    Northbound APIs
                  </CDropdownItem>
                  <CDropdownItem onClick={() => handleSwaggerClick(process.env.REACT_APP_SWAGGER_NEF_EMULATOR_URL)}>
                    NEF Emulator
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </CNavItem>
            <CNavItem>
              <CDropdown>
                <CDropdownToggle color="link">Redoc</CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem onClick={() => handleRedocClick(process.env.REACT_APP_REDOC_NORTHBOUND_URL)}>
                    Northbound APIs
                  </CDropdownItem>
                  <CDropdownItem onClick={() => handleRedocClick(process.env.REACT_APP_REDOC_NEF_EMULATOR_URL)}>
                    NEF Emulator
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </CNavItem>
          </CSidebarNav>
        </CSidebar>
        <div className="main-content">
          <Header />
          <CContainer lg>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <Routes>
                <Route path="/dashboard" element={<Dashboard token={token} />} />
                <Route path="/map" element={<MapView token={token} />} />
                <Route path="/import" element={<ImportView token={token}/>} />
                <Route path="/export" element={<ExportView token={token}/>} />
                {/* Add any additional routes here */}
              </Routes>
            )}
          </CContainer>
        </div>
      </div>
    </Router>
  );
};

export default App;
