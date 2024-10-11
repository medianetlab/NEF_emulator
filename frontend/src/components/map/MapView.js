import React, { useState, useEffect, useRef } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CButton,
  CTable,
  CTableBody,
  CTableHead,
  CTableRow,
  CTableDataCell,
} from '@coreui/react';
import maplibregl from 'maplibre-gl';
import {
  getUEs,
  getCells,
  start_loop,
  stop_loop,
  fetchLastNotifications, // Import the new function
  last_notification
} from '../../utils/api';
import {
  addUEsToMap,
  addCellsToMap,
  removeMapLayersAndSources,
  handleUEClick,
  addPathsToMap,
  addCellRadiusToMap,
  initializeMarkers,
  handleStopAllLoops,
  handleStartIndividualLoop,
  handleStartLoop,
} from './MapViewUtils';

var last_notification_id = -1;

const MapView = ({ token }) => {
  const [ues, setUEs] = useState([]);
  const [cells, setCells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLoops, setActiveLoops] = useState(new Set());
  const [logs, setLogs] = useState([]); // State to hold log entries
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null); // Keep track of the map instance
  const intervalRef = useRef(null); // To hold the interval ID

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

  // Fetch logs periodically every 5 seconds
  useEffect(() => {
    const fetchLogs = async () => {
      if (!token) return;
      try {
        // Fetch the last notifications
        const logData = await last_notification(token, last_notification_id);
        setLogs(logData); // Assuming logData is an array of log entries
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    // Initial fetch for existing notifications
    fetchLogs();

    // Set up interval to fetch logs every 5 seconds
    intervalRef.current = setInterval(() => {
      fetchLogs();
    }, 5000); // 5000 milliseconds = 5 seconds

    // Clear interval on component unmount
    return () => clearInterval(intervalRef.current);
  }, [token]); // Dependency array includes token

  return (
    <CCard className="mb-4" style={{ width: '100%' }}>
      <CCardHeader>Map</CCardHeader>
      <CCardBody>
        <div ref={mapRef} style={{ height: '700px', width: '100%' }}></div>
        <CRow className="mt-3">
          <CCol>
            <CButton 
              color="primary" 
              onClick={() => handleStartLoop(token, ues, activeLoops, setActiveLoops, start_loop)} 
              disabled={activeLoops.size === ues.length || loading}
            >
              Start All
            </CButton>
            {ues.map((ue) => (
              <CButton
                key={ue.supi}
                color={activeLoops.has(ue.supi) ? "danger" : "primary"}
                onClick={() => handleStartIndividualLoop(ue.supi, token, activeLoops, setActiveLoops, start_loop, stop_loop)} 
                className="ms-2"
              >
                {activeLoops.has(ue.supi) ? `Stop ${ue.supi}` : `Start ${ue.supi}`}
              </CButton>
            ))}
            <CButton 
              color="danger" 
              onClick={() => handleStopAllLoops(token, ues, activeLoops, setActiveLoops, stop_loop)} 
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
              <CTableDataCell>Service API</CTableDataCell>
              <CTableDataCell>Method</CTableDataCell>
              <CTableDataCell>Status Code</CTableDataCell>
              <CTableDataCell>Request Body</CTableDataCell>
              <CTableDataCell>Response Body</CTableDataCell>
              <CTableDataCell>Timestamp</CTableDataCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {logs.map((log, index) => (
              <CTableRow key={log.id}> {/* Use log.id for the key */}
                <CTableDataCell>{log.id}</CTableDataCell>
                <CTableDataCell>{log.serviceAPI}</CTableDataCell>
                <CTableDataCell>{log.method}</CTableDataCell>
                <CTableDataCell>{log.status_code}</CTableDataCell>
                <CTableDataCell>{JSON.stringify(log.request_body)}</CTableDataCell>
                <CTableDataCell>{JSON.stringify(log.response_body)}</CTableDataCell>
                <CTableDataCell>{new Date(log.timestamp).toLocaleString()}</CTableDataCell> {/* Format the timestamp */}
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  );
};

export default MapView;
