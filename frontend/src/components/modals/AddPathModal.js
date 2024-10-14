import React, { useState, useEffect, useRef } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormTextarea, CAlert
} from '@coreui/react';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getCells, getUEs, getPaths, getGNBs } from '../../utils/api'; // Assuming you have these API functions

const colorOptions = [
  '#FF5733', '#33FF57', '#3357FF', '#F4C542', '#E94E77', '#8E44AD'
];

const AddPathModal = ({ visible, handleClose, handleSubmit, token }) => {
  const [formData, setFormData] = useState({
    description: '',
    color: '',
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
        color: '',
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
            addCellsToMap(mapInstanceRef.current, cells);
            addUEsToMap(mapInstanceRef.current, ues);
            await addPathsToMap(mapInstanceRef.current, paths); 
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
    if (mapInstanceRef.current && formData.points.length) {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      formData.points.forEach(point => {
        const marker = new maplibre.Marker({ color: formData.color || '#FF0000' })
          .setLngLat([parseFloat(point.longitude), parseFloat(point.latitude)])  // Using longitude and latitude
          .addTo(mapInstanceRef.current);
        markersRef.current.push(marker);
      });
    }
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
    }
  };

  const addCellsToMap = (map, cells) => {
    cells.forEach((cell, index) => {
      const radius = cell.radius || 100;

      const feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [cell.longitude, cell.latitude]
        },
        properties: {
          description: cell.description,
          color: '#FF0000',
          radius: radius
        }
      };

      map.addSource(`cell-source-${index}`, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [feature]
        }
      });

      map.addLayer({
        id: `cell-layer-${index}`,
        type: 'circle',
        source: `cell-source-${index}`,
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            10, ['/', ['get', 'radius'], 10],
            15, ['/', ['get', 'radius'], 2]
          ],
          'circle-opacity': 0.1
        }
      });

      map.addLayer({
        id: `cell-center-dot-${index}`,
        type: 'circle',
        source: `cell-source-${index}`,
        paint: {
          'circle-color': '#FF0000',
          'circle-radius': 5,
          'circle-opacity': 1
        }
      });
    });
  };

  const addUEsToMap = (map, ues) => {
    ues.forEach((ue, index) => {
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [ue.longitude, ue.latitude]
        },
        properties: {
          description: ue.description,
          color: '#00FF00', // Example color for UEs
          radius: 10
        }
      };

      map.addSource(`ue-source-${index}`, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [feature]
        }
      });

      map.addLayer({
        id: `ue-layer-${index}`,
        type: 'circle',
        source: `ue-source-${index}`,
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            10, ['/', ['get', 'radius'], 10],
            15, ['/', ['get', 'radius'], 2]
          ],
          'circle-opacity': 0.7
        }
      });

      map.addLayer({
        id: `ue-center-dot-${index}`,
        type: 'circle',
        source: `ue-source-${index}`,
        paint: {
          'circle-color': '#00FF00',
          'circle-radius': 5,
          'circle-opacity': 1
        }
      });
    });
  };

  const addPathsToMap = (map, paths) => {
    paths.forEach((path, index) => {
      const lineCoordinates = path.points.map(point => [point.lon, point.lat]);

      map.addSource(`path-source-${index}`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: lineCoordinates
          }
        }
      });

      map.addLayer({
        id: `path-layer-${index}`,
        type: 'line',
        source: `path-source-${index}`,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': path.color || '#0000FF',
          'line-width': 2
        }
      });
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(formData);
    handleClose();
  };

  return (
    <CModal visible={visible} onClose={handleClose} size="lg">
      <CModalHeader onClose={handleClose}>
        <h5>Add Path</h5>
      </CModalHeader>
      <CModalBody>
        <CForm onSubmit={handleFormSubmit}>
          <div className="color-selection">
            {colorOptions.map(color => (
              <div
                key={color}
                onClick={() => setFormData(prev => ({ ...prev, color }))}
                style={{
                  backgroundColor: color,
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'inline-block',
                  marginRight: '10px',
                  cursor: 'pointer',
                  border: formData.color === color ? '2px solid #000' : 'none'
                }}
              />
            ))}
          </div>
          <CFormTextarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Description"
            rows={3}
            className="mt-2"
          />
          <div className="points-preview">
            <h6>Points:</h6>
            <ul>
              {formData.points.map((point, index) => (
                <li key={index}>{`Lat: ${point.latitude}, Lon: ${point.longitude}`}</li>
              ))}
            </ul>
          </div>
          <div ref={mapRef} style={{ width: '100%', height: '400px' }} />
          {toasts.map((toast, index) => (
            <CAlert key={index} color={toast.color}>
              {toast.message}
            </CAlert>
          ))}
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose}>Close</CButton>
        <CButton color="primary" type="submit" onClick={handleFormSubmit}>Add Path</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default AddPathModal;
