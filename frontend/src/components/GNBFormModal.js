// src/components/GNBFormModal.js

import React, { useState, useEffect } from 'react';
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton, CForm, CFormLabel, CFormInput } from '@coreui/react';

const GNBFormModal = ({ show, handleClose, handleSubmit, initialData = {} }) => {
  const [gnb, setGNB] = useState({
    id: '',
    gNB_id: '',
    name: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    if (initialData) {
      setGNB(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGNB({ ...gnb, [name]: value });
  };

  const onSubmit = () => {
    handleSubmit(gnb);
  };

  return (
    <CModal show={show} onClose={handleClose}>
      <CModalHeader closeButton>
        <CModalTitle>{gnb.id ? 'Edit gNB' : 'Add new gNB'}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          <div className="mb-3">
            <CFormLabel htmlFor="gNB_id">gNB_id</CFormLabel>
            <CFormInput id="gNB_id" name="gNB_id" value={gnb.gNB_id} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="name">Name</CFormLabel>
            <CFormInput id="name" name="name" value={gnb.name} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="location">Location</CFormLabel>
            <CFormInput id="location" name="location" value={gnb.location} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="description">Description</CFormLabel>
            <CFormInput id="description" name="description" value={gnb.description} onChange={handleChange} />
          </div>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose}>Cancel</CButton>
        <CButton color="primary" onClick={onSubmit}>{gnb.id ? 'Save' : 'Create'}</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default GNBFormModal;

