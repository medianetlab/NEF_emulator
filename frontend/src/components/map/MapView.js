import React, { useState, useEffect, useRef } from 'react';
import { CCard, CCardBody, CCardHeader, CRow, CCol, CButton, CTable, CTableBody, CTableHead, CTableRow, CTableDataCell } from '@coreui/react';
import maplibregl from 'maplibre-gl';
import {
  getUEs,
  getCells,
  start_loop,
  stop_loop,
  last_notification
} from '../../utils/api';
import {
  addUEsToMap,
  addCellsToMap,
  removeMapLayersAndSources,
  handleUEClick,
  updateUEPositionsOnMap,
  addPathsToMap,
  addCellRadiusToMap,
  initializeMarkers,
  handleStopAllLoops,
  handleStartIndividualLoop,
  handleStartLoop,
  connectWebSocket,
  handleLogEntry, // Import the new log handling function
} from './MapViewUtils';

const MapView = ({ token }) => {
  const [ues, setUEs] = useState([]);
  const [cells, setCells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLoops, setActiveLoops] = useState(new Set());
  const [ws, setWs] = useState(null); // State for WebSocket
  const [logs, setLogs] = useState([]); // State to hold log entries
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null); // Keep track of the map instance

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const uesData = await getUEs(token);
        const cellsData = await getCells(token);

        setUEs(Array.isArray(uesData) ? uesData : []);
        setCells(cellsData || []);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    if (loading || !token) return;

    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = new maplibregl.Map({
        container: mapRef.current,
        style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.REACT_APP_MAPTILER_API_KEY}`,
        center: [23.81953, 37.99803],
        zoom: 16,
      });
    }

    const map = mapInstanceRef.current;

    map.on('style.load', async () => {
      removeMapLayersAndSources(map, cells.map(cell => `cell-${cell.id}`));
      addCellsToMap(map, cells);
      addCellRadiusToMap(map, cells);
      initializeMarkers(map);
      addUEsToMap(map, ues, handleUEClick);
      await addPathsToMap(map, ues, token);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading, token, ues, cells]);

  // This function will handle WebSocket messages for log entries
  const handleWebSocketMessage = (event) => {
    handleLogEntry(event, setLogs); // Call the log handling function
  };

  return (
    <CCard className="mb-4" style={{ width: '100%' }}>
      <CCardHeader>Map</CCardHeader>
      <CCardBody>
        <div ref={mapRef} style={{ height: '700px', width: '100%' }}></div>
        <CRow className="mt-3">
          <CCol>
            <CButton 
              color="primary" 
              onClick={() => handleStartLoop(token, ues, activeLoops, setActiveLoops, start_loop, ws, setWs, mapInstanceRef)} 
              disabled={activeLoops.size === ues.length || loading}
            >
              Start All
            </CButton>
            {ues.map((ue) => (
              <CButton
                key={ue.supi}
                color={activeLoops.has(ue.supi) ? "danger" : "primary"}
                onClick={() => handleStartIndividualLoop(ue.supi, token, activeLoops, setActiveLoops, start_loop, stop_loop, ws, setWs, mapInstanceRef)}
                className="ms-2"
              >
                {activeLoops.has(ue.supi) ? `Stop ${ue.supi}` : `Start ${ue.supi}`}
              </CButton>
            ))}
            <CButton 
              color="danger" 
              onClick={() => handleStopAllLoops(token, ues, activeLoops, setActiveLoops, stop_loop, ws, setWs)} 
              disabled={activeLoops.size === 0}
            >
              Stop All
            </CButton>
          </CCol>
        </CRow>

        {/* Table to display log entries */}
        <CTable className="mt-4">
          <CTableHead>
            <CTableRow>
              <CTableDataCell>ID</CTableDataCell>
              <CTableDataCell>SERVICE</CTableDataCell>
              <CTableDataCell>TYPE</CTableDataCell>
              <CTableDataCell>METHOD</CTableDataCell>
              <CTableDataCell>RESPONSE</CTableDataCell>
              <CTableDataCell>TIMESTAMP</CTableDataCell>
              <CTableDataCell>DETAILS</CTableDataCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {logs.map((log, index) => (
              <CTableRow key={index}>
                <CTableDataCell>{log.ID}</CTableDataCell>
                <CTableDataCell>{log.Service}</CTableDataCell>
                <CTableDataCell>{log.Type}</CTableDataCell>
                <CTableDataCell>{log.Method}</CTableDataCell>
                <CTableDataCell>{log.Response}</CTableDataCell>
                <CTableDataCell>{log.Timestamp}</CTableDataCell>
                <CTableDataCell>{log.Details}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  );
};

export default MapView;
