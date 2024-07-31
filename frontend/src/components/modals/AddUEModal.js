import React, { useState, useEffect } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormInput
} from '@coreui/react';

const AddUEModal = ({ visible, handleClose, handleSubmit }) => {
  const [formData, setFormData] = useState({
    supi: '',
    name: '',
    ext_identifier: '',
    cell_id: '',
    ip_address_v4: '',
    path_id: '',
    speed: ''
  });

  useEffect(() => {
    setFormData({
      supi: '',
      name: '',
      ext_identifier: '',
      cell_id: '',
      ip_address_v4: '',
      path_id: '',
      speed: ''
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
            label="IP Address (v4)"
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
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose}>Cancel</CButton>
        <CButton color="primary" onClick={handleFormSubmit}>Save</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default AddUEModal;
