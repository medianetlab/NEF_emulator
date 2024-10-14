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
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CFormSelect
} from '@coreui/react';
import maplibregl from 'maplibre-gl';
import {
  getUEs,
  getCells,
  start_loop,
  stop_loop,
  last_notification,
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

let last_notification_id = -1;

const MapView = ({ token }) => {
  const [ues, setUEs] = useState([]);
  const [cells, setCells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLoops, setActiveLoops] = useState(new Set());
  const [logs, setLogs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [ws, setWs] = useState(null);
  const [logFrequency, setLogFrequency] = useState(5000); // State to hold log frequency

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const intervalRef = useRef(null);

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

  useEffect(() => {
    const fetchLogs = async () => {
      if (!token) return;
      try {
        const logData = await last_notification(token, last_notification_id);
        // Update the logs, replacing any with the same id
        setLogs((prevLogs) => {
          // Create a map of existing logs by id
          const logMap = new Map(prevLogs.map(log => [log.id, log]));
  
          // Add new logs or replace logs with the same id
          logData.forEach(log => {
            logMap.set(log.id, log);
          });
  
          // Convert the updated map back to an array
          const updatedLogs = Array.from(logMap.values());
  
          // Limit the logs to the latest 100
          return updatedLogs.slice(-100);
        });
  
        if (activeLoops.size > 0 && ws) {
          last_notification_id += 1;
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };
  
    fetchLogs();
  
    intervalRef.current = setInterval(() => {
      fetchLogs();
    }, logFrequency);
  
    // Clear interval on component unmount
    return () => clearInterval(intervalRef.current);
  }, [token, logFrequency, activeLoops, ws]);
  

  const formatJson = (json) => {
    if (!json) return '';
  
    const jsonString = JSON.stringify(json, null, 2);
  
    return jsonString
      .replace(/\\/g, '')
      .replace(/:\s/g, ': ')
      .replace(/,/g, ',\n')
      .replace(/\{([^{}]*)\}/g, '{\n$1\n}')
      .replace(/\[\s*/g, '[\n')
      .replace(/\s*\]/g, '\n]');
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

        {/* Dropdown for log fetching frequency */}
        <CRow className="mt-3">
          <CCol>
          {/* Log frequency selection dropdown */}
          <CFormSelect 
              size="sm" 
              value={logFrequency}
              onChange={(e) => setLogFrequency(Number(e.target.value))} 
              aria-label="Select Log Fetch Frequency"
              style={{ width: 'auto', display: 'inline-block' }} 
            >
              <option value={1000}>1 sec</option>
              <option value={2000}>2 sec</option>
              <option value={5000}>5 sec</option>
              <option value={10000}>10 sec</option>
            </CFormSelect>
          </CCol>
        </CRow>

        {/* Table to display log entries */}
        <CTable className="mt-4">
          <CTableHead>
            <CTableRow>
              <CTableDataCell>ID</CTableDataCell>
              <CTableDataCell>Service API</CTableDataCell>
              <CTableDataCell>Type</CTableDataCell>
              <CTableDataCell>Method</CTableDataCell>
              <CTableDataCell>Response (Status Code)</CTableDataCell>
              <CTableDataCell>Timestamp</CTableDataCell>
              <CTableDataCell>Details</CTableDataCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {logs.map((log) => (
              <CTableRow key={log.id}>
                <CTableDataCell>{log.id}</CTableDataCell>
                <CTableDataCell>{log.serviceAPI}</CTableDataCell>
                <CTableDataCell>{log.type}</CTableDataCell>
                <CTableDataCell>{log.method}</CTableDataCell>
                <CTableDataCell>{log.status_code}</CTableDataCell>
                <CTableDataCell>{new Date(log.timestamp).toLocaleString()}</CTableDataCell>
                <CTableDataCell>
                  <CButton 
                    color="info" 
                    onClick={() => {
                      setSelectedLog(log); 
                      setModalVisible(true);
                    }}
                  >
                    View
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        {/* Modal for log details */}
        <CModal size="lg" visible={modalVisible} onClose={() => setModalVisible(false)}>
          <CModalHeader>
            <h5>Log Details</h5>
          </CModalHeader>
          <CModalBody>
            {selectedLog && (
              <div>
                {/* Service API and Endpoint Section */}
                <CTable>
                  <CTableBody>
                    <CTableRow>
                      <CTableDataCell><strong>Service API:</strong></CTableDataCell>
                      <CTableDataCell>{selectedLog.serviceAPI}</CTableDataCell>
                    </CTableRow>
                    <CTableRow>
                      <CTableDataCell><strong>Endpoint:</strong></CTableDataCell>
                      <CTableDataCell>{selectedLog.endpoint}</CTableDataCell>
                    </CTableRow>
                  </CTableBody>
                </CTable>
                
                {/* Log Type, Status Code, Method, and Timestamp Section */}
                <CTable>
                  <CTableBody>
                    <CTableRow>
                      <CTableDataCell><strong>Type:</strong></CTableDataCell>
                      <CTableDataCell>{selectedLog.type}</CTableDataCell>
                    </CTableRow>
                    <CTableRow>
                      <CTableDataCell><strong>Status Code:</strong></CTableDataCell>
                      <CTableDataCell>{selectedLog.status_code}</CTableDataCell>
                    </CTableRow>
                    <CTableRow>
                      <CTableDataCell><strong>Method:</strong></CTableDataCell>
                      <CTableDataCell>{selectedLog.method}</CTableDataCell>
                    </CTableRow>
                    <CTableRow>
                      <CTableDataCell><strong>Timestamp:</strong></CTableDataCell>
                      <CTableDataCell>{new Date(selectedLog.timestamp).toLocaleString()}</CTableDataCell>
                    </CTableRow>
                  </CTableBody>
                </CTable>

                {/* Request Body Section */}
                <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', marginTop: '1rem' }}>
                  <strong>Request Body:</strong>
                  <pre>{formatJson(selectedLog.request_body)}</pre>
                </div>

                {/* Response Body Section */}
                <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', marginTop: '1rem' }}>
                  <strong>Response Body:</strong>
                  <pre>{formatJson(selectedLog.response_body)}</pre>
                </div>
              </div>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setModalVisible(false)}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default MapView;
