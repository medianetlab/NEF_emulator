import React, { useState, useEffect, useRef } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormInput, CAlert
} from '@coreui/react';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getCells } from '../../utils/api';
import { removeMapLayersAndSources, addCellsToMap, addUEsToMap } from './ModalUtils';
import turf from '@turf/turf';

const EditCellModal = ({ visible, handleClose, handleSubmit, initialData, token, ues, handleUEClick }) => {
  const [formData, setFormData] = useState({
    cell_id: '',
    name: '',
    latitude: 0.0,
    longitude: 0.0,
    radius: 0,
    frequency: '',
    bandwidth: ''
  });

  const [cells, setCells] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  // Fetch cells data when component mounts or token changes
  useEffect(() => {
    const fetchCells = async () => {
      if (!token) return;
      try {
        const cellsData = await getCells(token);
        setCells(cellsData);
      } catch (error) {
        console.error('Error fetching cells:', error);
        setMessage({ type: 'failure', text: 'Error fetching cells. Please try again later.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    };

    fetchCells();
  }, [token]);

  // Update formData when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        latitude: initialData.position?.lat || initialData.latitude || 0.0,
        longitude: initialData.position?.lng || initialData.longitude || 0.0,
        radius: initialData.radius || 0
      }));
    }
  }, [initialData, visible]);

  // Initialize or update MapLibre map, marker, and circle
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        if (mapRef.current) {
          if (!mapInstanceRef.current) {
            mapInstanceRef.current = new maplibre.Map({
              container: mapRef.current,
              style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.REACT_APP_MAPTILER_API_KEY}`,
              center: [formData.longitude, formData.latitude],
              zoom: 13,
            });

            mapInstanceRef.current.on('style.load', async () => {
              removeMapLayersAndSources(mapInstanceRef.current, cells.map(cell => `cell-${cell.id}`));
              addCellsToMap(mapInstanceRef.current, cells); 
              addUEsToMap(mapInstanceRef.current, ues, handleUEClick);
            });

            // Add marker to the map for the cell being edited
            markerRef.current = new maplibre.Marker({ color: 'blue' })
              .setLngLat([formData.longitude, formData.latitude])
              .addTo(mapInstanceRef.current);

            // Add click event to update the marker and circle
            mapInstanceRef.current.on('click', (e) => {
              const { lng, lat } = e.lngLat;
              setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
              markerRef.current.setLngLat([lng, lat]);
              drawCircle(); // Update the circle with the new coordinates
            });

          } else {
            // Update map center and marker position when formData changes
            mapInstanceRef.current.setCenter([formData.longitude, formData.latitude]);
            markerRef.current.setLngLat([formData.longitude, formData.latitude]);
            drawCircle(); // Update the circle when coordinates change
          }
        }
      }, 500);
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  }, [visible, formData.latitude, formData.longitude, cells, ues]);

  const drawCircle = () => {
    if (!mapInstanceRef.current || !formData.radius) return;

    const radius = formData.radius; // in meters
    const lat = formData.latitude;
    const lng = formData.longitude;

    // Create a circle using Turf.js
    const center = turf.point([lng, lat]);
    const circle = turf.circle(center, radius / 1000, { steps: 64, units: 'kilometers' });

    // Remove previous circle layer if it exists
    if (circleRef.current) {
      mapInstanceRef.current.removeLayer('circle');
      mapInstanceRef.current.removeSource('circle');
    }

    // Add a source for the circle
    mapInstanceRef.current.addSource('circle', {
      type: 'geojson',
      data: circle
    });

    // Add a layer for the circle
    mapInstanceRef.current.addLayer({
      id: 'circle',
      type: 'fill',
      source: 'circle',
      layout: {},
      paint: {
        'fill-color': '#888',
        'fill-opacity': 0.5
      }
    });

    circleRef.current = 'circle'; // Store reference to circle layer
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
      handleClose(); // Close the modal after successful update
    } catch (error) {
      console.error('Error updating Cell:', error);
      setMessage({ type: 'failure', text: 'Error: Failed to update the Cell.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  return (
    <>
      {/* Status message display */}
      {message.text && (
        <CAlert
          color={message.type === 'success' ? 'success' : 'danger'}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999
          }}
        >
          {message.text}
        </CAlert>
      )}

      {/* Edit Cell Modal */}
      <CModal visible={visible} onClose={handleClose} size="lg">
        <CModalHeader closeButton>Edit Cell</CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              id="cell_id"
              name="cell_id"
              label="Cell ID"
              value={formData.cell_id}
              onChange={handleChange}
            />
            <CFormInput
              id="name"
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleChange}
            />
            <CFormInput
              id="frequency"
              name="frequency"
              label="Frequency"
              value={formData.frequency}
              onChange={handleChange}
            />
            <CFormInput
              id="bandwidth"
              name="bandwidth"
              label="Bandwidth"
              value={formData.bandwidth}
              onChange={handleChange}
            />
            <CFormInput
              id="latitude"
              name="latitude"
              label="Latitude"
              value={formData.latitude}
              readOnly
            />
            <CFormInput
              id="longitude"
              name="longitude"
              label="Longitude"
              value={formData.longitude}
              readOnly
            />
            <CFormInput
              id="radius"
              name="radius"
              label="Radius (meters)"
              type="number"
              value={formData.radius}
              onChange={handleChange}
            />
            <div className="map-container" ref={mapRef} style={{ width: '100%', height: '400px' }} />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleClose}>Cancel</CButton>
          <CButton color="primary" onClick={handleFormSubmit}>Save Changes</CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default EditCellModal;
