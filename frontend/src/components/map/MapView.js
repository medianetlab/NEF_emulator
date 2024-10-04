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
import { getUEs, getCells, start_loop, stop_loop } from '../../utils/api';
import {
  addUEsToMap,
  addCellsToMap,
  removeMapLayersAndSources,
  handleUEClick,
  addPathsToMap
} from './MapViewUtils';

const MapView = ({ token }) => {
  const [ues, setUEs] = useState([]);
  const [cells, setCells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLoops, setActiveLoops] = useState(new Set());
  const [ws, setWs] = useState(null); // WebSocket connection state
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
        setUEs(uesData || []);
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
        center: [23.7275, 37.9838],
        zoom: 14,
      });
    }

    const map = mapInstanceRef.current;

    map.on('style.load', async () => {
      removeMapLayersAndSources(map, cells.map(cell => `cell-${cell.id}`));
      addCellsToMap(map, cells);
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

  // WebSocket connection effect
  useEffect(() => {
    if (!token) return;

    // Establish WebSocket connection
    const websocket = new WebSocket(`ws://localhost:4443/ws/ues`);

    websocket.onopen = () => {
      console.log('WebSocket connection opened');
    };

    websocket.onmessage = (event) => {
      const { data } = event;
      const updatedUEs = JSON.parse(data);
      setUEs(updatedUEs); // Update UEs with real-time data from WebSocket
    };

    websocket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(websocket);

    return () => {
      websocket.close(); // Close WebSocket connection when component unmounts
    };
  }, [token]);

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
                className="ml-2"
              >
                {activeLoops.has(ue.supi) ? `Stop ${ue.name}` : `Start ${ue.name}`}
              </CButton>
            ))}
            <CButton color="danger" onClick={handleStopAllLoops}>
              Stop All
            </CButton>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
};

export default MapView;
