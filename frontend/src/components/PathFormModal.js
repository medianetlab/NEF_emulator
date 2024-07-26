import React, { useState, useEffect } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormInput
} from '@coreui/react';

const PathFormModal = ({ visible, handleClose, handleSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    id: '',
    description: '',
    color: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        id: '',
        description: '',
        color: ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = () => {
    handleSubmit(formData);
  };

  return (
    <CModal visible={visible} onClose={handleClose}>
      <CModalHeader closeButton>{formData.id ? 'Edit Path' : 'Add Path'}</CModalHeader>
      <CModalBody>
        <CForm>
          <CFormInput
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

export default PathFormModal;
