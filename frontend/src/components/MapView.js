import React, { useState, useEffect } from 'react';
import { CCard, CCardBody, CCardHeader, CButton, CRow, CCol, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell } from '@coreui/react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getUEs } from '../utils/api';
import { handleStartAll, handleUEClick } from './MapViewUtils';

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!token) return <p>Please provide a valid token.</p>;

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>Map</CCardHeader>
        <CCardBody>
          <MapContainer center={[37.9838, 23.7275]} zoom={13} style={{ height: '500px' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
            />
            <Marker position={[37.9838, 23.7275]}>
              <Popup>Example Location</Popup>
            </Marker>
          </MapContainer>

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
