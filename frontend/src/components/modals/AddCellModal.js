import React, { useState, useEffect, useRef } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormInput, CFormSelect, CAlert
} from '@coreui/react';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getGNBs, getUEs, getCells } from '../../utils/api';
import { addCellsToMap } from './ModalUtils'; 

const AddCellModal = ({ visible, handleClose, token }) => {
  const [formData, setFormData] = useState({
    cell_id: 'AAAAA1001',
    name: 'cell1',
    description: '',
    gNB_id: '',
    latitude: '',
    longitude: '',
    radius: '100'
  });

  const [gnbs, setGnbs] = useState([]);
  const [cells, setCells] = useState([]);
  const [ues, setUes] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const circleLayerId = 'circleLayer';
  const sourceId = 'circleSource';
  const dotLayerId = 'dotLayer';

  useEffect(() => {
    const fetchGnbs = async () => {
      if (!token) return;
      try {
        const gnbData = await getGNBs(token);
        setGnbs(gnbData);
      } catch (error) {
        console.error('Error fetching gNBs:', error);
        setMessage({ type: 'danger', text: 'Error fetching gNBs. Please try again.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    };

    const fetchCellsAndUEs = async () => {
      if (!token) return;
      try {
        const [cellsData, uesData] = await Promise.all([getCells(token), getUEs(token)]);
        setCells(cellsData);
        setUes(uesData);
      } catch (error) {
        console.error('Error fetching cells or UEs:', error);
        setMessage({ type: 'danger', text: 'Error fetching cells or UEs. Please try again.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    };

    fetchGnbs();
    fetchCellsAndUEs();
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
              zoom: 14,
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
                // Update the existing source with the new coordinates
                mapInstanceRef.current.getSource(sourceId).setData({
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
                });
              } else {
                // Add the source if it doesn't exist
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
              }

              // Update or add the circle layer for the radius
              if (mapInstanceRef.current.getLayer(circleLayerId)) {
                // Update existing layer
                mapInstanceRef.current.setPaintProperty(circleLayerId, 'circle-radius', convertRadiusToPixels(parseFloat(formData.radius), lat, mapInstanceRef.current.getZoom()));
                mapInstanceRef.current.setPaintProperty(circleLayerId, 'circle-opacity', 0.1);
              } else {
                // Add new circle layer
                mapInstanceRef.current.addLayer({
                  id: circleLayerId,
                  type: 'circle',
                  source: sourceId,
                  paint: {
                    'circle-color': 'rgba(255, 0, 0, 0.1)',
                    'circle-radius': convertRadiusToPixels(parseFloat(formData.radius), lat, mapInstanceRef.current.getZoom()),
                    'circle-opacity': 0.1
                  }
                });
              }

              // Update or add the dot layer
              if (mapInstanceRef.current.getLayer(dotLayerId)) {
                mapInstanceRef.current.setPaintProperty(dotLayerId, 'circle-opacity', 1);
              } else {
                mapInstanceRef.current.addLayer({
                  id: dotLayerId,
                  type: 'circle',
                  source: sourceId,
                  paint: {
                    'circle-color': '#FF0000',
                    'circle-radius': 5,
                    'circle-opacity': 1
                  }
                });
              }
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
                      color: '#FF0000',
                      radius: cell.radius || 100
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
                  'circle-opacity': 0.1
                }
              });

              mapInstanceRef.current.addLayer({
                id: 'centerDotsLayer',
                type: 'circle',
                source: 'cellsSource',
                paint: {
                  'circle-color': '#FF0000',
                  'circle-radius': 5,
                  'circle-opacity': 1
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

  const convertRadiusToPixels = (radius, latitude, zoom) => {
    const metersPerPixel = 156543.03392 * Math.cos((latitude * Math.PI) / 180) / Math.pow(2, zoom);
    return radius / metersPerPixel;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async () => {
    if (!formData.gNB_id.trim()) {
      setMessage({ type: 'danger', text: 'Error: Please select a gNB.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    try {
      await addCellsToMap({
        ...formData,
        radius: parseFloat(formData.radius),
        gNB_id: formData.gNB_id.trim()
      });
      setMessage({ type: 'success', text: 'Cell successfully added!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      handleClose();
    } catch (error) {
      console.error('Error adding cell:', error);
      setMessage({ type: 'danger', text: 'Error: Failed to add cell. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  return (
    <>
      {/* Status message display */}
      {message.text && (
        <CAlert
          color={message.type}
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

      {/* Modal */}
      <CModal visible={visible} onClose={handleClose} size="lg">
        <CModalHeader closeButton>Add Cell</CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              label="Cell ID"
              name="cell_id"
              value={formData.cell_id}
              onChange={handleChange}
              required
            />
            <CFormInput
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <CFormInput
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
            <CFormSelect
              label="gNB"
              name="gNB_id"
              value={formData.gNB_id}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select a gNB</option>
              {gnbs.map(gnb => (
                <option key={gnb.gNB_id} value={gnb.gNB_id}>{gnb.name}</option>
              ))}
            </CFormSelect>
            <CFormInput
              label="Latitude"
              name="latitude"
              value={formData.latitude}
              readOnly
            />
            <CFormInput
              label="Longitude"
              name="longitude"
              value={formData.longitude}
              readOnly
            />
            <CFormInput
              label="Radius (meters)"
              name="radius"
              type="number"
              value={formData.radius}
              onChange={handleChange}
              required
            />
            <div ref={mapRef} style={{ width: '100%', height: '400px' }} />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleClose}>Close</CButton>
          <CButton color="primary" onClick={handleFormSubmit}>Add Cell</CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default AddCellModal;
