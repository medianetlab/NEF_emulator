import maplibregl from 'maplibre-gl';
import { readPath } from '../../utils/api';

let markersMap = new Map();

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
          color: '#FF0000', // Red for all cells
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
      'circle-color': '#FF0000', // Red color
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
          'circle-color': '#FF5733',
          'circle-opacity': 0.1 // More opaque (increase the opacity)
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
  
  // Add or update UEs to the map
  export const addUEsToMap = (mapInstance, ues, handleUEClick) => {
    console.log('Adding UEs to map:', ues);
  
    const uesArray = Array.isArray(ues) ? ues : Object.values(ues);
  
    uesArray.forEach(ue => {
      if (ue && ue.latitude && ue.longitude) {
        // Remove existing marker if it exists
        if (markersMap.has(ue.id)) {
          const existingMarker = markersMap.get(ue.id);
          existingMarker.remove(); // Remove the old marker
          markersMap.delete(ue.id); // Delete marker from map
        }
  
        // Create new UE marker
        const marker = new maplibregl.Marker({ id: `ue-${ue.id}` })
          .setLngLat([ue.longitude, ue.latitude])
          .setPopup(new maplibregl.Popup().setHTML(`<h3>${ue.name}</h3><p>${ue.description}</p>`))
          .addTo(mapInstance);
  
        // Store the marker in the map
        markersMap.set(ue.id, marker);
  
        // Add click event handler
        marker.getElement().addEventListener('click', () => handleUEClick(ue));
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