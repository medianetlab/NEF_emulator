import maplibregl from 'maplibre-gl';

// Function to add UEs with paths as markers
export const addUEsToMap = (mapInstance, ues, paths, handleUEClick) => {
  ues.forEach(ue => {
    const uePath = paths.find(path => path.ue_id === ue.id);
    if (uePath && ue.position) {
      const marker = new maplibregl.Marker({ color: 'blue' })
        .setLngLat([ue.position.longitude, ue.position.latitude])
        .setPopup(new maplibregl.Popup().setText(`UE: ${ue.name || ue.supi}`))
        .addTo(mapInstance);

      marker.getElement().addEventListener('click', () => {
        handleUEClick(ue);
      });
    }
  });
};

// Function to add cells as markers
export const addCellsToMap = (mapInstance, cells) => {
  cells.forEach(cell => {
    if (cell.position) {
      new maplibregl.Marker({ color: 'red' })
        .setLngLat([cell.position.longitude, cell.position.latitude])
        .setPopup(new maplibregl.Popup().setText(`Cell: ${cell.id}`))
        .addTo(mapInstance);
    }
  });
};

// Function to add paths to the map
export const addPathsToMap = (mapInstance, paths) => {
  paths.forEach(path => {
    if (path.start_point && path.end_point && path.points && path.points.length > 0) {
      const coordinates = path.points.map(point => [parseFloat(point.longitude), parseFloat(point.latitude)]);
      coordinates.unshift([parseFloat(path.start_point.longitude), parseFloat(path.start_point.latitude)]);
      coordinates.push([parseFloat(path.end_point.longitude), parseFloat(path.end_point.latitude)]);

      // Add path as a line
      const pathSourceId = `path-${path.id}`;
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
            'line-color': path.color || '#FF0000',
            'line-width': 4
          }
        });
      }

      // Add markers for start and end points
      new maplibregl.Marker({ color: path.color || '#FF0000' })
        .setLngLat([parseFloat(path.start_point.longitude), parseFloat(path.start_point.latitude)])
        .setPopup(new maplibregl.Popup().setText(`Start: ${path.description}`))
        .addTo(mapInstance);

      new maplibregl.Marker({ color: path.color || '#FF0000' })
        .setLngLat([parseFloat(path.end_point.longitude), parseFloat(path.end_point.latitude)])
        .setPopup(new maplibregl.Popup().setText(`End: ${path.description}`))
        .addTo(mapInstance);
    }
  });
};

// Function to remove all layers and sources
export const removeMapLayersAndSources = (mapInstance, paths) => {
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
