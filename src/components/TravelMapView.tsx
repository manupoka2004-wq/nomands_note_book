import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import VehicleSimulation from './VehicleSimulation';

// Fix for default marker icons in Leaflet with React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface TravelMapViewProps {
  pickup: [number, number] | null;
  destination: [number, number] | null;
  route: [number, number][] | null;
}

// Component to handle map view updates
function MapUpdater({ pickup, destination, route }: TravelMapViewProps) {
  const map = useMap();

  useEffect(() => {
    if (route && route.length > 0) {
      const bounds = L.polyline(route).getBounds();
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickup) {
      map.setView(pickup, 13);
    }
  }, [pickup, destination, route, map]);

  return null;
}

const TravelMapView: React.FC<TravelMapViewProps> = ({ pickup, destination, route }) => {
  const center: [number, number] = pickup || [19.0760, 72.8777]; // Default to Mumbai

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {pickup && (
          <Marker position={pickup}>
            <Popup>Pickup Location</Popup>
          </Marker>
        )}
        
        {destination && (
          <Marker position={destination}>
            <Popup>Destination Location</Popup>
          </Marker>
        )}
        
        {route && (
          <Polyline 
            positions={route} 
            pathOptions={{ color: '#4f46e5', weight: 5, opacity: 0.7 }} 
          />
        )}

        {pickup && <VehicleSimulation pickup={pickup} />}
        
        <MapUpdater pickup={pickup} destination={destination} route={route} />
      </MapContainer>
    </div>
  );
};

export default TravelMapView;
