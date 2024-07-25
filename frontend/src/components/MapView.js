import React from 'react';
import { CCard, CCardBody, CCardHeader } from '@coreui/react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const MapView = () => {
  return (
    <CCard className="mb-4">
      <CCardHeader>Map</CCardHeader>
      <CCardBody>
        <MapContainer center={[37.9838, 23.7275]} zoom={13} style={{ height: '500px' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />
          <Marker position={[37.9838, 23.7275]}>
            <Popup>
              Example Location
            </Popup>
          </Marker>
        </MapContainer>
      </CCardBody>
    </CCard>
  );
};

export default MapView;
