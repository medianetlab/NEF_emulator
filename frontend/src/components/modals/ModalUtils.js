import * as turf from '@turf/turf';
import maplibregl from 'maplibre-gl';
import { readPath, getPaths } from '../../utils/api';

let markersMap = new Map();

/**
 * Add cells to the map.
 * @param {Object} mapInstance - The MapLibre map instance.
 * @param {Array} cells - Array of cell objects containing longitude, latitude, and other properties.
 */
export const addCellsToMap = (mapInstance, cells) => {
  if (!mapInstance || !cells || cells.length === 0) return;

  // Add a GeoJSON source for all cells
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
          color: '#FF0000',
          radius: cell.radius || 100,
        },
      })),
    },
  });

  // Iterate through each cell and add its radius as a circle
  cells.forEach(cell => {
    const radiusCenter = [cell.longitude, cell.latitude];
    const radius = (cell.radius || 100) / 1000; // Convert radius from meters to kilometers

    // Generate a circle using Turf.js
    const options = {
      steps: 64,
      units: 'kilometers' 
    };
    const circle = turf.circle(radiusCenter, radius, options);

    // Add the circle as a GeoJSON source
    mapInstance.addSource(`cell-radius-${cell.id}`, {
      type: 'geojson',
      data: circle
    });

    // Add a fill layer for the circle with some transparency
    mapInstance.addLayer({
      id: `cell-radius-${cell.id}`,
      type: 'fill',
      source: `cell-radius-${cell.id}`,
      paint: {
        'fill-color': '#FF0000', 
        'fill-opacity': 0.1
      }
    });
  });

  // Add a layer for cell centers
  mapInstance.addLayer({
    id: 'cell-centers-layer',
    type: 'circle',
    source: 'cellsSource',
    paint: {
      'circle-color': '#FF0000', 
      'circle-radius': 2, 
      'circle-opacity': 1,
    },
  });
};


/**
 * Fetch and add paths to the map.
 * @param {Object} mapInstance - The MapLibre map instance.
 * @param {string} token - The token for API authentication.
 */
export const addPathsToMap = async (mapInstance, token) => {
  if (!mapInstance) {
    console.error('Map instance is null. Cannot add paths.');
    return;
  }

  try {
    const paths = await getPaths(token);

    for (const path of paths) {
      if (path.id) {
        try {
          const pathData = await readPath(token, path.id);
          const coordinates = pathData.points.map(point => [point.longitude, point.latitude]);

          // Add the path as a new layer to the map
          mapInstance.addLayer({
            id: `path-${path.id}`,
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
              'line-color': pathData.color || '#00F', // Use default color if none provided
              'line-width': 2,
              'line-opacity': 0.4
            },
          });

        } catch (error) {
          console.error(`Error fetching path data for path_id ${path.path_id}:`, error);
        }
      }
    }

  } catch (error) {
    console.error('Error fetching paths:', error);
  }
};


/**
 * Add or update UEs to the map
 * @param {Object} mapInstance - The MapLibre map instance.
 * @param {Array} ues - Array of UE objects containing longitude and latitude.
 * @param {Function} handleUEClick - Callback function for UE click events.
 */
export const addUEsToMap = (mapInstance, ues, handleUEClick) => {
  if (!mapInstance || !Array.isArray(ues)) return;

  ues.forEach(ue => {
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


/**
 * Remove layers and sources from the map
 * @param {Object} mapInstance - The MapLibre map instance.
 * @param {Array} layerIds - Array of layer IDs to be removed.
 */
export const removeMapLayersAndSources = (mapInstance, layerIds) => {
  if (!mapInstance) {
    console.error('Map instance is null. Cannot remove layers or sources.');
    return;
  }

  layerIds.forEach(layerId => {
    if (mapInstance.getLayer(layerId)) {
      mapInstance.removeLayer(layerId);
      mapInstance.removeSource(layerId);
    }
  });
};


/**
 * Handle click events on UEs.
 * @param {Object} ue - UE object containing information to display.
 */
export const handleUEClick = (ue) => {
  const ueInfo = `
    Location: [${ue.latitude}, ${ue.longitude}]
    Cell ID: ${ue.cell_id || 'N/A'}
    External Identifier: ${ue.external_identifier || 'N/A'}
    Speed: ${ue.speed || 'Unknown'}
  `;

  alert(ueInfo);
};
