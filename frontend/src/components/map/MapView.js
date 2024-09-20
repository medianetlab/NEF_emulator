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
  handleUEClick
} from './MapViewUtils';
import * as turf from '@turf/turf';

const MapView = ({ token }) => {
  const [ues, setUEs] = useState([]);
  const [cells, setCells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLoops, setActiveLoops] = useState(new Set()); // Track active loops for UEs
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const intervalRef = useRef(null);

  // Fetch initial data
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

  // Initialize map
  useEffect(() => {
    if (loading || !token) return;

    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = new maplibregl.Map({
        container: mapRef.current,
        style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.REACT_APP_MAPTILER_API_KEY}`,
        zoom: 14, // Set initial zoom level
      });
    }

    const map = mapInstanceRef.current;

    map.on('style.load', () => {
      removeMapLayersAndSources(map, cells.map(cell => `cell-${cell.id}`));
      addCellsToMap(map, cells);
      addUEsToMap(map, ues, [], handleUEClick);
      
      if (cells.length > 0) {
        // Calculate the centroid of the cells
        const cellCoords = cells.map(cell => [cell.longitude, cell.latitude]);
        const centroid = turf.centroid(turf.multiPoint(cellCoords));
        
        // Center the map on the centroid
        map.setCenter(centroid.geometry.coordinates);
      }
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
          if (!activeLoops.has(ue.supi)) return; // Skip UEs that are not active

          // Initialize previous coordinates if not set
          if (!ue.previousLongitude || !ue.previousLatitude) {
            ue.previousLongitude = ue.longitude;
            ue.previousLatitude = ue.latitude;
          }

          const startCoordinates = [ue.previousLongitude, ue.previousLatitude];
          const endCoordinates = [ue.longitude, ue.latitude];

          const steps = 50; // Number of steps for the animation
          let step = 0;

          const animate = () => {
            if (step <= steps) {
              const interpolate = (start, end) => start + (end - start) * (step / steps);
              ue.latitude = interpolate(startCoordinates[1], endCoordinates[1]);
              ue.longitude = interpolate(startCoordinates[0], endCoordinates[0]);

              addUEsToMap(map, [ue], [], handleUEClick);
              step++;
              requestAnimationFrame(animate);
            } else {
              // Update previous coordinates after animation
              ue.previousLongitude = ue.longitude;
              ue.previousLatitude = ue.latitude;
            }
          };

          animate(); // Start the animation for this UE
        });
      } catch (error) {
        console.error('Error fetching updated UEs:', error);
      }
    };

    animateUEs();
    intervalRef.current = setInterval(animateUEs, 5000); // Update every 5 seconds

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
      const promises = []; // Store promises to ensure all loops start

      for (const supi of supiSet) {
        if (!activeLoops.has(supi)) { // Only start if not already active
          promises.push(start_loop(token, supi));
          activeLoops.add(supi);
        }
      }

      await Promise.all(promises); // Wait for all loops to start
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
      // Stop loop for this UE
      await stop_loop(token, supi);
      activeLoops.delete(supi);
      console.log(`Stopped loop for SUPI: ${supi}`);
    } else {
      // Start loop for this UE
      await start_loop(token, supi);
      activeLoops.add(supi);
      console.log(`Started loop for SUPI: ${supi}`);
    }
    setActiveLoops(new Set(activeLoops)); // Trigger re-render
  };

  const handleStopAllLoops = async () => {
    if (!token) {
      console.error('Token is missing');
      return;
    }

    for (const supi of activeLoops) {
      await stop_loop(token, supi);
    }
    setActiveLoops(new Set()); // Clear active loops
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
