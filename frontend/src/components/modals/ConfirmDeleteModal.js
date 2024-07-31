
import React from 'react';
import { CModal, CModalHeader, CModalBody, CModalFooter, CButton } from '@coreui/react';

const ConfirmDeleteModal = ({ visible, handleClose, handleDelete }) => {
  return (
    <CModal visible={visible} onClose={handleClose}>
      <CModalHeader closeButton>Confirm Delete</CModalHeader>
      <CModalBody>
        Are you sure you want to delete this gNB?
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose}>Cancel</CButton>
        <CButton color="danger" onClick={handleDelete}>Delete</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default ConfirmDeleteModal;
