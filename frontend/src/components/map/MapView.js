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
import 'maplibre-gl/dist/maplibre-gl.css';
import { getUEs, getCells, start_loop, stop_loop, state_ues } from '../../utils/api';
import {
  addUEsToMap,
  addCellsToMap,
  removeMapLayersAndSources,
  handleUEClick,
  addPathsToMap // Import the new function
} from './MapViewUtils';

const MapView = ({ token }) => {
  const [ues, setUEs] = useState([]);
  const [cells, setCells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLoops, setActiveLoops] = useState(new Set());
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
      
      // Add paths to the map
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
    const animateUEs = async () => {
      if (activeLoops.size === 0 || !mapInstanceRef.current) return;

      const map = mapInstanceRef.current;

      try {
        const updatedUEsResponse = await state_ues(token);
        const updatedUEs = Object.values(updatedUEsResponse);

        updatedUEs.forEach(ue => {
          if (!activeLoops.has(ue.supi)) return;

          if (!ue.previousLongitude || !ue.previousLatitude) {
            ue.previousLongitude = ue.longitude;
            ue.previousLatitude = ue.latitude;
          }

          const startCoordinates = [ue.previousLongitude, ue.previousLatitude];
          const endCoordinates = [ue.longitude, ue.latitude];

          const steps = 50;
          let step = 0;

          const animate = () => {
            if (step <= steps) {
              const interpolate = (start, end) => start + (end - start) * (step / steps);
              ue.latitude = interpolate(startCoordinates[1], endCoordinates[1]);
              ue.longitude = interpolate(startCoordinates[0], endCoordinates[0]);

              addUEsToMap(map, [ue], handleUEClick);
              step++;
              requestAnimationFrame(animate);
            } else {
              ue.previousLongitude = ue.longitude;
              ue.previousLatitude = ue.latitude;
            }
          };

          animate();
        });
      } catch (error) {
        console.error('Error fetching updated UEs:', error);
      }
    };

    animateUEs();
    intervalRef.current = setInterval(animateUEs, 5000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [activeLoops, token]);

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
            <CButton color="primary" onClick={handleStartLoop} disabled={activeLoops.size === ues.length}>
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
