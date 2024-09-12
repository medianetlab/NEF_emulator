import React, { useState, useEffect } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormInput, CFormTextarea, CAlert
} from '@coreui/react';

// Color options for the path
const colorOptions = [
  '#FF5733', '#33FF57', '#3357FF', '#F4C542', '#E94E77', '#8E44AD'
];

const EditPathModal = ({ visible, handleClose, handleSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    id: '',
    description: '',
    color: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showMessage, setShowMessage] = useState(false); // Control visibility
  const [fadeOut, setFadeOut] = useState(false); // Trigger fade-out

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData, visible]);

  useEffect(() => {
    if (showMessage) {
      const fadeTimer = setTimeout(() => {
        setFadeOut(true); // Trigger fade-out after 3 seconds
      }, 3000);

      const hideTimer = setTimeout(() => {
        setShowMessage(false); // Hide message completely after fade-out
        setFadeOut(false); // Reset fade-out for future messages
      }, 3500);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [showMessage]);

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
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = () => {
    if (validateForm()) {
      handleSubmit(formData);
      setMessage({ type: 'success', text: 'Path updated successfully!' });
    } else {
      setMessage({ type: 'danger', text: 'Please correct the errors in the form.' });
    }
    setShowMessage(true);
  };

  return (
    <CModal visible={visible} onClose={handleClose}>
      <CModalHeader closeButton>Edit Path</CModalHeader>
      <CModalBody>
        {showMessage && (
          <CAlert
            color={message.type === 'success' ? 'success' : 'danger'}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 9999,
              opacity: fadeOut ? 0 : 1, // Trigger fade-out effect
              transition: 'opacity 0.5s ease', // Smooth fade-out transition
            }}
          >
            {message.text}
          </CAlert>
        )}
        <CForm>
          <CFormInput
            id="id"
            name="id"
            label="ID"
            value={formData.id}
            onChange={handleChange}
            disabled
          />
          <CFormTextarea
            id="description"
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            isInvalid={!!errors.description}
          />
          {errors.description && <div className="invalid-feedback">{errors.description}</div>}
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
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose}>Cancel</CButton>
        <CButton color="primary" onClick={handleFormSubmit}>Save</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default EditPathModal;
