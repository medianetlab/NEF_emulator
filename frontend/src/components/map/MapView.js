import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CRow,
  CCol,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell
} from '@coreui/react';
import maplibregl from 'maplibre-gl'; 
import { getUEs } from '../../utils/api';
import { handleStartAll, handleUEClick } from './MapViewUtils';
import './MapView.css';

const MapView = ({ token }) => {
  const [ues, setUEs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUEs = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const uesData = await getUEs(token);
        setUEs(uesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUEs();
  }, [token]);

  useEffect(() => {
    if (loading || !token) return;

    // Initialize MapLibre GL JS map
    const map = new maplibregl.Map({
      container: 'map', // Container ID
      style: 'https://demotiles.maplibre.org/style.json', // Map style URL
      center: [23.7275, 37.9838], // Map center [lng, lat]
      zoom: 1 // Zoom level
    });

    // Add a marker
    new maplibregl.Marker()
      .setLngLat([23.7275, 37.9838])
      .setPopup(new maplibregl.Popup().setText('Example Location'))
      .addTo(map);

    // Clean up on component unmount
    return () => map.remove();
  }, [loading, token]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!token) return <p>Please provide a valid token.</p>;

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>Map</CCardHeader>
        <CCardBody>
          <div id="map" style={{ height: '500px', width: '100%' }}></div> {/* Map container */}
          
          <CRow className="mt-3">
            <CCol>
              <CButton color="primary" onClick={handleStartAll}>Start All</CButton>
            </CCol>
            {ues.map(ue => (
              <CCol key={ue.supi} className="mt-2">
                <CButton color="info" onClick={() => handleUEClick(ue)}>{ue.name || ue.supi}</CButton>
              </CCol>
            ))}
          </CRow>

          <CCard className="mt-4">
            <CCardHeader>API User Interface</CCardHeader>
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>ID</CTableHeaderCell>
                    <CTableHeaderCell>SERVICE</CTableHeaderCell>
                    <CTableHeaderCell>TYPE</CTableHeaderCell>
                    <CTableHeaderCell>METHOD</CTableHeaderCell>
                    <CTableHeaderCell>RESPONSE</CTableHeaderCell>
                    <CTableHeaderCell>TIMESTAMP</CTableHeaderCell>
                    <CTableHeaderCell>DETAILS</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {logs.map((log, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{log.id}</CTableDataCell>
                      <CTableDataCell>{log.service}</CTableDataCell>
                      <CTableDataCell>{log.type}</CTableDataCell>
                      <CTableDataCell>{log.method}</CTableDataCell>
                      <CTableDataCell>{log.response}</CTableDataCell>
                      <CTableDataCell>{log.timestamp}</CTableDataCell>
                      <CTableDataCell>{log.details}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCardBody>
      </CCard>
    </>
  );
};

export default MapView;

