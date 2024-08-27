import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { CModal, CModalHeader, CModalBody, CModalFooter, CButton, CForm, CFormInput, CFormTextarea } from '@coreui/react';
import 'leaflet/dist/leaflet.css';

// Color options for the path
const colorOptions = [
  '#FF5733', '#33FF57', '#3357FF', '#F4C542', '#E94E77', '#8E44AD'
];

// Component to handle map click events and update start/end points
const MapClickHandler = ({ setStart, setEnd }) => {
  const [clicks, setClicks] = useState([]);

  useMapEvents({
    click(e) {
      if (clicks.length < 2) {
        setClicks(prev => [...prev, e.latlng]);
      }
    }
  });

  useEffect(() => {
    if (clicks.length === 1) {
      setStart(clicks[0]);
    } else if (clicks.length === 2) {
      setEnd(clicks[1]);
    }
  }, [clicks, setStart, setEnd]);

  return null;
};

const AddPathModal = ({ visible, handleClose, handleSubmit }) => {
  const [formData, setFormData] = useState({
    description: '',
    color: '',
    start: null,
    end: null
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (visible) {
      setFormData({
        description: '',
        color: '',
        start: null,
        end: null
      });
      setErrors({});
    }
  }, [visible]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorClick = (color) => {
    setFormData(prev => ({ ...prev, color }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.description) errors.description = 'Description is required';
    if (!formData.color) errors.color = 'Color is required';
    if (!formData.start) errors.start = 'Start point is required';
    if (!formData.end) errors.end = 'End point is required';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = () => {
    if (validateForm()) {
      handleSubmit(formData);
    }
  };

  return (
    <CModal visible={visible} onClose={handleClose}>
      <CModalHeader closeButton>Add Path</CModalHeader>
      <CModalBody>
        <CForm>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <CFormTextarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              isInvalid={!!errors.description}
            />
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Color</label>
            <div className="d-flex">
              {colorOptions.map((color) => (
                <div
                  key={color}
                  onClick={() => handleColorClick(color)}
                  style={{
                    backgroundColor: color,
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    marginRight: '10px',
                    cursor: 'pointer',
                    border: formData.color === color ? '2px solid #000' : '2px solid transparent'
                  }}
                />
              ))}
            </div>
            {errors.color && <div className="invalid-feedback d-block">{errors.color}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Map</label>
            <div style={{ height: '400px', width: '100%' }}>
              <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapClickHandler
                  setStart={(latlng) => {
                    if (!formData.start || formData.end) {
                      setFormData(prev => ({ ...prev, start: latlng, end: null }));
                    } else {
                      setFormData(prev => ({ ...prev, end: latlng }));
                    }
                  }}
                  setEnd={(latlng) => setFormData(prev => ({ ...prev, end: latlng }))}
                />
                {formData.start && <Marker position={[formData.start.lat, formData.start.lng]} />}
                {formData.end && <Marker position={[formData.end.lat, formData.end.lng]} />}
              </MapContainer>
            </div>
            {errors.start && <div className="invalid-feedback d-block">{errors.start}</div>}
            {errors.end && <div className="invalid-feedback d-block">{errors.end}</div>}
          </div>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose}>Cancel</CButton>
        <CButton color="primary" type="button" onClick={handleFormSubmit}>Save</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default AddPathModal;

