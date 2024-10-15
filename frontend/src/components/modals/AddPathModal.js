import React, { useState, useEffect, useRef } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormTextarea, CAlert
} from '@coreui/react';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getCells, getUEs, getPaths, getGNBs } from '../../utils/api';
import { addCellsToMap, addUEsToMap, addPathsToMap, removeMapLayersAndSources, handleUEClick } from './ModalUtils';

const colorOptions = [
  '#FF5733', '#33FF57', '#3357FF', '#F4C542', '#E94E77', '#8E44AD'
];

const AddPathModal = ({ visible, handleClose, handleSubmit, token }) => {
  const [formData, setFormData] = useState({
    description: '',
    color: '#FF0000', // Set default color
    start_point: null,
    end_point: null,
    points: []
  });
  const [paths, setPaths] = useState([]);
  const [gnbs, setGNBs] = useState([]);
  const [cells, setCells] = useState([]);
  const [ues, setUEs] = useState([]);
  const [toasts, setToasts] = useState([]);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const circleLayersRef = useRef([]);

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
      setFormData({
        description: '',
        color: '#FF0000', // Reset color when modal opens
        start_point: null,
        end_point: null,
        points: []
      });

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
        if (mapRef.current && !mapInstanceRef.current) {
          mapInstanceRef.current = new maplibre.Map({
            container: mapRef.current,
            style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.REACT_APP_MAPTILER_API_KEY}`,
            center: [23.819390, 37.997564],
            zoom: 15,
          });

          mapInstanceRef.current.on('click', (e) => {
            const { lng, lat } = e.lngLat;
            addPoint({ latitude: lat.toFixed(6), longitude: lng.toFixed(6) });
          });

          mapInstanceRef.current.on('style.load', async () => {
            removeMapLayersAndSources(mapInstanceRef.current, cells.map(cell => `cell-${cell.id}`));
            addCellsToMap(mapInstanceRef.current, cells);
            addUEsToMap(mapInstanceRef.current, ues, handleUEClick);
            await addPathsToMap(mapInstanceRef.current, token);
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
  }, [formData.points]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      updatePath(); // Call updatePath to change color
    }
  }, [formData.color]); // Monitor color changes

  const addPoint = (point) => {
    setFormData(prev => {
      const newPoints = [...prev.points, { latitude: parseFloat(point.latitude), longitude: parseFloat(point.longitude) }];
      return {
        ...prev,
        points: newPoints,
        start_point: newPoints[0] || null,
        end_point: newPoints[newPoints.length - 1] || null
      };
    });
  };

  const updateMarkers = () => {
    /*
    if (mapInstanceRef.current && formData.points.length) {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      formData.points.forEach(point => {
        // Create a transparent marker
        const transparentMarker = new maplibre.Marker({ color: 'transparent' }) // Transparent color
          .setLngLat([parseFloat(point.longitude), parseFloat(point.latitude)])
          .addTo(mapInstanceRef.current);
        markersRef.current.push(transparentMarker);
      });
    }
      */
  };

  const updatePath = () => {
    if (mapInstanceRef.current && formData.points.length) {
      const lineCoordinates = formData.points.map(point => [parseFloat(point.longitude), parseFloat(point.latitude)]);

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
            'line-width': 2
          }
        });
      }

      // Update the color of the path
      if (mapInstanceRef.current.getLayer('path-line')) {
        mapInstanceRef.current.setPaintProperty('path-line', 'line-color', formData.color);
      }
    }
  };

  const handleAddPath = async () => {
    try {
      const newPath = {
        description: formData.description,
        color: formData.color,
        start_point: formData.start_point,
        end_point: formData.end_point,
        points: formData.points,
      };

      await handleSubmit(newPath);
      handleClose(); // Close modal after submission
    } catch (error) {
      console.error('Error adding path:', error);
      setToasts(prev => [...prev, { text: 'Error adding path!', color: 'danger' }]);
    }
  };

  return (
    <CModal visible={visible} onClose={handleClose} size="lg"> {/* Set modal size to large */}
      <CModalHeader closeButton>Add Path</CModalHeader>
      <CModalBody>
        <CForm>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <CFormTextarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="color" className="form-label">Color</label>
            <div className="d-flex flex-wrap">
              {colorOptions.map((color, index) => (
                <div
                  key={index}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  style={{
                    backgroundColor: color,
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    margin: '5px',
                    border: formData.color === color ? '2px solid #000' : 'none'
                  }}
                />
              ))}
            </div>
          </div>
          <div className="mb-3" ref={mapRef} style={{ width: '100%', height: '400px' }}></div> {/* Increase height */}
          {formData.points.length > 0 && (
            <CAlert color="info">
              Points: {formData.points.map(p => `(${p.latitude}, ${p.longitude})`).join(', ')}
            </CAlert>
          )}
          {toasts.map((toast, index) => (
            <CAlert key={index} color={toast.color}>{toast.text}</CAlert>
          ))}
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose}>Close</CButton>
        <CButton color="primary" onClick={handleAddPath}>Add Path</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default AddPathModal;
