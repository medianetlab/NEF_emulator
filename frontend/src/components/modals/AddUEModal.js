import React, { useState, useEffect, useRef } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormInput, CFormSelect, CToaster, CToast, CToastBody, CToastClose
} from '@coreui/react';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getPaths, getGNBs, getCells, getUEs } from '../../utils/api';
import { addCellsToMap, addUEsToMap, addPathsToMap, removeMapLayersAndSources, handleUEClick } from './ModalUtils';

const AddUEModal = ({ visible, handleClose, handleSubmit, token }) => {
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
  const [ues, setUEs] = useState([]);
  const [toasts, setToasts] = useState([]);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [pathsData, gnbData, cellData, ueData] = await Promise.all([
          getPaths(token),
          getGNBs(token),
          getCells(token),
          getUEs(token),
        ]);
        setPaths(pathsData);
        setGNBs(gnbData);
        setCells(cellData);
        setUEs(ueData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        if (mapRef.current) {
          if (!mapInstanceRef.current) {
            mapInstanceRef.current = new maplibre.Map({
              container: mapRef.current,
              style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.REACT_APP_MAPTILER_API_KEY}`,
              center: [23.819390, 37.997564],
              zoom: 15,
            });
            mapInstanceRef.current.on('style.load', async () => {
              removeMapLayersAndSources(mapInstanceRef.current, cells.map(cell => `cell-${cell.id}`));
              addCellsToMap(mapInstanceRef.current, cells);
              addUEsToMap(mapInstanceRef.current, ues, handleUEClick);
              await addPathsToMap(mapInstanceRef.current, token);
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
              markerRef.current.setLngLat([lng, lat]);
            });
          }
        }
      }, 500);
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }
  }, [visible, cells, gnbs, paths, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addToast = (message, color) => {
    setToasts([...toasts, { message, color }]);
  };

  const handleFormSubmit = () => {
    if (gnbs.length === 0 || cells.length === 0) {
      addToast('Error: No gNBs or Cells available. Please add at least one.', 'danger');
      return;
    }

    handleSubmit(formData);
    addToast('UE added successfully!', 'success');
    handleClose();
  };

  return (
    <>
      <CModal visible={visible} onClose={handleClose} size="lg">
        <CModalHeader closeButton>Add UE</CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <CFormInput
                label="SUPI"
                name="supi"
                value={formData.supi}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <CFormInput
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <CFormInput
                label="External Identifier"
                name="ext_identifier"
                value={formData.ext_identifier}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <CFormSelect
                label="Cell ID"
                name="cell_id"
                value={formData.cell_id}
                onChange={handleChange}
              >
                {cells.map(cell => (
                  <option key={cell.id} value={cell.id}>{cell.description}</option>
                ))}
              </CFormSelect>
            </div>
            <div className="mb-3">
              <CFormInput
                label="IPv4 Address"
                name="ip_address_v4"
                value={formData.ip_address_v4}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <CFormInput
                label="IPv6 Address"
                name="ip_address_v6"
                value={formData.ip_address_v6}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <CFormInput
                label="MAC Address"
                name="mac"
                value={formData.mac}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <CFormInput
                label="MCC"
                name="mcc"
                value={formData.mcc}
                onChange={handleChange}
                disabled // Disable the field
              />
            </div>
            <div className="mb-3">
              <CFormInput
                label="MNC"
                name="mnc"
                value={formData.mnc}
                onChange={handleChange}
                disabled // Disable the field
              />
            </div>
            <div className="mb-3">
              <CFormInput
                label="DNN"
                name="dnn"
                value={formData.dnn}
                onChange={handleChange}
                disabled // Disable the field
              />
            </div>
            <div className="mb-3">
              <CFormSelect
                label="Speed"
                name="speed"
                value={formData.speed}
                onChange={handleChange}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </CFormSelect>
            </div>
            <div className="mb-3">
              <CFormSelect
                label="Path"
                name="path" 
                value={formData.path_id}
                onChange={handleChange}
              >
                <option value="" disabled>Select a path</option>
                {paths.map(path => (
                  <option key={path.id} value={path.id}>{path.description}</option>
                ))}
              </CFormSelect>
            </div>
            <div className="mb-3">
              <CFormInput
                label="Latitude"
                name="lat"
                value={formData.lat}
                onChange={handleChange}
                disabled 
              />
            </div>
            <div className="mb-3">
              <CFormInput
                label="Longitude"
                name="lon"
                value={formData.lon}
                onChange={handleChange}
                disabled 
              />
            </div>
          </CForm>

          <div id="ueMap" ref={mapRef} style={{ height: '400px', marginTop: '20px' }}></div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleClose}>Cancel</CButton>
          <CButton color="primary" onClick={handleFormSubmit}>Save</CButton>
        </CModalFooter>
      </CModal>

      <CToaster placement="bottom-end">
        {toasts.map((toast, index) => (
          <CToast key={index} color={toast.color} autohide={true} delay={5000} visible={true}>
            <div className="d-flex">
              <CToastBody>{toast.message}</CToastBody>
              <CToastClose className="me-2 m-auto" />
            </div>
          </CToast>
        ))}
      </CToaster>
    </>
  );
};

export default AddUEModal;
