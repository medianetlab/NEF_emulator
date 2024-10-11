import maplibregl from 'maplibre-gl';
import { readPath } from '../../utils/api';

let markersMap = new Map(); // Map to track UE markers

export const updateUEPositionsOnMap = (map, updatedUEs, ueMarkers) => {
  if (!map || !updatedUEs) return; // Ensure updatedUEs is not null or undefined

  updatedUEs.forEach((ue) => {
    const { supi, longitude, latitude } = ue;

    // Check if required properties are available
    if (!supi || longitude == null || latitude == null) {
      console.error('Invalid UE data:', ue);
      return; // Skip invalid data
    }

    const coordinates = [longitude, latitude];

    // Check if there is an initial marker for this UE in the markersMap
    if (markersMap.has(supi)) {
      const initialMarker = markersMap.get(supi);
      initialMarker.remove(); // Remove the initial static marker from the map
      markersMap.delete(supi); // Remove it from the map so it's no longer tracked
    }

    // Update the UE position or create a new marker if not already present
    if (ueMarkers[supi]) {
      // Update existing moving marker position
      ueMarkers[supi].setLngLat(coordinates);
    } else {
      // Create a new marker for the moving UE
      const marker = new maplibregl.Marker({ color: 'blue' })
        .setLngLat(coordinates)
        .addTo(map);

      // Store the marker reference in ueMarkers
      ueMarkers[supi] = marker;

      // Optionally, add click handler for the UE marker
      marker.getElement().addEventListener('click', () => {
        handleUEClick(ue);
      });
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

      // Store the marker in markersMap (static markers)
      markersMap.set(ue.id, marker);

      // Add click event handler
      marker.getElement().addEventListener('click', () => handleUEClick(ue));
    }
  });
};


// Add cells to the map
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