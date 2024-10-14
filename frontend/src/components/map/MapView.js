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
  const [logs, setLogs] = useState([]); // State to hold log entries
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [selectedLog, setSelectedLog] = useState(null); // State for selected log
  const [ws, setWs] = useState(null);

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

  const formatJson = (json) => {
    if (!json) return '';
  
    // Convert JSON to string and format it
    const jsonString = JSON.stringify(json, null, 2);
  
    // Format the JSON string
    return jsonString
      .replace(/\\/g, '') // Remove all backslashes
      .replace(/:\s/g, ': ') // Ensure there's a space after the colon for readability
      .replace(/,/g, ',\n') // Add new line after each comma for better readability
      .replace(/\{([^{}]*)\}/g, '{\n$1\n}') // New line for braces
      .replace(/\[\s*/g, '[\n') // New line after opening brackets
      .replace(/\s*\]/g, '\n]'); // New line before closing brackets
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

              {/* Type, Status Code, Method, and Timestamp Section */}
              <CTable>
                <CTableBody>
                  <CTableRow>
                    <CTableDataCell><strong>Type:</strong></CTableDataCell>
                    <CTableDataCell>{selectedLog.type}</CTableDataCell>
                    <CTableDataCell><strong>Status Code:</strong></CTableDataCell>
                    <CTableDataCell>{selectedLog.status_code}</CTableDataCell>
                    <CTableDataCell><strong>Method:</strong></CTableDataCell>
                    <CTableDataCell>{selectedLog.method}</CTableDataCell>
                    <CTableDataCell><strong>Timestamp:</strong></CTableDataCell>
                    <CTableDataCell>{new Date(selectedLog.timestamp).toLocaleString()}</CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>

              {/* Request Body Section */}
              <div style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
                <strong>Request Body:</strong>
                <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', margin: '0', fontFamily: 'monospace', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
                  {formatJson(selectedLog.request_body)}
                </pre>
              </div>

              {/* Response Body Section */}
              <div style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '5px', marginTop: '10px', overflow: 'auto' }}>
                <strong>Response Body:</strong>
                <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', margin: '0', fontFamily: 'monospace', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
                  {formatJson(selectedLog.response_body)}
                </pre>
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
