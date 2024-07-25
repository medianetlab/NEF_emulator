// src/components/DeleteConfirmationModal.js

import React from 'react';
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton } from '@coreui/react';

const DeleteConfirmationModal = ({ show, handleClose, handleDelete }) => {
  return (
    <CModal show={show} onClose={handleClose}>
      <CModalHeader closeButton>
        <CModalTitle>Confirm gNB deletion?</CModalTitle>
      </CModalHeader>
      <CModalBody>
        If you proceed, the gNB will be permanently removed. This change can't be undone.
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose}>Cancel</CButton>
        <CButton color="danger" onClick={handleDelete}>Delete</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default DeleteConfirmationModal;
