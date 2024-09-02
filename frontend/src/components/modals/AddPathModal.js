import React, { useState, useEffect, useRef } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormTextarea
} from '@coreui/react';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Color options for the path
const colorOptions = [
  '#FF5733', '#33FF57', '#3357FF', '#F4C542', '#E94E77', '#8E44AD'
];

const AddPathModal = ({ visible, handleClose, handleSubmit }) => {
  const [formData, setFormData] = useState({
    description: '',
    color: '',
    start: null,
    end: null
  });
  const [errors, setErrors] = useState({});
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setFormData({
        description: '',
        color: '',
        start: null,
        end: null
      });
      setErrors({});

      setTimeout(() => {
        if (mapRef.current) {
          if (!mapInstanceRef.current) {
            mapInstanceRef.current = new maplibre.Map({
              container: mapRef.current,
              style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.REACT_APP_MAPTILER_API_KEY}`,
              center: [23.7275, 37.9838],
              zoom: 12,
            });

            mapInstanceRef.current.on('click', (e) => {
              const { lng, lat } = e.lngLat;
              if (!formData.start) {
                setFormData(prev => ({ ...prev, start: { lat, lon: lng } }));
              } else if (!formData.end) {
                setFormData(prev => ({ ...prev, end: { lat, lon: lng } }));
              }
            });
          }
        }
      }, 500);
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
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
    <CModal visible={visible} onClose={handleClose} size="lg">
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
            <div ref={mapRef} style={{ height: '400px', width: '100%' }} />
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
