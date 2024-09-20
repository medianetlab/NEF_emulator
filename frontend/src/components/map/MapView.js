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
  const [isLooping, setIsLooping] = useState(false);
  const [currentSupi, setCurrentSupi] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const counterRef = useRef(0);
  const stepsRef = useRef(500);
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
        center: [23.7275, 37.9838],
        zoom: 12,
      });
    }

    const map = mapInstanceRef.current;

    map.on('style.load', () => {
      removeMapLayersAndSources(map, cells.map(cell => `cell-${cell.id}`));
      addCellsToMap(map, cells);
      addUEsToMap(map, ues, [], handleUEClick);
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
      if (!isLooping || !mapInstanceRef.current) return;
    
      const map = mapInstanceRef.current;
    
      try {
        const updatedUEsResponse = await state_ues(token);
        const updatedUEs = Object.values(updatedUEsResponse);
    
        updatedUEs.forEach(ue => {
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
  
    if (isLooping) {
      animateUEs();
      intervalRef.current = setInterval(animateUEs, 5000); // Update every 5 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLooping, token]);
  
  

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
        setCurrentSupi(supi);
        setIsLooping(true);
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
        await stop_loop(token, currentSupi);
        setIsLooping(false);
        console.log('Loop stopped');
      } else {
        console.error('No SUPI stored for stopping the loop');
      }
    } catch (err) {
      console.error('Error stopping loop:', err);
    }
  };

  return (
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
      </CCardBody>
    </CCard>
  );
};

export default MapView;
