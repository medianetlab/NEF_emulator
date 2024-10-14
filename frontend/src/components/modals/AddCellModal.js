import React, { useState, useEffect, useRef } from 'react';
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CButton,
  CForm, CFormInput, CFormSelect, CAlert
} from '@coreui/react';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getGNBs, getUEs, getCells } from '../../utils/api';
import { addCellsToMap, addUEsToMap, addPathsToMap, removeMapLayersAndSources, handleUEClick } from './ModalUtils'; 
import { buffer, point } from '@turf/turf'; // Import Turf.js functions

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
              zoom: 15,
            });

            mapInstanceRef.current.on('click', (e) => {
              const { lng, lat } = e.lngLat;

              setFormData(prev => ({
                ...prev,
                latitude: lat.toFixed(5),
                longitude: lng.toFixed(5)
              }));

              // Create the Turf.js circle
              const radiusInMeters = parseFloat(formData.radius);
              const radiusInKilometers = radiusInMeters / 1000; // Convert meters to kilometers
              const circleGeoJSON = buffer(point([lng, lat]), radiusInKilometers, { units: 'kilometers' });

              // Add the source and layer for the radius
              if (mapInstanceRef.current.getSource(sourceId)) {
                // Update existing source
                mapInstanceRef.current.getSource(sourceId).setData(circleGeoJSON);
              } else {
                // Add new source
                mapInstanceRef.current.addSource(sourceId, {
                  type: 'geojson',
                  data: circleGeoJSON
                });

                // Add fill layer for the circle
                mapInstanceRef.current.addLayer({
                  id: circleLayerId,
                  type: 'fill',
                  source: sourceId,
                  paint: {
                    'fill-color': 'rgba(255, 0, 0, 0.5)', // Circle color
                    'fill-opacity': 0.5 // Circle opacity
                  }
                });
              }

              // Add the center point layer
              if (mapInstanceRef.current.getLayer(dotLayerId)) {
                // Update existing dot layer
                mapInstanceRef.current.setPaintProperty(dotLayerId, 'circle-opacity', 1);
              } else {
                // Add new dot layer for the center
                mapInstanceRef.current.addLayer({
                  id: dotLayerId,
                  type: 'circle',
                  source: {
                    type: 'geojson',
                    data: point([lng, lat]) // Center point
                  },
                  paint: {
                    'circle-color': '#FF0000',
                    'circle-radius': 8, // Center point radius
                    'circle-opacity': 1
                  }
                });
              }
            });

            mapInstanceRef.current.on('style.load', async () => {
              removeMapLayersAndSources(mapInstanceRef.current, cells.map(cell => `cell-${cell.id}`));
              addCellsToMap(mapInstanceRef.current, cells);
              addUEsToMap(mapInstanceRef.current, ues, handleUEClick);
              await addPathsToMap(mapInstanceRef.current, ues, token);
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
    if (!formData.gNB_id.trim()) {
      setMessage({ type: 'danger', text: 'Error: Please select a gNB.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    try {
      // Call the addCellsToMap function with the new cell data
      await addCellsToMap(mapInstanceRef.current, [{
        cell_id: formData.cell_id,
        name: formData.name,
        description: formData.description,
        gNB_id: formData.gNB_id,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        radius: parseFloat(formData.radius)
      }]);
      
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
              label="Radius (m)"
              type="number"
              name="radius"
              value={formData.radius}
              onChange={handleChange}
              required
            />
            <div ref={mapRef} style={{ width: '100%', height: '300px' }} />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleFormSubmit}>Add Cell</CButton>
          <CButton color="secondary" onClick={handleClose}>Cancel</CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default AddCellModal;
