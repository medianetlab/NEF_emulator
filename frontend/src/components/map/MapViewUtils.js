import maplibregl from 'maplibre-gl';
import { readPath } from '../../utils/api';

// Function to add UEs with paths as markers
export const addUEsToMap = (mapInstance, ues, paths, handleUEClick) => {
  console.log('Adding UEs to map:', ues);

  ues.forEach(ue => {
    mapInstance.addLayer({
      id: `ue-${ue.id}`,
      type: 'circle',
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [ue.longitude, ue.latitude]
          },
          properties: {
            id: ue.id,
            ...ue,
          }
        }
      },
      paint: {
        'circle-radius': 5,
        'circle-color': '#00F',
        'circle-opacity': 0.7
      }
    });

    mapInstance.on('click', `ue-${ue.id}`, (e) => {
      handleUEClick(e);
    });
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
        'circle-radius': {
          property: 'radius',
          stops: [
            [0, 0],
            [12, cell.radius || 50]
          ]
        },
        'circle-color': '#F00',
        'circle-opacity': 0.2
      }
    });
  });
};

// Function to add paths to the map
export const addPathsToMap = (mapInstance, ues, token) => {
  console.log('Adding paths to map:', ues);

  ues.forEach(async (ue) => {
    try {
      const path = await readPath(token, ue.id);
      if (path) {
        mapInstance.addLayer({
          id: `path-${ue.id}`,
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: path.coordinates
              }
            }
          },
          paint: {
            'line-width': 2,
            'line-color': '#00F'
          }
        });
      }
    } catch (err) {
      console.error('Error reading path:', err);
    }
  });
};

// Function to remove map layers and sources
export const removeMapLayersAndSources = (mapInstance, layersToRemove) => {
  console.log('Removing map layers and sources:', layersToRemove);

  if (mapInstance) {
    layersToRemove.forEach((layerId) => {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.removeLayer(layerId);
      }
      if (mapInstance.getSource(layerId)) {
        mapInstance.removeSource(layerId);
      }
    });
  }
};

// Function to handle UE click event
export const handleUEClick = (event) => {
  console.log('UE Clicked:', event.features[0].properties);
};

