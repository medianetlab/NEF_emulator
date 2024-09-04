import maplibregl from 'maplibre-gl';

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
      new maplibregl.Marker({ color: 'red' })
        .setLngLat([lng, lat])
        .setPopup(new maplibregl.Popup().setText(`Cell: ${cell.id}`))
        .addTo(mapInstance);
    } else {
      console.warn('Invalid lat/lng for Cell:', cell);
    }
  });
};

// Function to add paths to the map
export const addPathsToMap = (mapInstance, pathDetails) => {
  console.log('Adding Paths to map:', pathDetails);

  pathDetails.forEach(pathDetail => {
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

      // Add path as a line
      const pathSourceId = `path-${pathDetail.id}`;
      if (!mapInstance.getSource(pathSourceId)) {
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
          id: pathSourceId,
          type: 'line',
          source: pathSourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': pathDetail.color || '#FF0000',
            'line-width': 4
          }
        });
      } else {
        // Update the existing line source and layer if needed
        mapInstance.getSource(pathSourceId).setData({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates
          }
        });
      }

      // Add markers for start and end points
      if (!isNaN(startLat) && !isNaN(startLng)) {
        new maplibregl.Marker({ color: pathDetail.color || '#FF0000' })
          .setLngLat([startLng, startLat])
          .setPopup(new maplibregl.Popup().setText(`Start: ${pathDetail.description}`))
          .addTo(mapInstance);
      }

      if (!isNaN(endLat) && !isNaN(endLng)) {
        new maplibregl.Marker({ color: pathDetail.color || '#FF0000' })
          .setLngLat([endLng, endLat])
          .setPopup(new maplibregl.Popup().setText(`End: ${pathDetail.description}`))
          .addTo(mapInstance);
      }
    } else {
      console.warn('Invalid start/end points or empty points for path:', pathDetail);
    }
  });
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
