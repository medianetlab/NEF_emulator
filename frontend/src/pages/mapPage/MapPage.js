// MapPage.js
import React from 'react';
import MapComponent from '../../components/map/MapComponent';

const MapPage = ({ token }) => {
  return (
    <div className="map-page">
      <MapComponent />
    </div>
  );
};

export default MapPage;