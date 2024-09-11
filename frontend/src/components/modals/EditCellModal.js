import React, { useState, useEffect, useRef } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormInput, CFormTextarea, CFormSelect, CAlert
} from '@coreui/react';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getGNBs } from '../../utils/api';

const EditCellModal = ({ visible, handleClose, handleSubmit, token, initialData }) => {
  const [formData, setFormData] = useState({
    cell_id: '',
    name: '',
    description: '',
    gNB_id: '',
    latitude: 0,
    longitude: 0,
    radius: ''
  });

  const [gnbs, setGnbs] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' }); // State for success/failure message
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null); // Ref to hold the map marker

  // Fetch gNBs when modal is visible
  useEffect(() => {
    if (visible) {
      getGNBs(token)
        .then(setGnbs)
        .catch(err => {
          console.error("Failed to fetch gNBs", err);
          setMessage({ type: 'failure', text: 'Error fetching gNBs. Please try again later.' });
          setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        });
    }
  }, [visible, token]);

  // Pre-fill form data when modal opens
  useEffect(() => {
    if (initialData && visible) {
      setFormData({
        cell_id: initialData.cell_id || '',
        name: initialData.name || '',
        description: initialData.description || '',
        gNB_id: initialData.gNB_id || '',
        latitude: initialData.latitude || 0,
        longitude: initialData.longitude || 0,
        radius: initialData.radius || ''
      });
    }
  }, [visible, initialData]);

  // Initialize the map when the modal is visible
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        if (mapRef.current) {
          if (!mapInstanceRef.current) {
            mapInstanceRef.current = new maplibre.Map({
              container: mapRef.current,
              style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.REACT_APP_MAPTILER_API_KEY}`,
              center: [formData.longitude, formData.latitude], // Corrected order
              zoom: 12,
            });

            // Add a marker to the map at the initial position
            markerRef.current = new maplibre.Marker()
              .setLngLat([formData.longitude, formData.latitude]) // Corrected order
              .addTo(mapInstanceRef.current);

            // Update the map marker and form fields on map click
            mapInstanceRef.current.on('click', (e) => {
              const { lng, lat } = e.lngLat;
              setFormData(prev => ({
                ...prev,
                latitude: lat, // Latitude first
                longitude: lng // Longitude second
              }));
              
              if (markerRef.current) {
                markerRef.current.setLngLat([lng, lat]); // Update marker position
              }
            });
          }
        }
      }, 500);
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  }, [visible, formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async () => {
    try {
      const dataToSubmit = {
        ...formData,
        radius: parseFloat(formData.radius),
        gNB_id: parseFloat(formData.gNB_id)
      };

      await handleSubmit(dataToSubmit);
      setMessage({ type: 'success', text: 'Cell updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000); // Auto-hide after 3 seconds
      handleClose(); // Close the modal after successful update
    } catch (error) {
      setMessage({ type: 'failure', text: 'Error: Failed to update the cell.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000); // Auto-hide after 3 seconds
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
              disabled // Disable editing for Cell ID
            />
            <CFormInput
              id="name"
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleChange}
            />
            <CFormTextarea
              id="description"
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
            />
            <CFormSelect
              id="gNB_id"
              name="gNB_id"
              label="Select gNB"
              value={formData.gNB_id}
              onChange={handleChange}
            >
              <option value="">Select gNB</option>
              {gnbs.map(gnb => (
                <option key={gnb.id} value={gnb.id}>
                  {gnb.name} (ID: {gnb.id})
                </option>
              ))}
            </CFormSelect>
            <CFormInput
              id="latitude"
              name="latitude"
              label="Latitude"
              value={formData.latitude}
              onChange={handleChange}
              disabled
            />
            <CFormInput
              id="longitude"
              name="longitude"
              label="Longitude"
              value={formData.longitude}
              onChange={handleChange}
              disabled
            />
            <CFormInput
              id="radius"
              name="radius"
              label="Radius"
              value={formData.radius}
              onChange={handleChange}
            />
            <div
              ref={mapRef}
              style={{ height: '400px', marginTop: '20px' }}
            ></div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleClose}>Cancel</CButton>
          <CButton color="primary" type="button" onClick={handleFormSubmit}>Save</CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default EditCellModal;
