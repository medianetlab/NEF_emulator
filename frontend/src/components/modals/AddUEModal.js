import React, { useState, useEffect, useRef } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormInput, CFormSelect
} from '@coreui/react';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getPaths } from '../../utils/api';

const AddUEModal = ({ visible, handleClose, handleSubmit, token }) => {
  const [formData, setFormData] = useState({
    supi: '',
    name: '',
    ext_identifier: '',
    cell_id: '',
    ip_address_v4: '',
    path_id: '',
    speed: 'LOW',
    lat: '',  // Latitude of the UE
    lon: ''   // Longitude of the UE
  });

  const [paths, setPaths] = useState([]);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    const fetchPaths = async () => {
      if (!token) return;
      try {
        const pathsData = await getPaths(token);
        setPaths(pathsData);
      } catch (error) {
        console.error('Error fetching paths:', error);
      }
    };

    fetchPaths();
  }, [token]);

  useEffect(() => {
    if (visible) {
      setTimeout(() => { // Add a timeout to ensure modal is fully visible
        if (mapRef.current) {
          if (!mapInstanceRef.current) {
            // Initialize MapLibre map with a professional style
            mapInstanceRef.current = new maplibre.Map({
              container: mapRef.current,
              style: 'https://api.maptiler.com/maps/streets/style.json?key=${process.env.REACT_APP_MAPTILER_API_KEY}',
              center: [23.7275, 37.9838],
              zoom: 12,
            });

            // Handle map click to get coordinates
            mapInstanceRef.current.on('click', (e) => {
              const { lng, lat } = e.lngLat;
              setFormData(prev => ({ ...prev, lat: lat, lon: lng }));
            });
          }
        }
      }, 500); // Delay map rendering to ensure modal is fully rendered
    } else if (mapInstanceRef.current) {
      // Destroy the map when the modal is not visible
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  }, [visible]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = () => {
    handleSubmit(formData);
  };

  return (
    <CModal visible={visible} onClose={handleClose}>
      <CModalHeader closeButton>Add UE</CModalHeader>
      <CModalBody>
        <CForm>
          <CFormInput
            id="supi"
            name="supi"
            label="SUPI"
            value={formData.supi}
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
            id="ext_identifier"
            name="ext_identifier"
            label="External Identifier"
            value={formData.ext_identifier}
            onChange={handleChange}
          />
          <CFormInput
            id="cell_id"
            name="cell_id"
            label="Cell ID"
            value={formData.cell_id}
            onChange={handleChange}
          />
          <CFormInput
            id="ip_address_v4"
            name="ip_address_v4"
            label="IPv4"
            value={formData.ip_address_v4}
            onChange={handleChange}
          />

          <CFormSelect
            id="path_id"
            name="path_id"
            label="Path"
            value={formData.path_id}
            onChange={handleChange}
          >
            <option value="">Select a path</option>
            {paths.map((path) => (
              <option key={path.id} value={path.id}>
                {path.description}
              </option>
            ))}
          </CFormSelect>

          <CFormSelect
            id="speed"
            name="speed"
            label="Speed"
            value={formData.speed}
            onChange={handleChange}
          >
            <option value="LOW">LOW</option>
            <option value="HIGH">HIGH</option>
          </CFormSelect>

          <CFormInput
            id="lat"
            name="lat"
            label="Latitude"
            value={formData.lat}
            readOnly // Lock the field to make it read-only
          />
          <CFormInput
            id="lon"
            name="lon"
            label="Longitude"
            value={formData.lon}
            readOnly // Lock the field to make it read-only
          />
        </CForm>

        <div
          id="ueMap"
          ref={mapRef}
          style={{ height: '300px', marginTop: '20px' }}
        ></div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose}>Cancel</CButton>
        <CButton color="primary" onClick={handleFormSubmit}>Save</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default AddUEModal;
