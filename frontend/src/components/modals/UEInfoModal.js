import React from 'react';
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton } from '@coreui/react';

const UEInfoModal = ({ visible, onClose, ue }) => {
  if (!ue) return null;

  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader>
        <CModalTitle>{ue.name}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p><strong>Location:</strong> [{ue.latitude}, {ue.longitude}]</p>
        <p><strong>Cell ID:</strong> {ue.cell_id || 'N/A'}</p>
        <p><strong>External Identifier:</strong> {ue.external_identifier || 'N/A'}</p>
        <p><strong>Speed:</strong> {ue.speed || 'Unknown'}</p>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Close</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default UEInfoModal;
