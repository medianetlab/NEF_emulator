import React, { useState, useEffect } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormInput, CFormTextarea, CAlert
} from '@coreui/react';

const EditGNBModal = ({ visible, handleClose, handleSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    id: '',
    gNB_id: '',
    name: '',
    description: '',
    location: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' }); // State for success/failure message

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData, visible]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async () => {
    try {
      await handleSubmit(formData);  // Call the submit handler
      setMessage({ type: 'success', text: 'gNB updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000); // Auto-hide after 3 seconds
      handleClose();  // Close modal after success
    } catch (error) {
      setMessage({ type: 'failure', text: 'Error: Failed to update gNB.' });
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

      {/* Edit gNB Modal */}
      <CModal visible={visible} onClose={handleClose}>
        <CModalHeader closeButton>Edit gNB</CModalHeader>
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
            <CFormInput
              id="gNB_id"
              name="gNB_id"
              label="gNB_id"
              value={formData.gNB_id}
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
              id="location"
              name="location"
              label="Location"
              value={formData.location}
              onChange={handleChange}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleClose}>Cancel</CButton>
          <CButton color="primary" onClick={handleFormSubmit}>Save</CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default EditGNBModal;
