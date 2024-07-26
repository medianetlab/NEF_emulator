import React, { useState, useEffect } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormInput, CFormTextarea
} from '@coreui/react';

const CellFormModal = ({ visible, handleClose, handleSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    id: '',
    cell_id: '',
    name: '',
    description: '',
    gnb: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        id: '',
        cell_id: '',
        name: '',
        description: '',
        gnb: ''
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
      <CModalHeader closeButton>{formData.id ? 'Edit Cell' : 'Add Cell'}</CModalHeader>
      <CModalBody>
        <CForm>
          <CFormInput
            id="cell_id"
            name="cell_id"
            label="Cell ID"
            value={formData.cell_id}
            onChange={handleChange}
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
          <CFormInput
            id="gnb"
            name="gnb"
            label="gNB"
            value={formData.gnb}
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

export default CellFormModal;
