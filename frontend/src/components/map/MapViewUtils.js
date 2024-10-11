import { readPath } from '../../utils/api';
import MarkerManager from './MarkerManager';

let markerManager;

export const initializeMarkers = (map) => {
  markerManager = new MarkerManager(map); // Initialize marker manager
};

// Update the positions of UEs on the map
export const updateUEPositionsOnMap = (map, updatedUEs) => {
  if (!map || !updatedUEs) return;

  updatedUEs.forEach((ue) => {
    const { supi, longitude, latitude } = ue;

    if (!supi || longitude == null || latitude == null) {
      console.error('Invalid UE data:', ue);
      return;
    }

    const coordinates = [longitude, latitude];
    markerManager.updateMarker(supi, coordinates); // Update marker position
  });
};

// Add UEs to the map
export const addUEsToMap = (map, ues, handleUEClick) => {
  ues.forEach(ue => {
    if (ue && ue.latitude && ue.longitude) {
      const coordinates = [ue.longitude, ue.latitude];
      markerManager.addMarker(ue.supi, coordinates, 'blue', () => handleUEClick(ue)); // Add marker for UE
    }
  });
};

// Add paths for UEs to the map
export const addPathsToMap = async (mapInstance, ues, token) => {
  for (const ue of ues) {
    if (ue.path_id) {
      const layerId = `path-${ue.path_id}`;

      // Check if the layer already exists, and remove it if necessary
      if (mapInstance.getLayer(layerId)) {
        mapInstance.removeLayer(layerId);
      }
      if (mapInstance.getSource(layerId)) {
        mapInstance.removeSource(layerId);
      }

      try {
        const pathData = await readPath(token, ue.path_id);
        const coordinates = pathData.points.map(point => [point.longitude, point.latitude]);

        mapInstance.addLayer({
          id: layerId,
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates,
              },
              properties: {
                id: pathData.id,
                color: pathData.color,
              },
            },
          },
          paint: {
            'line-color': pathData.color || '#00F',
            'line-width': 2,
          },
        });
      } catch (error) {
        console.error('Error fetching path:', error);
      }
    }
  }
};


// Add cells to the map
export const addCellsToMap = (mapInstance, cells) => {
  if (!mapInstance || !cells) return;

  mapInstance.addSource('cellsSource', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: cells.map(cell => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [cell.longitude, cell.latitude],
        },
        properties: {
          description: cell.description,
          color: '#0000FF',
          radius: cell.radius || 100,
        },
      })),
    },
  });

  // Add cell circles
  mapInstance.addLayer({
    id: 'cellsLayer',
    type: 'circle',
    source: 'cellsSource',
    paint: {
      'circle-color': ['get', 'color'],
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        10, ['/', ['get', 'radius'], 10],
        15, ['/', ['get', 'radius'], 2],
      ],
      'circle-opacity': 0.1,
    },
  });

  // Add center dots for cells
  mapInstance.addLayer({
    id: 'centerDotsLayer',
    type: 'circle',
    source: 'cellsSource',
    paint: {
      'circle-color': '#0000FF',
      'circle-radius': 5,
      'circle-opacity': 1,
    },
  });
};

// Add radius visualization for individual cells
export const addCellRadiusToMap = (map, cell) => {
  const radius = (cell.radius || 0) / 2;
  const center = [cell.longitude, cell.latitude];

  map.addSource(`cell-radius-${cell.id}`, {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: center } }],
    },
  });

  map.addLayer({
    id: `cell-radius-layer-${cell.id}`,
    type: 'circle',
    source: `cell-radius-${cell.id}`,
    paint: {
      'circle-color': '#0000FF',
      'circle-radius': radius,
      'circle-opacity': 0.3,
    },
  });
};

// Remove map layers and sources
export const removeMapLayersAndSources = (map, layerIds) => {
  layerIds.forEach(layerId => {
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
    if (map.getSource(layerId)) {
      map.removeSource(layerId);
    }
  });
};

// Handle clicking on a UE marker
export const handleUEClick = (ue) => {
  alert(`UE: ${ue.supi} clicked!`);
};

export const connectWebSocket = (setWs, mapInstanceRef) => {
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
      const map = mapInstanceRef.current; // Use mapInstanceRef passed as parameter
      updateUEPositionsOnMap(map, updatedUEs); // Only update positions
    } catch (err) {
      console.error('Error parsing WebSocket message:', err);
    }
  };

  websocket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  websocket.onclose = (event) => {
    if (event.wasClean) {
      console.log(`WebSocket connection closed cleanly, code=${event.code}, reason=${event.reason}`);
    } else {
      console.error(`WebSocket connection died, code=${event.code}`);
    }
  };  

  setWs(websocket); // Store WebSocket instance in state
};

export const handleStartLoop = (token, ues, activeLoops, setActiveLoops, start_loop, ws, setWs, mapInstanceRef) => {
  if (!ws) {
    connectWebSocket(setWs, mapInstanceRef); // Pass mapInstanceRef to connectWebSocket
  }

  ues.forEach(ue => {
    if (!activeLoops.has(ue.supi)) {
      start_loop(token, ue.supi);
      setActiveLoops(prev => new Set(prev).add(ue.supi));
    }
  });
};

export const handleStartIndividualLoop = (supi, token, activeLoops, setActiveLoops, start_loop, stop_loop, ws, setWs, mapInstanceRef) => {
  if (!activeLoops.has(supi)) {
    if (!ws) {
      connectWebSocket(setWs, mapInstanceRef); // Pass mapInstanceRef to connectWebSocket
    }
    start_loop(token, supi);
    setActiveLoops(prev => new Set(prev).add(supi));
  } else {
    stop_loop(token, supi);
    setActiveLoops(prev => {
      const newSet = new Set(prev);
      newSet.delete(supi);
      return newSet;
    });
  }
};

export const handleStopAllLoops = (token, ues, activeLoops, setActiveLoops, stop_loop, ws, setWs) => {
  ues.forEach(ue => {
    if (activeLoops.has(ue.supi)) {
      stop_loop(token, ue.supi);
    }
  });

  setActiveLoops(new Set()); // Clear active loops
  if (ws) {
    ws.close(); // Close WebSocket connection
    setWs(null); // Clear WebSocket state
  }
};

