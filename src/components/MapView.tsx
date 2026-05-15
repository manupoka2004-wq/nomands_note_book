import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Place } from '../services/placesService';
import PlaceMarker from './PlaceMarker';

interface MapViewProps {
  center: [number, number];
  places: Place[];
  onViewDetails: (place: Place) => void;
}

const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
};

const MapView: React.FC<MapViewProps> = ({ center, places, onViewDetails }) => {
  return (
    <div className="h-full w-full rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapUpdater center={center} />
        {places.map((place) => (
          <PlaceMarker 
            key={place.id} 
            place={place} 
            onViewDetails={onViewDetails} 
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
