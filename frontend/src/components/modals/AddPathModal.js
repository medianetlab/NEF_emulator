import React, { useState, useEffect, useRef } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormTextarea, CAlert
} from '@coreui/react';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Color options for the path
const colorOptions = [
  '#FF5733', '#33FF57', '#3357FF', '#F4C542', '#E94E77', '#8E44AD'
];

const AddPathModal = ({ visible, handleClose, handleSubmit, cells = [] }) => { // Default to empty array if undefined
  const [formData, setFormData] = useState({
    description: '',
    color: '',
    start_point: null,
    end_point: null,
    points: []
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' }); // For success/error messages
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const circleLayersRef = useRef([]);

  useEffect(() => {
    if (visible) {
      setFormData({
        description: '',
        color: '',
        start_point: null,
        end_point: null,
        points: []
      });
      setErrors({});
      setMessage({ type: '', text: '' }); // Clear messages
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      circleLayersRef.current.forEach(layer => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(layer);
          mapInstanceRef.current.removeSource(layer);
        }
      });
      circleLayersRef.current = [];

      if (mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer('path-line');
        mapInstanceRef.current.removeSource('path-line');
      }

      setTimeout(() => {
        if (mapRef.current) {
          if (!mapInstanceRef.current) {
            mapInstanceRef.current = new maplibre.Map({
              container: mapRef.current,
              style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.REACT_APP_MAPTILER_API_KEY}`,
              center: [23.7275, 37.9838],
              zoom: 12,
            });

            mapInstanceRef.current.on('click', (e) => {
              const { lng, lat } = e.lngLat;
              addPoint({ lat: lat.toFixed(6).toString(), lon: lng.toFixed(6).toString() });
            });

            // Add cells to map (radius circles)
            addCellsToMap(mapInstanceRef.current, cells);
          }
        }
      }, 500);
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  }, [visible, cells]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkers();
      updatePath();
    }
  }, [formData.points, formData.color]);

  const addPoint = (point) => {
    setFormData(prev => {
      const newPoints = [...prev.points, point];
      return {
        ...prev,
        points: newPoints,
        start_point: newPoints[0] || null,
        end_point: newPoints[newPoints.length - 1] || null
      };
    });
  };

  const updateMarkers = () => {
    if (mapInstanceRef.current && formData.points.length) {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      formData.points.forEach(point => {
        const marker = new maplibre.Marker({ color: formData.color || '#FF0000' })
          .setLngLat([parseFloat(point.lon), parseFloat(point.lat)])
          .addTo(mapInstanceRef.current);
        markersRef.current.push(marker);
      });
    }
  };

  const updatePath = () => {
    if (mapInstanceRef.current && formData.points.length) {
      const lineCoordinates = formData.points.map(point => [parseFloat(point.lon), parseFloat(point.lat)]);

      if (mapInstanceRef.current.getSource('path-line')) {
        mapInstanceRef.current.getSource('path-line').setData({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: lineCoordinates
          }
        });
      } else {
        mapInstanceRef.current.addSource('path-line', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: lineCoordinates
            }
          }
        });

        mapInstanceRef.current.addLayer({
          id: 'path-line',
          type: 'line',
          source: 'path-line',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': formData.color || '#FF0000',
            'line-width': 2 // Thinner line
          }
        });
      }
    }
  };

  const addCellsToMap = (mapInstance, cells) => {
    if (!cells || !Array.isArray(cells)) {
      console.warn('Invalid cells data:', cells);
      return;
    }

    cells.forEach(cell => {
      const lat = parseFloat(cell.latitude);
      const lng = parseFloat(cell.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        const circleLayerId = `cell-radius-${cell.id}`;

        if (mapInstance.getLayer(circleLayerId)) {
          mapInstance.removeLayer(circleLayerId);
          mapInstance.removeSource(circleLayerId);
        }

        mapInstance.addSource(circleLayerId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            }
          }
        });

        mapInstance.addLayer({
          id: circleLayerId,
          type: 'circle',
          source: circleLayerId,
          paint: {
            'circle-radius': cell.radius,
            'circle-color': 'rgba(255, 0, 0, 0.5)',
            'circle-stroke-width': 1,
            'circle-stroke-color': 'rgba(255, 0, 0, 0.8)'
          }
        });

        circleLayersRef.current.push(circleLayerId);
      } else {
        console.warn('Invalid lat/lng for Cell:', cell);
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorClick = (color) => {
    setFormData(prev => ({ ...prev, color }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.description) errors.description = 'Description is required';
    if (!formData.color) errors.color = 'Color is required';
    if (!formData.start_point) errors.start_point = 'Start point is required';
    if (!formData.end_point) errors.end_point = 'End point is required';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = () => {
    if (validateForm()) {
      const dataToSubmit = {
        ...formData,
        start_point: {
          latitude: parseFloat(formData.start_point.lat),
          longitude: parseFloat(formData.start_point.lon)
        },
        end_point: {
          latitude: parseFloat(formData.end_point.lat),
          longitude: parseFloat(formData.end_point.lon)
        },
        points: formData.points.map(point => ({
          latitude: point.lat,
          longitude: point.lon
        }))
      };
      handleSubmit(dataToSubmit);
      setMessage({ type: 'success', text: 'Path added successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } else {
      setMessage({ type: 'danger', text: 'Please correct the errors in the form.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  return (
    <CModal visible={visible} onClose={handleClose} size="lg">
      <CModalHeader closeButton>Add Path</CModalHeader>
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
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <CFormTextarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              isInvalid={!!errors.description}
            />
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Color</label>
            <div className="d-flex">
              {colorOptions.map((color) => (
                <div
                  key={color}
                  onClick={() => handleColorClick(color)}
                  style={{
                    backgroundColor: color,
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    marginRight: '10px',
                    cursor: 'pointer',
                    border: formData.color === color ? '2px solid #000' : '2px solid transparent'
                  }}
                />
              ))}
            </div>
            {errors.color && <div className="invalid-feedback d-block">{errors.color}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Map</label>
            <div ref={mapRef} style={{ height: '400px', width: '100%' }} />
            {errors.start_point && <div className="invalid-feedback d-block">{errors.start_point}</div>}
            {errors.end_point && <div className="invalid-feedback d-block">{errors.end_point}</div>}
          </div>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose}>Cancel</CButton>
        <CButton color="primary" type="button" onClick={handleFormSubmit}>Save</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default AddPathModal;
