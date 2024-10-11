import { readPath } from '../../utils/api';
import MarkerManager from './MarkerManager';

let markerManager; 

export const initializeMarkers = (map) => {
  markerManager = new MarkerManager(map); // Initialize marker manager
};

export const updateUEPositionsOnMap = (map, updatedUEs) => {
  if (!map || !updatedUEs) return;

  updatedUEs.forEach((ue) => {
    const { supi, longitude, latitude } = ue;

    if (!supi || longitude == null || latitude == null) {
      console.error('Invalid UE data:', ue);
      return; // Skip invalid data
    }

    const coordinates = [longitude, latitude];
    markerManager.updateMarker(supi, coordinates); // Update marker position
  });
};

export const addUEsToMap = (map, ues, handleUEClick) => {
  console.log('Adding UEs to map:', ues);
  ues.forEach(ue => {
    if (ue && ue.latitude && ue.longitude) {
      const coordinates = [ue.longitude, ue.latitude];
      markerManager.addMarker(ue.supi, coordinates, 'blue', () => handleUEClick(ue));
    }
  });
};


export const addPathsToMap = async (mapInstance, ues, token) => {
  console.log('Adding paths to map:', ues);

  for (const ue of ues) {
    if (ue.path_id) {
      try {
        const pathData = await readPath(token, ue.path_id);
        const coordinates = pathData.points.map(point => [point.longitude, point.latitude]);

        mapInstance.addLayer({
          id: `path-${ue.path_id}`,
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

/**
 * Add cells to the map.
 * @param {Object} mapInstance - The MapLibre map instance.
 * @param {Array} cells - Array of cell objects containing longitude, latitude, and other properties.
 */
export const addCellsToMap = (mapInstance, cells) => {
  if (!mapInstance || !cells) return;

  // Add the source for cells
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
          color: '#0000FF', // Red for all cells
          radius: cell.radius || 100, // Real-world radius in meters
        },
      })),
    },
  });

  // Add the layer for cell circles
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
      'circle-opacity': 0.1, // Higher opacity for circles
    },
  });

  // Add a layer for center dots
  mapInstance.addLayer({
    id: 'centerDotsLayer',
    type: 'circle',
    source: 'cellsSource',
    paint: {
      'circle-color': '#0000FF', // Red color
      'circle-radius': 5, // Small dot size
      'circle-opacity': 1, // Fully opaque
    },
  });
};

export const addCellRadiusToMap = (map, cell) => {
  const radius = (cell.radius || 0) / 2; // Adjust the radius to be smaller (e.g., divide by 2)
  const center = [cell.longitude, cell.latitude];
  
  // Adding a circle for cell radius
  map.addSource(`cell-radius-${cell.id}`, {
      type: 'geojson',
      data: {
          type: 'FeatureCollection',
          features: [
              {
                  type: 'Feature',
                  geometry: {
                      type: 'Point',
                      coordinates: center
                  }
              }
          ]
      }
  });

  map.addLayer({
      id: `cell-radius-${cell.id}`,
      type: 'circle',
      source: `cell-radius-${cell.id}`,
      paint: {
          'circle-radius': radius, // Smaller radius
          'circle-color': "#0000FF",
          'circle-opacity': 0.1 // More opaque (increase the opacity)
      }
  });
};


// Remove layers and sources from the map
export const removeMapLayersAndSources = (mapInstance, layerIds) => {
  layerIds.forEach(layerId => {
    if (mapInstance.getLayer(layerId)) {
      mapInstance.removeLayer(layerId);
      mapInstance.removeSource(layerId);
    }
  });
};

// Handle UE click event
export const handleUEClick = (ue) => {
  console.log('UE clicked:', ue);
};