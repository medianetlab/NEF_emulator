// MapComponent.js
import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { CCard, CCardBody } from '@coreui/react';
import 'leaflet/dist/leaflet.css';

const MapComponent = () => {
  return (
    <CCard className="map-card">
      <CCardBody>
        <div className="map-container">
          <MapContainer
            center={[51.505, -0.09]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">NEF Map</a> contributors'
            />
          </MapContainer>
        </div>
      </CCardBody>
    </CCard>
  );
};

export default MapComponent;
