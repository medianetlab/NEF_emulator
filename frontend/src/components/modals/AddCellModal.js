import React, { useState, useEffect, useRef } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormInput, CFormSelect
} from '@coreui/react';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getGNBs, getUEs, getCells } from '../../utils/api';

const AddCellModal = ({ visible, handleClose, handleSubmit, token }) => {
  const [formData, setFormData] = useState({
    cell_id: '',
    name: '',
    description: '',
    gNB_id: '',
    latitude: '',
    longitude: '',
    radius: ''
  });

  const [gnbs, setGnbs] = useState([]);
  const [cells, setCells] = useState([]);
  const [ues, setUes] = useState([]);
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

              // Update form data with clicked coordinates
              setFormData(prev => ({
                ...prev,
                latitude: lat.toFixed(5),
                longitude: lng.toFixed(5)
              }));

              // Remove existing marker if it exists
              if (markerRef.current) markerRef.current.remove();

              // Add new marker
              markerRef.current = new maplibre.Marker({ color: 'red' })
                .setLngLat([lng, lat])
                .addTo(mapInstanceRef.current);

              // Remove existing circle layer and source if they exist
              if (mapInstanceRef.current.getSource(sourceId)) {
                mapInstanceRef.current.removeLayer(circleLayerId);
                mapInstanceRef.current.removeSource(sourceId);
              }

              // Convert radius from meters to pixels
              const radiusInPixels = convertRadiusToPixels(parseFloat(formData.radius), lat, mapInstanceRef.current.getZoom());
              console.log(`Radius in pixels: ${radiusInPixels}`);

              // Add new circle
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
                  'circle-color': 'rgba(255, 0, 0, 0.3)', // Red color with low opacity
                  'circle-radius': radiusInPixels, // Use radius in pixels
                  'circle-opacity': 0.3
                }
              });
            });

            // Add cells to the map
            mapInstanceRef.current.on('load', () => {
              // Add Cells Layer
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
                      color: cell.color || '#FF0000' // Default color if not provided
                    }
                  }))
                }
              });

              mapInstanceRef.current.addLayer({
                id: 'cellsLayer',
                type: 'circle',
                source: 'cellsSource',
                paint: {
                  'circle-color': ['get', 'color'], // Use color from properties
                  'circle-radius': 6, // Adjust size as needed
                  'circle-opacity': 0.6
                }
              });

              // Add UEs Layer
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
                      id: ue.id, // Ensure that UE properties are set correctly
                      name: ue.name
                    }
                  }))
                }
              });

              // Add the custom icon image to the map
              mapInstanceRef.current.loadImage('/assets/person.png', (error, image) => {
                if (error) throw error;
                if (!mapInstanceRef.current.hasImage('custom-person-icon')) {
                  mapInstanceRef.current.addImage('custom-person-icon', image);
                }

                // Add UEs Layer after the icon image is added
                mapInstanceRef.current.addLayer({
                  id: 'uesLayer',
                  type: 'symbol',
                  source: 'uesSource',
                  layout: {
                    'icon-image': 'custom-person-icon', // Use the custom icon image
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
    // Approximate conversion factor
    const metersPerPixel = 156543.03392 * Math.cos((latitude * Math.PI) / 180) / Math.pow(2, zoom);
    return radius / metersPerPixel;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = () => {
    handleSubmit({
      ...formData,
      radius: parseFloat(formData.radius),
      gNB_id: formData.gNB_id.trim()
    });
  };

  return (
    <CModal visible={visible} onClose={handleClose} size="lg"> {/* Adjust size to "lg" */}
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
            placeholder="Enter radius in meters"
          />
        </CForm>

        <div
          id="cellMap"
          ref={mapRef}
          style={{ height: '400px', marginTop: '20px' }} // Increased height for better visibility
        ></div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose}>Cancel</CButton>
        <CButton color="primary" onClick={handleFormSubmit}>Save</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default AddCellModal;
