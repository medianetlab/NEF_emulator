import maplibregl from 'maplibre-gl';

class MarkerManager {
  constructor(map) {
    this.map = map;
    this.markers = new Map();
  }

  addMarker(id, coordinates, color = 'blue', onClick) {
    // Remove existing marker if it exists
    this.removeMarker(id);

    const marker = new maplibregl.Marker({ color })
      .setLngLat(coordinates)
      .addTo(this.map);

    this.markers.set(id, marker);

    // Add click event listener
    if (onClick) {
      marker.getElement().addEventListener('click', () => onClick(id));
    }
  }

  updateMarker(id, coordinates) {
    const marker = this.markers.get(id);
    if (marker) {
      marker.setLngLat(coordinates);
    }
  }

  removeMarker(id) {
    const marker = this.markers.get(id);
    if (marker) {
      marker.remove();
      this.markers.delete(id);
    }
  }

  removeAllMarkers() {
    this.markers.forEach((marker, id) => {
      marker.remove();
      this.markers.delete(id);
    });
  }
}

export default MarkerManager;
