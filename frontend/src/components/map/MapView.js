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
import { getUEs, getCells, getPaths, readPath, state_ues, start_loop, stop_loop } from '../../utils/api';
import {
  addUEsToMap,
  addCellsToMap,
  addPathsToMap,
  removeMapLayersAndSources,
  handleUEClick,
  addUEsToMapWithMarkers,
} from './MapViewUtils';

const MapView = ({ token }) => {
  const [ues, setUEs] = useState([]); // Initialize as an empty array
  const [cells, setCells] = useState([]);
  const [paths, setPaths] = useState([]);
  const [pathDetails, setPathDetails] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLooping, setIsLooping] = useState(false);
  const [currentSupi, setCurrentSupi] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

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
        const pathDetailsData = await Promise.all(pathsData.map(path => readPath(token, path.id)));

        setUEs(uesData || []); 
        setCells(cellsData || []);
        setPaths(pathsData || []);
        setPathDetails(pathDetailsData || []);
      } catch (err) {
        setError(err.message);
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
        center: [23.7275, 37.9838],
        zoom: 12,
      });
    }

    const map = mapInstanceRef.current;

    map.on('style.load', () => {
      // Ensure all layers are reset initially
      removeMapLayersAndSources(map, paths);

      addUEsToMapWithMarkers(map, ues, paths, handleUEClick);
      addCellsToMap(map, cells);
      addPathsToMap(map, ues, token); // Pass token to addPathsToMap

      cells.forEach(cell => {
        map.addLayer({
          id: `cell-radius-${cell.id}`,
          type: 'circle',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [cell.longitude, cell.latitude]
              }
            }
          },
          paint: {
            'circle-radius': {
              property: 'radius',
              stops: [
                [0, 0],
                [12, cell.radius || 50]
              ]
            },
            'circle-color': '#FF0000',
            'circle-opacity': 0.2
          }
        });
      });

      const bounds = new maplibregl.LngLatBounds();
      cells.forEach(cell => {
        bounds.extend([cell.longitude, cell.latitude]);
      });
      map.fitBounds(bounds, { padding: 50 });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading, token, ues, cells, paths, pathDetails]);

  useEffect(() => {
    let interval;

    if (isLooping) {
      const fetchUEState = async () => {
        try {
          const uesState = await state_ues(token);

          // Convert the object to an array
          const uesArray = Object.values(uesState);

          setUEs(uesArray);

          const map = mapInstanceRef.current;
          if (map) {
            // Update markers without reloading the map
            addUEsToMapWithMarkers(map, uesArray, paths, handleUEClick);
          }
        } catch (err) {
          console.error('Error fetching UE state:', err);
        }
      };

      interval = setInterval(fetchUEState, 5000);
    } else if (!isLooping && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLooping, token, paths]);

  const handleStartLoop = async () => {
    if (!token) {
      console.error('Token is missing');
      return;
    }

    try {
      const supi = ues.length > 0 ? ues[0].supi : null;

      if (supi) {
        await start_loop(token, supi);
        console.log(`Loop started for SUPI: ${supi}`);
        setCurrentSupi(supi); // Store the SUPI
        setIsLooping(true); // Mark loop as active
      } else {
        console.error('No SUPI found to start the loop');
      }
    } catch (err) {
      console.error('Error starting loop:', err);
    }
  };

  const handleStopLoop = async () => {
    if (!token) {
      console.error('Token is missing');
      return;
    }

    try {
      if (currentSupi) {
        console.log(`Stopping loop for SUPI: ${currentSupi}`);
        await stop_loop(token, currentSupi); // Stop the loop using the stored SUPI
        setIsLooping(false); // Set the loop status as inactive
        console.log('Loop stopped');
      } else {
        console.error('No SUPI stored for stopping the loop');
      }
    } catch (err) {
      console.error('Error stopping loop:', err);
    }
  };

  return (
    <>
      <CCard className="mb-4" style={{ width: '100%' }}>
        <CCardHeader>Map</CCardHeader>
        <CCardBody>
          <div ref={mapRef} style={{ height: '700px', width: '100%' }}></div>
          <CRow className="mt-3">
            <CCol>
              <CButton color="primary" onClick={handleStartLoop} disabled={isLooping}>
                Start Movement Loop
              </CButton>
              <CButton color="danger" onClick={handleStopLoop}>
                Stop Movement Loop
              </CButton>
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
                      <CTableDataCell>{new Date(log.timestamp).toLocaleString()}</CTableDataCell>
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
