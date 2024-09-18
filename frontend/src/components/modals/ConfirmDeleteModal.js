import React, { useState } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CAlert
} from '@coreui/react';

const ConfirmDeleteModal = ({ visible, handleClose, handleDelete }) => {
  const [message, setMessage] = useState({ type: '', text: '' }); // State for success/failure message

  const handleDeleteWithToast = async () => {
    try {
      await handleDelete();  // Call the delete function
      setMessage({ type: 'success', text: 'Object deleted successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000); // Auto-hide after 3 seconds
      handleClose();  // Close the modal after deletion
    } catch (error) {
      setMessage({ type: 'failure', text: 'Error: Failed to delete the object.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000); // Auto-hide after 3 seconds
    }
  };

  return (
    <>
      {/* Status message display */}
      {message.text && (
        <CAlert
          color={message.type === 'success' ? 'success' : 'danger'}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999
          }}
        >
          {message.text}
        </CAlert>
      )}

      {/* Confirm Delete Modal */}
      <CModal visible={visible} onClose={handleClose}>
        <CModalHeader closeButton>Confirm Delete</CModalHeader>
        <CModalBody>
          Are you sure you want to delete this object?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleClose}>Cancel</CButton>
          <CButton color="danger" onClick={handleDeleteWithToast}>Delete</CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default ConfirmDeleteModal;

