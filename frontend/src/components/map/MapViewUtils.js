import maplibregl from 'maplibre-gl';
import { readPath } from '../../utils/api';

// Add UEs to the map
export const addUEsToMap = (mapInstance, ues, paths, handleUEClick) => {
  console.log('Adding UEs to map:', ues);

  const uesArray = Array.isArray(ues) ? ues : Object.values(ues);

  uesArray.forEach(ue => {
    if (ue && ue.latitude && ue.longitude) {
      // Add UE markers
      const marker = new maplibregl.Marker({ id: `ue-${ue.id}` })
        .setLngLat([ue.longitude, ue.latitude])
        .setPopup(new maplibregl.Popup().setHTML(`<h3>${ue.name}</h3><p>${ue.description}</p>`))
        .addTo(mapInstance);

      // Optional: Add click event handler if needed
      marker.getElement().addEventListener('click', () => handleUEClick(ue));
    }
  });
};

// Function to remove UE markers by their IDs
export const removeUEMarkers = (mapInstance, ueIds) => {
  ueIds.forEach(id => {
    const existingMarker = mapInstance.getLayer(`ue-${id}`);
    if (existingMarker) {
      mapInstance.removeLayer(`ue-${id}`);
    }
  });
};

// Function to add cells to the map
export const addCellsToMap = (mapInstance, cells) => {
  console.log('Adding cells to map:', cells);

  cells.forEach(cell => {
    mapInstance.addLayer({
      id: `cell-${cell.id}`,
      type: 'circle',
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [cell.longitude, cell.latitude]
          },
          properties: {
            id: cell.id,
            ...cell,
          }
        }
      },
      paint: {
        'circle-radius': 7,
        'circle-color': '#F00',
        'circle-opacity': 0.7
      }
    });
  });
};

// Function to add paths to the map
export const addPathsToMap = (mapInstance, ues, token) => {
  console.log('Adding paths to map:', ues);

  ues.forEach(async ue => {
    try {
      const path = await readPath(token, ue.pathId);
      const coordinates = path.map(point => [point.longitude, point.latitude]);

      mapInstance.addLayer({
        id: `path-${ue.pathId}`,
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates
            },
            properties: {
              id: ue.pathId
            }
          }
        },
        paint: {
          'line-color': '#00F',
          'line-width': 2
        }
      });
    } catch (error) {
      console.error('Error fetching path:', error);
    }
  });
};

// Function to remove all layers and sources from the map
export const removeMapLayersAndSources = (mapInstance, layerIds) => {
  layerIds.forEach(layerId => {
    if (mapInstance.getLayer(layerId)) {
      mapInstance.removeLayer(layerId);
      mapInstance.removeSource(layerId);
    }
  });
};

// Handle UE click event
export const handleUEClick = (event) => {
  const { features } = event;

  if (features.length > 0) {
    const feature = features[0];
    console.log('UE clicked:', feature.properties);
  }
};
