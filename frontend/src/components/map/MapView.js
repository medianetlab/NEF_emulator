// MapView.js
import React, { useState, useEffect, useRef } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CButton
} from '@coreui/react';
import maplibregl from 'maplibre-gl';
import {
  getUEs,
  getCells,
  start_loop,
  stop_loop,
  readPath
} from '../../utils/api';
import {
  addUEsToMap,
  addCellsToMap,
  removeMapLayersAndSources,
  handleUEClick,
  updateUEPositionsOnMap,
  addPathsToMap,
  addCellRadiusToMap,
  initializeMarkers
} from './MapViewUtils';

const MapView = ({ token }) => {
  const [ues, setUEs] = useState([]);
  const [cells, setCells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLoops, setActiveLoops] = useState(new Set());
  const [ws, setWs] = useState(null);
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
      initializeMarkers(map); // Initialize MarkerManager
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

  const connectWebSocket = () => {
    const websocketURL = `wss://localhost:4443/api/v1/ue_movement/ws/ues`;

    console.log('Attempting WebSocket connection to', websocketURL);

    const websocket = new WebSocket(websocketURL);

    websocket.onopen = () => {
      console.log('WebSocket connection opened');
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const updatedUEs = Object.values(data);
        const map = mapInstanceRef.current;
        updateUEPositionsOnMap(map, updatedUEs); // Only update positions
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
    };

    setWs(websocket);
  };

  const handleStartLoop = async () => {
    if (!token) {
      console.error('Token is missing');
      return;
    }

    try {
      const supiSet = new Set(ues.map(ue => ue.supi));
      const promises = [];

      for (const supi of supiSet) {
        if (!activeLoops.has(supi)) {
          promises.push(start_loop(token, supi));
          activeLoops.add(supi);
        }
      }

      await Promise.all(promises);
      setActiveLoops(new Set(activeLoops));
      console.log(`Started loops for all UEs`);
      connectWebSocket();

    } catch (err) {
      console.error('Error starting loops:', err);
    }
  };

  const handleStartIndividualLoop = async (supi) => {
    if (!token) {
      console.error('Token is missing');
      return;
    }

    if (activeLoops.has(supi)) {
      await stop_loop(token, supi);
      activeLoops.delete(supi);
      console.log(`Stopped loop for SUPI: ${supi}`);
    } else {
      await start_loop(token, supi);
      activeLoops.add(supi);
      console.log(`Started loop for SUPI: ${supi}`);
      connectWebSocket();
    }
    setActiveLoops(new Set(activeLoops));
  };

  const handleStopAllLoops = async () => {
    if (!token) {
      console.error('Token is missing');
      return;
    }

    for (const supi of activeLoops) {
      await stop_loop(token, supi);
    }
    setActiveLoops(new Set());
    console.log('Stopped all loops');
  };

  return (
    <CCard className="mb-4" style={{ width: '100%' }}>
      <CCardHeader>Map</CCardHeader>
      <CCardBody>
        <div ref={mapRef} style={{ height: '700px', width: '100%' }}></div>
        <CRow className="mt-3">
          <CCol>
            <CButton color="primary" onClick={handleStartLoop} disabled={activeLoops.size === ues.length || loading}>
              Start All
            </CButton>
            {ues.map((ue) => (
              <CButton
                key={ue.supi}
                color={activeLoops.has(ue.supi) ? "danger" : "primary"}
                onClick={() => handleStartIndividualLoop(ue.supi)}
                className="ms-2"
              >
                {activeLoops.has(ue.supi) ? `Stop ${ue.supi}` : `Start ${ue.supi}`}
              </CButton>
            ))}
            <CButton color="danger" onClick={handleStopAllLoops} disabled={activeLoops.size === 0}>
              Stop All
            </CButton>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
};

export default MapView;
