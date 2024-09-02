import React, { useState, useEffect, useRef } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormInput, CFormSelect
} from '@coreui/react';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getPaths } from '../../utils/api';

const EditUEModal = ({ visible, handleClose, handleSubmit, initialData, token }) => {
  const [formData, setFormData] = useState({
    supi: '',
    name: '',
    ext_identifier: '',
    cell_id: '',
    ip_address_v4: '',
    ip_address_v6: '',
    mac: '',
    mcc: '',
    mnc: '',
    dnn: '',
    path_id: '',
    speed: 'LOW',
    position: { lat: 51.505, lng: -0.09 }
  });

  const [paths, setPaths] = useState([]);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Fetch paths data when component mounts or token changes
  useEffect(() => {
    const fetchPaths = async () => {
      if (!token) return;
      try {
        const pathsData = await getPaths(token);
        setPaths(pathsData);
      } catch (error) {
        console.error('Error fetching paths:', error);
      }
    };

    fetchPaths();
  }, [token]);

  // Update formData when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        position: initialData.position || { lat: 51.505, lng: -0.09 }
      }));
    }
  }, [initialData, visible]);

  // Initialize or update MapLibre map
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        if (mapRef.current) {
          if (!mapInstanceRef.current) {
            mapInstanceRef.current = new maplibre.Map({
              container: mapRef.current,
              style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.REACT_APP_MAPTILER_API_KEY}`,
              center: [formData.position.lng, formData.position.lat],
              zoom: 13,
            });

            mapInstanceRef.current.on('click', (e) => {
              const { lng, lat } = e.lngLat;
              setFormData(prev => ({ ...prev, position: { lat, lng } }));
            });
          } else {
            // Update map center and zoom when formData changes
            mapInstanceRef.current.setCenter([formData.position.lng, formData.position.lat]);
            mapInstanceRef.current.setZoom(13);
          }
        }
      }, 500);
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  }, [visible, formData.position]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = () => {
    handleSubmit(formData);
  };

  return (
    <CModal visible={visible} onClose={handleClose}>
      <CModalHeader closeButton>Edit UE</CModalHeader>
      <CModalBody>
        <CForm>
          <CFormInput
            id="supi"
            name="supi"
            label="SUPI"
            value={formData.supi}
            onChange={handleChange}
            disabled
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
            label="IPv4 Address"
            value={formData.ip_address_v4}
            onChange={handleChange}
          />
          <CFormInput
            id="ip_address_v6"
            name="ip_address_v6"
            label="IPv6 Address"
            value={formData.ip_address_v6}
            onChange={handleChange}
          />
          <CFormInput
            id="mac"
            name="mac"
            label="MAC Address"
            value={formData.mac}
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
            value={formData.position.lat}
            readOnly 
          />
          <CFormInput
            id="lon"
            name="lon"
            label="Longitude"
            value={formData.position.lng}
            readOnly 
          />
          <div className="mt-3">
            <label className="form-label">Map</label>
            <div ref={mapRef} style={{ height: '400px', width: '100%' }}></div>
          </div>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose}>Cancel</CButton>
        <CButton color="primary" onClick={handleFormSubmit}>Save</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default EditUEModal;
