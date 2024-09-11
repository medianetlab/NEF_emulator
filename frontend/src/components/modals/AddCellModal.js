import React, { useState, useEffect, useRef } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormInput, CFormSelect, CToaster, CToast, CToastBody, CToastClose
} from '@coreui/react';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getGNBs, getUEs, getCells } from '../../utils/api';

const AddCellModal = ({ visible, handleClose, handleSubmit, token }) => {
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
  const [toasts, setToasts] = useState([]);  // State for toast messages
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleLayerId = 'circleLayer';
  const sourceId = 'circleSource';

  useEffect(() => {
    const fetchGnbs = async () => {
      if (!token) return;
      try {
        const gnbData = await getGNBs(token);
        setGnbs(gnbData);
      } catch (error) {
        console.error('Error fetching gNBs:', error);
        addToast('Error fetching gNBs. Please try again.', 'danger');
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
        addToast('Error fetching cells or UEs. Please try again.', 'danger');
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
              zoom: 12,
            });

            mapInstanceRef.current.on('click', (e) => {
              const { lng, lat } = e.lngLat;

              setFormData(prev => ({
                ...prev,
                latitude: lat.toFixed(5),
                longitude: lng.toFixed(5)
              }));

              if (markerRef.current) markerRef.current.remove();

              markerRef.current = new maplibre.Marker({ color: 'red' })
                .setLngLat([lng, lat])
                .addTo(mapInstanceRef.current);

              if (mapInstanceRef.current.getSource(sourceId)) {
                mapInstanceRef.current.removeLayer(circleLayerId);
                mapInstanceRef.current.removeSource(sourceId);
              }

              const radiusInPixels = convertRadiusToPixels(parseFloat(formData.radius), lat, mapInstanceRef.current.getZoom());
              console.log(`Radius in pixels: ${radiusInPixels}`);

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

              mapInstanceRef.current.addLayer({
                id: circleLayerId,
                type: 'circle',
                source: sourceId,
                paint: {
                  'circle-color': 'rgba(255, 0, 0, 0.3)',
                  'circle-radius': radiusInPixels,
                  'circle-opacity': 0.3
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
                      color: cell.color || '#FF0000'
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
                  'circle-radius': 6,
                  'circle-opacity': 0.6
                }
              });

              mapInstanceRef.current.addSource('uesSource', {
                type: 'geojson',
                data: {
                  type: 'FeatureCollection',
                  features: ues.map(ue => ({
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: [ue.longitude, ue.latitude]
                    },
                    properties: {
                      id: ue.id,
                      name: ue.name
                    }
                  }))
                }
              });

              mapInstanceRef.current.loadImage('/assets/person.png', (error, image) => {
                if (error) throw error;
                if (!mapInstanceRef.current.hasImage('custom-person-icon')) {
                  mapInstanceRef.current.addImage('custom-person-icon', image);
                }

                mapInstanceRef.current.addLayer({
                  id: 'uesLayer',
                  type: 'symbol',
                  source: 'uesSource',
                  layout: {
                    'icon-image': 'custom-person-icon',
                    'icon-size': 1.5
                  },
                  paint: {
                    'icon-color': '#00FF00'
                  }
                });
              });
            });
          }
        }
      }, 500);
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
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

  const addToast = (message, color) => {
    setToasts(prevToasts => [...prevToasts, { message, color }]);
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.slice(1)); // Remove the oldest toast after 3 seconds
    }, 3000);
  };

  const handleFormSubmit = async () => {
    if (!formData.gNB_id.trim()) {
      addToast('Error: Please select a gNB.', 'danger');
      return;
    }

    try {
      await handleSubmit({
        ...formData,
        radius: parseFloat(formData.radius),
        gNB_id: formData.gNB_id.trim()
      });
      addToast('Cell successfully added!', 'success');
      handleClose();
    } catch (error) {
      console.error('Error adding cell:', error);  // Log error to console
      addToast('Error: Failed to add cell. Please try again.', 'danger');
    }
  };

  return (
    <>
      <CModal visible={visible} onClose={handleClose} size="lg">
        <CModalHeader closeButton>Add Cell</CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              id="cell_id"
              name="cell_id"
              label="Cell ID"
              value={formData.cell_id}
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
              id="description"
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
            />
            <CFormSelect
              id="gNB_id"
              name="gNB_id"
              label="Select gNB"
              value={formData.gNB_id}
              onChange={handleChange}
            >
              <option value="">Select gNB</option>
              {gnbs.map(gnb => (
                <option key={gnb.id} value={gnb.id}>
                  {gnb.name} (ID: {gnb.id})
                </option>
              ))}
            </CFormSelect>
            <CFormInput
              id="latitude"
              name="latitude"
              label="Latitude"
              value={formData.latitude}
              readOnly
            />
            <CFormInput
              id="longitude"
              name="longitude"
              label="Longitude"
              value={formData.longitude}
              readOnly
            />
            <CFormInput
              id="radius"
              name="radius"
              label="Radius (meters)"
              value={formData.radius}
              onChange={handleChange}
              placeholder="Radius in meters"
            />
          </CForm>

          <div
            ref={mapRef}
            style={{ width: '100%', height: '400px', marginTop: '10px' }}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleClose}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleFormSubmit}>
            Submit
          </CButton>
        </CModalFooter>
      </CModal>

      <CToaster position="top-end">
        {toasts.map((toast, index) => (
          <CToast key={index} color={toast.color} autohide={true} visible={true} fade={true} style={{ marginTop: '1rem' }}>
            <CToastBody>
              {toast.message}
              <CToastClose />
            </CToastBody>
          </CToast>
        ))}
      </CToaster>
    </>
  );
};

export default AddCellModal;
