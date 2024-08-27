import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { CModal, CModalHeader, CModalBody, CModalFooter, CButton, CForm, CFormInput } from '@coreui/react';
import 'leaflet/dist/leaflet.css';

const MapClickHandler = ({ setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    }
  });

  return null;
};

const EditUEModal = ({ visible, handleClose, handleSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    supi: '',
    name: '',
    ext_identifier: '',
    cell_id: '',
    ip_address_v4: '',
    path_id: '',
    speed: '',
    position: { lat: 51.505, lng: -0.09 } // Default position
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        position: initialData.position || { lat: 51.505, lng: -0.09 }
      }));
    }
  }, [initialData, visible]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = () => {
    handleSubmit(formData);
  };

  const setPosition = (latlng) => {
    setFormData(prev => ({ ...prev, position: latlng }));
  };

  return (
    <CModal visible={visible} onClose={handleClose}>
      <CModalHeader closeButton>Edit UE</CModalHeader>
      <CModalBody>
        <CForm>
          <CFormInput
            id="supi"
            name="supi"
            label="SUPI"
            value={formData.supi}
            onChange={handleChange}
            disabled
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
            label="IPv4 Address"
            value={formData.ip_address_v4}
            onChange={handleChange}
          />
          <CFormInput
            id="path_id"
            name="path_id"
            label="Path ID"
            value={formData.path_id}
            onChange={handleChange}
          />
          <CFormInput
            id="speed"
            name="speed"
            label="Speed"
            value={formData.speed}
            onChange={handleChange}
          />
          <div className="mt-3">
            <label className="form-label">Location</label>
            <div style={{ height: '400px', width: '100%' }}>
              <MapContainer center={formData.position} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapClickHandler setPosition={setPosition} />
                <Marker position={formData.position} />
              </MapContainer>
            </div>
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

export default EditUEModal;
