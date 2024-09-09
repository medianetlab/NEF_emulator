import React, { useState, useEffect, useRef } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell
} from '@coreui/react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getUEs, getCells, getPaths, readPath } from '../../utils/api';
import {
  addUEsToMap,
  addCellsToMap,
  addPathsToMap,
  removeMapLayersAndSources,
  handleStartAll,
  handleUEClick,
} from './MapViewUtils';
import createWebSocketObservable from '../../utils/server'; 

const BASE_URL = `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/api/v1`;

const MapView = ({ token }) => {
  const [ues, setUEs] = useState([]);
  const [cells, setCells] = useState([]);
  const [paths, setPaths] = useState([]);
  const [pathDetails, setPathDetails] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Fetch initial data (UEs, cells, paths)
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const uesData = await getUEs(token);
        const cellsData = await getCells(token);
        const pathsData = await getPaths(token);

        // Fetch detailed path information for each path
        const pathDetailsData = await Promise.all(pathsData.map(path => readPath(token, path.id)));

        setUEs(uesData);
        setCells(cellsData);
        setPaths(pathsData);
        setPathDetails(pathDetailsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Initialize the map
  useEffect(() => {
    if (loading || !token) return;

    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = new maplibregl.Map({
        container: mapRef.current,
        style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.REACT_APP_MAPTILER_API_KEY}`,
        center: [23.7275, 37.9838],
        zoom: 12,
      });
    }

    const map = mapInstanceRef.current;

    map.on('style.load', () => {
      // Remove any existing layers and sources before adding new ones
      removeMapLayersAndSources(map, paths);

      // Add UEs, cells, and paths to the map
      addUEsToMap(map, ues, paths, handleUEClick);
      addCellsToMap(map, cells);
      addPathsToMap(map, pathDetails); // Pass pathDetails here
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading, token, ues, cells, paths, pathDetails]);


  return (
    <>
      <CCard className="mb-4" style={{ width: '100%' }}>
        <CCardHeader>Map</CCardHeader>
        <CCardBody>
          <div ref={mapRef} style={{ height: '700px', width: '100%' }}></div> {/* Map container */}
          <CRow className="mt-3">
            <CCol>
              <CButton color="primary" onClick={() => handleStartAll(ues)}>Start All</CButton>
            </CCol>
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
