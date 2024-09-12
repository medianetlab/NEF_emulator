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

      // Add a radius circle around the UE marker
      mapInstance.addLayer({
        id: `ue-radius-${ue.id}`,
        type: 'circle',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            }
          }
        },
        paint: {
          'circle-radius': {
            stops: [
              [0, 0],
              [12, 30] // Adjust the radius size as needed (e.g., 30 meters)
            ]
          },
          'circle-color': '#0000FF', // Blue color for the radius
          'circle-opacity': 0.2 // Low opacity
        }
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

      // Add a radius circle around the cell marker
      mapInstance.addLayer({
        id: `cell-radius-${cell.id}`,
        type: 'circle',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            }
          }
        },
        paint: {
          'circle-radius': {
            stops: [
              [0, 0],
              [12, 50] // Adjust the radius size as needed (e.g., 50 meters)
            ]
          },
          'circle-color': '#0000FF', // Blue color for the radius
          'circle-opacity': 0.2 // Low opacity
        }
      });
    } else {
      console.warn('Invalid lat/lng for Cell:', cell);
    }
  });
};

// Function to add paths to the map
export const addPathsToMap = (mapInstance, pathDetails) => {
  pathDetails.forEach(pathDetail => {
    // Assuming pathDetail has a property 'coordinates' with an array of [lng, lat]
    const coordinates = pathDetail.coordinates;

    if (coordinates && coordinates.length > 0) {
      // Add path as a line layer
      mapInstance.addLayer({
        id: `path-${pathDetail.id}`,
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: coordinates
            }
          }
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#FF0000', // Color for the path line
          'line-width': 3
        }
      });

      // Add a radius circle at the start and end of the path
      if (coordinates.length > 0) {
        const [startLng, startLat] = coordinates[0];
        const [endLng, endLat] = coordinates[coordinates.length - 1];

        mapInstance.addLayer({
          id: `path-start-radius-${pathDetail.id}`,
          type: 'circle',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [startLng, startLat]
              }
            }
          },
          paint: {
            'circle-radius': {
              stops: [
                [0, 0],
                [12, 10] // Adjust the radius size as needed (e.g., 10 meters)
              ]
            },
            'circle-color': '#0000FF', // Blue color for the radius
            'circle-opacity': 0.2 // Low opacity
          }
        });

        mapInstance.addLayer({
          id: `path-end-radius-${pathDetail.id}`,
          type: 'circle',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [endLng, endLat]
              }
            }
          },
          paint: {
            'circle-radius': {
              stops: [
                [0, 0],
                [12, 10] // Adjust the radius size as needed (e.g., 10 meters)
              ]
            },
            'circle-color': '#0000FF', // Blue color for the radius
            'circle-opacity': 0.2 // Low opacity
          }
        });
      }
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

    // Remove radius layers
    if (mapInstance.getLayer(`path-start-radius-${path.id}`)) {
      mapInstance.removeLayer(`path-start-radius-${path.id}`);
    }
    if (mapInstance.getLayer(`path-end-radius-${path.id}`)) {
      mapInstance.removeLayer(`path-end-radius-${path.id}`);
    }
  });

  // Remove UEs and cells layers if needed
  ues.forEach(ue => {
    if (mapInstance.getLayer(`ue-radius-${ue.id}`)) {
      mapInstance.removeLayer(`ue-radius-${ue.id}`);
    }
  });

  cells.forEach(cell => {
    if (mapInstance.getLayer(`cell-radius-${cell.id}`)) {
      mapInstance.removeLayer(`cell-radius-${cell.id}`);
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
