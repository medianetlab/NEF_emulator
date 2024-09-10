import React, { useState, useEffect } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormInput, CFormTextarea
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

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData, visible]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorClick = (color) => {
    setFormData(prev => ({ ...prev, color }));
  };

  const handleFormSubmit = () => {
    handleSubmit(formData);
  };

  return (
    <CModal visible={visible} onClose={handleClose}>
      <CModalHeader closeButton>Edit Path</CModalHeader>
      <CModalBody>
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
          />
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
