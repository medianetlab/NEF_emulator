import React, { useState, useEffect } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormInput, CFormTextarea
} from '@coreui/react';

const AddPathModal = ({ visible, handleClose, handleSubmit}) => {
  const [formData, setFormData] = useState({
    description: '',
    color: ''
  });

  useEffect(() => {
    setFormData({
      description: '',
      color: ''
    });
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
      <CModalHeader closeButton>Add Path</CModalHeader>
      <CModalBody>
        <CForm>
          <CFormTextarea
            id="description"
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
          />
          <CFormInput
            id="color"
            name="color"
            label="Color"
            value={formData.color}
            onChange={handleChange}
          />
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose}>Cancel</CButton>
        <CButton color="primary" onClick={handleFormSubmit}>Save</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default AddPathModal;
