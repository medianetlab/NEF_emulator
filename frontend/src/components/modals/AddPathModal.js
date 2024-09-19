import React, { useState, useEffect, useRef } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormTextarea, CAlert
} from '@coreui/react';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getCells } from '../../utils/api';

// Color options for the path
const colorOptions = [
  '#FF5733', '#33FF57', '#3357FF', '#F4C542', '#E94E77', '#8E44AD'
];

const AddPathModal = ({ visible, handleClose, handleSubmit }) => {
  const [formData, setFormData] = useState({
    description: '',
    color: '',
    start_point: null,
    end_point: null,
    points: []
  });
  const [ues, setUEs] = useState({});
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [cells, setCells] = useState([]); 
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
      setMessage({ type: '', text: '' });

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

      // Fetch cells when modal becomes visible
      getCells()
        .then(response => {
          setCells(response.data);
          // Add cells to map once fetched
          if (mapInstanceRef.current) {
            addCellsToMap(mapInstanceRef.current, response.data);
          }
        })
        .catch(error => {
          console.error('Error fetching cells:', error);
        });

      setTimeout(() => {
        if (mapRef.current && !mapInstanceRef.current) {
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

          mapInstanceRef.current.on('style.load', () => {
            // Add cells and paths to map
            addCellsToMap(mapInstanceRef.current, cells);
            updatePath();
          });
        }
      }, 500);
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  }, [visible]);

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

  const addCellsToMap = (mapInstanceRef, cells) => {
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
    }, []);
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
      <CModalHeader closeButton>
        <h5>Add Path</h5>
      </CModalHeader>
      <CModalBody>
        <CForm>
          {message.text && (
            <CAlert color={message.type} dismissible>
              {message.text}
            </CAlert>
          )}
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
            />
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Path Color</label>
            <div className="d-flex gap-2">
              {colorOptions.map(color => (
                <div
                  key={color}
                  style={{ backgroundColor: color, width: 24, height: 24, cursor: 'pointer' }}
                  onClick={() => handleColorClick(color)}
                ></div>
              ))}
            </div>
            {errors.color && <div className="text-danger">{errors.color}</div>}
          </div>
          <div id="map" ref={mapRef} style={{ height: '400px', width: '100%' }}></div>
          <div className="mb-3">
            <label htmlFor="start_point" className="form-label">Start Point</label>
            <input
              type="text"
              id="start_point"
              name="start_point"
              value={formData.start_point ? `${formData.start_point.lat}, ${formData.start_point.lon}` : ''}
              readOnly
              className={`form-control ${errors.start_point ? 'is-invalid' : ''}`}
            />
            {errors.start_point && <div className="invalid-feedback">{errors.start_point}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="end_point" className="form-label">End Point</label>
            <input
              type="text"
              id="end_point"
              name="end_point"
              value={formData.end_point ? `${formData.end_point.lat}, ${formData.end_point.lon}` : ''}
              readOnly
              className={`form-control ${errors.end_point ? 'is-invalid' : ''}`}
            />
            {errors.end_point && <div className="invalid-feedback">{errors.end_point}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="points" className="form-label">Points</label>
            <CFormTextarea
              id="points"
              name="points"
              value={formData.points.map(point => `(${point.lat}, ${point.lon})`).join('\n')}
              readOnly
              rows={5}
              className="form-control"
            />
          </div>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose}>Close</CButton>
        <CButton color="primary" onClick={handleFormSubmit}>Save changes</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default AddPathModal;
