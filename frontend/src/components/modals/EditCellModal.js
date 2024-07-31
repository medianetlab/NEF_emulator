import React, { useState, useEffect } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormInput, CFormTextarea, CFormSelect
} from '@coreui/react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { getGNBs } from '../../utils/api';  // Import the renamed function

// Custom hook to handle map click events
const MapClickHandler = ({ setLatLng }) => {
  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;  // Use lat and lng
      setLatLng({ latitude: lat, longitude: lng });  // Map lat to latitude and lng to longitude
    }
  });
  return null;
};

const EditCellModal = ({ visible, handleClose, handleSubmit, token, cellData }) => {
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

  // Fetch gNBs when modal is visible
  useEffect(() => {
    if (visible) {
      getGNBs(token)  // Use getGnbs to fetch gNBs
        .then(setGnbs)
        .catch(err => console.error("Failed to fetch gNBs", err));
    }
  }, [visible, token]);

  
  // Pre-fill form data when modal opens and cellData is provided
  useEffect(() => {
    if (visible && cellData) {
      setFormData({
        cell_id: cellData.cell_id || '',
        name: cellData.name || '',
        description: cellData.description || '',
        gNB_id: cellData.gNB_id || '',
        latitude: cellData.latitude || 0,
        longitude: cellData.longitude || 0,
        radius: cellData.radius || ''
      });
    }
  }, [visible, cellData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMapClick = ({ latitude, longitude }) => {
    setFormData(prev => ({ ...prev, latitude, longitude }));
  };

  const handleFormSubmit = () => {
    const dataToSubmit = {
      ...formData,
      radius: parseFloat(formData.radius), // Convert radius to number
      gNB_id: parseFloat(formData.gNB_id) // Convert gNB_id to number to remove any quotes
    };

    handleSubmit(dataToSubmit);
  };

  return (
    <CModal visible={visible} onClose={handleClose}>
      <CModalHeader closeButton>Edit Cell</CModalHeader>
      <CModalBody>
        <CForm>
          <CFormInput
            id="cell_id"
            name="cell_id"
            label="Cell ID"
            value={formData.cell_id}
            onChange={handleChange}
           // disabled // Disable
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
          <div style={{ height: '400px', width: '100%' }}>
            <MapContainer
              center={[formData.latitude || 51.505, formData.longitude || -0.09]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapClickHandler setLatLng={handleMapClick} />
              <Marker position={[formData.latitude || 51.505, formData.longitude || -0.09]}>
                <Popup>
                  Latitude: {formData.latitude} <br /> Longitude: {formData.longitude}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose}>Cancel</CButton>
        <CButton color="primary" onClick={handleFormSubmit}>Save</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default EditCellModal;
