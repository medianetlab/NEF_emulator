import React, { useEffect, useState } from 'react';
import { CCard, CCardBody, CCardHeader, CButton, CAlert } from '@coreui/react';
import { exportScenario } from '../utils/api'; 

const ExportView = ({ token }) => {
  const [exportData, setExportData] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExportData = async () => {
      try {
        const data = await exportScenario(token);
        setExportData(JSON.stringify(data, null, 2)); // json format
        setError(null);
      } catch (error) {
        setError('Error fetching scenario data.');
      } finally {
        setLoading(false);
      }
    };

    fetchExportData();
  }, [token]);

  const handleExport = async () => {
    try {
      await exportScenario(token);
      setError(null);
    } catch (error) {
      setError('Error exporting scenario.');
    }
  };

  return (
    <CCard>
      <CCardHeader>Export</CCardHeader>
      <CCardBody>
        {/* Text area to display the data about to be exported */}
        <textarea
          style={{ width: '100%', height: '300px', padding: '10px', borderRadius: '5px', borderColor: '#ced4da' }}
          value={exportData}
          readOnly
        />
        <CButton color="primary" onClick={handleExport} className="mt-3" disabled={loading}>
          {loading ? 'Exporting...' : 'Export'}
        </CButton>
        {error && <CAlert color="danger" className="mt-3">{error}</CAlert>}
      </CCardBody>
    </CCard>
  );
};

export default ExportView;

