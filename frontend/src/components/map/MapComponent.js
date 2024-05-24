import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { CCard, CCardBody, CCardTitle } from '@coreui/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapComponent.css';

// Define custom marker icon
const customMarker = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  shadowSize: [41, 41]
});

const Map = () => {
  return (
    <div className="map-view">
      <CCard>
        <CCardBody>
          <CCardTitle>Map</CCardTitle>
          <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '500px' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[51.505, -0.09]} icon={customMarker}>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
          </MapContainer>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default Map;

