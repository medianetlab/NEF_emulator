import React, { useState, useEffect, useRef } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormInput, CFormSelect, CAlert
} from '@coreui/react';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf';
import { getCells, getGNBs, getPaths, getUEs } from '../../utils/api';
import { removeMapLayersAndSources, addCellsToMap, addUEsToMap, addPathsToMap, handleUEClick } from './ModalUtils';

const EditCellModal = ({ visible, handleClose, handleSubmit, initialData, token }) => {
  const [formData, setFormData] = useState({
    cell_id: '',
    name: '',
    gnb_id: '', 
    description: '', 
    latitude: 0.0,
    longitude: 0.0,
    radius: 0,
  });

  const [cells, setCells] = useState([]);
  const [gnbs, setGNBs] = useState([]); 
  const [message, setMessage] = useState({ type: '', text: '' });
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleLayerId = useRef(`cell-radius-${initialData?.cell_id || 'default'}`);
  const [paths, setPaths] = useState([]);
  const [ues, setUEs] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [pathsData, gnbData, cellData, ueData] = await Promise.all([
          getPaths(token),
          getGNBs(token),
          getCells(token),
          getUEs(token),
        ]);
        setPaths(pathsData);
        setGNBs(gnbData);
        setCells(cellData);
        setUEs(ueData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [token]);

  // Update formData when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        gnb_id: initialData.gnb_id || '', // Set GNB ID from initial data
        description: initialData.description || '', // Set description from initial data
        latitude: initialData.position?.lat || initialData.latitude || 0.0,
        longitude: initialData.position?.lng || initialData.longitude || 0.0,
        radius: initialData.radius || 0 // Set the initial radius
      }));
    }
  }, [initialData, visible]);

  // Initialize or update MapLibre map and marker
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        if (mapRef.current) {
          if (!mapInstanceRef.current) {
            mapInstanceRef.current = new maplibre.Map({
              container: mapRef.current,
              style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.REACT_APP_MAPTILER_API_KEY}`,
              center: [23.81953, 37.99803], 
              zoom: 15, 
            });

            mapInstanceRef.current.on('style.load', async () => {
              removeMapLayersAndSources(mapInstanceRef.current, cells.map(cell => `cell-${cell.id}`));
              addCellsToMap(mapInstanceRef.current, cells);
              addUEsToMap(mapInstanceRef.current, ues, handleUEClick);
              await addPathsToMap(mapInstanceRef.current, token);
              updateCellRepresentation(formData.latitude, formData.longitude); // Draw the circle for the currently editing cell
            });

            // Add marker for the cell being edited
            addMarker(formData.latitude, formData.longitude);

            // Add click event to update the marker and circle
            mapInstanceRef.current.on('click', (e) => {
              const { lng, lat } = e.lngLat;
              // Update formData with new latitude and longitude
              setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
              updateCellRepresentation(lat, lng); // Update the representation for the cell
            });

          } else {
            // Update marker position when formData changes
            addMarker(formData.latitude, formData.longitude);
            updateCellRepresentation(formData.latitude, formData.longitude);
          }
        }
      }, 500);
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  }, [visible, formData.latitude, formData.longitude, cells]);

  // Function to draw cells on the map
  const addCellsToMap = (mapInstance, cells) => {
    if (!mapInstance || !cells) return;

    // Remove existing sources and layers before adding new ones
    removeMapLayersAndSources(mapInstance, cells.map(cell => `cell-${cell.id}`));

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
            color: '#FF0000', // Default color for other cells
            radius: cell.radius || 100,
          },
        })),
      },
    });

    // Iterate through each cell to add its radius as a circle
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
          'fill-color': '#FF0000', // Color for other cells
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
        'circle-color': '#FF0000', // Color for other cells
        'circle-radius': 3, // Smaller for better visibility
        'circle-opacity': 1,
      },
    });
  };

  const addMarker = (lat, lng) => {
    // Remove existing marker if it exists
    if (markerRef.current) {
      markerRef.current.remove();
    }
    // Create a new marker for the currently editing cell
    markerRef.current = new maplibre.Marker()
      .setLngLat([lng, lat])
      .addTo(mapInstanceRef.current);
  };

  const updateCellRepresentation = (lat, lng) => {
    if (!mapInstanceRef.current || !formData.radius) return;

    // Remove previous cell representation if it exists
    if (mapInstanceRef.current.getLayer(circleLayerId.current)) {
      mapInstanceRef.current.removeLayer(circleLayerId.current);
      mapInstanceRef.current.removeSource(circleLayerId.current);
    }

    // Add a new marker for the updated position
    addMarker(lat, lng);

    // Generate the new circle using Turf.js
    const radius = (formData.radius || 100) / 1000; // Convert radius from meters to kilometers
    const options = {
      steps: 64,
      units: 'kilometers'
    };
    const circle = turf.circle([lng, lat], radius, options);

    // Add the new circle as a GeoJSON source
    mapInstanceRef.current.addSource(circleLayerId.current, {
      type: 'geojson',
      data: circle,
    });

    // Add a fill layer for the circle with transparency and blue color
    mapInstanceRef.current.addLayer({
      id: circleLayerId.current,
      type: 'fill',
      source: circleLayerId.current,
      paint: {
        'fill-color': '#0000FF', // Blue color for the editing cell
        'fill-opacity': 0.1
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async () => {
    try {
      await handleSubmit(formData);
      setMessage({ type: 'success', text: 'Cell updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      handleClose(); // Close the modal after submission
    } catch (error) {
      console.error('Error updating cell:', error);
      setMessage({ type: 'failure', text: 'Failed to update cell. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  return (
    <CModal visible={visible} onClose={handleClose} size="lg">
      <CModalHeader>
        <h5>Edit Cell</h5>
      </CModalHeader>
      <CModalBody>
        {message.text && (
          <CAlert color={message.type === 'failure' ? 'danger' : 'success'}>
            {message.text}
          </CAlert>
        )}
        <CForm>
          <CFormInput
            type="text"
            id="cell_id"
            name="cell_id"
            label="Cell ID"
            value={formData.cell_id}
            disabled // Set to disabled
          />
          <CFormInput
            type="text"
            id="name"
            name="name"
            label="Cell Name"
            value={formData.name}
            onChange={handleChange}
          />
          <CFormSelect
            id="gnb_id"
            name="gnb_id"
            label="Select GNB"
            value={formData.gnb_id}
            onChange={handleChange}
          >
            <option value="">Choose GNB</option>
            {gnbs.map(gnb => (
              <option key={gnb.id} value={gnb.id}>{gnb.name}</option>
            ))}
          </CFormSelect>
          <CFormInput
            type="text"
            id="description"
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
          />
          <CFormInput
            type="number"
            id="latitude"
            name="latitude"
            label="Latitude"
            value={formData.latitude}
            disabled // Set to disabled
          />
          <CFormInput
            type="number"
            id="longitude"
            name="longitude"
            label="Longitude"
            value={formData.longitude}
            disabled // Set to disabled
          />
          <CFormInput
            type="number"
            id="radius"
            name="radius"
            label="Radius (in meters)"
            value={formData.radius}
            disabled // Set to disabled
          />
          <div style={{ margin: '20px 0' }} /> {/* Add margin between form and map */}
          <div style={{ height: '300px', width: '100%' }} ref={mapRef}></div>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="primary" onClick={handleFormSubmit}>
          Submit
        </CButton>
        <CButton color="secondary" onClick={handleClose}>
          Cancel
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default EditCellModal;
