import React, { useState } from 'react';
import { CCard, CCardBody, CCardHeader, CButton, CFormTextarea, CRow } from '@coreui/react';
import { importScenario } from '../utils/api'; 

const ImportView = ({ token }) => { 
  const [text, setText] = useState('');

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleImport = async () => {
    if (text.trim()) {
      try {
        await importScenario(text, token); 
        alert('Import successful!');
      } catch (error) {
        console.error('Error importing scenario:', error);
        alert('Error importing scenario.');
      }
    } else {
      alert('Please enter some text.');
    }
  };

  return (
    <CCard>
      <CCardHeader>Import</CCardHeader>
      <CCardBody>
        <CRow className="mb-3">
          <CFormTextarea
            placeholder="Enter scenario data here..."
            rows={10}
            value={text}
            onChange={handleTextChange}
          />
        </CRow>
        <CButton color="primary" onClick={handleImport}>Import</CButton>
      </CCardBody>
    </CCard>
  );
};

export default ImportView;

