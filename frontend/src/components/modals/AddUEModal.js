import React, { useState, useEffect, useRef } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormInput, CFormSelect, CAlert
} from '@coreui/react';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getPaths, getGNBs, getCells, addUE } from '../../utils/api';  // Assuming you have these API functions

const AddUEModal = ({ visible, handleClose, token }) => {
  const [formData, setFormData] = useState({
    supi: '202010000000001',
    name: 'UE1',
    ext_identifier: '10001@domain.com',
    cell_id: 1,
    ip_address_v4: '10.0.0.1',
    ip_address_v6: '::1',
    mac: '22-00-00-00-00-01',
    mcc: '202',
    mnc: '1',
    dnn: 'province1.mnc01.mcc202.gprs',
    path_id: '',
    speed: 'LOW',
    lat: '',  
    lon: '' 
  });

  const [paths, setPaths] = useState([]);
  const [gnbs, setGNBs] = useState([]);
  const [cells, setCells] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' }); // For success/error messages
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const fetchPaths = async () => {
      if (!token) return;
      try {
        const [pathsData, gnbData, cellData] = await Promise.all([
          getPaths(token),
          getGNBs(token),
          getCells(token)
        ]);
        setPaths(pathsData);
        setGNBs(gnbData);
        setCells(cellData);
      } catch (error) {
        console.error('Error fetching paths, gNBs, or cells:', error);
      }
    };

    fetchPaths();
  }, [token]);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        if (mapRef.current) {
          if (!mapInstanceRef.current) {
            mapInstanceRef.current = new maplibre.Map({
              container: mapRef.current,
              style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.REACT_APP_MAPTILER_API_KEY}`,
              center: [23.7275, 37.9838],
              zoom: 12,
            });

            markerRef.current = new maplibre.Marker()
              .setLngLat([parseFloat(formData.lon) || 23.7275, parseFloat(formData.lat) || 37.9838])
              .addTo(mapInstanceRef.current);

            mapInstanceRef.current.on('click', (e) => {
              const { lng, lat } = e.lngLat;
              setFormData(prev => ({
                ...prev,
                lat: lat.toFixed(6),
                lon: lng.toFixed(6)
              }));

              if (markerRef.current) {
                markerRef.current.setLngLat([lng, lat]);
              }
            });
          }
        }
      }, 500);
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }
  }, [visible, formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async () => {
    if (gnbs.length === 0) {
      setMessage({ type: 'danger', text: 'Error: No gNBs available. Please add at least one gNB.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    if (cells.length === 0) {
      setMessage({ type: 'danger', text: 'Error: No Cells available. Please add at least one Cell.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    try {
      await addUE(formData);
      setMessage({ type: 'success', text: 'UE added successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      handleClose();
    } catch (error) {
      setMessage({ type: 'danger', text: 'Error: Failed to add UE.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  return (
    <CModal visible={visible} onClose={handleClose} size="lg">
      <div style={{ maxWidth: '100%', width: '100%' }}>
        <CModalHeader closeButton>Add UE</CModalHeader>
        <CModalBody>
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
              label="IPv4"
              value={formData.ip_address_v4}
              onChange={handleChange}
            />
            <CFormInput
              id="ip_address_v6"
              name="ip_address_v6"
              label="IPv6"
              value={formData.ip_address_v6}
              onChange={handleChange}
            />
            <CFormInput
              id="mcc"
              name="mcc"
              label="MCC"
              value={formData.mcc}
              onChange={handleChange}
              disabled
            />
            <CFormInput
              id="mnc"
              name="mnc"
              label="MNC"
              value={formData.mnc}
              onChange={handleChange}
              disabled
            />
            <CFormInput
              id="dnn"
              name="dnn"
              label="DNN"
              value={formData.dnn}
              onChange={handleChange}
              disabled
            />
            <CFormSelect
              id="path_id"
              name="path_id"
              label="Path"
              value={formData.path_id}
              onChange={handleChange}
            >
              <option value="">Select a path</option>
              {paths.map((path) => (
                <option key={path.id} value={path.id}>
                  {path.description}
                </option>
              ))}
            </CFormSelect>

            <CFormSelect
              id="speed"
              name="speed"
              label="Speed"
              value={formData.speed}
              onChange={handleChange}
            >
              <option value="LOW">LOW</option>
              <option value="HIGH">HIGH</option>
            </CFormSelect>

            <CFormInput
              id="lat"
              name="lat"
              label="Latitude"
              value={formData.lat}
              readOnly 
            />
            <CFormInput
              id="lon"
              name="lon"
              label="Longitude"
              value={formData.lon}
              readOnly 
            />
          </CForm>

          <div
            id="ueMap"
            ref={mapRef}
            style={{ height: '400px', marginTop: '20px' }}
          ></div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleClose}>Cancel</CButton>
          <CButton color="primary" onClick={handleFormSubmit}>Save</CButton>
        </CModalFooter>
      </div>
    </CModal>
  );
};

export default AddUEModal;
