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
  const [ues, setUEs] = useState([]);
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
              center: [23.81953, 37.99803],
              zoom: 14,  // Zoom level to focus on the cluster
            });

            mapInstanceRef.current.on('click', (e) => {
              const { lng, lat } = e.lngLat;

              setFormData(prev => ({
                ...prev,
                latitude: lat.toFixed(5),
                longitude: lng.toFixed(5)
              }));

              // Check if the source already exists
              if (mapInstanceRef.current.getSource(sourceId)) {
                // Remove existing layers
                if (mapInstanceRef.current.getLayer(circleLayerId)) {
                  mapInstanceRef.current.removeLayer(circleLayerId);
                }
                if (mapInstanceRef.current.getLayer(dotLayerId)) {
                  mapInstanceRef.current.removeLayer(dotLayerId);
                }
                // Remove the existing source
                mapInstanceRef.current.removeSource(sourceId);
              }

              // Add or update the source
              mapInstanceRef.current.addSource(sourceId, {
                type: 'geojson',
                data: {
                  type: 'FeatureCollection',
                  features: [
                    {
                      type: 'Feature',
                      geometry: {
                        type: 'Point',
                        coordinates: [lng, lat]
                      }
                    }
                  ]
                }
              });

              // Add or update the circle layer
              mapInstanceRef.current.addLayer({
                id: circleLayerId,
                type: 'circle',
                source: sourceId,
                paint: {
                  'circle-color': 'rgba(255, 0, 0, 0.1)',  // Very low opacity red color
                  'circle-radius': convertRadiusToPixels(parseFloat(formData.radius), lat, mapInstanceRef.current.getZoom()),
                  'circle-opacity': 0.1  // Very low opacity
                }
              });

              // Add or update the dot layer
              mapInstanceRef.current.addLayer({
                id: dotLayerId,
                type: 'circle',
                source: sourceId,
                paint: {
                  'circle-color': '#FF0000',  // Red color for the dot
                  'circle-radius': 5,  // Dot size
                  'circle-opacity': 1  // Fully opaque dot
                }
              });
            });

            mapInstanceRef.current.on('load', () => {
              mapInstanceRef.current.addSource('cellsSource', {
                type: 'geojson',
                data: {
                  type: 'FeatureCollection',
                  features: cells.map(cell => ({
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: [cell.longitude, cell.latitude]
                    },
                    properties: {
                      description: cell.description,
                      color: '#FF0000',  // Red for all cells
                      radius: cell.radius || 100  // Real-world radius in meters
                    }
                  }))
                }
              });

              mapInstanceRef.current.addLayer({
                id: 'cellsLayer',
                type: 'circle',
                source: 'cellsSource',
                paint: {
                  'circle-color': ['get', 'color'],
                  'circle-radius': ['interpolate', ['linear'], ['zoom'],
                    10, ['/', ['get', 'radius'], 10],
                    15, ['/', ['get', 'radius'], 2]
                  ],
                  'circle-opacity': 0.1  // Higher opacity for circles
                }
              });

              // Add a red dot in the center of each cell
              mapInstanceRef.current.addLayer({
                id: 'centerDotsLayer',
                type: 'circle',
                source: 'cellsSource',
                paint: {
                  'circle-color': '#FF0000',  // Red color
                  'circle-radius': 5,  // Small dot size
                  'circle-opacity': 1  // Fully opaque
                }
              });
            });
          }
        }
      }, 500);
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  }, [visible, formData.radius, cells, ues]);

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
