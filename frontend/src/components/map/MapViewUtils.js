import maplibregl from 'maplibre-gl';
import { readPath } from '../../utils/api';

// Function to add UEs with paths as markers
export const addUEsToMap = (mapInstance, ues, paths, handleUEClick) => {
  console.log('Adding UEs to map:', ues);

  ues.forEach(ue => {
    const uePath = paths.find(path => path.ue_id === ue.id);

    // Ensure lat and lng are valid numbers
    const lat = parseFloat(ue.latitude);
    const lng = parseFloat(ue.longitude);

    if (!isNaN(lat) && !isNaN(lng)) {
      const marker = new maplibregl.Marker({ color: 'blue' })
        .setLngLat([lng, lat])
        .setPopup(new maplibregl.Popup().setText(`UE: ${ue.name || ue.supi}`))
        .addTo(mapInstance);

      marker.getElement().addEventListener('click', () => {
        handleUEClick(ue);
      });
    } else {
      console.warn('Invalid lat/lng for UE:', ue);
    }
  });
};

// Function to add cells as markers
export const addCellsToMap = (mapInstance, cells) => {
  console.log('Adding Cells to map:', cells);

  cells.forEach(cell => {
    // Ensure lat and lng are valid numbers
    const lat = parseFloat(cell.latitude);
    const lng = parseFloat(cell.longitude);

    if (!isNaN(lat) && !isNaN(lng)) {
      const cellRadiusId = `cell-radius-${cell.id}`;

      // Remove existing circle layer and source if it exists (for re-rendering purposes)
      if (mapInstance.getLayer(cellRadiusId)) {
        mapInstance.removeLayer(cellRadiusId);
      }
      if (mapInstance.getSource(cellRadiusId)) {
        mapInstance.removeSource(cellRadiusId);
      }

      // Add circle representing the cell's radius
      mapInstance.addSource(cellRadiusId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          }
        }
      });

      mapInstance.addLayer({
        id: cellRadiusId,
        type: 'circle',
        source: cellRadiusId,
        paint: {
          'circle-radius': cell.radius, // Proportional to radius
          'circle-color': 'rgba(255, 0, 0, 0.5)', // Red with opacity
          'circle-stroke-width': 1,
          'circle-stroke-color': 'rgba(255, 0, 0, 0.8)'
        }
      });

      // Add cell center marker after the circle layer, ensuring it's displayed on top
      const marker = new maplibregl.Marker({ color: 'red' }) // Red marker
        .setLngLat([lng, lat])
        .setPopup(new maplibregl.Popup().setText(`Cell: ${cell.id}`))
        .addTo(mapInstance);

    } else {
      console.warn('Invalid lat/lng for Cell:', cell);
    }
  });
};


// Function to add paths to the map
export const addPathsToMap = async (mapInstance, ues, token) => {
  console.log('Adding Paths to map:', ues);

  // Loop through each UE
  for (const ue of ues) {
    const pathId = ue.path_id; // each UE has a `path_id` field

    try {
      // Fetch path details
      const pathDetail = await readPath(token, pathId);

      const points = pathDetail.points;

      // Ensure start and end points are valid
      const startLat = parseFloat(pathDetail.start_point.latitude);
      const startLng = parseFloat(pathDetail.start_point.longitude);
      const endLat = parseFloat(pathDetail.end_point.latitude);
      const endLng = parseFloat(pathDetail.end_point.longitude);

      if (!isNaN(startLat) && !isNaN(startLng) && points.length > 0) {
        // Prepare coordinates array
        const coordinates = points.map(point => {
          const lng = parseFloat(point.longitude);
          const lat = parseFloat(point.latitude);
          if (!isNaN(lng) && !isNaN(lat)) {
            return [lng, lat];
          } else {
            console.warn('Invalid point coordinates:', point);
            return null;
          }
        }).filter(coord => coord !== null);

        // Ensure start and end coordinates are valid
        if (!isNaN(startLat) && !isNaN(startLng)) {
          coordinates.unshift([startLng, startLat]);
        }
        if (!isNaN(endLat) && !isNaN(endLng)) {
          coordinates.push([endLng, endLat]);
        }

        // Add path as a line, ensuring we don't duplicate sources and layers
        const pathSourceId = `path-${pathId}`;
        const pathLayerId = `path-layer-${pathId}`;

        if (mapInstance.getSource(pathSourceId)) {
          mapInstance.removeSource(pathSourceId);
        }

        if (mapInstance.getLayer(pathLayerId)) {
          mapInstance.removeLayer(pathLayerId);
        }

        mapInstance.addSource(pathSourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates
            }
          }
        });

        mapInstance.addLayer({
          id: pathLayerId,
          type: 'line',
          source: pathSourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': pathDetail.color || '#FF0000',
            'line-width': 2 // Thinner line width as per your requirement
          }
        });
      } else {
        console.warn('Invalid start/end points or empty points for path:', pathDetail);
      }
    } catch (error) {
      console.error('Error adding path to map:', error);
    }
  }
};




// Function to remove all layers and sources
export const removeMapLayersAndSources = (mapInstance, paths) => {
  console.log('Removing map layers and sources');

  paths.forEach(path => {
    const pathSourceId = `path-${path.id}`;
    if (mapInstance.getLayer(pathSourceId)) {
      mapInstance.removeLayer(pathSourceId);
    }
    if (mapInstance.getSource(pathSourceId)) {
      mapInstance.removeSource(pathSourceId);
    }
  });
};

// Function to handle the "Start All" button click
export const handleStartAll = (ues) => {
  console.log('Start all clicked');
  ues.forEach(ue => {
    console.log(`Starting UE: ${ue.supi}`);
    // Implement additional logic for starting UEs here
  });
};

// Function to handle UE marker click
export const handleUEClick = (ue) => {
  console.log(`UE clicked: ${ue.supi}`);
  // Implement additional logic for handling UE clicks here
};



